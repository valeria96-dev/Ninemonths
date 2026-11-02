import { describe, expect, it } from "vitest";
import { ENTRIES, SOURCES } from "@/lib/ingredients/data";
import { checkIngredients } from "@/lib/ingredients/engine";

const v = (text: string, type: Parameters<typeof checkIngredients>[1] = "leave", week = 22) => checkIngredients(text, type, week);
const ids = (text: string, type: Parameters<typeof checkIngredients>[1] = "leave", week = 22) =>
  Object.fromEntries(v(text, type, week).matches.map((m) => [m.entry.id, m.status]));

describe("pregnancy ingredient rules", () => {
  it("every rule cites at least one source with a URL", () => {
    for (const e of ENTRIES) {
      expect(e.sources.length, e.id).toBeGreaterThan(0);
      for (const s of e.sources) expect(SOURCES[s]?.url, `${e.id}/${s}`).toMatch(/^https:\/\//);
    }
  });

  it.each([
    ["Aqua, Glycerin, Retinol, Tocopherol", "retinoids"],
    ["Aqua, Retinyl Palmitate", "retinoids"],
    ["Water, Tretinoin 0.05%", "retinoids"],
    ["Aqua, Hydroquinone, Glycerin", "hydroquinone"],
  ])("blocks %s", (text, id) => {
    expect(v(text).verdict).toBe("avoid");
    expect(ids(text)[id]).toBe("avoid");
  });

  it("salicylic acid depends on the product: rinse-off is fine, a peel is not", () => {
    expect(ids("Water, Salicylic Acid", "rinse").salicylic).toBe("safe");
    expect(ids("Water, Salicylic Acid", "peel").salicylic).toBe("avoid");
    expect(ids("Water, Salicylic Acid", "leave").salicylic).toBe("caution");
  });

  it("does not confuse the sunscreen filter ethylhexyl salicylate with salicylic acid", () => {
    expect(ids("Aqua, Ethylhexyl Salicylate, Zinc Oxide", "sunscreen").salicylic).toBeUndefined();
  });

  it.each([
    "Aqua, Azelaic Acid, Glycerin",
    "Aqua, Benzoyl Peroxide",
    "Aqua, Zinc Oxide, Titanium Dioxide, Iron Oxides",
    "Aqua, Niacinamide, Ascorbic Acid, Sodium Hyaluronate",
  ])("pregnancy-friendly actives pass: %s", (text) => {
    expect(v(text, text.includes("Zinc") ? "sunscreen" : "leave").verdict).toBe("safe");
  });

  it("hair dye is more cautious in the first trimester", () => {
    const dye = "Aqua, p-Phenylenediamine, Ammonia";
    expect(ids(dye, "hairdye", 8)["hair-dye"]).toBe("caution");
    expect(ids(dye, "hairdye", 24)["hair-dye"]).toBe("safe");
  });

  it("unknown ingredients are never reported as safe matches", () => {
    const r = v("Aqua, Madeupium Extract, Glycerin");
    expect(r.matches).toHaveLength(0);
    expect(r.unmatched).toContain("Madeupium Extract");
  });

  it("the worst ingredient decides the product verdict", () => {
    expect(v("Niacinamide, Azelaic Acid, Retinol").verdict).toBe("avoid");
    expect(v("Niacinamide, Bakuchiol").verdict).toBe("caution");
  });
});
