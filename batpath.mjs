import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.goto('http://localhost:8123/'); await new Promise(r => setTimeout(r, 2000));
const px = +(process.argv[2] ?? -0.8), pyaw = +(process.argv[3] ?? 0);
console.log(await p.evaluate((px, pyaw) => { const { THREE, scene, renderer, camera, makeChibi, setBatterPose } = window.__rk; renderer.setAnimationLoop(null); const c = makeChibi({ bat: true, helmet: true }); c.position.set(px, 0, 0.2); c.rotation.y = Math.PI / 2 + pyaw; c.scale.setScalar(0.72); scene.add(c); const o = [];
  for (const s of [0, 0.1, 0.2, 0.3, 0.34, 0.4, 0.5, 0.7, 1]) { setBatterPose(c, s); renderer.render(scene, camera); const m = c.userData.batMesh; m.updateWorldMatrix(true, false); const ctr = m.getWorldPosition(new THREE.Vector3()); const ax = new THREE.Vector3(0, 1, 0).transformDirection(m.matrixWorld); const barrel = ctr.clone().addScaledVector(ax, 0.2); o.push('s=' + s + ' barrel=' + barrel.toArray().map(v => v.toFixed(2)) + ' knob=' + ctr.clone().addScaledVector(ax, -0.3).toArray().map(v => v.toFixed(2))); } return o.join('\n'); }, px, pyaw));
await b.close();
