#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const configPath = path.join(__dirname, 'ui-poc', 'b-stage-routing.json');
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const load = () => JSON.parse(fs.readFileSync(configPath, 'utf8'));
const fail = message => ({pass:false, findings_count:1, findings:[message]});

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

function verify(stage, logPath, facts = {}) {
  const expected = plan(stage, facts);
  if (!expected.pass) return expected;
  let log;
  try { log = JSON.parse(fs.readFileSync(logPath, 'utf8')); } catch (e) { return fail(`Unreadable evidence log: ${e.message}`); }
  if (log.schema !== 1 || log.arm !== 'B' || log.stage !== stage || log.configSha256 !== expected.configSha256) return fail('Evidence log identity does not match the routing plan');
  if (!Array.isArray(log.events)) return fail('Evidence log events must be an array');
  for (const invocation of expected.invocations.filter(x => x.decision === 'use')) {
    const entrypoints = load().skills[invocation.skill].entrypoints;
    for (const entrypoint of entrypoints) {
      const event = log.events.find(e => e.type === 'skill-read' && e.skill === invocation.skill && e.entrypoint === entrypoint && /^[a-f0-9]{64}$/.test(e.sha256 || ''));
      if (!event) return fail(`Missing skill-read evidence: ${invocation.skill} ${entrypoint}`);
      const local = path.resolve(entrypoint);
      if (!fs.existsSync(local) || hash(fs.readFileSync(local)) !== event.sha256) return fail(`Skill-read hash does not match installed entrypoint: ${entrypoint}`);
    }
    const applied = log.events.find(e => e.type === 'skill-applied' && e.skill === invocation.skill);
    if (!applied || !Array.isArray(applied.inputs) || !Array.isArray(applied.outputs) || !invocation.inputs.every(x => applied.inputs.includes(x)) || !invocation.outputs.every(x => applied.outputs.includes(x))) return fail(`Incomplete skill-applied evidence: ${invocation.skill}`);
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
    else if (argv[i] === '--facts') out.facts = JSON.parse(fs.readFileSync(argv[++i], 'utf8'));
    else if (argv[i] === '--log') out.log = argv[++i];
    else throw Error(`Unknown argument: ${argv[i]}`);
  }
  return out;
}
function main(argv) {
  try {
    const command = argv.shift(), args = parse(argv);
    const result = command === 'plan' ? plan(args.stage, args.facts) : command === 'verify' ? verify(args.stage, args.log, args.facts) : fail('Expected plan or verify');
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.pass ? 0 : 1;
  } catch (e) { console.log(JSON.stringify(fail(e.message), null, 2)); process.exitCode = 1; }
}
if (require.main === module) main(process.argv.slice(2));
module.exports = {plan, verify, load};
