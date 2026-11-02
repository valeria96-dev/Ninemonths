import type { ConcernId, ZoneId } from "@/lib/skin/types";

// Demo mode, used when no YouCam key is configured. The spot score is derived
// from our real on-device pigment index; the others are placeholders. The UI
// labels every demo result as simulated.

export function demoScores(zones: Partial<Record<ZoneId, number>>, seed: number): Partial<Record<ConcernId, number>> {
  const vals = Object.values(zones);
  const pigment = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 20;
  const wobble = (n: number) => Math.round(Math.sin(seed * 12.9898 + n) * 6);
  const clamp = (v: number) => Math.max(5, Math.min(98, Math.round(v)));
  return {
    age_spot: clamp(92 - pigment * 0.9),
    acne: clamp(78 + wobble(1)),
    redness: clamp(74 + wobble(2)),
    moisture: clamp(62 + wobble(3)),
    radiance: clamp(66 + wobble(4)),
    dark_circle: clamp(70 + wobble(5)),
  };
}
