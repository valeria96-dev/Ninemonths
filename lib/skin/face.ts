"use client";

import type { FaceLandmarker, NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { L } from "@/lib/i18n";
import { ZONES, type ZoneId } from "@/lib/skin/types";

// On-device face work with MediaPipe Face Landmarker:
//  1. live capture checks, so week-to-week photos are comparable
//     (YouCam's numbers move with lighting and pose);
//  2. the crop YouCam needs (face > 60% of the image width);
//  3. our own melasma-zone pigment index, which runs with or without YouCam.

const WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm";
const MODEL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

let landmarker: Promise<FaceLandmarker> | null = null;

export function getLandmarker(): Promise<FaceLandmarker> {
  landmarker ??= (async () => {
    const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
    const files = await FilesetResolver.forVisionTasks(WASM);
    return FaceLandmarker.createFromOptions(files, {
      baseOptions: { modelAssetPath: MODEL, delegate: "GPU" },
      runningMode: "VIDEO",
      numFaces: 1,
    });
  })();
  return landmarker;
}

// Uploaded photos are unrelated stills: VIDEO mode would try to track the
// previous photo's face and miss the new one, so they get an IMAGE-mode twin.
let stillLandmarker: Promise<FaceLandmarker> | null = null;
export function getStillLandmarker(): Promise<FaceLandmarker> {
  stillLandmarker ??= (async () => {
    const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
    const files = await FilesetResolver.forVisionTasks(WASM);
    return FaceLandmarker.createFromOptions(files, {
      baseOptions: { modelAssetPath: MODEL, delegate: "GPU" },
      runningMode: "IMAGE",
      numFaces: 1,
    });
  })();
  return stillLandmarker;
}

// Face-mesh landmark indices.
const IDX = { left: 234, right: 454, nose: 1, eyeL: 33, eyeR: 263, glabella: 9, forehead: 151, cheekL: 280, cheekR: 50, subnasale: 2, lipTop: 0, lipBottom: 17, chin: 152 };

type Pt = { x: number; y: number };
const mix = (a: Pt, b: Pt, t: number): Pt => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

/** Zone centres and radii in pixels for an image of size w×h. */
export function zoneGeometry(lm: NormalizedLandmark[], w: number, h: number) {
  const p = (i: number): Pt => ({ x: lm[i].x * w, y: lm[i].y * h });
  const faceW = Math.hypot(p(IDX.right).x - p(IDX.left).x, p(IDX.right).y - p(IDX.left).y);
  const zones: Record<ZoneId, { c: Pt; r: number }> = {
    // Lower-mid forehead: clear of the hairline and fringe.
    forehead: { c: mix(p(IDX.glabella), p(IDX.forehead), 0.55), r: faceW * 0.09 },
    cheekL: { c: p(IDX.cheekL), r: faceW * 0.09 },
    cheekR: { c: p(IDX.cheekR), r: faceW * 0.09 },
    // Skin between nose and lip (the classic melasma "moustache"), clear of the lip itself.
    upperLip: { c: mix(p(IDX.subnasale), p(IDX.lipTop), 0.4), r: faceW * 0.035 },
    chin: { c: mix(p(IDX.lipBottom), p(IDX.chin), 0.55), r: faceW * 0.06 },
  };
  return { zones, faceW };
}

// sRGB → CIE L* and a* (enough precision for relative comparisons).
function lab(r: number, g: number, b: number) {
  const lin = (c: number) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const R = lin(r), G = lin(g), B = lin(b);
  const X = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.9505;
  const Y = 0.2126 * R + 0.7152 * G + 0.0722 * B;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return { L: 116 * f(Y) - 16, a: 500 * (f(X) - f(Y)) };
}

/**
 * Samples a zone on a grid of `step`-pixel blocks (each block averaged), so
 * sensor noise and JPEG grain don't read as spots. Returns L* and a* per block.
 */
function sampleZone(img: ImageData, c: Pt, r: number, step = 1) {
  const Ls: number[] = [];
  const As: number[] = [];
  const Xs: number[] = [];
  const Ys: number[] = [];
  const r2 = r * r;
  for (let y = Math.max(0, Math.floor(c.y - r)); y + step <= Math.min(img.height, c.y + r); y += step) {
    for (let x = Math.max(0, Math.floor(c.x - r)); x + step <= Math.min(img.width, c.x + r); x += step) {
      if ((x + step / 2 - c.x) ** 2 + (y + step / 2 - c.y) ** 2 > r2) continue;
      let R = 0, G = 0, B = 0;
      for (let yy = y; yy < y + step; yy++) {
        for (let xx = x; xx < x + step; xx++) {
          const i = (yy * img.width + xx) * 4;
          R += img.data[i];
          G += img.data[i + 1];
          B += img.data[i + 2];
        }
      }
      const n = step * step;
      const { L, a } = lab(R / n, G / n, B / n);
      Ls.push(L);
      As.push(a);
      Xs.push((x - c.x) / r);
      Ys.push((y - c.y) / r);
    }
  }
  const sorted = [...Ls].sort((m, n) => m - n);
  const aSorted = [...As].sort((m, n) => m - n);
  return { Ls, As, Xs, Ys, median: sorted[Math.floor(sorted.length / 2)] ?? 0, aMedian: aSorted[Math.floor(aSorted.length / 2)] ?? 0 };
}

/** Least-squares plane L = k0 + k1·x + k2·y over the given points. */
function fitPlane(L: number[], X: number[], Y: number[]) {
  let n = 0, sx = 0, sy = 0, sl = 0, sxx = 0, syy = 0, sxy = 0, sxl = 0, syl = 0;
  for (let i = 0; i < L.length; i++) {
    n++; sx += X[i]; sy += Y[i]; sl += L[i];
    sxx += X[i] * X[i]; syy += Y[i] * Y[i]; sxy += X[i] * Y[i];
    sxl += X[i] * L[i]; syl += Y[i] * L[i];
  }
  // Solve the 3×3 normal equations (Cramer's rule).
  const m = [[n, sx, sy], [sx, sxx, sxy], [sy, sxy, syy]];
  const v = [sl, sxl, syl];
  const det = (a: number[][]) => a[0][0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1]) - a[0][1] * (a[1][0] * a[2][2] - a[1][2] * a[2][0]) + a[0][2] * (a[1][0] * a[2][1] - a[1][1] * a[2][0]);
  const D = det(m);
  if (Math.abs(D) < 1e-9) return [sl / Math.max(1, n), 0, 0];
  return [0, 1, 2].map((k) => det(m.map((row, i) => row.map((val, j) => (j === k ? v[i] : val)))) / D);
}

/**
 * Pigment index per zone, 0–100: the share of skin that is locally darker
 * than its surroundings (ΔL* 5–25, like melasma patches). Each zone's light
 * gradient is removed first with a fitted plane, so side lighting doesn't
 * count as pigment; sampling is at ~260 px face width so grain doesn't either.
 * Much darker pixels (hair, nostrils) and much redder ones (lips) are not skin.
 */
export function pigmentIndex(img: ImageData, lm: NormalizedLandmark[]): Partial<Record<ZoneId, number>> {
  const { zones, faceW } = zoneGeometry(lm, img.width, img.height);
  const step = Math.max(1, Math.round(faceW / 260));
  const out: Partial<Record<ZoneId, number>> = {};
  for (const id of ZONES) {
    const { Ls, As, Xs, Ys, median, aMedian } = sampleZone(img, zones[id].c, zones[id].r, step);
    const keep: number[] = [];
    for (let i = 0; i < Ls.length; i++) if (median - Ls[i] <= 25 && As[i] - aMedian <= 10) keep.push(i);
    if (keep.length < 30) continue;
    const [k0, k1, k2] = fitPlane(keep.map((i) => Ls[i]), keep.map((i) => Xs[i]), keep.map((i) => Ys[i]));
    let dark = 0;
    for (const i of keep) if (k0 + k1 * Xs[i] + k2 * Ys[i] - Ls[i] >= 5) dark++;
    out[id] = Math.min(100, Math.round((dark / keep.length) * 200));
  }
  return out;
}

export type Check = { id: "face" | "frontal" | "light" | "even" | "close"; ok: boolean; hint: L };

/** Live checks for comparable selfies. */
export function captureChecks(img: ImageData | null, lm: NormalizedLandmark[] | undefined, frameW: number, frameH: number): Check[] {
  if (!lm || !img) return [{ id: "face", ok: false, hint: { es: "Pon tu cara dentro del óvalo", en: "Place your face inside the oval" } }];
  const { zones, faceW } = zoneGeometry(lm, frameW, frameH);
  const nose = lm[IDX.nose].x * frameW;
  const mid = ((lm[IDX.left].x + lm[IDX.right].x) / 2) * frameW;
  const yaw = Math.abs(nose - mid) / faceW;
  const roll = Math.abs((Math.atan2((lm[IDX.eyeR].y - lm[IDX.eyeL].y) * frameH, (lm[IDX.eyeR].x - lm[IDX.eyeL].x) * frameW) * 180) / Math.PI);
  const l = sampleZone(img, zones.cheekL.c, zones.cheekL.r).median;
  const r = sampleZone(img, zones.cheekR.c, zones.cheekR.r).median;
  const light = (l + r) / 2;
  return [
    { id: "face", ok: true, hint: { es: "Cara detectada", en: "Face found" } },
    { id: "close", ok: faceW / frameW > 0.38, hint: { es: "Acércate un poco más", en: "Come a little closer" } },
    { id: "frontal", ok: yaw < 0.07 && roll < 8, hint: { es: "Mira de frente, con la cabeza recta", en: "Look straight ahead, head level" } },
    { id: "light", ok: light > 42 && light < 88, hint: light <= 42 ? { es: "Falta luz: ponte frente a una ventana", en: "Too dark: face a window" } : { es: "Demasiada luz directa", en: "Too much direct light" } },
    { id: "even", ok: Math.abs(l - r) < 13, hint: { es: "La luz llega de un lado: gira hacia la luz", en: "Light comes from one side: turn toward it" } },
  ];
}

/**
 * Portrait crop where the face fills ~70% of the width (YouCam asks for
 * 60–80%), exported as JPEG. Returns the crop and its landmarks re-projected.
 */
export async function cropForAnalysis(source: HTMLCanvasElement, lm: NormalizedLandmark[]) {
  const w = source.width, h = source.height;
  const xs = lm.map((p) => p.x * w), ys = lm.map((p) => p.y * h);
  const faceW = Math.max(...xs) - Math.min(...xs);
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
  const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  let cw = Math.min(w, faceW / 0.7);
  let ch = cw * (4 / 3);
  if (ch > h) {
    ch = h;
    cw = ch * 0.75;
  }
  const x0 = Math.max(0, Math.min(w - cw, cx - cw / 2));
  const y0 = Math.max(0, Math.min(h - ch, cy - ch / 2));

  const scale = Math.min(1, 1440 / ch);
  const out = document.createElement("canvas");
  out.width = Math.round(cw * scale);
  out.height = Math.round(ch * scale);
  out.getContext("2d")!.drawImage(source, x0, y0, cw, ch, 0, 0, out.width, out.height);

  const cropLm = lm.map((p) => ({ ...p, x: (p.x * w - x0) / cw, y: (p.y * h - y0) / ch }));
  const blob: Blob = await new Promise((res) => out.toBlob((b) => res(b!), "image/jpeg", 0.92));
  return { canvas: out, blob, landmarks: cropLm as NormalizedLandmark[], shortSide: Math.min(out.width, out.height) };
}

export function thumbnail(canvas: HTMLCanvasElement, max = 420): string {
  const s = Math.min(1, max / Math.max(canvas.width, canvas.height));
  const t = document.createElement("canvas");
  t.width = Math.round(canvas.width * s);
  t.height = Math.round(canvas.height * s);
  t.getContext("2d")!.drawImage(canvas, 0, 0, t.width, t.height);
  return t.toDataURL("image/jpeg", 0.8);
}

/**
 * YouCam's own melasma map: share of each zone covered by YouCam's age_spot
 * mask (a PNG the size of the analysed crop, spots drawn with alpha). This
 * puts YouCam's detection, not just ours, behind every zone.
 */
export async function maskZoneCoverage(maskUrl: string, w: number, h: number, lm: NormalizedLandmark[]): Promise<Partial<Record<ZoneId, number>>> {
  const img = new Image();
  img.src = maskUrl;
  await img.decode();
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  const { zones } = zoneGeometry(lm, w, h);
  const out: Partial<Record<ZoneId, number>> = {};
  for (const id of ZONES) {
    const { c: ctr, r } = zones[id];
    let n = 0, hit = 0;
    for (let y = Math.max(0, Math.floor(ctr.y - r)); y < Math.min(h, ctr.y + r); y++)
      for (let x = Math.max(0, Math.floor(ctr.x - r)); x < Math.min(w, ctr.x + r); x++) {
        if ((x - ctr.x) ** 2 + (y - ctr.y) ** 2 > r * r) continue;
        n++;
        if (data[(y * w + x) * 4 + 3] > 40) hit++;
      }
    if (n) out[id] = Math.round((hit / n) * 100);
  }
  return out;
}

/** Her skin colour: median RGB of both cheeks, as #rrggbb. */
export function skinTone(img: ImageData, lm: NormalizedLandmark[]): string {
  const { zones } = zoneGeometry(lm, img.width, img.height);
  const R: number[] = [], G: number[] = [], B: number[] = [];
  for (const z of [zones.cheekL, zones.cheekR]) {
    const r = z.r * 0.8;
    for (let y = Math.max(0, Math.floor(z.c.y - r)); y < Math.min(img.height, z.c.y + r); y += 2)
      for (let x = Math.max(0, Math.floor(z.c.x - r)); x < Math.min(img.width, z.c.x + r); x += 2) {
        if ((x - z.c.x) ** 2 + (y - z.c.y) ** 2 > r * r) continue;
        const i = (y * img.width + x) * 4;
        R.push(img.data[i]);
        G.push(img.data[i + 1]);
        B.push(img.data[i + 2]);
      }
  }
  const med = (a: number[]) => (a.sort((m, n) => m - n)[Math.floor(a.length / 2)] ?? 180);
  return `#${[med(R), med(G), med(B)].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Tinted-sunscreen shades around her skin colour. Iron-oxide tints sit a
 * touch warmer than bare skin; we offer her match plus one lighter and one
 * deeper so she can see which disappears best.
 */
export function tintShades(hex: string): Array<{ id: "light" | "match" | "deep"; color: string }> {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const warm = (k: number) => {
    const rr = Math.min(255, r * k + 6), gg = Math.min(255, g * k + 1), bb = Math.min(255, b * k - 4);
    return `#${[rr, gg, bb].map((v) => Math.max(0, Math.round(v)).toString(16).padStart(2, "0")).join("")}`;
  };
  return [
    { id: "light", color: warm(1.08) },
    { id: "match", color: warm(1.0) },
    { id: "deep", color: warm(0.9) },
  ];
}
