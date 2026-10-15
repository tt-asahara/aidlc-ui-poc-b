#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const configPath = path.join(__dirname, 'ui-poc', 'b-stage-routing.json');
const sourceLockPath = path.join(__dirname, 'ui-poc', 'treatments', 'source-lock.json');
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const gitBlobHash = b => crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');
const load = () => JSON.parse(fs.readFileSync(configPath, 'utf8'));
const fail = message => ({pass:false, findings_count:1, findings:[message]});

function boundedFile(projectRoot, rel) {
  if (typeof rel !== 'string' || !rel || path.isAbsolute(rel) || rel.includes('\\') || rel.split('/').includes('..')) throw Error(`Unsafe artifact path: ${rel}`);
  const root = fs.realpathSync(projectRoot), file = fs.realpathSync(path.resolve(projectRoot, rel));
  if (!file.startsWith(root + path.sep) || !fs.statSync(file).isFile()) throw Error(`Artifact reference escapes project or is not a file: ${rel}`);
  return fs.readFileSync(file);
}
function validContext(value, stage) {
  return value && value.stage === stage && value.scope === 'ui-poc-comparison' && typeof value.recordId === 'string' && value.recordId.trim() && Number.isInteger(value.attempt) && value.attempt > 0 && (value.unit === null || typeof value.unit === 'string');
}

function lockedEntrypoint(skillName, entrypoint) {
  const cfg = load(), skill = cfg.skills[skillName];
  if (!skill || !skill.sourcePaths || !skill.sourcePaths[entrypoint]) throw Error(`Missing source-lock mapping: ${skillName} ${entrypoint}`);
  const lock = JSON.parse(fs.readFileSync(sourceLockPath, 'utf8'));
  const source = lock.sources?.find(x => x.repository === skill.repository && x.commit === skill.commit);
  const record = source?.files?.find(x => x.path === skill.sourcePaths[entrypoint]);
  if (!record || !/^[a-f0-9]{40}$/.test(record.git_blob_sha || '') || !Number.isInteger(record.bytes)) throw Error(`Missing pinned source-lock record: ${skillName} ${entrypoint}`);
  return record;
}

function plan(stage, facts = {}) {
  const cfg = load();
  if (!Object.hasOwn(cfg.stages, stage)) return fail(`Unknown stage: ${stage}`);
  const invocations = [];
  for (const rule of cfg.stages[stage]) {
    let result = rule.decision;
    if (result === 'conditional') {
      if (!Object.hasOwn(facts, rule.condition)) return fail(`Missing routing fact: ${rule.condition}`);
      if (typeof facts[rule.condition] !== 'boolean') return fail(`Routing fact must be boolean: ${rule.condition}`);
      result = facts[rule.condition] === true ? 'use' : 'do-not-use';
    }
    const skill = cfg.skills[rule.skill];
    if (!skill || skill.lifecyclePolicy === 'disabled') return fail(`Disabled or unknown lifecycle skill: ${rule.skill}`);
    invocations.push({...rule, decision:result, repository:skill.repository, commit:skill.commit, applicationKind:skill.applicationKind || 'skill', entrypoints:skill.entrypoints});
  }
  return {pass:true, schema:1, arm:'B', stage, configSha256:hash(fs.readFileSync(configPath)), invocations};
}

function verify(stage, logPath, facts = {}, options = {}) {
  const expected = plan(stage, facts);
  if (!expected.pass) return expected;
  if (!expected.invocations.length && (!logPath || !fs.existsSync(logPath))) return {pass:true, findings_count:0, findings:[]};
  let log;
  try { log = JSON.parse(fs.readFileSync(logPath, 'utf8')); } catch (e) { return fail(`Unreadable evidence log: ${e.message}`); }
  if (log.schema !== 1 || log.arm !== 'B' || log.stage !== stage || log.configSha256 !== expected.configSha256) return fail('Evidence log identity does not match the routing plan');
  if (!Array.isArray(log.events)) return fail('Evidence log events must be an array');
  if (expected.invocations.length) {
    if (!options.contextPath || !options.factsPath || !options.outputPath) return fail('Routing context, facts path, and output path are required');
    const evidenceRoot = path.dirname(path.resolve(logPath));
    if ([options.contextPath, options.factsPath, options.outputPath].some(p => path.dirname(path.resolve(p)) !== evidenceRoot)) return fail('Routing context, facts, log, and stage output must share the stage evidence directory');
    let context;
    try { context = JSON.parse(fs.readFileSync(options.contextPath, 'utf8')); } catch (e) { return fail(`Unreadable routing context: ${e.message}`); }
    if (!validContext(context, stage)) return fail('Invalid routing execution context');
    if (log.contextSha256 !== hash(fs.readFileSync(options.contextPath)) || log.factsSha256 !== hash(fs.readFileSync(options.factsPath)) || JSON.stringify(log.context) !== JSON.stringify(context)) return fail('Evidence log is not bound to the current context and facts');
  }
  const selected = new Set(expected.invocations.filter(x => x.decision === 'use').map(x => x.skill));
  const skipped = new Set(expected.invocations.filter(x => x.decision === 'do-not-use').map(x => x.skill));
  for (const event of log.events) {
    if (event.type === 'skill-applied' && !selected.has(event.skill)) return fail(`Unselected or disabled skill was applied: ${event.skill}`);
    if (event.type === 'skill-read' && !selected.has(event.skill)) return fail(`Unselected or disabled skill was read as stage evidence: ${event.skill}`);
    if (event.type === 'skill-skipped' && !skipped.has(event.skill)) return fail(`Unexpected skill-skipped evidence: ${event.skill}`);
  }
  for (const invocation of expected.invocations.filter(x => x.decision === 'use')) {
    const entrypoints = load().skills[invocation.skill].entrypoints;
    for (const entrypoint of entrypoints) {
      const event = log.events.find(e => e.type === 'skill-read' && e.skill === invocation.skill && e.entrypoint === entrypoint && /^[a-f0-9]{64}$/.test(e.sha256 || ''));
      if (!event) return fail(`Missing skill-read evidence: ${invocation.skill} ${entrypoint}`);
      const local = path.resolve(entrypoint);
      if (!fs.existsSync(local)) return fail(`Installed entrypoint is missing: ${entrypoint}`);
      const bytes = fs.readFileSync(local), locked = lockedEntrypoint(invocation.skill, entrypoint);
      if (bytes.length !== locked.bytes || gitBlobHash(bytes) !== locked.git_blob_sha) return fail(`Installed entrypoint differs from source-lock: ${entrypoint}`);
      if (hash(bytes) !== event.sha256) return fail(`Skill-read hash does not match installed entrypoint: ${entrypoint}`);
    }
    const applications = log.events.filter(e => e.type === 'skill-applied' && e.skill === invocation.skill);
    if (applications.length !== 1) return fail(`Expected exactly one skill-applied event: ${invocation.skill}`);
    const applied = applications[0];
    if (!applied || !Array.isArray(applied.inputs) || !Array.isArray(applied.outputs)) return fail(`Incomplete skill-applied evidence: ${invocation.skill}`);
    for (const [kind, required, refs] of [['input',invocation.inputs,applied.inputs],['output',invocation.outputs,applied.outputs]]) {
      if (!required.every(name => refs.some(ref => ref?.name === name))) return fail(`Incomplete skill-applied ${kind} evidence: ${invocation.skill}`);
      for (const ref of refs) {
        if (!ref || typeof ref.name !== 'string' || !required.includes(ref.name)) return fail(`Unexpected skill-applied ${kind}: ${invocation.skill}`);
        if (ref.kind === 'value') {
          if (kind === 'output' || !Object.hasOwn(ref, 'value') || !JSON.stringify(ref.value).length) return fail(`Invalid bounded value ${kind}: ${invocation.skill} ${ref.name}`);
        } else if (ref.kind === 'file') {
          if (!/^[a-f0-9]{64}$/.test(ref.sha256 || '')) return fail(`Invalid artifact hash: ${invocation.skill} ${ref.name}`);
          let bytes; try { bytes = boundedFile(process.cwd(), ref.path); } catch (e) { return fail(e.message); }
          if (hash(bytes) !== ref.sha256) return fail(`Artifact hash mismatch: ${invocation.skill} ${ref.name}`);
        } else return fail(`Invalid ${kind} reference kind: ${invocation.skill} ${ref.name}`);
      }
    }
  }
  for (const invocation of expected.invocations.filter(x => x.decision === 'do-not-use' && x.condition)) {
    if (!log.events.some(e => e.type === 'skill-skipped' && e.skill === invocation.skill && e.condition === invocation.condition && typeof e.reason === 'string' && e.reason.trim())) return fail(`Missing conditional skip evidence: ${invocation.skill}`);
  }
  if (log.events.some(e => e.type === 'approval' || e.type === 'tracker-publish')) return fail('Skill evidence log must not record or perform approval or tracker publication');
  return {pass:true, findings_count:0, findings:[]};
}

function parse(argv) {
  const out = {facts:{}};
  for (let i=0;i<argv.length;i++) {
    if (argv[i] === '--stage') out.stage = argv[++i];
    else if (argv[i] === '--facts') { out.factsPath = argv[++i]; out.facts = JSON.parse(fs.readFileSync(out.factsPath, 'utf8')); }
    else if (argv[i] === '--log') out.log = argv[++i];
    else if (argv[i] === '--context') out.context = argv[++i];
    else if (argv[i] === '--output-path') out.outputPath = argv[++i];
    else throw Error(`Unknown argument: ${argv[i]}`);
  }
  return out;
}
function main(argv) {
  try {
    const command = argv.shift(), args = parse(argv);
    const result = command === 'plan' ? plan(args.stage, args.facts) : command === 'verify' ? verify(args.stage, args.log, args.facts, {contextPath:args.context,factsPath:args.factsPath,outputPath:args.outputPath}) : fail('Expected plan or verify');
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.pass ? 0 : 1;
  } catch (e) { console.log(JSON.stringify(fail(e.message), null, 2)); process.exitCode = 1; }
}
if (require.main === module) main(process.argv.slice(2));
module.exports = {plan, verify, load, lockedEntrypoint};
