import { describe, expect, it } from "vitest";
import { levelFor, SYMPTOMS } from "@/lib/symptoms";

describe("symptom triage", () => {
  it("itchy palms and soles (cholestasis red flag) means see a doctor soon", () => {
    expect(levelFor(["palm-itch"])).toBeGreaterThanOrEqual(2);
  });
  it("fewer baby movements means get care now", () => {
    expect(levelFor(["fewer-movements"])).toBe(3);
  });
  it("common pregnancy skin changes stay reassuring", () => {
    expect(levelFor(["dark-line"])).toBe(0);
    expect(levelFor(["stretch-marks"])).toBe(0);
  });
  it("the most urgent symptom wins", () => {
    expect(levelFor(["dark-line", "palm-itch", "fewer-movements"])).toBe(3);
  });
  it("every symptom has a note in both languages", () => {
    for (const s of SYMPTOMS) {
      expect(s.note.es.length, s.id).toBeGreaterThan(10);
      expect(s.note.en.length, s.id).toBeGreaterThan(10);
    }
  });
});
