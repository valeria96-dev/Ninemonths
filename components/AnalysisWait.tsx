"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaceIcon, LockIcon, SparkleIcon } from "@/components/icons";
import { useLang } from "@/lib/i18n";

/** Timed presentation, never an estimate of server progress. Unmounts with busy. */
export function AnalysisWait({ hasPrevious }: { hasPrevious: boolean }) {
  const { t } = useLang();
  const [phase, setPhase] = useState(0);
  const title = useId();
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const overflow = document.body.style.overflow;
    const focused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    root.current?.focus();
    const timers = [1400, 4200, 7000].map((delay,i)=>setTimeout(()=>setPhase(i+1),delay));
    return () => { timers.forEach(clearTimeout); document.body.style.overflow = overflow; focused?.focus(); };
  }, []);
  const steps = [
    { es: "Encontrar tu rostro", en: "Finding your face" },
    { es: "Medir seis indicadores con YouCam", en: "Measuring six concerns with YouCam" },
    { es: "Organizar tu mapa de zonas", en: "Mapping your melasma zones" },
    hasPrevious ? { es: "Comparar con tu semana anterior", en: "Comparing with last week" } : { es: "Preparar tu punto de partida", en: "Preparing your starting point" },
  ];
  if (typeof document === "undefined") return null;
  return createPortal(<div ref={root} tabIndex={-1} className="analysis-wait" role="dialog" aria-modal="true" aria-labelledby={title}>
    <div className="analysis-wait-inner"><p className="analysis-brand">Ninemonths<span /><span>{t({ es: "TU MOMENTO DE CLARIDAD", en: "YOUR MOMENT OF CLARITY" })}</span></p>
      <div className="analysis-orbits" aria-hidden="true"><span /><span /><span /><div><FaceIcon width={48} height={48} /></div><i className="analysis-satellite"><SparkleIcon width={17} height={17} /></i></div>
      <p className="eyebrow">{t({ es: "UNA SELFIE, MUCHO CONTEXTO", en: "ONE SELFIE, MORE CONTEXT" })}</p>
      <h2 id={title}>{t({ es: "Un momento para", en: "A moment for" })}<br /><span className="serif-accent">{t({ es: "entender tu piel.", en: "understanding your skin." })}</span></h2>
      <ol className="analysis-steps">{steps.map((step,i)=><li key={step.en} data-state={i === phase ? "active" : i < phase ? "past" : "next"}><span className="analysis-step-marker">{String(i+1).padStart(2,"0")}</span><span>{t(step)}</span>{i === phase && <span className="analysis-step-pulse" aria-hidden="true" />}</li>)}</ol>
      <p role="status" className="analysis-active-text">{t(steps[phase])}…</p>
      <div className="analysis-indeterminate" aria-hidden="true"><span /></div>
      <p className="analysis-timing-note">{t({ es: "Secuencia orientativa, no progreso exacto. El resultado aparecerá al terminar el procesamiento.", en: "An illustrative sequence, not exact progress. Results appear when processing is complete." })}</p>
      <p className="analysis-privacy"><LockIcon width={13} height={13} />{t({ es: "El análisis usa YouCam cuando está conectado.", en: "Analysis uses YouCam when connected." })}</p>
    </div>
  </div>,document.body);
}
