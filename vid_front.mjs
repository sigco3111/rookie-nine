import puppeteer from 'puppeteer-core'; import fs from 'fs';
const mode = process.argv[2]; const rot = process.argv[3] || 'side';
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.setViewport({ width: 480, height: 480, deviceScaleFactor: 1 });
await p.goto('http://localhost:8123/'); await new Promise(r => setTimeout(r, 2500));
await p.evaluate((mode) => { const { THREE, scene, renderer, makeChibi } = window.__rk; renderer.setAnimationLoop(null); document.body.innerHTML = ''; document.body.appendChild(renderer.domElement); renderer.setSize(480, 480); renderer.setPixelRatio(1);
  scene.children.forEach(o => { if (!o.isLight) o.visible = false; });
  const c = mode === 'bat' ? makeChibi({ bat: true, helmet: true }) : makeChibi({ glove: true }); scene.add(c); c.rotation.y = 0.5; window.__c = c;
  window.__cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100); window.__cam.position.set(0.0, 1.0, 6.0); window.__cam.lookAt(0, 0.95, 0); }, mode);
fs.mkdirSync('/tmp/vff', { recursive: true }); for (const f of fs.readdirSync('/tmp/vff')) fs.unlinkSync('/tmp/vff/' + f);
const fps = 30; const dur = mode === 'bat' ? 1.5 : 1.6; const n = Math.round(dur * fps);
for (let i = 0; i < n; i++) { const t = i / fps;
  await p.evaluate((mode, t) => { const { renderer, scene, setBatterPose, setPitcherPose } = window.__rk;
    if (mode === 'bat') { const sw = t < 0.5 ? 0 : (t - 0.5) / 0.22; setBatterPose(window.__c, sw); }
    else { const w = Math.min(t, 0.9) / 0.9 * 0.65 * 0 + (t < 0.9 ? t / 0.9 * 0.65 : 0.65 + (t - 0.9) * 2); setPitcherPose(window.__c, w); }
    renderer.render(scene, window.__cam); }, mode, t);
  await p.screenshot({ path: `/tmp/vff/f${String(i).padStart(3, '0')}.png` }); }
await b.close();
