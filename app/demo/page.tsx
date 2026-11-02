"use client";

import { useRouter } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import { ArrowIcon, BottleIcon, FaceIcon, PulseIcon, LockIcon, SparkleIcon } from "@/components/icons";
import { Logo } from "@/components/ui";
import { LangToggle, useLang, type L } from "@/lib/i18n";
import { presetLabel, presetMelasma, presetSymptom } from "@/lib/presets";

// "For judges": each card loads a ready-made state on this device and jumps
// to the screen that shows it. No camera, account or key needed.

type Preset = { Icon: ComponentType<SVGProps<SVGSVGElement>>; tint: string; time: string; title: L; body: L; shows: L; go: () => void; to: string };

export default function Demo() {
  const { t } = useLang();
  const router = useRouter();

  const PRESETS: Preset[] = [
    {
      Icon: FaceIcon,
      tint: "tint-1",
      time: "30 s",
      title: { es: "Melasma creciendo: semana 14 → 22", en: "Melasma growing: week 14 → 22" },
      body: {
        es: "Tres selfies semanales de ejemplo. Verás el aviso por zona, el mapa del melasma, la tendencia, la rutina que se adapta y el resumen para el médico.",
        en: "Three sample weekly selfies. See the per-zone alert, the melasma map, the trend, the routine that adapts and the doctor summary.",
      },
      shows: { es: "Mi piel · Rutina · Resumen", en: "My skin · Routine · Summary" },
      go: presetMelasma,
      to: "/piel",
    },
    {
      Icon: BottleIcon,
      tint: "tint-2",
      time: "15 s",
      title: { es: "Foto de etiqueta → retinol → evítalo", en: "Label photo → retinol → avoid" },
      body: {
        es: "Una foto de un sérum de noche se lee en el teléfono (sin enviarla a ningún servidor) y cada ingrediente recibe su semáforo con la fuente médica.",
        en: "A night-serum photo is read on the phone (never sent to a server) and every ingredient gets a traffic light with its medical source.",
      },
      shows: { es: "Revisar", en: "Check" },
      go: presetLabel,
      to: "/revisar",
    },
    {
      Icon: PulseIcon,
      tint: "tint-3",
      time: "10 s",
      title: { es: "Picazón en las palmas → colestasis", en: "Itchy palms → cholestasis" },
      body: {
        es: "Semana 32. Un síntoma que parece de piel pero puede ser del hígado: la app lo detecta y dice cuándo ir al médico y qué análisis pedir.",
        en: "Week 32. A symptom that looks like skin but can be the liver: the app catches it and says when to see a doctor and which test to ask for.",
      },
      shows: { es: "Síntomas", en: "Symptoms" },
      go: presetSymptom,
      to: "/sintomas",
    },
  ];

  return (
    <main className="judge-entry min-h-dvh bg-canvas px-4 pb-16 pt-4">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between rounded-[20px] bg-white/90 px-4 py-2.5 shadow-[0_12px_40px_var(--ring)]">
          <Logo />
          <LangToggle />
        </header>

        <p className="eyebrow eyebrow-dot mt-12 judge-kicker">{t({ es: "Para jueces", en: "For judges" })}</p>
        <h1 className="mt-3 font-display text-[clamp(36px,5vw,58px)] font-bold leading-[1] tracking-[-0.05em]">
          {t({ es: "Todo Ninemonths ", en: "All of Ninemonths " })}
          <span className="serif-accent">{t({ es: "en un minuto.", en: "in one minute." })}</span>
        </h1>
        <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-ink-2">
          {t({
            es: "Cada tarjeta carga un caso listo en este dispositivo y te lleva a la pantalla que lo muestra. Para la medición real con YouCam AI, toma tu selfie guiada en Mi piel.",
            en: "Each card loads a ready-made case on this device and takes you to the screen that shows it. For a real YouCam AI measurement, take your guided selfie in My skin.",
          })}
        </p>

        <div className="judge-tour-note"><SparkleIcon width={18} height={18} /><div><strong>{t({ es: "Tres capítulos, una experiencia", en: "Three chapters, one experience" })}</strong><p>{t({ es: "Datos de ejemplo · Sin cámara · Sin cuenta", en: "Sample data · No camera · No account" })}</p></div><span>{t({ es: "DEMO", en: "DEMO" })}</span></div>
        <div className="judge-presets">
          {PRESETS.map((p, i) => (
            <button
              key={p.to}
              onClick={() => {
                p.go();
                router.push(p.to);
              }}
              className={`judge-preset card card-tap flex w-full items-start gap-4 p-5 text-left shadow-none ${p.tint}`}
            >
              <span className="icon-tile bg-white">
                <p.Icon />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-3">
                  0{i + 1} · {p.time}
                </span>
                <span className="mt-1 block font-display text-[19px] font-bold leading-tight tracking-[-0.025em]">{t(p.title)}</span>
                <span className="mt-1.5 block text-[13.5px] leading-relaxed text-ink-2">{t(p.body)}</span>
                <span className="judge-destinations">{t(p.shows)}</span>
                <span className="judge-open">{t({ es: "Explorar este caso", en: "Explore this case" })}<ArrowIcon width={15} height={15} /></span>
              </span>
              <ArrowIcon width={18} height={18} className="mt-1 flex-none text-ink-3" />
            </button>
          ))}
        </div>

        <p className="judge-storage-note"><LockIcon width={14} height={14} />{t({ es: "Cada caso sustituye el historial de este navegador por datos de ejemplo.", en: "Each case replaces this browser's history with sample data." })}</p>
        <div className="judge-technology card mt-8 p-5">
          <p className="font-display text-[17px] font-bold">{t({ es: "Qué hace YouCam y qué hacemos nosotros", en: "What YouCam does and what we do" })}</p>
          <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-ink-2">
            <li>
              <b className="text-ink">YouCam Skin Analysis</b> {t({ es: "— manchas, acné, rojez, hidratación, luminosidad y ojeras (raw_score). Su máscara de manchas se cruza con cada zona del melasma.", en: "— dark spots, acne, redness, hydration, radiance and dark circles (raw_score). Its spot mask is intersected with every melasma zone." })}
            </li>
            <li>
              <b className="text-ink">YouCam Makeup VTO</b> {t({ es: "— prueba el protector solar con color en tu propia cara, en tres tonos alrededor del tuyo, antes de comprarlo.", en: "— try tinted sunscreen on your own face, in three shades around yours, before you buy it." })}
            </li>
            <li>
              <b className="text-ink">YouCam Fitzpatrick</b> {t({ es: "— fototipo, para recomendar protector con color en pieles más oscuras.", en: "— skin type, to recommend tinted sunscreen for deeper skin tones." })}
            </li>
            <li>
              <b className="text-ink">Ninemonths</b>{" "}
              {t({
                es: "— selfie guiada comparable, mapa del melasma por zona con corrección de luz, comparación semanal, reglas de seguridad en el embarazo con fuentes, lectura de etiquetas en el teléfono, alerta de síntomas y resumen para el médico.",
                en: "— comparable guided selfie, per-zone melasma map with lighting correction, week-over-week comparison, sourced pregnancy-safety rules, on-phone label reading, symptom triage and a doctor summary.",
              })}
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
