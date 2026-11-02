import "server-only";
import { CONCERN_ACTION, CONCERNS, type ConcernId, type SkinApiResult } from "@/lib/skin/types";

// YouCam API v2 (docs.perfectcorp.com, v1.16). Flow: register the file →
// PUT the bytes to the signed URL → start the task → poll → read raw_score
// and mask_urls → delete the task so her photo does not stay on their side.

const BASE = "https://yce-api-01.makeupar.com";

function key() {
  const k = process.env.YOUCAM_API_KEY;
  if (!k) throw new YouCamError("no_key", 501);
  return k;
}

export class YouCamError extends Error {
  constructor(public code: string, public status = 502) {
    super(code);
  }
}

async function call(path: string, init?: RequestInit) {
  const res = await fetch(BASE + path, {
    ...init,
    headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json", ...init?.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new YouCamError(body.error_code ?? body.error ?? `http_${res.status}`, res.status === 401 ? 502 : res.status);
  return body.data;
}

async function upload(jpeg: Buffer): Promise<string> {
  const data = await call("/s2s/v2.0/file", {
    method: "POST",
    body: JSON.stringify({ files: [{ content_type: "image/jpeg", file_name: "face.jpg", file_size: jpeg.length }] }),
  });
  const file = data.files[0];
  const put = file.requests[0];
  const res = await fetch(put.url, { method: put.method ?? "PUT", headers: put.headers, body: new Uint8Array(jpeg) });
  if (!res.ok) throw new YouCamError("upload_failed");
  return file.file_id as string;
}

async function poll(path: string, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    await new Promise((r) => setTimeout(r, 2000));
    const data = await call(path);
    if (data.task_status === "success") return data;
    if (data.task_status === "error") throw new YouCamError(data.error ?? "task_error", 422);
  }
  throw new YouCamError("timeout", 504);
}

async function toDataUrl(url: string) {
  const res = await fetch(url);
  if (!res.ok) return null;
  // S3 serves masks as binary/octet-stream; they are PNGs with alpha.
  return `data:image/png;base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
}

export async function analyseSkin(jpeg: Buffer, withFitzpatrick: boolean): Promise<SkinApiResult> {
  const fileId = await upload(jpeg);
  const hd = process.env.YOUCAM_HD === "1";
  const actions = CONCERNS.map((c) => (hd ? `hd_${c}` : CONCERN_ACTION[c]));

  const fitz = withFitzpatrick ? fitzpatrick(fileId).catch(() => null) : Promise.resolve(null);

  const { task_id } = await call("/s2s/v2.1/task/skin-analysis", {
    method: "POST",
    body: JSON.stringify({ src_file_id: fileId, dst_actions: actions, miniserver_args: { enable_mask_overlay: false }, format: "json" }),
  });
  try {
    const data = await poll(`/s2s/v2.1/task/skin-analysis/${task_id}`);
    const output = data.results.output as Array<{ type: string; region?: string; raw_score?: number; mask_urls?: string[] }>;

    const scores: Partial<Record<ConcernId, number>> = {};
    let maskUrl: string | null = null;
    for (const o of output) {
      const id = o.type.replace(/^hd_/, "").replace(/_v2$/, "") as ConcernId;
      if (!CONCERNS.includes(id) || typeof o.raw_score !== "number") continue;
      // HD returns per-region rows; keep the whole-face one when present.
      if (o.region && o.region !== "whole" && scores[id] !== undefined) continue;
      scores[id] = Math.round(o.raw_score);
      if (id === "age_spot" && o.mask_urls?.[0]) maskUrl = o.mask_urls[0];
    }
    return { source: "youcam", scores, spotMask: maskUrl ? await toDataUrl(maskUrl) : null, fitzpatrick: await fitz };
  } finally {
    call("/s2s/v2.0/task/delete", { method: "POST", body: JSON.stringify({ task_id }) }).catch(() => {});
  }
}

async function fitzpatrick(fileId: string): Promise<string | null> {
  const { task_id } = await call("/s2s/v2.0/task/fitzpatrick-scale-analyzer", {
    method: "POST",
    body: JSON.stringify({ src_file_id: fileId, version: "1.0", index: 0 }),
  });
  const data = await poll(`/s2s/v2.0/task/fitzpatrick-scale-analyzer/${task_id}`, 40_000);
  return (data.results?.fitzpatrick_scale as string) ?? null;
}

/**
 * Makeup VTO (1 unit): tinted sunscreen preview. A sheer foundation layer in
 * her matched shade stands in for an iron-oxide tinted mineral SPF.
 */
export async function tintPreview(jpeg: Buffer, color: string): Promise<string> {
  const fileId = await upload(jpeg);
  const { task_id } = await call("/s2s/v2.0/task/makeup-vto", {
    method: "POST",
    body: JSON.stringify({
      src_file_id: fileId,
      version: "1.0",
      effects: [
        { category: "skin_smooth", skinSmoothStrength: 0, skinSmoothColorIntensity: 0 },
        { category: "foundation", palettes: [{ color, colorIntensity: 45, glowIntensity: 20, coverageIntensity: 45 }] },
      ],
    }),
  });
  try {
    const data = await poll(`/s2s/v2.0/task/makeup-vto/${task_id}`, 45_000);
    const url = (data.results?.url ?? data.results?.[0]?.url) as string | undefined;
    if (!url) throw new YouCamError("no_result");
    const res = await fetch(url);
    if (!res.ok) throw new YouCamError("download_failed");
    const buf = Buffer.from(await res.arrayBuffer());
    const type = buf[0] === 0x89 && buf[1] === 0x50 ? "image/png" : "image/jpeg";
    return `data:${type};base64,${buf.toString("base64")}`;
  } finally {
    call("/s2s/v2.0/task/delete", { method: "POST", body: JSON.stringify({ task_id }) }).catch(() => {});
  }
}
