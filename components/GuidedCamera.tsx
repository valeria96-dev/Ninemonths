"use client";

import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CameraIcon, CheckIcon, FaceIcon, LockIcon } from "@/components/icons";
import { useLang } from "@/lib/i18n";
import { captureChecks, getLandmarker, type Check } from "@/lib/skin/face";

// Guided selfie: the shutter only unlocks once face, pose and light pass for
// about a second, so this week's photo can be compared with last week's.

export type Capture = { canvas: HTMLCanvasElement; landmarks: NormalizedLandmark[] };

export function GuidedCamera({ onCapture, onCancel, ghost, ghostLabel }: { onCapture: (c: Capture) => void; onCancel: () => void; ghost?: string | null; ghostLabel?: string }) {
  const { t } = useLang();
  const video = useRef<HTMLVideoElement>(null);
  const lastLm = useRef<NormalizedLandmark[] | null>(null);
  const [checks, setChecks] = useState<Check[]>([]);
  const [ready, setReady] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const goodSince = useRef<number | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;
    const probe = document.createElement("canvas");

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1920 }, height: { ideal: 1440 } }, audio: false });
        if (stopped) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        const v = video.current!;
        v.srcObject = stream;
        await v.play();
        const lm = await getLandmarker();
        if (stopped) return;
        setLoading(false);
        let last = 0;
        const loop = (now: number) => {
          if (stopped) return;
          raf = requestAnimationFrame(loop);
          if (now - last < 140 || v.readyState < 2) return;
          last = now;
          const res = lm.detectForVideo(v, now);
          const face = res.faceLandmarks[0];
          lastLm.current = face ?? null;
          // Checks run on a small copy of the frame: fast and good enough.
          const w = 360, h = Math.round((v.videoHeight / v.videoWidth) * 360);
          probe.width = w;
          probe.height = h;
          const ctx = probe.getContext("2d", { willReadFrequently: true })!;
          ctx.drawImage(v, 0, 0, w, h);
          const cs = captureChecks(face ? ctx.getImageData(0, 0, w, h) : null, face, w, h);
          setChecks(cs);
          // Even light is advice, not a gate: side light from a window is common and
          // YouCam still measures it; face, distance, pose and light level must pass.
          const allOk = cs.length > 1 && cs.every((c) => c.ok || c.id === "even");
          if (allOk) goodSince.current ??= now;
          else goodSince.current = null;
          setHoldProgress(allOk ? Math.min(1, (now - (goodSince.current ?? now)) / 900) : 0);
          setReady(allOk && now - (goodSince.current ?? now) > 900);
        };
        raf = requestAnimationFrame(loop);
      } catch {
        // A cancelled start (unmount, or React re-running the effect) is not an error.
        if (stopped) return;
        setError(t({ es: "No pudimos abrir la cámara. Revisa los permisos o sube una foto.", en: "We couldn't open the camera. Check permissions or upload a photo." }));
        setLoading(false);
      }
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((tr) => tr.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function shoot() {
    const v = video.current!;
    const lm = lastLm.current;
    if (!lm) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")!.drawImage(v, 0, 0);
    onCapture({ canvas: c, landmarks: lm });
  }

  // Portal to <body>: the page's enter animation uses a transform, which would
  // otherwise trap this "fixed" layer inside the content column.
  if (typeof document === "undefined") return null;
  return createPortal(
    <CameraFrame checks={checks} ready={ready} holdProgress={holdProgress} loading={loading} error={error} ghost={ghost} ghostLabel={ghostLabel} onShoot={shoot} onCancel={onCancel} video={<video ref={video} playsInline muted className="h-full w-full -scale-x-100 object-cover" />} />,
    document.body,
  );
}

/** Presentation only; capture checks and the 900 ms shutter gate stay above. */
export function CameraFrame({ checks, ready, holdProgress, loading, error, ghost, ghostLabel, onShoot, onCancel, video }: { checks: Check[]; ready: boolean; holdProgress: number; loading: boolean; error: string | null; ghost?: string | null; ghostLabel?: string; onShoot: () => void; onCancel: () => void; video: ReactNode }) {
  const { t } = useLang();
  const [showGhost, setShowGhost] = useState(true);
  const cancel = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const overflow = document.body.style.overflow;
    const focused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    cancel.current?.focus();
    return () => { document.body.style.overflow = overflow; focused?.focus(); };
  }, []);
  const labels = { face: { es: "Rostro centrado", en: "Face in frame" }, frontal: { es: "De frente", en: "Facing forward" }, close: { es: "Distancia", en: "Distance" }, light: { es: "Luz suficiente", en: "Enough light" }, even: { es: "Luz pareja", en: "Even light" } };
  const ids = ["face", "frontal", "close", "light", "even"] as const;
  return <div className="guided-camera" role="dialog" aria-modal="true" aria-label={t({ es: "Selfie guiada", en: "Guided selfie" })} onKeyDown={e => {
    if (e.key === "Escape") onCancel();
    if (e.key === "Tab") {
      const buttons = e.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)");
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
  }}>
    <header className="camera-header"><div><p>{t({ es: "NINEMONTHS · TU SELFIE SEMANAL", en: "NINEMONTHS · YOUR WEEKLY SELFIE" })}</p><h2>{t({ es: "Un momento, sin filtros.", en: "A moment, unfiltered." })}</h2></div><button ref={cancel} onClick={onCancel} className="camera-close" aria-label={t({ es: "Cancelar", en: "Cancel" })}>×</button></header>
    <div className="camera-stage">
      {video}
      <div className="camera-vignette" />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {ghost && showGhost && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ghost} alt="" className="ghost-guide absolute h-[78%] aspect-[3/4] -scale-x-100 object-cover opacity-45 grayscale contrast-125" style={{ maskImage: "radial-gradient(ellipse 50% 50% at 50% 48%, #000 55%, transparent 80%)", WebkitMaskImage: "radial-gradient(ellipse 50% 50% at 50% 48%, #000 55%, transparent 80%)" }} />
        )}
        <div className={`camera-face-ring ${ready ? "is-ready" : ""}`}><svg viewBox="0 0 200 260" aria-hidden="true"><ellipse cx="100" cy="130" rx="94" ry="124" pathLength="1" fill="none" stroke="white" strokeOpacity=".3" strokeWidth="1" /><ellipse cx="100" cy="130" rx="94" ry="124" pathLength="1" fill="none" stroke={ready ? "#c7e4cf" : "#d5bfe9"} strokeWidth="2.5" strokeDasharray={`${Math.max(0,Math.min(1,holdProgress))} 1`} strokeLinecap="round" /></svg><span className="camera-crosshair crosshair-top" /><span className="camera-crosshair crosshair-bottom" /></div>
      </div>
      {ghost && <button onClick={() => setShowGhost(v=>!v)} aria-pressed={showGhost} className="camera-ghost-toggle"><span aria-hidden="true">{showGhost ? "◐" : "○"}</span>{ghostLabel ?? t({ es: "Guía: tu selfie anterior", en: "Guide: your last selfie" })}<span className="ghost-toggle-track"><i /></span></button>}
      <div className="camera-stage-status" role="status">{error ? <span className="camera-error">{error}</span> : loading ? <><span className="camera-status-spinner" />{t({ es: "Preparando la cámara…", en: "Getting the camera ready…" })}</> : ready ? <><CheckIcon width={16} height={16} />{t({ es: "Lista. Cuando quieras.", en: "Ready. Whenever you are." })}</> : holdProgress > 0 ? t({ es: "Quédate quieta un momento…", en: "Hold still for a moment…" }) : <><FaceIcon width={16} height={16} />{t({ es: "Centra tu rostro en el óvalo", en: "Centre your face in the oval" })}</>}</div>
    </div>
    <div className="camera-controls"><div className="camera-checks-heading"><p>{t({ es: "PARA COMPARAR SEMANA A SEMANA", en: "FOR A WEEK-TO-WEEK COMPARISON" })}</p><span>{checks.filter(c=>c.ok && c.id!=="even").length}/4</span></div>
      <ul className="camera-checklist">{ids.map(id=>{const check=checks.find(c=>c.id===id);const ok=!!check?.ok;return <li key={id} className={`${ok ? "passed" : ""} ${id === "even" ? "advisory" : ""}`}><span className="camera-check-icon" aria-hidden="true">{ok ? <CheckIcon width={12} height={12} /> : <span />}</span><span>{!ok && check ? t(check.hint) : t(labels[id])}</span>{id === "even" && <small>{t({ es: "Consejo", en: "Tip" })}</small>}</li>;})}</ul>
      <p className="camera-prep-note">{t({ es: "Sin maquillaje ni lentes, boca cerrada, frente despejada.", en: "No makeup or glasses, mouth closed, forehead visible." })}</p>
      <div className="camera-shutter-row"><span className="camera-private-note"><LockIcon width={14} height={14} />{t({ es: "Tú eliges cuándo", en: "You choose when" })}</span><button className={`camera-shutter ${ready ? "is-ready" : ""}`} onClick={onShoot} disabled={!ready} aria-label={ready ? t({ es: "Tomar foto", en: "Take photo" }) : t({ es: "Ajusta según las indicaciones", en: "Adjust as shown" })}><span><CameraIcon width={27} height={27} /></span></button><div className="camera-hold-meter" role="progressbar" aria-valuenow={Math.round(holdProgress*100)} aria-valuemin={0} aria-valuemax={100} aria-label={t({ es: "Estabilidad del encuadre", en: "Frame stability" })}><span>{ready ? t({ es: "Tomar foto", en: "Take photo" }) : t({ es: "Sin moverte", en: "Hold still" })}</span></div></div>
    </div>
  </div>;
}
