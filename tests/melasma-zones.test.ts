import { describe, expect, it } from "vitest";
import { pigmentIndex, zoneGeometry } from "@/lib/skin/face";

// Positive / negative controls for the on-device melasma zone map, on a
// synthetic face so they run in CI with no camera and no YouCam units.

const W = 600, H = 800;
type LM = { x: number; y: number; z: number };
function landmarks(): LM[] {
  const lm: LM[] = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  const set = (i: number, x: number, y: number) => (lm[i] = { x, y, z: 0 });
  set(234, 0.2, 0.5); set(454, 0.8, 0.5); set(1, 0.5, 0.55); set(33, 0.36, 0.42); set(263, 0.64, 0.42);
  set(9, 0.5, 0.38); set(151, 0.5, 0.22); set(280, 0.68, 0.58); set(50, 0.32, 0.58);
  set(2, 0.5, 0.63); set(0, 0.5, 0.69); set(17, 0.5, 0.77); set(152, 0.5, 0.92);
  return lm;
}

function rng(seed: number) {
  return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

/** Even skin with mild sensor noise; `light(x, y)` scales brightness. */
function face(light: (x: number, y: number) => number = () => 1) {
  const r = rng(7);
  const data = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const k = light(x / W, y / H), n = (r() - 0.5) * 6, i = (y * W + x) * 4;
      data[i] = 205 * k + n; data[i + 1] = 160 * k + n; data[i + 2] = 135 * k + n; data[i + 3] = 255;
    }
  return { data, width: W, height: H } as unknown as ImageData;
}

/** Darken pixels inside soft blotches (melasma-like: ~10–14 L* darker). */
function blotches(img: ImageData, cx: number, cy: number, r: number, f = 0.8) {
  const spots = [[0, 0], [0.5, -0.3], [-0.45, 0.35], [0.3, 0.45], [-0.4, -0.4]];
  for (const [dx, dy] of spots) {
    const sx = cx + dx * r, sy = cy + dy * r, sr = r * 0.28;
    for (let y = Math.floor(sy - sr); y < sy + sr; y++)
      for (let x = Math.floor(sx - sr); x < sx + sr; x++) {
        if ((x - sx) ** 2 + (y - sy) ** 2 > sr * sr) continue;
        const i = (y * W + x) * 4;
        for (let c = 0; c < 3; c++) img.data[i + c] *= f;
      }
  }
}

const lm = landmarks() as never;
const zones = zoneGeometry(lm, W, H).zones;

describe("melasma zone map — controls", () => {
  it("negative control: even, clean skin reads near zero everywhere", () => {
    const z = pigmentIndex(face(), lm);
    for (const v of Object.values(z)) expect(v).toBeLessThanOrEqual(5);
  });

  it("negative control: strong side lighting is not mistaken for pigment", () => {
    const z = pigmentIndex(face((x) => 0.75 + 0.4 * x), lm); // 75% → 115% brightness across the face
    for (const v of Object.values(z)) expect(v).toBeLessThanOrEqual(8);
  });

  it("negative control: hair or a fringe over the forehead is not counted as spots", () => {
    const img = face();
    const f = zones.forehead;
    for (let y = Math.floor(f.c.y - f.r); y < f.c.y - f.r * 0.2; y++)
      for (let x = Math.floor(f.c.x - f.r); x < f.c.x + f.r; x++) {
        const i = (y * W + x) * 4;
        img.data[i] = 45; img.data[i + 1] = 32; img.data[i + 2] = 28;
      }
    expect(pigmentIndex(img, lm).forehead).toBeLessThanOrEqual(8);
  });

  it("positive control: melasma patches on one cheek raise that cheek only", () => {
    const before = pigmentIndex(face(), lm);
    const img = face();
    blotches(img, zones.cheekR.c.x, zones.cheekR.c.y, zones.cheekR.r);
    const after = pigmentIndex(img, lm);
    expect(after.cheekR! - before.cheekR!).toBeGreaterThanOrEqual(25);
    for (const z of ["forehead", "cheekL", "chin"] as const) expect(Math.abs(after[z]! - before[z]!)).toBeLessThanOrEqual(3);
  });

  it("positive control holds under side lighting too", () => {
    const light = (x: number) => 0.75 + 0.4 * x;
    const img = face(light);
    blotches(img, zones.cheekR.c.x, zones.cheekR.c.y, zones.cheekR.r);
    expect(pigmentIndex(img, lm).cheekR!).toBeGreaterThanOrEqual(25);
  });
});
