// CI check: site/ must be exactly what the app will accept. It verifies the manifest signature
// against the app's public key and every pack's SHA-256. It needs no secret.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const S=path.join(__dirname,'..','site');
const PUB='MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEY1ZuNsteaQ2c3742NJt5Hpi5M3+VhOy9UjF+sIBZOdH/huHqnno9hCejuhuznAo0j0jVB3xhpqfJZhHe9ag/hg==';
const key=crypto.createPublicKey({key:Buffer.from(PUB,'base64'),format:'der',type:'spki'});
const manifest=fs.readFileSync(path.join(S,'manifest.json'));
const sig=Buffer.from(fs.readFileSync(path.join(S,'manifest.sig'),'utf8').trim(),'base64');
if(!crypto.verify('sha256',manifest,{key,dsaEncoding:'ieee-p1363'},sig)){console.log('ERROR manifest signature invalid: run tools/build.js on the PC');process.exit(1);}
const m=JSON.parse(manifest);let bad=0;
for(const p of m.packs){
  const h=crypto.createHash('sha256').update(fs.readFileSync(path.join(S,p.file))).digest('hex');
  if(h!==p.sha256){console.log('ERROR hash mismatch',p.file);bad++;}
}
for(const f of ['index.html','privacy.html'])if(!fs.existsSync(path.join(S,f))){console.log('ERROR missing',f);bad++;}
if(bad)process.exit(1);
console.log('OK: signature valid,',m.packs.length,'packs,',m.fixes.length,'fixes, generated',m.generated);
