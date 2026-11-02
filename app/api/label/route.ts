import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

export const maxDuration = 60;

// Reads the ingredient list off a photo of a product label. Only extraction
// happens here; the safety verdict is decided by our own rule list on the
// phone (lib/ingredients), never by the model.

const Label = z.object({
  readable: z.boolean().describe("false if no ingredient list is legible in the photo"),
  productName: z.string().describe("product name as printed, or empty string"),
  productType: z.enum(["rinse", "leave", "sunscreen", "peel", "hairdye", "straightener", "body", "other"]),
  ingredients: z.array(z.string()).describe("every ingredient in printed order, exactly as written (INCI)"),
});

const PROMPT = `This is a photo of a cosmetic or skincare product. Transcribe its ingredient list (INCI) exactly as printed, in order, one ingredient per array item. Keep percentages if printed. Do not add, guess or translate ingredients; if part of the list is cut off or unreadable, transcribe only what you can read. productType: rinse = cleanser/shampoo washed off, leave = face cream/serum, body = body cream/oil, peel = strong exfoliant/peel, hairdye, straightener = keratin/straightening, sunscreen, other.`;

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ error: "no_key" }, { status: 501 });

  const form = await request.formData();
  const image = form.get("image");
  if (!(image instanceof Blob) || image.size > 5_000_000) return Response.json({ error: "bad_image" }, { status: 400 });
  const mediaType = image.type === "image/png" ? "image/png" : image.type === "image/webp" ? "image/webp" : "image/jpeg";

  const client = new Anthropic();
  try {
    const message = await client.beta.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: betaZodOutputFormat(Label) },
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: Buffer.from(await image.arrayBuffer()).toString("base64") } },
            { type: "text", text: PROMPT },
          ],
        },
      ],
    });
    if (message.stop_reason === "refusal" || !message.parsed_output) return Response.json({ error: "unreadable" }, { status: 422 });
    return Response.json(message.parsed_output);
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return Response.json({ error: "busy" }, { status: 429 });
    if (e instanceof Anthropic.APIError) return Response.json({ error: "vision_failed" }, { status: 502 });
    throw e;
  }
}
