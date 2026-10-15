'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const {plan, verify, load, lockedEntrypoint} = require('../tools/ui-poc-b-routing.cjs');

const root = path.resolve(__dirname, '../../..');
const sha256 = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const expectedStages = [
  'workspace-scaffold','workspace-detection','state-init','intent-capture','market-research','feasibility','scope-definition','team-formation','rough-mockups','approval-handoff',
  'reverse-engineering','practices-discovery','requirements-analysis','user-stories','refined-mockups','domain-design','units-generation','contract-design','delivery-planning',
  'functional-design','nfr-requirements','nfr-design','infrastructure-design','code-generation','build-and-test','ci-pipeline',
  'deployment-pipeline','environment-provisioning','deployment-execution','observability-setup','performance-validation','incident-response','feedback-optimization'
];
function fixture(t, stage='code-generation', facts={}) {
  const project=fs.mkdtempSync(path.join(os.tmpdir(),'ui-poc-routing-project-')); t.after(()=>fs.rmSync(project,{recursive:true,force:true}));
  const evidence=path.join(project,'evidence'); fs.mkdirSync(evidence,{recursive:true});
  const p=plan(stage,facts), events=[];
  for (const inv of p.invocations.filter(x=>x.decision==='use')) {
    for (const entrypoint of inv.entrypoints) {
      const target=path.join(project,entrypoint); fs.mkdirSync(path.dirname(target),{recursive:true}); fs.copyFileSync(path.join(root,entrypoint),target);
      events.push({type:'skill-read',skill:inv.skill,entrypoint,sha256:sha256(target)});
    }
    const inputs=inv.inputs.map(name=>({name,kind:'value',value:`bounded ${name}`}));
    const outputs=inv.outputs.map((name,index)=>{const rel=`evidence/${name}-${index}.txt`,file=path.join(project,rel);fs.writeFileSync(file,`actual ${name}`);return {name,kind:'file',path:rel,sha256:sha256(file)};});
    events.push({type:'skill-applied',skill:inv.skill,inputs,outputs});
  }
  for (const inv of p.invocations.filter(x=>x.decision==='do-not-use'&&x.condition)) events.push({type:'skill-skipped',skill:inv.skill,condition:inv.condition,reason:'explicit false fact'});
  const factsPath=path.join(evidence,'ui-poc-routing-facts.json'); fs.writeFileSync(factsPath,JSON.stringify(facts));
  const context={stage,scope:'ui-poc-comparison',recordId:'intent-001',attempt:1,unit:'unit-ui'};
  const contextPath=path.join(evidence,'ui-poc-routing-context.json'); fs.writeFileSync(contextPath,JSON.stringify(context));
  const outputPath=path.join(evidence,'stage-output.md'); fs.writeFileSync(outputPath,'stage output');
  const logPath=path.join(evidence,'ui-poc-skill-evidence.json');
  const write=()=>fs.writeFileSync(logPath,JSON.stringify({schema:1,arm:'B',stage,configSha256:p.configSha256,context,contextSha256:sha256(contextPath),factsSha256:sha256(factsPath),events})); write();
  return {project,evidence,p,events,facts,context,factsPath,contextPath,outputPath,logPath,write};
}

test('routing explicitly covers every core stage', () => {
  assert.deepEqual(Object.keys(load().stages).sort(), expectedStages.sort());
});
test('unrelated stages deterministically select no skills', () => {
  assert.deepEqual(plan('build-and-test').invocations, []);
  assert.deepEqual(plan('functional-design').invocations, []);
});
test('conditional routing fails closed on missing fact', () => {
  assert.equal(plan('requirements-analysis').pass, false);
});
test('conditional false records do-not-use without invocation', () => {
  const p = plan('requirements-analysis', {unresolved_requirement_decisions:false, domain_language_conflict:false});
  assert.equal(p.pass, true);
  assert.ok(p.invocations.every(x => x.decision === 'do-not-use'));
});
test('routing facts must be booleans', () => {
  assert.equal(plan('domain-design', {unresolved_domain_terms_or_boundaries:'false'}).pass, false);
});
test('rough routing requires the logic uncertainty fact and uses bounded adapters', () => {
  const p = plan('rough-mockups', {state_model_uncertainty:false});
  assert.equal(p.pass, true);
  assert.equal(p.invocations[0].applicationKind, 'bounded-adapter');
  assert.equal(p.invocations[2].decision, 'do-not-use');
});
test('to-spec is disabled in every lifecycle stage', () => {
  for (const stage of expectedStages) assert.ok(!(load().stages[stage] || []).some(x => x.skill === 'to-spec'));
  assert.equal(load().skills['to-spec'].lifecyclePolicy, 'disabled');
});
test('verified evidence distinguishes reads, application, approval and publication', t => {
  const f=fixture(t),old=process.cwd();process.chdir(f.project);t.after(()=>process.chdir(old));
  const options={contextPath:f.contextPath,factsPath:f.factsPath,outputPath:f.outputPath};
  assert.equal(verify('code-generation',f.logPath,f.facts,options).pass,true);
  f.events.push({type:'approval'});f.write();
  assert.equal(verify('code-generation',f.logPath,f.facts,options).pass,false);
});
test('rejects skill-applied evidence for an unselected disabled skill', t => {
  const f=fixture(t),old=process.cwd();process.chdir(f.project);t.after(()=>process.chdir(old));
  f.events.push({type:'skill-applied',skill:'to-spec',inputs:[],outputs:[]});f.write();
  const result = verify('code-generation',f.logPath,f.facts,{contextPath:f.contextPath,factsPath:f.factsPath,outputPath:f.outputPath});
  assert.equal(result.pass,false);
  assert.match(result.findings[0],/Unselected or disabled skill was applied: to-spec/);
});
test('rejects modified payload even when the log reports its matching sha256', t => {
  const f=fixture(t),old=process.cwd();process.chdir(f.project);t.after(()=>process.chdir(old));
  const event=f.events.find(x=>x.type==='skill-read'),target=path.join(f.project,event.entrypoint);fs.appendFileSync(target,'\nmodified');event.sha256=sha256(target);f.write();
  const result=verify('code-generation',f.logPath,f.facts,{contextPath:f.contextPath,factsPath:f.factsPath,outputPath:f.outputPath});
  assert.equal(result.pass,false);
  assert.match(result.findings[0],/differs from source-lock/);
});
test('rejects evidence reused from a different attempt', t => {
  const f=fixture(t),old=process.cwd();process.chdir(f.project);t.after(()=>process.chdir(old));
  f.context.attempt=2;fs.writeFileSync(f.contextPath,JSON.stringify(f.context));
  const result=verify('code-generation',f.logPath,f.facts,{contextPath:f.contextPath,factsPath:f.factsPath,outputPath:f.outputPath});
  assert.equal(result.pass,false);assert.match(result.findings[0],/not bound to the current context and facts/);
});
test('rejects symbolic output names without actual hashed artifacts', t => {
  const f=fixture(t),old=process.cwd();process.chdir(f.project);t.after(()=>process.chdir(old));
  f.events.find(x=>x.type==='skill-applied').outputs=f.p.invocations[0].outputs;f.write();
  const result=verify('code-generation',f.logPath,f.facts,{contextPath:f.contextPath,factsPath:f.factsPath,outputPath:f.outputPath});
  assert.equal(result.pass,false);assert.match(result.findings[0],/(Incomplete skill-applied output evidence|Invalid output reference kind)/);
});
test('routing pins exact upstream commits and installed entrypoints', () => {
  const cfg=load();
  assert.equal(cfg.sourceCommit,'49dd158d1076134a641b33efb035946536778336');
  for (const [name,skill] of Object.entries(cfg.skills)) for (const entrypoint of skill.entrypoints) {
    const bytes=fs.readFileSync(path.join(root,entrypoint)),locked=lockedEntrypoint(name,entrypoint);
    assert.equal(bytes.length,locked.bytes);
    assert.equal(crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'),locked.git_blob_sha);
  }
});
test('sensor dispatch adapter fails when routing evidence is missing', t => {
  const facts={unresolved_requirement_decisions:false,domain_language_conflict:false},f=fixture(t,'requirements-analysis',facts);
  fs.unlinkSync(f.logPath);
  const r=spawnSync(process.execPath,[path.join(root,'poc/ui-poc/tools/aidlc-sensor-ui-poc-evidence.ts'),'--stage','requirements-analysis','--output-path',f.outputPath],{cwd:f.project,encoding:'utf8'});
  assert.equal(r.status,0);const out=JSON.parse(r.stdout);assert.equal(out.pass,false);assert.match(out.findings.join(' '),/Unreadable evidence log/);
});
test('sensor dispatch adapter rejects forbidden skill application', t => {
  const facts={unresolved_requirement_decisions:false,domain_language_conflict:false},f=fixture(t,'requirements-analysis',facts);
  f.events.push({type:'skill-applied',skill:'to-spec',inputs:[],outputs:[]});f.write();
  const r=spawnSync(process.execPath,[path.join(root,'poc/ui-poc/tools/aidlc-sensor-ui-poc-evidence.ts'),'--stage','requirements-analysis','--output-path',f.outputPath],{cwd:f.project,encoding:'utf8'});
  assert.equal(r.status,0);const out=JSON.parse(r.stdout);assert.equal(out.pass,false);assert.match(out.findings.join(' '),/Unselected or disabled skill was applied: to-spec/);
});
test('real sensor dispatcher records failed when routing log is missing', t => {
  const facts={unresolved_requirement_decisions:false,domain_language_conflict:false},f=fixture(t,'requirements-analysis',facts);
  fs.unlinkSync(f.logPath);
  const dispatcher=path.join(root,'dist/claude/.claude/tools/aidlc-sensor.ts');
  assert.ok(fs.existsSync(dispatcher),'run bun scripts/package.ts before this integration test');
  const r=spawnSync('bun',[dispatcher,'fire','ui-poc-evidence','--stage','requirements-analysis','--output-path',f.outputPath],{cwd:root,encoding:'utf8',env:{...process.env,CLAUDE_PROJECT_DIR:f.project,AIDLC_SENSORS_DIR:path.join(root,'poc/ui-poc/sensors'),AIDLC_SENSOR_SCRIPT_DIR:path.join(root,'poc/ui-poc/tools')}});
  assert.equal(r.status,0,`${r.stdout}${r.stderr}`);const out=JSON.parse(r.stdout.trim().split(/\r?\n/).at(-1));assert.equal(out.result,'failed');
});
