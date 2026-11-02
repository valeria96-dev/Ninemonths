import { analyseSkin, YouCamError } from "@/lib/skin/youcam.server";

export const maxDuration = 90;

// POST multipart: image (JPEG, already cropped on the phone so the face fills
// ~70% of the width, as YouCam requires), fitzpatrick ("1" to also run it).
// 501 means no YouCam key is configured; the client then runs demo mode.
export async function POST(request: Request) {
  if (!process.env.YOUCAM_API_KEY) return Response.json({ error: "no_key" }, { status: 501 });

  const form = await request.formData();
  const image = form.get("image");
  if (!(image instanceof Blob) || image.size > 9_500_000) return Response.json({ error: "bad_image" }, { status: 400 });

  try {
    const result = await analyseSkin(Buffer.from(await image.arrayBuffer()), form.get("fitzpatrick") === "1");
    return Response.json(result);
  } catch (e) {
    if (e instanceof YouCamError) return Response.json({ error: e.code }, { status: e.status });
    throw e;
  }
}
