import { describe, expect, it } from "vitest";
import { extractIngredients } from "@/lib/ocr";

describe("label OCR clean-up", () => {
  it("keeps only the INCI list between the header and the volume / made-in line", () => {
    const raw = "LUMEN LAB\nRadiance Night Serum\nDirections: apply at night.\nINGREDIENTS: Aqua, Glycerin, Retinol,\nRetinyl Palmitate, Parfum.\n30 ml / 1.0 fl oz   Made in USA";
    expect(extractIngredients(raw)).toBe("Aqua, Glycerin, Retinol, Retinyl Palmitate, Parfum");
  });
  it("re-joins words hyphenated across lines", () => {
    expect(extractIngredients("Ingredients: Aqua, Glyce-\nrin, Niacinamide")).toBe("Aqua, Glycerin, Niacinamide");
  });
  it("accepts Spanish headers", () => {
    expect(extractIngredients("Ingredientes: Aqua, Glicerina")).toBe("Aqua, Glicerina");
  });
});
