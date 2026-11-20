// Reproducible isolated experiment. This never edits src/growth.js or browser saves.
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync}from 'node:child_process';import {fileURLToPath}from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),temp=fs.mkdtempSync(path.join(os.tmpdir(),'rookie9-growth-experiment-'));
try{
 fs.cpSync(path.join(root,'src'),path.join(temp,'src'),{recursive:true});fs.writeFileSync(path.join(temp,'package.json'),JSON.stringify({type:'module'}));
 const target=path.join(temp,'src/growth.js'),original=fs.readFileSync(target,'utf8');
 const old='Math.max(pr.gain[k] > 0 && Math.random() < 0.6 ? 1 : 0, Math.round(pr.gain[k] * mul * (p[k] > 60 ? 0.5 : 1)))';
 assert.equal(original.split(old).length,2,'production formula changed; review the experimental patch rather than guessing');
 const replacement="candidateTrainingGain({base:pr.gain[k],multiplier:mul,current:p[k],basic:id==='basic',roll:Math.random()})";
 let experiment=original.replace(old,replacement);
 if(process.env.EVALUATION_TAPER==='1'){
  const oldEvaluation='function addEv(p, k, v) { p.ev[k] = clamp(p.ev[k] + v, 0, 100); }';
  const newEvaluation='function addEv(p,k,v){if(v>0){const expected=v*(p.ev[k]>=80?.15:p.ev[k]>=60?.35:1),whole=Math.floor(expected);v=whole+(Math.random()<expected-whole?1:0);}p.ev[k]=clamp(p.ev[k]+v,0,100);}';
  assert.equal(experiment.split(oldEvaluation).length,2,'evaluation formula changed; review experiment');experiment=experiment.replace(oldEvaluation,newEvaluation);
 }
 fs.writeFileSync(target,"import {candidateTrainingGain} from './training-gain-candidate.js';\n"+experiment);
 const child=spawnSync(process.execPath,[path.join(root,'growth_pacing_audit.mjs')],{cwd:root,env:{...process.env,GROWTH_MODULE:target,RUNTIME_LABEL:process.env.EVALUATION_TAPER==='1'?'unshipped-gain-and-evaluation-taper':'unshipped-fractional-gain-experiment'},stdio:'inherit'});
 if(child.error)throw child.error;if(child.status!==0)process.exitCode=child.status||1;
 assert.equal(fs.readFileSync(path.join(root,'src/growth.js'),'utf8'),original,'production source must remain exact');
}finally{fs.rmSync(temp,{recursive:true,force:true});}
