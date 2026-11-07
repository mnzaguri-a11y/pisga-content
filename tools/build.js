// Builds the public site into site/ (committed): validates packs, writes a signed manifest.
// Usage (on the owner's PC, the key never leaves it): PISGA_SIGN_KEY_FILE=../extracted/pisga-trivia/secrets/pack-signing-key.pem node tools/build.js
// The app trusts content only if manifest.sig verifies against the public key embedded in engine.html.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const R=path.join(__dirname,'..'),OUT=path.join(R,'site');
const CATS=['gaming','movies','brands','club','science','world','pop','israel','food','idioms','ai','lawtech'];
const TYPES=['knowledge','estimate','logic','emoji','which','complete'];
const ID=/^[A-Za-z0-9_-]{1,40}$/;
let errors=0;const err=m=>{console.log('ERROR',m);errors++;};
const read=f=>JSON.parse(fs.readFileSync(path.join(R,f),'utf8'));

function checkQ(x,p){
  if(!x||typeof x.id!=='string'||!ID.test(x.id))return err(p+' bad id');
  if(!CATS.includes(x.cat))err(p+' cat '+x.cat);
  if(!(Number.isInteger(x.lvl)&&x.lvl>=1&&x.lvl<=5))err(p+' lvl');
  if(!TYPES.includes(x.type))err(p+' type '+x.type);
  if(typeof x.q!=='string'||x.q.length<2||x.q.length>300)err(p+' q');
  if(!Array.isArray(x.opts)||x.opts.length!==4)err(p+' opts len');
  else{
    if(x.opts.some(o=>typeof o!=='string'&&typeof o!=='number'||String(o).length>45))err(p+' opt type/length');
    if(new Set(x.opts.map(o=>String(o).trim().toLowerCase())).size!==4)err(p+' dup opts');
  }
  if(typeof x.hint!=='string'||!x.hint||x.hint.length>200)err(p+' hint');
  if(typeof x.why!=='string'||x.why.length<15||x.why.length>600)err(p+' why');
  if(x.more!==undefined&&(typeof x.more!=='string'||x.more.length<60||x.more.length>1500))err(p+' more (60-1500 chars)');
  if(x.say!==undefined&&(typeof x.say!=='string'||!x.say||x.say.length>300))err(p+' say');
}

// packs: listed in packs/index.json in release order (oldest first)
const order=fs.existsSync(path.join(R,'packs','index.json'))?read('packs/index.json'):[];
const seenIds=new Set(),seenQ=new Set(),packs=[];
fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(path.join(OUT,'packs'),{recursive:true});
for(const id of order){
  if(!ID.test(id)){err('pack id '+id);continue;}
  const file='packs/'+id+'.json',p=read(file);
  if(p.id!==id)err(file+' id mismatch');
  if(typeof p.title!=='string'||!p.title)err(file+' title');
  if(!Array.isArray(p.questions)||!p.questions.length){err(file+' no questions');continue;}
  p.questions.forEach((x,i)=>{
    const where=id+'['+i+'] '+(x&&x.id);checkQ(x,where);
    if(x&&x.id){if(!x.id.startsWith(id+'-'))err(where+' id must start with '+id+'-');if(seenIds.has(x.id))err(where+' dup id');seenIds.add(x.id);}
    const k=String(x&&x.q).replace(/\s+/g,' ').trim();if(seenQ.has(k))err(where+' dup q');seenQ.add(k);
  });
  const txt=JSON.stringify(p);
  fs.writeFileSync(path.join(OUT,file),txt);
  packs.push({id,title:p.title,file,n:p.questions.length,sha256:crypto.createHash('sha256').update(txt,'utf8').digest('hex')});
  console.log('pack',id,p.questions.length,'questions');
}
const fixes=fs.existsSync(path.join(R,'fixes.json'))?read('fixes.json'):[];
fixes.forEach((f,i)=>{if(!f||typeof f.id!=='string'||!ID.test(f.id))err('fix['+i+'] id');});
const config=fs.existsSync(path.join(R,'config.json'))?read('config.json'):{};
if(errors){console.log(errors,'errors, nothing built');process.exit(1);}

const manifest=JSON.stringify({v:1,generated:new Date().toISOString(),packs,fixes,config});
const pem=process.env.PISGA_SIGN_KEY||(process.env.PISGA_SIGN_KEY_FILE&&fs.readFileSync(process.env.PISGA_SIGN_KEY_FILE,'utf8'));
if(!pem){console.log('ERROR PISGA_SIGN_KEY missing');process.exit(1);}
const sig=crypto.sign('sha256',Buffer.from(manifest,'utf8'),{key:pem,dsaEncoding:'ieee-p1363'}).toString('base64');
fs.writeFileSync(path.join(OUT,'manifest.json'),manifest);
fs.writeFileSync(path.join(OUT,'manifest.sig'),sig);
for(const f of ['index.html','privacy.html','.nojekyll'])fs.copyFileSync(path.join(R,f),path.join(OUT,f));
console.log('built site/:',packs.length,'packs,',fixes.length,'fixes');
