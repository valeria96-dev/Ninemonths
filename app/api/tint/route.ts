import { tintPreview, YouCamError } from "@/lib/skin/youcam.server";

export const maxDuration = 60;

// POST multipart: image (her analysis crop, JPEG) + color (#RRGGBB, her matched
// tint shade). Returns { image: dataUrl } rendered by YouCam Makeup VTO.
export async function POST(request: Request) {
  if (!process.env.YOUCAM_API_KEY) return Response.json({ error: "no_key" }, { status: 501 });
  const form = await request.formData();
  const image = form.get("image");
  const color = String(form.get("color") ?? "");
  if (!(image instanceof Blob) || image.size > 9_500_000 || !/^#[0-9a-f]{6}$/i.test(color)) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  try {
    return Response.json({ image: await tintPreview(Buffer.from(await image.arrayBuffer()), color) });
  } catch (e) {
    if (e instanceof YouCamError) return Response.json({ error: e.code }, { status: e.status });
    throw e;
  }
}
