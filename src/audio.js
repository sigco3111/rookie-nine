let ctx = null;
// Audio sample count must not consume the game's random outcome stream.
let noiseSeed=0x6d2b79f5;
function noiseRandom(){noiseSeed^=noiseSeed<<13;noiseSeed^=noiseSeed>>>17;noiseSeed^=noiseSeed<<5;return (noiseSeed>>>0)/4294967296;}
const ac = () => { if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (ctx && ctx.state === 'suspended') ctx.resume(); return ctx; };
export function unlock() { ac(); }
function noise(dur, { type = 'highpass', freq = 1000, gain = 0.5, q = 1, sweep = 0 } = {}) {
  const c = ac(); if (!c) return; const n = Math.floor(c.sampleRate * dur); const b = c.createBuffer(1, n, c.sampleRate); const d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (noiseRandom() * 2 - 1) * (1 - i / n);
  const s = c.createBufferSource(); s.buffer = b; const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  if (sweep) f.frequency.linearRampToValueAtTime(freq + sweep, c.currentTime + dur);
  const g = c.createGain(); g.gain.value = gain; s.connect(f); f.connect(g); g.connect(c.destination); s.start();
}
function tone(freq, dur, { type = 'sine', gain = 0.2, slide = 0 } = {}) {
  const c = ac(); if (!c) return; const o = c.createOscillator(); o.type = type; o.frequency.value = freq; if (slide) o.frequency.linearRampToValueAtTime(freq + slide, c.currentTime + dur);
  const g = c.createGain(); g.gain.setValueAtTime(gain, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + dur);
}
export const sfx = {
  swing: () => noise(0.18, { type: 'bandpass', freq: 600, gain: 0.25, sweep: 1500 }),
  crack: (q = 1) => { noise(0.09, { type: 'highpass', freq: 2500, gain: 0.8 * q + 0.3 }); tone(180, 0.12, { type: 'square', gain: 0.25, slide: -80 }); },
  mitt: () => { noise(0.08, { type: 'lowpass', freq: 900, gain: 0.7 }); tone(120, 0.1, { type: 'sine', gain: 0.3 }); },
  cheer: (long = 1.2) => noise(long, { type: 'bandpass', freq: 1200, gain: 0.25, q: 0.6 }),
  ui: () => tone(660, 0.07, { type: 'triangle', gain: 0.12 }),
  good: () => { tone(660, 0.1, { type: 'triangle' }); setTimeout(() => tone(880, 0.15, { type: 'triangle' }), 90); },
  bad: () => tone(200, 0.25, { type: 'sawtooth', gain: 0.12, slide: -80 }),
  out: () => tone(300, 0.3, { type: 'triangle', gain: 0.15, slide: -150 }),
};
