"use client";

import { useEffect, useState, type ReactNode } from "react";
import { SparkleIcon } from "@/components/icons";
import { useLang, type L } from "@/lib/i18n";
import { loadPhoto, savePhoto } from "@/lib/photos";
import { tintShades } from "@/lib/skin/face";
import type { Scan } from "@/lib/store";

// Tinted sunscreen try-on (YouCam Makeup VTO, 1 unit per shade). Melasma's
// best defence is a mineral SPF with iron oxides, and the fear is "it will
// look orange / chalky on me": she sees the sheer tint on her own selfie,
// in three shades around her measured skin colour, before she buys.

const SHADE_LABEL: Record<"light" | "match" | "deep", L> = {
  light: { es: "Más claro", en: "Lighter" },
  match: { es: "Tu tono", en: "Your match" },
  deep: { es: "Más profundo", en: "Deeper" },
};

export function TintTryOn({ scan }: { scan: Scan }) {
  const { t } = useLang();
  const shades = tintShades(scan.skinHex ?? "#c9a28a");
  const [shade, setShade] = useState<"light" | "match" | "deep">("match");
  const [before, setBefore] = useState<string | null>(null);
  const [after, setAfter] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [split, setSplit] = useState(50);

  useEffect(() => {
    let alive = true;
    (async () => {
      const full = await loadPhoto(scan.fullKey ?? null);
      const cached: Record<string, string> = {};
      for (const s of ["light", "match", "deep"]) {
        const v = await loadPhoto(`${scan.id}-tint-${s}`);
        if (v) cached[s] = v;
      }
      if (alive) {
        setBefore(full);
        setAfter(cached);
      }
    })();
    return () => {
      alive = false;
    };
  }, [scan.id, scan.fullKey]);

  if (!before || !scan.skinHex) return null;

  async function tryShade(id: "light" | "match" | "deep") {
    setShade(id);
    setError(null);
    if (after[id]) return;
    setBusy(true);
    try {
      const blob = await (await fetch(before!)).blob();
      const form = new FormData();
      form.append("image", blob, "face.jpg");
      form.append("color", shades.find((s) => s.id === id)!.color);
      const res = await fetch("/api/tint", { method: "POST", body: form });
      if (!res.ok) {
        setError(
          res.status === 501
            ? t({ es: "El probador necesita YouCam conectado.", en: "The try-on needs YouCam connected." })
            : t({ es: "No pudimos generar la prueba. Intenta de nuevo.", en: "We couldn't render the try-on. Try again." }),
        );
        return;
      }
      const { image } = (await res.json()) as { image: string };
      await savePhoto(`${scan.id}-tint-${id}`, image);
      setAfter((a) => ({ ...a, [id]: image }));
    } catch {
      setError(t({ es: "Sin conexión.", en: "No connection." }));
    } finally {
      setBusy(false);
    }
  }

  const cur = after[shade];
  const color = shades.find((s) => s.id === shade)!.color;

  return (
    <section className="tint-studio card p-4">
      <div className="tint-studio-kicker"><SparkleIcon width={15} height={15} /><span>{t({ es: "UN TONO PARA TI · YOUCAM VTO", en: "A SHADE FOR YOU · YOUCAM VTO" })}</span></div>
      <h2 className="tint-studio-title">{t({ es: "Tu protector con color, en tu cara", en: "Your tinted sunscreen, on your face" })}</h2>
      <p className="mt-1 text-xs leading-relaxed text-ink-2">
        {t({
          es: "Explora tres tonos alrededor del tuyo, sobre tu propia selfie. Una visualización con YouCam para orientar qué tono buscar.",
          en: "Explore three shades around your own, on your selfie. A YouCam visualization to help you choose a shade to look for.",
        })}
      </p>

      <div className="tint-studio-shades mt-5 flex gap-2" role="group" aria-label={t({ es: "Elegir tono del protector", en: "Choose a sunscreen shade" })}>
        {shades.map((s) => (
          <button
            key={s.id}
            onClick={() => tryShade(s.id)}
            disabled={busy}
            aria-pressed={shade === s.id}
            className="chip flex-1 justify-center"
          >
            <span className="h-4 w-4 flex-none rounded-full border border-white shadow" style={{ background: s.color }} />
            {t(SHADE_LABEL[s.id])}
          </button>
        ))}
      </div>

      <TintComparison before={before} after={cur} split={split} onSplit={setSplit} busy={busy}>
        {!cur && <button onClick={() => tryShade(shade)} disabled={busy} className="btn btn-primary tint-try-button">{busy ? t({ es: "Aplicando con YouCam…", en: "Applying with YouCam…" }) : t({ es: "Probar en mi cara", en: "Try it on my face" })}</button>}
      </TintComparison>
      <p className="tint-studio-disclaimer">{t({ es: "Prueba visual de tono. No representa la cobertura ni la eficacia de un protector específico.", en: "A visual shade preview. It does not represent the coverage or effectiveness of a specific sunscreen." })}</p>
      {busy && cur && <p className="mt-2 text-xs text-ink-2">{t({ es: "Aplicando con YouCam…", en: "Applying with YouCam…" })}</p>}
      {error && <p className="mt-2 text-xs text-avoid">{error}</p>}

      <div className="tint-shopping-note mt-3 flex items-center gap-3 rounded-[14px] bg-surface-muted p-3 text-[12.5px]">
        <span className="h-8 w-8 flex-none rounded-full border-2 border-white shadow" style={{ background: color }} />
        <p className="leading-snug">
          <b>{t({ es: "Qué buscar:", en: "What to look for:" })}</b>{" "}
          {t({
            es: "protector mineral SPF 50 con óxido de zinc y óxido de hierro, en un tono cercano a este. Reaplícalo cada 2 horas si estás afuera.",
            en: "mineral SPF 50 with zinc oxide and iron oxides, in a shade close to this one. Reapply every 2 hours outdoors.",
          })}
        </p>
      </div>
    </section>
  );
}


/** The comparison is visual only; generation and caching remain in TintTryOn. */
export function TintComparison({ before, after, split, onSplit, busy = false, illustrative = false, children }: { before: string; after?: string; split: number; onSplit: (v: number) => void; busy?: boolean; illustrative?: boolean; children?: ReactNode }) {
  const { t } = useLang();
  return <figure className={`tint-live-comparison ${after ? "has-result" : ""}`}>
    <div className="tint-live-image">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={before} alt={t({ es: "Tu selfie", en: "Your selfie" })} className="tint-before" />
      {after && <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={after} src={after} alt={t({ es: "Con protector con color", en: "With tinted sunscreen" })} className="tint-after" style={{ clipPath: `inset(0 0 0 ${split}%)` }} />
        <span className="tint-divider" style={{left:`${split}%`}}><span className="tint-drag-handle" aria-hidden="true">‹ ›</span></span>
        <span className="tint-image-label label-bare">{t({ es: "Sin", en: "Bare" })}</span><span className="tint-image-label label-tinted">{t({ es: "Con tinte", en: "Tinted" })}</span>
        <input type="range" min={0} max={100} value={split} onChange={e=>onSplit(+e.target.value)} aria-label={t({ es: "Comparar sin y con tinte", en: "Compare bare and tinted" })} className="tint-range" />
      </>}
      {busy && <div className="tint-generating" role="status"><span className="tint-render-scan" /><span className="tint-render-message"><SparkleIcon width={17} height={17} />{t({ es: "Aplicando tu tono con YouCam…", en: "Applying your shade with YouCam…" })}</span></div>}
      {children}
    </div>
    <figcaption>{illustrative ? t({ es: "Ilustrativo · sin medición ni prueba real", en: "Illustrative · no real measurement or try-on" }) : after ? t({ es: "Desliza para comparar · Prueba de tono YouCam VTO", en: "Slide to compare · YouCam VTO shade preview" }) : t({ es: "Tu selfie es el punto de partida", en: "Your selfie is the starting point" })}</figcaption>
  </figure>;
}
