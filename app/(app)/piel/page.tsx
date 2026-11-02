"use client";

import { isRealChange, MIN_CHANGE, ZONE_GROWING, ZONE_MIN_CHANGE } from "@/lib/skin/noise";
import { AnalysisWait } from "@/components/AnalysisWait";
import { TintTryOn } from "@/components/TintTryOn";
import { ScoreRing, SkinPortrait, ZoneFace } from "@/components/skin-visuals";
import { Ready } from "@/components/AppGate";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { GuidedCamera, type Capture } from "@/components/GuidedCamera";
import { CameraIcon, UploadIcon } from "@/components/icons";
import { Disclaimer, SectionTitle } from "@/components/ui";
import { useLang, type L } from "@/lib/i18n";
import { loadPhoto, savePhoto } from "@/lib/photos";
import { canScan, uid, update, type Scan } from "@/lib/store";
import { demoScores } from "@/lib/skin/demo";
import {
  cropForAnalysis,
  getStillLandmarker,
  maskZoneCoverage,
  pigmentIndex,
  skinTone,
  thumbnail,
  zoneGeometry,
} from "@/lib/skin/face";

// Dev-only hook so the zone maths can be tested from the console without
// spending YouCam units.
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  (window as unknown as { __nm: unknown }).__nm = {
    getStillLandmarker,
    pigmentIndex,
    zoneGeometry,
    cropForAnalysis,
    maskZoneCoverage,
  };
}
import {
  CONCERN_LABEL,
  CONCERNS,
  ZONE_LABEL,
  ZONES,
  type SkinApiResult,
  type ZoneId,
} from "@/lib/skin/types";
import { useProfile } from "@/lib/useProfile";

const ERRORS: Record<string, L> = {
  error_src_face_too_small: {
    es: "La cara salió muy pequeña. Acércate más.",
    en: "Your face was too small. Come closer.",
  },
  error_lighting_dark: {
    es: "Falta luz. Ponte frente a una ventana.",
    en: "Too dark. Face a window.",
  },
  error_below_min_image_size: {
    es: "La foto tiene muy poca resolución.",
    en: "The photo resolution is too low.",
  },
  error_no_face: {
    es: "No encontramos una cara en la foto.",
    en: "We couldn't find a face in the photo.",
  },
  error_pose: {
    es: "Mira de frente a la cámara.",
    en: "Look straight at the camera.",
  },
  error_large_face_angle: {
    es: "Tu cara está un poco girada o inclinada. Mira de frente, con la cabeza recta.",
    en: "Your face is turned or tilted. Look straight at the camera, head level.",
  },
  error_src_face_out_of_bound: {
    es: "Tu cara quedó cortada. Centra tu cara en la foto.",
    en: "Your face is cut off. Centre your face in the photo.",
  },
  error_face_out_of_bound: {
    es: "Tu cara quedó cortada. Centra tu cara en la foto.",
    en: "Your face is cut off. Centre your face in the photo.",
  },
  error_lighting_bright: {
    es: "Hay demasiada luz. Evita el sol directo.",
    en: "Too bright. Avoid direct sun.",
  },
  error_lighting_uneven: {
    es: "La luz no es pareja. Ponte de frente a la ventana.",
    en: "Uneven light. Face the window directly.",
  },
  error_multiple_faces: {
    es: "Hay más de una cara en la foto.",
    en: "There is more than one face in the photo.",
  },
  error_inference: {
    es: "YouCam no pudo analizar esta foto. Prueba con otra, de frente y con buena luz.",
    en: "YouCam couldn't analyse this photo. Try another one, straight on and well lit.",
  },
  CreditInsufficiency: {
    es: "Se acabaron las unidades de YouCam de esta demo.",
    en: "This demo ran out of YouCam units.",
  },
};

function Skin() {
  const { t } = useLang();
  const { state, profile, week, tri } = useProfile();
  const [camera, setCamera] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const allowed = canScan(state);
  const scans = state.scans;
  const latest = scans.at(-1);
  const first = scans[0];
  const prev = scans.at(-2);
  const [ghost, setGhost] = useState<string | null>(null);
  useEffect(() => {
    if (camera) loadPhoto(latest?.photoKey ?? null).then(setGhost);
  }, [camera, latest?.photoKey]);

  async function analyse({ canvas, landmarks }: Capture) {
    setCamera(false);
    setBusy(true);
    setError(null);
    try {
      const crop = await cropForAnalysis(canvas, landmarks);
      if (crop.shortSide < 480) {
        setError(
          t({
            es: "La foto tiene poca resolución. Usa la cámara frontal con buena luz.",
            en: "The photo resolution is low. Use the front camera in good light.",
          }),
        );
        return;
      }
      const img = crop.canvas
        .getContext("2d")!
        .getImageData(0, 0, crop.canvas.width, crop.canvas.height);
      const zones = pigmentIndex(img, crop.landmarks);
      const skinHex = skinTone(img, crop.landmarks);

      const form = new FormData();
      form.append("image", crop.blob, "face.jpg");
      form.append("fitzpatrick", profile.fitzpatrick ? "0" : "1");
      const res = await fetch("/api/skin", { method: "POST", body: form });

      let source: Scan["source"] = "demo";
      let scores = demoScores(zones, scans.length + week);
      let mask: string | null = null;
      if (res.ok) {
        const data = (await res.json()) as SkinApiResult;
        source = "youcam";
        scores = data.scores;
        mask = data.spotMask;
        if (data.fitzpatrick)
          update((s) => ({
            ...s,
            profile: s.profile && {
              ...s.profile,
              fitzpatrick: data.fitzpatrick as never,
            },
          }));
      } else if (res.status !== 501) {
        const { error: code } = await res.json().catch(() => ({ error: "" }));
        setError(
          t(
            ERRORS[code] ?? {
              es: "El análisis falló. Intenta de nuevo con más luz.",
              en: "The analysis failed. Try again with more light.",
            },
          ),
        );
        return;
      }

      const id = uid();
      const photoKey = await savePhoto(id, thumbnail(crop.canvas));
      const maskKey = mask ? await savePhoto(`${id}-mask`, mask) : null;
      // Full-size crop for the tinted-sunscreen try-on (YouCam needs ≥480 px).
      const fullKey = await savePhoto(`${id}-full`, thumbnail(crop.canvas, 1280));
      const ycZones = mask ? await maskZoneCoverage(mask, crop.canvas.width, crop.canvas.height, crop.landmarks).catch(() => undefined) : undefined;
      update((s) => ({
        ...s,
        scans: [
          ...s.scans,
          {
            id,
            date: new Date().toISOString(),
            week,
            source,
            scores,
            zones,
            photoKey,
            maskKey,
            fullKey,
            ycZones,
            skinHex,
          },
        ],
      }));
    } catch {
      setError(
        t({
          es: "Algo falló al procesar la foto. Intenta de nuevo.",
          en: "Something went wrong processing the photo. Try again.",
        }),
      );
    } finally {
      setBusy(false);
    }
  }

  async function fromFile(file: File) {
    setBusy(true);
    try {
      const bmp = await createImageBitmap(file);
      const c = document.createElement("canvas");
      c.width = bmp.width;
      c.height = bmp.height;
      c.getContext("2d")!.drawImage(bmp, 0, 0);
      const lm = (await getStillLandmarker()).detect(c).faceLandmarks[0];
      if (!lm) {
        setError(t(ERRORS.error_no_face));
        setBusy(false);
        return;
      }
      await analyse({ canvas: c, landmarks: lm });
    } catch {
      setError(
        t({
          es: "No pudimos leer la foto.",
          en: "We couldn't read the photo.",
        }),
      );
      setBusy(false);
    }
  }

  return (
    <div>
      {busy && <AnalysisWait hasPrevious={scans.length > 0} />}
      {camera && (
        <GuidedCamera onCapture={analyse} onCancel={() => setCamera(false)} ghost={ghost} ghostLabel={latest ? t({ es: `Guía: semana ${latest.week}`, en: `Guide: week ${latest.week}` }) : undefined} />
      )}
      <SectionTitle
        kicker={t({ es: `Semana ${week}`, en: `Week ${week}` })}
        title={t({ es: "Mi piel", en: "My skin" })}
        sub={t({
          es: "Una selfie guiada por semana. Siempre con la misma luz, para que la comparación sea real.",
          en: "One guided selfie a week. Same light every time, so the comparison is real.",
        })}
      />

      {!latest && (
        <div className="scan-intro">
          <SkinPortrait compact />
          <div>
            <p className="mini-label mb-2">
              {t({ es: "TU PUNTO DE PARTIDA", en: "YOUR STARTING POINT" })}
            </p>
            <h2>
              {t({
                es: "Una selfie. Más claridad.",
                en: "One selfie. More clarity.",
              })}
            </h2>
            <p>
              {t({
                es: "Luz natural, rostro de frente y sin filtros. Te guiamos para conseguir una foto comparable cada semana.",
                en: "Natural light, face forward and no filters. We'll guide you to a comparable photo every week.",
              })}
            </p>
          </div>
        </div>
      )}
      {allowed ? (
        <div className="card space-y-2 p-4">
          <button
            className="btn btn-primary w-full"
            onClick={() => setCamera(true)}
            disabled={busy}
          >
            {busy ? (
              t({ es: "Analizando tu piel…", en: "Analysing your skin…" })
            ) : (
              <>
                <CameraIcon width={20} height={20} />
                {t({ es: "Tomar selfie guiada", en: "Take a guided selfie" })}
              </>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && fromFile(e.target.files[0])}
          />
          <button
            className="btn btn-ghost w-full text-sm"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
          >
            <UploadIcon width={18} height={18} />
            {t({ es: "Subir una foto", en: "Upload a photo" })}
          </button>
          {error && (
            <p className="rounded-xl bg-avoid-tint p-3 text-sm text-avoid">
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="card p-5">
          <p className="font-semibold">
            {t({
              es: "Tu análisis gratis ya está hecho",
              en: "Your free analysis is done",
            })}
          </p>
          <p className="mt-1 text-sm text-ink-2">
            {t({
              es: "El melasma se ve con el tiempo. Con el pase haces una selfie cada semana y ves qué zonas cambian.",
              en: "Melasma shows over time. With the pass you take a selfie every week and see which zones change.",
            })}
          </p>
          <Link href="/pase" className="btn btn-primary mt-4">
            {t({ es: "Ver el pase · $9.99", en: "See the pass · $9.99" })}
          </Link>
        </div>
      )}

      {latest && (
        <section className="skin-results mt-6 space-y-4">
          {latest.source === "demo" && (
            <p className="rounded-xl bg-caution-tint p-3 text-xs text-caution">
              {t({
                es: "Modo demo: YouCam no está conectado. El mapa de zonas es real (se calcula en tu teléfono); las puntuaciones de acné, rojez e hidratación son simuladas.",
                en: "Demo mode: YouCam isn't connected. The zone map is real (computed on your phone); acne, redness and hydration scores are simulated.",
              })}
            </p>
          )}
          {latest.source === "sample" && (
            <p className="rounded-xl bg-brand-tint p-3 text-xs text-brand-deep">
              {t({
                es: "Historial de ejemplo para revisar la app. Toma tu selfie guiada para sumar una medición real de YouCam.",
                en: "Sample history to review the app. Take your guided selfie to add a real YouCam measurement.",
              })}
            </p>
          )}
          <Insight latest={latest} prev={prev} first={first} tri={tri} />
          <Scores latest={latest} prev={prev} />
          <ZoneMap latest={latest} first={first} />
          {scans.length > 1 && <Trend scans={scans} />}
          <Photos first={first} latest={latest} />
          {latest.source === "youcam" && <TintTryOn scan={latest} />}
          {profile.fitzpatrick && (
            <p className="text-sm text-ink-2">
              {t({
                es: "Fototipo (Fitzpatrick):",
                en: "Skin phototype (Fitzpatrick):",
              })}{" "}
              <b>{profile.fitzpatrick}</b>
              {["IV", "V", "VI"].includes(profile.fitzpatrick) &&
                t({
                  es: " — tu piel tiene más tendencia al melasma; el protector con color es tu mejor aliado.",
                  en: " — your skin is more prone to melasma; tinted sunscreen is your best ally.",
                })}
            </p>
          )}
        </section>
      )}
      <Disclaimer />
    </div>
  );
}

function Insight({
  latest,
  prev,
  first,
  tri,
}: {
  latest: Scan;
  prev?: Scan;
  first: Scan;
  tri: 1 | 2 | 3;
}) {
  const { t } = useLang();
  const ref = prev ?? first;
  const d =
    latest !== ref &&
    latest.scores.age_spot != null &&
    ref.scores.age_spot != null
      ? latest.scores.age_spot - ref.scores.age_spot
      : null;
  // Which zones gained the most pigment since the first selfie.
  const gains = ZONES.map((z) => ({
    z,
    g: (latest.zones[z] ?? 0) - (first.zones[z] ?? 0),
  })).sort((a, b) => b.g - a.g);
  const top = gains[0];
  const malar =
    (latest.zones.cheekL ?? 0) + (latest.zones.cheekR ?? 0) >
    2 * ((latest.zones.forehead ?? 0) + (latest.zones.upperLip ?? 0));

  // Zone growth since the previous selfie: the on-device map sees local
  // patches that the whole-face YouCam score can average away.
  const zoneUp = ZONES.map((z) => ({
    z,
    g: (latest.zones[z] ?? 0) - (ref.zones[z] ?? 0),
  })).sort((x, y) => y.g - x.g)[0];
  const spreading = latest !== ref && zoneUp.g >= ZONE_GROWING;
  const zoneDown = ZONES.map((z) => ({
    z,
    g: (ref.zones[z] ?? 0) - (latest.zones[z] ?? 0),
  })).sort((x, y) => y.g - x.g)[0];
  const fading = latest !== ref && !spreading && zoneDown.g >= ZONE_GROWING;

  let head: L;
  let body: L;
  const advice: L =
    tri === 1
      ? {
          es: "Es algo temprano para el melasma, pero ya empezó. Protector mineral cada mañana y reaplicar al mediodía.",
          en: "It's early for melasma, but it has started. Mineral sunscreen every morning, reapplied at midday.",
        }
      : {
          es: "En el segundo y tercer trimestre es esperable, pero no inevitable: el sol es el factor que más lo empeora. Protector con color cada 2 horas afuera, y ácido azelaico de noche.",
          en: "Expected in the second and third trimesters, but not inevitable: sun is the main driver. Tinted sunscreen every 2 hours outdoors, and azelaic acid at night.",
        };
  if (d === null) {
    head = { es: "Tu punto de partida", en: "Your starting point" };
    body = {
      es: "Esta es tu primera medición. A partir de la próxima semana verás qué cambia y en qué zonas.",
      en: "This is your first measurement. From next week you'll see what changes and where.",
    };
  } else if (spreading) {
    const zl = ZONE_LABEL[zoneUp.z];
    head = {
      es: `Tu melasma está creciendo en: ${zl.es.toLowerCase()}`,
      en: `Your melasma is growing on your ${zl.en.toLowerCase()}`,
    };
    body = advice;
  } else if (fading) {
    const zl = ZONE_LABEL[zoneDown.z];
    head = {
      es: `Tu melasma está bajando en: ${zl.es.toLowerCase()}`,
      en: `Your melasma is fading on your ${zl.en.toLowerCase()}`,
    };
    body = {
      es: "Lo que estás haciendo funciona. Sigue con el protector con color todos los días.",
      en: "What you're doing works. Keep up the tinted sunscreen every day.",
    };
  } else if (d <= -MIN_CHANGE.age_spot) {
    head = { es: "Tus manchas aumentaron", en: "Your dark spots increased" };
    body = advice;
  } else if (d >= MIN_CHANGE.age_spot) {
    head = { es: "Tus manchas mejoraron", en: "Your dark spots improved" };
    body = {
      es: "Lo que estás haciendo funciona. Sigue igual con el protector.",
      en: "What you're doing works. Keep going with the sunscreen.",
    };
  } else {
    head = {
      es: "Tus manchas están estables",
      en: "Your dark spots are stable",
    };
    body = {
      es: "Ningún cambio más allá de la variación normal entre fotos. Bien.",
      en: "No change beyond normal photo-to-photo variation. Good.",
    };
  }

  return (
    <div className="skin-insight card p-4"><p className="mini-label mb-3">{t({ es: "LO QUE CUENTA TU PIEL", en: "WHAT YOUR SKIN IS TELLING YOU" })}</p>
      <p className="font-display text-xl font-semibold">{t(head)}</p>
      <p className="mt-1 text-sm leading-relaxed">{t(body)}</p>
      {spreading && malar && (
        <p className="mt-2 text-sm text-ink-2">
          {t({
            es: "Patrón en mejillas: el más común del melasma del embarazo.",
            en: "Cheek pattern: the most common in pregnancy melasma.",
          })}
        </p>
      )}
      {latest !== first && top.g >= ZONE_MIN_CHANGE && !spreading && (
        <p className="mt-2 text-sm">
          {t({ es: "Zona que más cambió:", en: "Zone that changed most:" })}{" "}
          <b>{t(ZONE_LABEL[top.z])}</b>
          {malar &&
            t({
              es: " (patrón en mejillas, el más común del melasma)",
              en: " (cheek pattern, melasma's most common)",
            })}
        </p>
      )}
    </div>
  );
}

function Scores({ latest, prev }: { latest: Scan; prev?: Scan }) {
  const { t } = useLang();
  return (
    <div className="skin-score-grid grid grid-cols-2 gap-3">
      {CONCERNS.map((c) => {
        const v = latest.scores[c];
        const d =
          prev && v != null && prev.scores[c] != null
            ? v - prev.scores[c]!
            : null;
        return (
          <div key={c} className="card score-card p-4">
            <div>
              <p className="text-sm text-ink-2">{t(CONCERN_LABEL[c])}</p>
              <p className="font-display text-3xl font-semibold">
                {v ?? "—"}
                <span className="text-sm font-normal text-ink-2">/100</span>
              </p>
              {d !== null && isRealChange(c, d) && (
                <p
                  className={`text-xs font-semibold ${d < 0 ? "text-avoid" : "text-safe"}`}
                >
                  {d > 0 ? "▲ +" : "▼ "}
                  {d} {t({ es: "vs. anterior", en: "vs. previous" })}
                </p>
              )}
              {d !== null && !isRealChange(c, d) && (
                <p className="text-xs text-ink-3" title={t({ es: `Cambios menores a ${MIN_CHANGE[c]} puntos están dentro de la variación normal entre fotos.`, en: `Changes under ${MIN_CHANGE[c]} points are within normal photo-to-photo variation.` })}>
                  ≈ {t({ es: "sin cambio real", en: "no real change" })}
                </p>
              )}
            </div>
            <ScoreRing value={v} />
          </div>
        );
      })}
      <p className="col-span-2 text-xs text-ink-2">
        {latest.source === "youcam"
          ? t({
              es: "Más alto = piel más sana. Medido por YouCam AI.",
              en: "Higher = healthier skin. Measured by YouCam AI.",
            })
          : t({
              es: "Más alto = piel más sana. Valores de demostración.",
              en: "Higher = healthier skin. Demo values.",
            })}
      </p>
    </div>
  );
}

/** Pigment index per melasma zone: one hue, bar length = magnitude. */
function ZoneMap({ latest, first }: { latest: Scan; first: Scan }) {
  const { t } = useLang();
  return (
    <div className="skin-zone-card card p-4">
      <p className="font-semibold">
        {t({ es: "Mapa de zonas del melasma", en: "Melasma zone map" })}
      </p>
      <p className="text-xs text-ink-2">
        {latest.ycZones
          ? t({
              es: "Barras: piel con manchas en cada zona, medida en tu teléfono. Debajo: lo que marcó el detector de manchas de YouCam en esa zona.",
              en: "Bars: skin with dark patches in each zone, measured on your phone. Below: what YouCam's spot detector marked in that zone.",
            })
          : t({
              es: "Porcentaje de piel con manchas en cada zona. Calculado en tu teléfono.",
              en: "Share of skin with dark spots in each zone. Computed on your phone.",
            })}
      </p>
      <div className="skin-zones-layout mt-4">
        <ZoneFace values={latest.zones} />
        <ul className="grid gap-3">
          {ZONES.map((z: ZoneId) => {
            const v = latest.zones[z];
            const d =
              latest !== first && v != null && first.zones[z] != null
                ? v - first.zones[z]!
                : null;
            return (
              <li
                key={z}
                className="skin-zone-row grid grid-cols-[7.5rem_1fr_4.5rem] items-center gap-2 text-sm"
                title={`${t(ZONE_LABEL[z])}: ${v ?? "—"}`}
              >
                <span>
                  {t(ZONE_LABEL[z])}
                  {latest.ycZones?.[z] != null && (
                    <span className="block text-[11px] font-medium text-ink-3">
                      {latest.source === "youcam" ? "YouCam" : t({ es: "Ejemplo YouCam", en: "Sample YouCam" })} {latest.ycZones[z]}%
                      {first !== latest && first.ycZones?.[z] != null && latest.ycZones[z]! - first.ycZones[z]! !== 0 && (
                        <span className={latest.ycZones[z]! > first.ycZones[z]! ? "text-avoid" : "text-safe"}>
                          {" "}
                          ({latest.ycZones[z]! > first.ycZones[z]! ? "+" : ""}
                          {latest.ycZones[z]! - first.ycZones[z]!})
                        </span>
                      )}
                    </span>
                  )}
                </span>
                <span className="h-2.5 overflow-hidden rounded-full bg-surface-muted">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg,var(--brand-bright),var(--brand))",
                      width: `${Math.max(2, v ?? 0)}%`,
                    }}
                  />
                </span>
                <span className="text-right tabular-nums">
                  {v ?? "—"}
                  {d !== null && Math.abs(d) >= ZONE_MIN_CHANGE && (
                    <span
                      className={`ml-1 text-xs ${d > 0 ? "text-avoid" : "text-safe"}`}
                    >
                      {d > 0 ? `+${d}` : d}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/**
 * Melasma level across weeks: the mean of the zone map (0–100, higher = more
 * pigment). A single series, so the title names it.
 */
function Trend({ scans }: { scans: Scan[] }) {
  const { t, lang } = useLang();
  const [hover, setHover] = useState<number | null>(null);
  const level = (s: Scan) => {
    const v = ZONES.map((z) => s.zones[z]).filter(
      (n): n is number => n != null,
    );
    return v.length
      ? Math.round(v.reduce((a, b) => a + b, 0) / v.length)
      : null;
  };
  const wk = lang === "es" ? "S" : "W";
  const pts = scans
    .map((s) => ({ w: s.week, v: level(s) }))
    .filter((p): p is { w: number; v: number } => p.v != null);
  if (pts.length < 2) return null;
  const W = 320,
    H = 120,
    P = 18;
  const vs = pts.map((p) => p.v);
  const lo = 0,
    hi = Math.min(100, Math.max(40, ...vs) + 8);
  const x = (i: number) => P + (i * (W - 2 * P)) / (pts.length - 1);
  const y = (v: number) => H - P - ((v - lo) / (hi - lo || 1)) * (H - 2 * P);
  const d = pts
    .map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`)
    .join(" ");
  return (
    <div className="card skin-chart-card p-5">
      <p className="font-semibold">
        {t({
          es: "Tu melasma, semana a semana",
          en: "Your melasma, week by week",
        })}
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-2 w-full"
        role="img"
        aria-label={pts.map((p) => `${wk}${p.w}: ${p.v}`).join(", ")}
        onMouseLeave={() => setHover(null)}
      >
        <line x1={P} x2={W - P} y1={H - P} y2={H - P} stroke="var(--line)" />
        <path
          className="chart-line"
          pathLength="1"
          d={d}
          fill="none"
          stroke="var(--brand)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <g
            key={i}
            onMouseEnter={() => setHover(i)}
            onTouchStart={() => setHover(i)}
          >
            <rect
              x={Math.max(0, Math.min(W - 48, x(i) - 24))}
              y={0}
              width={48}
              height={H}
              fill="transparent"
            />
            <circle
              cx={x(i)}
              cy={y(p.v)}
              r={hover === i ? 6 : 4.5}
              fill="var(--brand)"
              stroke="var(--surface)"
              strokeWidth="2"
            />
            <text
              x={x(i)}
              y={H - 4}
              textAnchor="middle"
              fontSize="10"
              fill="var(--ink-2)"
            >
              {wk}
              {p.w}
            </text>
          </g>
        ))}
        {[0, pts.length - 1]
          .filter((i) => i !== hover)
          .map((i) => (
            <text
              key={`l${i}`}
              x={x(i)}
              y={y(pts[i].v) - 10}
              textAnchor="middle"
              fontSize="11"
              fill="var(--ink-2)"
            >
              {pts[i].v}
            </text>
          ))}
        {hover !== null && (
          <text
            x={x(hover)}
            y={y(pts[hover].v) - 10}
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            fill="var(--ink)"
          >
            {pts[hover].v}
          </text>
        )}
      </svg>
      <p className="text-xs text-ink-2">
        {t({
          es: "Promedio del mapa de zonas. Más alto = más pigmento.",
          en: "Average of the zone map. Higher = more pigment.",
        })}
      </p>
    </div>
  );
}

function Photos({ first, latest }: { first: Scan; latest: Scan }) {
  const { t } = useLang();
  const [imgs, setImgs] = useState<{
    a: string | null;
    b: string | null;
    mask: string | null;
  }>({ a: null, b: null, mask: null });
  const [showMask, setShowMask] = useState(false);
  useEffect(() => {
    Promise.all([
      loadPhoto(first.photoKey),
      loadPhoto(latest.photoKey),
      loadPhoto(latest.maskKey),
    ]).then(([a, b, mask]) => setImgs({ a, b, mask }));
  }, [first.photoKey, latest.photoKey, latest.maskKey]);
  if (!imgs.b) return null;
  return (
    <div className="skin-photo-card card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold">
          {first === latest
            ? t({ es: "Tu foto", en: "Your photo" })
            : t({ es: "Antes y ahora", en: "Then and now" })}
        </p>
        {imgs.mask && (
          <label className="photo-mask-toggle flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showMask}
              onChange={(e) => setShowMask(e.target.checked)}
              className="accent-[var(--brand)]"
            />
            {t({ es: "Ver manchas (YouCam)", en: "Show spots (YouCam)" })}
          </label>
        )}
      </div>
      <div
        className={`mt-3 grid gap-2 ${first === latest ? "grid-cols-1" : "grid-cols-2"}`}
      >
        {first !== latest && imgs.a && (
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgs.a} alt="" className="w-full rounded-xl" />
            <figcaption className="mt-1 text-center text-xs text-ink-2">
              {t({ es: `Semana ${first.week}`, en: `Week ${first.week}` })}
            </figcaption>
          </figure>
        )}
        <figure className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgs.b} alt="" className="w-full rounded-xl" />
          {showMask && imgs.mask && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgs.mask}
              alt=""
              className="absolute inset-0 h-[calc(100%-1.25rem)] w-full rounded-xl object-cover mix-blend-multiply"
            />
          )}
          <figcaption className="mt-1 text-center text-xs text-ink-2">
            {t({ es: `Semana ${latest.week}`, en: `Week ${latest.week}` })}
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Ready>
      <Skin />
    </Ready>
  );
}
