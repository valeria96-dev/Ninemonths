import type { ConcernId } from "@/lib/skin/types";

// Measured photo-to-photo variation (2026-11-01): 6 captures of the same face
// with realistic changes in framing (±3%), distance (±4%), head tilt (±2°)
// and light (±7%), each through the full pipeline (crop → YouCam live → zone
// map). SD per metric below. A change between two selfies is reported only
// when it beats 2.8 × SD (≈ 2σ of the difference of two noisy readings), with
// a floor of 3 points. Smaller moves are "within normal photo variation".

export const NOISE_SD: Record<ConcernId, number> = {
  age_spot: 0.41,
  acne: 1.17,
  redness: 2.66,
  moisture: 1.79,
  radiance: 0.55,
  dark_circle: 0.41,
};
/** Largest SD across the five melasma zones (forehead and upper lip). */
export const ZONE_NOISE_SD = 1.75;

const threshold = (sd: number) => Math.max(3, Math.ceil(2.8 * sd));

export const MIN_CHANGE: Record<ConcernId, number> = Object.fromEntries(
  Object.entries(NOISE_SD).map(([k, sd]) => [k, threshold(sd)]),
) as Record<ConcernId, number>;

/** Zone-map change beyond normal variation. */
export const ZONE_MIN_CHANGE = threshold(ZONE_NOISE_SD);
/** Zone growth large enough to call melasma "growing" (2× the noise threshold). */
export const ZONE_GROWING = 2 * ZONE_MIN_CHANGE;

export const isRealChange = (c: ConcernId, delta: number) => Math.abs(delta) >= MIN_CHANGE[c];
