// CMU Graphics Lab mocap (subject 124, free for all uses incl. commercial products; no direct resale of the data) -> direction/frame based retarget
import * as THREE from 'three';
import swing from './mocap/swing.json';
import pitch from './mocap/pitch.json';
export const CLIPS = { swing, pitch };
const KEYS = Object.keys(swing.frames[0]);
const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
const SWAP = { shL: 'shR', shR: 'shL', elL: 'elR', elR: 'elL', wrL: 'wrR', wrR: 'wrL', hpL: 'hpR', hpR: 'hpL', knL: 'knR', knR: 'knL', anL: 'anR', anR: 'anL', toL: 'toR', toR: 'toL' };
// f: 클립 시작 기준 프레임(소수). 반환: {joint: Vector3} (거울/요 적용)
export function sample(name, f, { mirror = false, yaw = 0 } = {}) {
  const c = CLIPS[name], n = c.frames.length; f = Math.max(0, Math.min(n - 1, f));
  const i = Math.floor(f), j = Math.min(n - 1, i + 1), a = f - i, A = c.frames[i], B = c.frames[j], o = {};
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  for (const k of KEYS) {
    const p = V(A[k]).lerp(V(B[k]), a); if (mirror) p.x = -p.x;
    const x = p.x * cy + p.z * sy, z = -p.x * sy + p.z * cy; p.x = x; p.z = z;
    o[mirror && SWAP[k] ? SWAP[k] : k] = p;
  }
  return o;
}
