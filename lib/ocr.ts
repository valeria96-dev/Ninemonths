// On-device label reading (fallback when the server has no vision key).
// Tesseract runs in a web worker; the photo never leaves the phone.

type Progress = (p: number) => void;

/** Grayscale + upscale + contrast stretch: Tesseract reads small print far better. */
async function prepare(file: Blob): Promise<HTMLCanvasElement> {
  const bmp = await createImageBitmap(file);
  const target = 2200;
  const s = Math.min(3, target / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bmp, 0, 0, c.width, c.height);
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  let lo = 255,
    hi = 0;
  for (let i = 0; i < d.length; i += 16) {
    const y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    if (y < lo) lo = y;
    if (y > hi) hi = y;
  }
  const span = Math.max(40, hi - lo);
  for (let i = 0; i < d.length; i += 4) {
    const y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const v = Math.max(0, Math.min(255, ((y - lo) / span) * 255));
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/** Pull the INCI list out of whatever else is printed on the label. */
export function extractIngredients(raw: string): string {
  let t = raw.replace(/\r/g, "").replace(/-\n(?=[a-z])/g, "").replace(/\n+/g, " ");
  const start = t.search(/\b(ingredients?|ingr[eé]dients|ingredientes|composition|inci)\b\s*[:.\-]?/i);
  if (start >= 0) t = t.slice(start).replace(/^\S+\s*[:.\-]?\s*/, "");
  const end = t.search(/\b(directions|how to use|warnings?|caution|made in|distributed|manufactured|net wt|modo de uso|advertencia)\b|\b\d+([.,]\d+)?\s?(ml|fl\.? ?oz|g)\b/i);
  if (end > 20) t = t.slice(0, end);
  return t
    .replace(/[|•·;]/g, ",")
    .replace(/[^\p{L}\p{N}\s,()/.\-+%]/gu, " ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s{2,}/g, " ")
    .replace(/(,\s*){2,}/g, ", ")
    .replace(/^[,.\s]+|[,.\s]+$/g, "")
    .trim();
}

export async function readLabelOnDevice(file: Blob, onProgress?: Progress): Promise<string> {
  const [{ createWorker }, canvas] = await Promise.all([import("tesseract.js"), prepare(file)]);
  const worker = await createWorker("eng", 1, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === "recognizing text") onProgress?.(m.progress);
    },
  });
  try {
    const { data } = await worker.recognize(canvas);
    return extractIngredients(data.text);
  } finally {
    await worker.terminate();
  }
}
