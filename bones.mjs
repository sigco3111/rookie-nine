import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage(); await p.goto('http://localhost:8123/'); await new Promise(r => setTimeout(r, 2000));
const out = await p.evaluate(() => { const {makeChibi,scene,THREE}=window.__rk; const c=makeChibi({bat:true}); scene.add(c); c.updateMatrixWorld(true); const L=[]; c.traverse(o=>{ if(o.isBone){ const w=o.getWorldPosition(new THREE.Vector3()); L.push(o.name+' <- '+(o.parent&&o.parent.name)+' '+w.x.toFixed(2)+','+w.y.toFixed(2)+','+w.z.toFixed(2)); } }); return L.join('\n'); });
console.log(out); await b.close();
