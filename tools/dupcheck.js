// Flags existing questions (bundled banks + published packs) that may test the same fact as a draft pack.
// Usage: node tools/dupcheck.js <path to app banks/> <draft pack .json>
// Output is a list of suspects for a human/agent to judge; a hit is not automatically a duplicate.
const fs=require('fs'),path=require('path');
const [banksDir,draftFile]=process.argv.slice(2);
if(!banksDir||!draftFile){console.log('usage: node tools/dupcheck.js <banks dir> <draft.json>');process.exit(1);}
global.BANKS={};
for(const f of fs.readdirSync(banksDir).filter(f=>f.endsWith('.js')))new Function('BANKS',fs.readFileSync(path.join(banksDir,f),'utf8'))(BANKS);
const pool=[];for(const c in BANKS)BANKS[c].forEach(q=>pool.push(q));
const draft=JSON.parse(fs.readFileSync(draftFile,'utf8'));
const packsDir=path.join(__dirname,'..','packs');
for(const id of JSON.parse(fs.readFileSync(path.join(packsDir,'index.json'),'utf8'))){
  if(id===draft.id)continue;
  JSON.parse(fs.readFileSync(path.join(packsDir,id+'.json'),'utf8')).questions.forEach(q=>pool.push(q));
}
const norm=s=>String(s).toLowerCase().replace(/[^֐-׿a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const STOP=new Set('של את על עם מה מי איזה איזו באיזה באיזו כמה הוא היא זה זו לא יש היה הייתה גם או כי אם בין רק כל מן אל עד'.split(' '));
const toks=s=>new Set(norm(s).split(' ').filter(w=>w.length>2&&!STOP.has(w)));
let flagged=0;
draft.questions.forEach(d=>{
  const ans=norm(d.opts[0]),dt=toks(d.q+' '+d.opts[0]);const hits=[];
  for(const b of pool){
    let score=0;
    if(ans.length>2&&norm(b.opts[0])===ans)score+=3;
    if(ans.length>3&&norm(b.q+' '+b.why).includes(ans))score+=1;
    const bt=toks(b.q+' '+b.opts[0]+' '+b.why);let ov=0;dt.forEach(w=>{if(bt.has(w))ov++;});
    if(ov>=3)score+=2;
    if(score>=3)hits.push([score,b.id+' | '+b.q+' => '+b.opts[0]]);
  }
  hits.sort((a,b)=>b[0]-a[0]);
  if(hits.length){flagged++;console.log('\n'+d.id+' '+d.q+' => '+d.opts[0]+'\n   '+hits.slice(0,3).map(h=>h[1]).join('\n   '));}
});
console.log('\n'+flagged+' of '+draft.questions.length+' draft questions have suspects (checked against '+pool.length+' existing).');
