"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertIcon, ArrowIcon, BottleIcon, CheckIcon, FaceIcon, HomeIcon, PulseIcon, RoutineIcon } from "@/components/icons";

// Internal page to choose the palette. Each column is the same set of real
// components rendered under a different data-theme.

const THEMES = [
  { id: "lavanda", name: "Lavanda", note: "Lavanda suave + rosa. Calma, confianza, femenino sin ser infantil.", hex: "#7B61D1" },
  { id: "rosa", name: "Rosa empolvado", note: "Rosa adulto + lila. Lo más cálido y maternal.", hex: "#C4577E" },
  { id: "malva", name: "Malva", note: "Orquídea entre rosa y morado. Elegante, tipo skincare premium.", hex: "#9B5BA5" },
  { id: "lila", name: "Lila + durazno", note: "Morado más vivo con acento durazno. Lo más moderno y tech.", hex: "#6E56CF" },
] as const;

export default function Variantes() {
  const router = useRouter();
  const use = (id: string) => {
    try {
      localStorage.setItem("nm.theme", id);
    } catch {}
    document.documentElement.setAttribute("data-theme", id);
    router.push("/");
  };

  return (
    <main className="min-h-dvh bg-[#f4f4f4] px-4 py-10">
      <div className="mx-auto max-w-[1500px]">
        <p className="eyebrow eyebrow-dot">Ninemonths · sistema de diseño</p>
        <h1 className="mt-3 font-display text-[clamp(32px,4vw,52px)] font-bold leading-[1] tracking-[-0.05em]">
          Elige la paleta. <span className="mark">Todo lo demás es igual.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] text-ink-2">
          Misma estructura, tipografía y componentes en las cuatro. Toca &quot;Ver todo el sitio&quot; para recorrer la landing y la app con esa paleta.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
          {THEMES.map((th) => (
            <section key={th.id} data-theme={th.id} className="overflow-hidden rounded-[28px] bg-canvas shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
              <div className="flex items-center justify-between border-b border-line bg-white px-5 py-4">
                <div>
                  <p className="font-display text-[18px] font-bold tracking-[-0.03em]">{th.name}</p>
                  <p className="text-[11.5px] text-ink-3">{th.hex}</p>
                </div>
                <div className="flex -space-x-1.5">
                  {["var(--brand)", "var(--brand-bright)", "var(--coral)", "var(--tint-1)", "var(--tint-2)", "var(--tint-3)"].map((c) => (
                    <span key={c} className="h-6 w-6 rounded-full border-2 border-white" style={{ background: c }} />
                  ))}
                </div>
              </div>

              <div className="relative space-y-4 overflow-hidden p-5">
                <span className="pointer-events-none absolute -right-14 -top-10 h-36 w-36 rounded-full" style={{ background: "var(--orb-1)" }} />
                <span className="pointer-events-none absolute -left-12 top-56 h-24 w-24 rounded-full" style={{ background: "var(--orb-2)" }} />

                {/* Hero */}
                <div className="relative">
                  <p className="eyebrow eyebrow-dot text-ink-3">La app de piel para el embarazo</p>
                  <h2 className="mt-3 font-display text-[34px] font-bold leading-[0.95] tracking-[-0.055em]">
                    Tu piel cambia. <span className="mark block">Míralo semana a semana.</span>
                  </h2>
                  <div className="mt-4 flex items-center gap-4">
                    <span className="btn btn-primary btn-sm">
                      Empezar gratis <ArrowIcon width={14} height={14} className="-rotate-45" />
                    </span>
                    <span className="link-u">Cómo funciona ↓</span>
                  </div>
                </div>

                {/* Step strip */}
                <div className="relative grid grid-cols-2 gap-2 rounded-[20px] bg-white p-2 shadow-[0_12px_30px_var(--ring)]">
                  {["Selfie guiada", "YouCam mide", "Ves qué cambió", "Sabes qué hacer"].map((s, i) => (
                    <div key={s} className={`flex items-center gap-2 rounded-[14px] border p-2 ${["border-line", "tint-1", "tint-2", "tint-3"][i]}`}>
                      <span className="num h-6 w-6 text-[10px]">0{i + 1}</span>
                      <span className="text-[11.5px] font-bold">{s}</span>
                    </div>
                  ))}
                </div>

                {/* App: week card */}
                <div className="relative rounded-[22px] p-4 text-white" style={{ background: "var(--g-deep)" }}>
                  <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.12em]">
                    <span className="live-dot" /> Trimestre 2
                  </p>
                  <p className="mt-2 font-display text-[30px] font-bold leading-none tracking-[-0.05em]">Semana 22</p>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full w-[55%] rounded-full bg-white" />
                  </div>
                </div>

                {/* App: action tiles */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { I: BottleIcon, h: "¿Puedo usar esto?", c: "tint-1" },
                    { I: FaceIcon, h: "Selfie semanal", c: "tint-2" },
                    { I: PulseIcon, h: "¿Esto es normal?", c: "tint-3" },
                    { I: RoutineIcon, h: "Mi rutina", c: "tint-1" },
                  ].map(({ I, h, c }) => (
                    <div key={h} className={`card p-3 shadow-none ${c}`}>
                      <span className="icon-tile h-9 w-9 bg-white">
                        <I />
                      </span>
                      <p className="mt-2 text-[12.5px] font-bold">{h}</p>
                    </div>
                  ))}
                </div>

                {/* App: scores + verdicts */}
                <div className="card space-y-2 p-3">
                  <div className="flex items-baseline justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Manchas · YouCam AI</p>
                    <p className="font-display text-[22px] font-bold leading-none">
                      64<span className="text-[10px] text-ink-3">/100</span>
                    </p>
                  </div>
                  {[78, 50, 30].map((v, i) => (
                    <div key={v} className="grid grid-cols-[64px_1fr] items-center gap-2">
                      <span className="text-[10.5px] text-ink-2">{["Mejillas", "Bigote", "Frente"][i]}</span>
                      <span className="h-[6px] overflow-hidden rounded-full bg-surface-muted">
                        <span className="block h-full rounded-full bg-brand" style={{ width: `${v}%` }} />
                      </span>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-avoid-tint px-2 py-0.5 text-[10px] font-bold text-avoid">
                      <AlertIcon width={11} height={11} /> Evítalo
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-safe-tint px-2 py-0.5 text-[10px] font-bold text-safe">
                      <CheckIcon width={11} height={11} /> Sin riesgo conocido
                    </span>
                    <span className="chip h-7 min-h-0 px-2.5 text-[10.5px]" aria-pressed="true">
                      Melasma
                    </span>
                  </div>
                </div>

                {/* App: nav */}
                <div className="floating-nav grid grid-cols-4 p-1">
                  {[HomeIcon, BottleIcon, FaceIcon, PulseIcon].map((I, i) => (
                    <span key={i} className={`grid h-11 place-items-center rounded-[16px] ${i === 2 ? "bg-brand-tint text-brand" : "text-ink-3"}`}>
                      <I width={19} height={19} />
                    </span>
                  ))}
                </div>

                <p className="text-[12.5px] leading-snug text-ink-2">{th.note}</p>
                <button onClick={() => use(th.id)} className="btn btn-primary w-full">
                  Ver todo el sitio con {th.name}
                  <ArrowIcon width={15} height={15} className="-rotate-45" />
                </button>
              </div>
            </section>
          ))}
        </div>
        <p className="mt-8 text-center text-[12.5px] text-ink-3">
          <Link href="/" className="link-u">Volver al sitio</Link>
        </p>
      </div>
    </main>
  );
}
