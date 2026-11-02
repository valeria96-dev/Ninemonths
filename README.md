# Ninemonths

**Track your pregnancy skin, week by week.** One guided selfie a week: YouCam
Skin AI measures the skin, Ninemonths maps melasma zone by zone and tells her
what changed and what to do today. Plus a pregnancy-safety check for every
cream (label photo read on the phone) and a symptom check that knows when skin
is really the liver.

Live: **https://ninemonths.skin** · Built for the YouCam API Skin AI & eCommerce VTO hackathon.

## For judges, in 60 seconds

Open **https://ninemonths.skin/demo** and tap any card. Each one loads a
ready-made case on your device and opens the screen that shows it. No camera,
account or key needed.

| # | Preset | What you'll see |
|---|---|---|
| 1 | **Melasma growing, week 14 → 22** | "Your melasma is growing on your right cheek", the per-zone map with deltas, the week-by-week trend, a routine that switches to azelaic acid + tinted sunscreen, and the one-page doctor summary |
| 2 | **Label photo → retinol → avoid** | A serum label photo is read **on the phone** (tesseract.js) and every ingredient gets a pregnancy traffic light with its medical source |
| 3 | **Itchy palms → cholestasis** | A symptom that looks like skin but can be the liver: "see your doctor soon" and which blood test to ask for |

For the real thing, go to **My skin → Take a guided selfie** (or upload a
front-facing photo): the live YouCam analysis returns in ~6–10 s.

## How YouCam is used

| YouCam API | What we do with it |
|---|---|
| **Skin Analysis v2.1** — 6 concerns chosen for pregnancy: `age_spot` (melasma), `acne`, `redness`, `moisture`, `radiance` (the "glow"), `dark_circle_v2` (short nights) | File upload → signed PUT → task → poll → read **`raw_score`** (not the inflated `ui_score`). The task is deleted right after reading, so her photo doesn't stay on YouCam's side. |
| **Skin Analysis `age_spot` mask → per-zone melasma map** | YouCam's spot mask (a PNG the size of her photo) is intersected with our face-mesh zones — forehead, cheeks, upper lip, chin — so every zone shows **what YouCam's detector marked there**, next to our on-device pigment index. Also drawn over her photo ("Show spots"). |
| **Makeup VTO** (`foundation`, smoothing off) | **Tinted-sunscreen try-on**: iron-oxide tinted mineral SPF is the best melasma shield, and the fear is "it'll look orange on me". She sees a sheer tint in three shades around her measured cheek colour (lighter / match / deeper) on her own selfie, with a before/after slider, before buying. Skin smoothing is explicitly set to 0 so the preview never airbrushes her. 1 unit per shade, cached on the phone. |
| **Fitzpatrick Scale Analyzer** | Skin phototype → deeper skin tones get tinted (iron-oxide) sunscreen in the routine, because visible light darkens melasma. |

Around YouCam we built what makes week-to-week numbers comparable and useful:

- **Guided capture** (MediaPipe Face Landmarker, on device): face found, distance, frontal pose, light level; shutter unlocks only when they pass. **Last week's selfie appears as a ghost** inside the frame, so she lines up the same distance and angle every week. Crop to YouCam's 60–80% face-width requirement before upload, so bad photos cost no units.
- **Measured noise floor**: a change between two selfies is only reported when it beats the photo-to-photo variation we measured (table below); smaller moves show "≈ no real change".
- **Melasma zone map** (forehead, cheeks, upper lip, chin), computed on the phone: share of skin that is locally darker than its surroundings, after removing each zone's lighting gradient with a fitted plane, at a fixed face scale, ignoring hair/nostrils (too dark) and lips (too red).
- **Week-over-week insight**: zone growth or fading, trimester-aware advice, trend chart, then/now photos.
- **YouCam errors → plain advice** ("your face is tilted, look straight at the camera", "too dark, face a window").

## Evidence

**Automated tests: 35, all passing** (`npm test`).

| Suite | What it proves |
|---|---|
| `tests/melasma-zones.test.ts` | Positive and negative controls for the zone map on a synthetic face (table below) |
| `tests/ingredients.test.ts` | Every rule cites a source URL; retinoids/hydroquinone blocked; salicylic acid depends on product type (rinse ✓, leave-on ⚠, peel ✗); the sunscreen filter *ethylhexyl salicylate* is not confused with salicylic acid; first-trimester hair-dye rule; unknown ingredients are never called safe |
| `tests/symptoms.test.ts` | Itchy palms → see a doctor soon; fewer baby movements → get care now; common changes stay reassuring; most urgent wins |
| `tests/ocr.test.ts` | INCI list isolated from the rest of the label; hyphenation re-joined; Spanish headers |
| `tests/claims.test.ts` | Claim guard: fails the build if any user-facing text promises a diagnosis, a cure or absolute safety (EN + ES) |
| `tests/noise-and-tint.test.ts` | Change thresholds derive from the measured noise (≥ 2.8 × SD, floor 3); try-on shades are ordered lighter → match → deeper for light to deep skin |

**Melasma zone map — controls** (zone index 0–100: forehead / left cheek / right cheek / upper lip / chin):

| Case | Result |
|---|---|
| Even, clean skin | 0 / 0 / 0 / 0 / 0 |
| Strong side lighting (75% → 115% brightness across the face) | 0 / 0 / 0 / 0 / 0 |
| Dark fringe over the forehead | 0 / 0 / 0 / 0 / 0 |
| Melasma-like patches on the right cheek | 0 / 0 / **79** / 0 / 0 |
| Same patches under side lighting | 0 / 0 / **79** / 0 / 0 |

**Photo-to-photo noise, measured** (same face, 6 captures with realistic changes in framing ±3%, distance ±4%, head tilt ±2° and light ±7%, each through the full live pipeline):

| Metric | SD across captures | Reported as a change only if ≥ |
|---|---|---|
| YouCam dark spots (`age_spot`) | 0.4 | 3 |
| YouCam radiance / dark circles | 0.6 / 0.4 | 3 / 3 |
| YouCam acne | 1.2 | 4 |
| YouCam hydration | 1.8 | 6 |
| YouCam redness | 2.7 | 8 |
| Our melasma zone index (worst zone) | 1.75 | 5 ("growing" at 10) |
| YouCam mask coverage per zone | ≤ 0.8 % | — |

**On a real photo, with the live YouCam API:**

| Check | Result |
|---|---|
| Repeatability — same face, uploaded photo vs guided-camera capture | Zones 16/3/0/29/7 vs 17/3/1/28/8 (max difference 1 point). YouCam spots 94 vs 94 |
| Sensitivity — patches added to both cheeks | Right cheek 0 → 54, left cheek 3 → 20; forehead 16 → 16, chin 7 → 9. The app said "Your melasma is growing on your right cheek" |
| Latency | ~6–10 s per analysis, end to end |
| Label photo OCR (flat printed label) | 15 of 15 ingredients read correctly on the phone |

## Run it

```bash
cp .env.example .env.local   # keys are optional, see below
npm install
PORT=3020 npm run dev        # http://localhost:3020
npm test                     # 35 tests
```

| Env var | Without it |
|---|---|
| `YOUCAM_API_KEY` | Skin analysis runs in **demo mode**: the zone map is real (on-device), the four scores are simulated and labelled as such. |
| `YOUCAM_HD=1` | SD concerns (9 units/scan). HD costs 12. |
| `ANTHROPIC_API_KEY` | "Photo of the label" is read on the phone with tesseract.js (`lib/ocr.ts`); the photo never leaves the device. |

## What is where

| Piece | File |
|---|---|
| Ingredient rules + sources | `lib/ingredients/data.ts` (every entry cites a source; unknown ≠ safe) |
| Label checker | `lib/ingredients/engine.ts` (product-type and first-trimester overrides) |
| Label photo → INCI list | `lib/ocr.ts` (on device, tesseract.js); optional server vision in `app/api/label/route.ts`. Extraction only — the verdict is always ours |
| YouCam Skin Analysis + Fitzpatrick | `lib/skin/youcam.server.ts`, `app/api/skin/route.ts` |
| YouCam Makeup VTO (tinted sunscreen try-on) | `lib/skin/youcam.server.ts` (`tintPreview`), `app/api/tint/route.ts`, `components/TintTryOn.tsx` |
| Noise thresholds | `lib/skin/noise.ts` |
| Guided selfie, crop, melasma zone map | `lib/skin/face.ts`, `components/GuidedCamera.tsx` (MediaPipe, on device) |
| Symptom triage | `lib/symptoms.ts` (cholestasis red flag, RCOG) |
| Routine | `lib/plan.ts` (ingredients to look for, never brands) |
| UV of her city | `lib/uv.ts` (Open-Meteo, no key) |
| Judge presets | `lib/presets.ts`, `app/demo/page.tsx` (sample data is labelled "sample", never "YouCam") |
| State | `lib/store.ts` (localStorage), `lib/photos.ts` (IndexedDB). No accounts, no server database. |

## Business

Free: 3 product checks, 1 skin analysis, symptom check always, UV.
**Pregnancy pass — $9.99 once** for the whole pregnancy (no subscription to
forget): unlimited checks, weekly scans with history and zone map, routine,
doctor summary. Payment is not wired in this build (demo unlock).

## Medical sources

ACOG (Skin Conditions During Pregnancy), American Academy of Dermatology,
Bozzo et al. *Can Fam Physician* 2011, Murase et al. *J Am Acad Dermatol* 2014,
Brennan et al. Cochrane 2012, RCOG Green-top Guideline 43. Links in
`lib/ingredients/data.ts` and on the site footer. Ninemonths does not replace
a doctor and never diagnoses.
