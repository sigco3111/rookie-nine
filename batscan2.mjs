import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.goto('http://localhost:8123/'); await new Promise(r => setTimeout(r, 2000));
console.log(await p.evaluate(() => { const { THREE, scene, renderer, camera, makeChibi, setBatterPose } = window.__rk; renderer.setAnimationLoop(null); const c = makeChibi({ bat: true, helmet: true }); c.scale.setScalar(0.72); { const m = c.userData.batMesh; m.scale.y = 1.25; m.position.y = 0.34 * 1.25; } scene.add(c); const res = [];
  const tgt = new THREE.Vector3(0, 0.9, 0.12);
  for (const px of [-0.55, -0.5, -0.45]) for (let yd = -80; yd <= -20; yd += 10) { c.position.set(px, 0, 0.2); c.rotation.y = Math.PI / 2 + yd * Math.PI / 180; let best = 9, bs = 0, bp = null;
    for (let s = 0.28; s <= 0.42; s += 0.02) { setBatterPose(c, s); renderer.render(scene, camera); const m = c.userData.batMesh; m.updateWorldMatrix(true, false); const ctr = m.getWorldPosition(new THREE.Vector3()); const ax = new THREE.Vector3(0, 1, 0).transformDirection(m.matrixWorld); const a = ctr.clone().addScaledVector(ax, -0.37), bb = ctr.clone().addScaledVector(ax, 0.37); const ab = bb.clone().sub(a); const tt = Math.max(0, Math.min(1, tgt.clone().sub(a).dot(ab) / ab.lengthSq())); const d = a.clone().addScaledVector(ab, tt).distanceTo(tgt); if (d < best) { best = d; bs = s; } }
    res.push([+best.toFixed(2), px, yd, +bs.toFixed(2)]); }
  res.sort((a, b) => a[0] - b[0]); return res.slice(0, 8).map(r => 'minDist=' + r[0] + ' px=' + r[1] + ' yawDeg=' + r[2] + ' atS=' + r[3]).join('\n'); }));
await b.close();
