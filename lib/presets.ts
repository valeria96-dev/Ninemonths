"use client";

import { dueDateFromWeek } from "@/lib/pregnancy";
import { update, type Scan, type State } from "@/lib/store";

// One-click judge presets. They write a believable pregnancy history to the
// phone's storage so every screen can be reviewed in seconds, without a camera
// or a bottle at hand. Sample scans are marked source "sample" in the data.

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

function sampleScan(id: string, week: number, weeksAgo: number, scores: Scan["scores"], zones: Scan["zones"], ycZones: Scan["ycZones"]): Scan {
  return { id, date: daysAgo(weeksAgo * 7), week, source: "sample", scores, zones, ycZones, photoKey: null, maskKey: null };
}

function mom(week: number): Pick<State, "profile" | "pass"> {
  return {
    profile: {
      dueDate: dueDateFromWeek(week),
      city: { name: "Miami, Florida, United States", lat: 25.7743, lon: -80.1937 },
      concerns: ["spots", "dryness"],
      fitzpatrick: "IV",
      createdAt: daysAgo(70),
    },
    pass: true,
  };
}

/** Week 22, melasma growing on both cheeks over 8 weeks, a retinol serum in use, itchy palms logged. */
export function presetMelasma() {
  update(() => ({
    ...mom(22),
    scans: [
      sampleScan("s14", 14, 8, { age_spot: 88, acne: 90, redness: 85, moisture: 52, radiance: 71, dark_circle: 78 }, { forehead: 6, cheekL: 8, cheekR: 9, upperLip: 5, chin: 4 }, { forehead: 2, cheekL: 3, cheekR: 4, upperLip: 1, chin: 1 }),
      sampleScan("s18", 18, 4, { age_spot: 83, acne: 88, redness: 84, moisture: 48, radiance: 66, dark_circle: 72 }, { forehead: 10, cheekL: 18, cheekR: 22, upperLip: 12, chin: 5 }, { forehead: 4, cheekL: 9, cheekR: 12, upperLip: 5, chin: 1 }),
      sampleScan("s22", 22, 0, { age_spot: 77, acne: 91, redness: 86, moisture: 45, radiance: 62, dark_circle: 66 }, { forehead: 12, cheekL: 31, cheekR: 41, upperLip: 21, chin: 6 }, { forehead: 5, cheekL: 16, cheekR: 22, upperLip: 9, chin: 2 }),
    ],
    checks: [
      {
        id: "c1",
        date: daysAgo(3),
        week: 22,
        name: "Radiance Night Serum",
        type: "leave",
        ingredientsText: "Aqua, Glycerin, Propanediol, Squalane, Niacinamide, Retinol, Retinyl Palmitate, Sodium Hyaluronate, Tocopherol, Phenoxyethanol, Parfum",
        verdict: "avoid",
        flagged: ["retinoids"],
        inUse: true,
      },
      {
        id: "c2",
        date: daysAgo(3),
        week: 22,
        name: "Mineral Sunscreen SPF 50",
        type: "sunscreen",
        ingredientsText: "Aqua, Zinc Oxide, Titanium Dioxide, Caprylic/Capric Triglyceride, Glycerin, Iron Oxides, Tocopherol",
        verdict: "safe",
        flagged: [],
        inUse: true,
      },
    ],
    symptoms: [{ id: "y1", date: daysAgo(1), week: 22, symptomIds: ["palm-itch", "face-patches"], level: 2 }],
  }));
}

/** Week 32, fresh profile; the symptom checker opens with itchy palms selected. */
export function presetSymptom() {
  update(() => ({ ...mom(32), scans: [], checks: [], symptoms: [] }));
  try {
    sessionStorage.setItem("nm.preset.symptoms", JSON.stringify(["palm-itch"]));
  } catch {}
}

/** Week 12, the label checker opens and reads a sample retinol label photo on the device. */
export function presetLabel() {
  update(() => ({ ...mom(12), scans: [], checks: [], symptoms: [] }));
  try {
    sessionStorage.setItem("nm.preset.label", "/demo/label-retinol.jpg");
  } catch {}
}
