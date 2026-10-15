'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const {plan, verify, load} = require('../tools/ui-poc-b-routing.cjs');

const root = path.resolve(__dirname, '../../..');
const sha256 = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const expectedStages = [
  'workspace-scaffold','workspace-detection','state-init','intent-capture','market-research','feasibility','scope-definition','team-formation','rough-mockups','approval-handoff',
  'reverse-engineering','practices-discovery','requirements-analysis','user-stories','refined-mockups','domain-design','units-generation','contract-design','delivery-planning',
  'functional-design','nfr-requirements','nfr-design','infrastructure-design','code-generation','build-and-test','ci-pipeline',
  'deployment-pipeline','environment-provisioning','deployment-execution','observability-setup','performance-validation','incident-response','feedback-optimization'
];

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
  const old = process.cwd(); process.chdir(root); t.after(() => process.chdir(old));
  const p = plan('code-generation');
  const events = [];
  for (const inv of p.invocations) {
    for (const entrypoint of inv.entrypoints) events.push({type:'skill-read',skill:inv.skill,entrypoint,sha256:sha256(path.join(root,entrypoint))});
    events.push({type:'skill-applied',skill:inv.skill,inputs:inv.inputs,outputs:inv.outputs});
  }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(),'ui-poc-routing-')); t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  const log = path.join(dir,'log.json'); fs.writeFileSync(log,JSON.stringify({schema:1,arm:'B',stage:'code-generation',configSha256:p.configSha256,events}));
  assert.equal(verify('code-generation',log).pass,true);
  events.push({type:'approval'}); fs.writeFileSync(log,JSON.stringify({schema:1,arm:'B',stage:'code-generation',configSha256:p.configSha256,events}));
  assert.equal(verify('code-generation',log).pass,false);
});
test('routing pins exact upstream commits and installed entrypoints', () => {
  const cfg=load();
  assert.equal(cfg.sourceCommit,'49dd158d1076134a641b33efb035946536778336');
  for (const skill of Object.values(cfg.skills)) for (const entrypoint of skill.entrypoints) assert.ok(fs.statSync(path.join(root,entrypoint)).isFile());
});
