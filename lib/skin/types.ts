import type { L } from "@/lib/i18n";

/**
 * The YouCam concerns that matter in pregnancy: melasma (age_spot), hormonal
 * acne, redness, dryness, the "pregnancy glow" (radiance) and the dark
 * circles of short nights. 6 SD concerns per scan.
 */
export const CONCERNS = ["age_spot", "acne", "redness", "moisture", "radiance", "dark_circle"] as const;
export type ConcernId = (typeof CONCERNS)[number];

export const CONCERN_LABEL: Record<ConcernId, L> = {
  age_spot: { es: "Manchas", en: "Dark spots" },
  acne: { es: "Acné", en: "Acne" },
  redness: { es: "Rojez", en: "Redness" },
  moisture: { es: "Hidratación", en: "Hydration" },
  radiance: { es: "Luminosidad", en: "Radiance" },
  dark_circle: { es: "Ojeras", en: "Dark circles" },
};

/** YouCam action name for each concern (dark circles use the v2 model). */
export const CONCERN_ACTION: Record<ConcernId, string> = {
  age_spot: "age_spot",
  acne: "acne",
  redness: "redness",
  moisture: "moisture",
  radiance: "radiance",
  dark_circle: "dark_circle_v2",
};

/** The classic melasma zones (centrofacial + malar patterns). */
export const ZONES = ["forehead", "cheekL", "cheekR", "upperLip", "chin"] as const;
export type ZoneId = (typeof ZONES)[number];

export const ZONE_LABEL: Record<ZoneId, L> = {
  forehead: { es: "Frente", en: "Forehead" },
  cheekL: { es: "Mejilla izquierda", en: "Left cheek" },
  cheekR: { es: "Mejilla derecha", en: "Right cheek" },
  upperLip: { es: "Bigote", en: "Upper lip" },
  chin: { es: "Mentón", en: "Chin" },
};

export type SkinApiResult = {
  source: "youcam";
  scores: Partial<Record<ConcernId, number>>;
  /** age_spot mask as a data URL (YouCam's links expire after 2 hours). */
  spotMask: string | null;
  fitzpatrick?: string | null;
};
