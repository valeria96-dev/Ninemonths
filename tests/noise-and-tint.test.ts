import { describe, expect, it } from "vitest";
import { tintShades } from "@/lib/skin/face";
import { isRealChange, MIN_CHANGE, NOISE_SD, ZONE_GROWING, ZONE_MIN_CHANGE, ZONE_NOISE_SD } from "@/lib/skin/noise";
import { CONCERN_ACTION, CONCERNS } from "@/lib/skin/types";

describe("measured noise thresholds", () => {
  it("every concern's threshold beats 2.8× its measured SD and is at least 3 points", () => {
    for (const c of CONCERNS) {
      expect(MIN_CHANGE[c]).toBeGreaterThanOrEqual(3);
      expect(MIN_CHANGE[c]).toBeGreaterThanOrEqual(2.8 * NOISE_SD[c]);
    }
    expect(ZONE_MIN_CHANGE).toBeGreaterThanOrEqual(2.8 * ZONE_NOISE_SD);
    expect(ZONE_GROWING).toBe(2 * ZONE_MIN_CHANGE);
  });
  it("small moves are not reported as change; real ones are", () => {
    expect(isRealChange("redness", 5)).toBe(false); // redness is the noisiest YouCam score
    expect(isRealChange("redness", -9)).toBe(true);
    expect(isRealChange("age_spot", -2)).toBe(false);
    expect(isRealChange("age_spot", -4)).toBe(true);
  });
  it("dark circles use YouCam's v2 model name", () => {
    expect(CONCERN_ACTION.dark_circle).toBe("dark_circle_v2");
  });
});

describe("tinted sunscreen shades", () => {
  const lum = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).reduce((a, b) => a + b, 0);
  it.each(["#f1d3c2", "#c99a7e", "#7a4f3a", "#3e2a22"])("offers lighter / match / deeper around %s", (skin) => {
    const s = tintShades(skin);
    expect(s.map((x) => x.id)).toEqual(["light", "match", "deep"]);
    expect(lum(s[0].color)).toBeGreaterThan(lum(s[1].color));
    expect(lum(s[1].color)).toBeGreaterThan(lum(s[2].color));
    for (const x of s) expect(x.color).toMatch(/^#[0-9a-f]{6}$/);
  });
});
