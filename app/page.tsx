"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowIcon,
  BottleIcon,
  CheckIcon,
  FaceIcon,
  LockIcon,
  PulseIcon,
  ShieldIcon,
  SparkleIcon,
  SunIcon,
} from "@/components/icons";
import { Disclaimer, Logo } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { SkinPortrait, Sparkline, ZoneFace } from "@/components/skin-visuals";
import { LangToggle, useLang } from "@/lib/i18n";
import { SOURCES } from "@/lib/ingredients/data";
import { useAppState } from "@/lib/store";

const DEMO = [
  { week: 18, values: [28, 38, 36, 21, 14], trend: [34, 35, 30, 32, 28] },
  { week: 22, values: [34, 46, 42, 27, 18], trend: [28, 32, 36, 35, 34] },
  { week: 26, values: [31, 39, 36, 23, 16], trend: [34, 33, 31, 30, 29] },
];

export default function Landing() {
  const { t } = useLang();
  const state = useAppState();
  const cta = state?.profile ? "/hoy" : "/empezar";
  const ctaLabel = state?.profile
    ? t({ es: "Ir a mi espacio", en: "Go to my space" })
    : t({ es: "Conoce tu piel", en: "Meet your skin" });
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-nav">
          <Logo />
          <nav
            className="hidden items-center gap-8 text-[12px] font-semibold md:flex"
            aria-label={t({
              es: "Navegación principal",
              en: "Main navigation",
            })}
          >
            <a href="#como">
              {t({ es: "La experiencia", en: "The experience" })}
            </a>
            <a href="#seguimiento">
              {t({ es: "Tu evolución", en: "Your progress" })}
            </a>
            <a href="#precio">{t({ es: "El pase", en: "The pass" })}</a>
          </nav>
          <div className="flex items-center gap-3">
            <LangToggle />
            <Link
              href={cta}
              className="btn btn-deep btn-sm hidden sm:inline-flex"
            >
              {t({ es: "Empezar gratis", en: "Start free" })}
              <ArrowIcon width={14} height={14} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero-section section-wrap">
          <div className="hero-copy rise">
            <p className="eyebrow">
              <span className="brand-dot" />
              {t({
                es: "LA APP DE PIEL PARA EL EMBARAZO · CON YOUCAM AI",
                en: "THE PREGNANCY SKIN APP · POWERED BY YOUCAM AI",
              })}
            </p>
            <h1>
              {t({ es: "El embarazo cambia tu piel.", en: "Pregnancy changes your skin." })}
              <br />
              <span className="serif-accent">
                {t({ es: "Míralo semana a semana.", en: "See it week by week." })}
              </span>
            </h1>
            <p className="hero-description">
              {t({
                es: "Una selfie guiada por semana: YouCam AI mapea tu melasma zona por zona, prueba protector solar con color en tu cara, revisa si tus cremas son seguras para tu bebé y te dice cuándo un síntoma necesita a tu médico.",
                en: "One guided selfie a week: YouCam AI maps your melasma zone by zone, tries tinted sunscreen on your face, checks if your creams are safe for your baby, and tells you when a symptom needs your doctor.",
              })}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link href={cta} className="btn btn-deep hero-cta">
                {ctaLabel}
                <span className="button-arrow">
                  <ArrowIcon width={18} height={18} />
                </span>
              </Link>
              <a href="#seguimiento" className="hero-secondary">
                <span className="play-symbol">▷</span>
                {t({
                  es: "Explora la experiencia",
                  en: "Explore the experience",
                })}
              </a>
            </div>
            <div className="hero-reassurance">
              <ShieldIcon width={15} height={15} />
              <span>
                {t({
                  es: "Sin cuenta. Primer análisis gratis. Hecho para ti.",
                  en: "No account. First scan free. Made for you.",
                })}
              </span>
            </div>
            <div className="hero-footnote">
              <span className="tiny-orbits" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span>
                {t({
                  es: "Cuidado consciente, desde el primer trimestre.",
                  en: "Thoughtful care, from your first trimester.",
                })}
              </span>
            </div>
          </div>
          <div className="hero-art rise">
            <div className="art-topline">
              <span className="flex items-center gap-2">
                <span className="status-pip" /> SKIN INTELLIGENCE
              </span>
              <span>N° 009</span>
            </div>
            <SkinPortrait />
            <div className="hero-art-tag">
              <SparkleIcon width={13} height={13} />
              {t({
                es: "Tu piel tiene una historia.",
                en: "Your skin has a story.",
              })}
            </div>
            <div className="floating-insight floaty">
              <div className="insight-icon">
                <FaceIcon width={18} height={18} />
              </div>
              <div>
                <p className="mini-label">
                  {t({
                    es: "DE LA SELFIE A LA CLARIDAD",
                    en: "FROM SELFIE TO CLARITY",
                  })}
                </p>
                <p className="mt-1 text-[13px] font-semibold">
                  {t({
                    es: "Melasma, zona por zona.",
                    en: "Melasma, zone by zone.",
                  })}
                </p>
              </div>
              <span className="insight-check">
                <CheckIcon width={14} height={14} />
              </span>
            </div>
            <div className="floating-chart">
              <div className="flex items-center justify-between gap-6">
                <p className="mini-label">
                  {t({ es: "SEMANA A SEMANA", en: "WEEK BY WEEK" })}
                </p>
                <span className="text-[9px] text-ink-2">
                  {t({ es: "Ejemplo ilustrativo", en: "Illustrative example" })}
                </span>
              </div>
              <Sparkline values={[38, 44, 41, 49, 43, 37, 32]} />
              <div className="flex justify-between text-[9px] text-ink-2">
                <span>
                  {t({ es: "Tu punto de partida", en: "Your starting point" })}
                </span>
                <span>
                  {t({ es: "Tu siguiente capítulo", en: "Your next chapter" })}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="science-strip">
          <div className="section-wrap">
            <span className="mini-label">
              {t({
                es: "TECNOLOGÍA CON PROPÓSITO",
                en: "TECHNOLOGY WITH PURPOSE",
              })}
            </span>
            <span className="science-name">
              YouCam <em>AI</em>
            </span>
            <span className="science-divider" />
            <span className="text-[12px] text-ink-2">
              {t({
                es: "Skin Analysis · Makeup VTO · Fitzpatrick — y reglas basadas en guías de",
                en: "Skin Analysis · Makeup VTO · Fitzpatrick — plus rules from published guidance by",
              })}
            </span>
            <a href={SOURCES.acog.url} target="_blank" rel="noreferrer">
              ACOG ↗
            </a>
            <a href={SOURCES.aad.url} target="_blank" rel="noreferrer">
              AAD ↗
            </a>
            <a href={SOURCES.rcog.url} target="_blank" rel="noreferrer">
              RCOG ↗
            </a>
          </div>
        </div>

        <section id="como" className="section-wrap experience-section">
          <Reveal className="section-heading">
            <div>
              <p className="eyebrow">
                01 / {t({ es: "UN POCO DE CLARIDAD", en: "A LITTLE CLARITY" })}
              </p>
              <h2>
                {t({ es: "Menos dudas.", en: "Less wondering." })}
                <br />
                <span className="serif-accent">
                  {t({ es: "Más acompañada.", en: "More supported." })}
                </span>
              </h2>
            </div>
            <p>
              {t({
                es: "Tu cuerpo está haciendo algo extraordinario. Cuidar tu piel no debería ser complicado.",
                en: "Your body is doing something extraordinary. Taking care of your skin shouldn't be complicated.",
              })}
            </p>
          </Reveal>
          <div className="experience-grid">
            <Reveal className="experience-card experience-skin">
              <div className="feature-heading">
                <span className="feature-number">01</span>
                <FaceIcon />
              </div>
              <div className="feature-visual face-feature">
                <ZoneFace
                  values={{
                    forehead: 28,
                    cheekL: 38,
                    cheekR: 36,
                    upperLip: 21,
                    chin: 14,
                  }}
                />
                <span className="zone-callout">
                  {t({ es: "5 zonas del melasma", en: "5 melasma zones" })}
                  <span className="status-pip" />
                </span>
              </div>
              <p className="mini-label">
                {t({ es: "MELASMA DEL EMBARAZO", en: "PREGNANCY MELASMA" })}
              </p>
              <h3>
                {t({
                  es: "Tu melasma, zona por zona.",
                  en: "Your melasma, zone by zone.",
                })}
              </h3>
              <p>
                {t({
                  es: "YouCam AI mide manchas, acné, rojez, hidratación, luminosidad y ojeras, y marca cada mancha en tu foto. Ninemonths lo cruza con las 5 zonas del melasma y te avisa cuál crece. Tu selfie anterior aparece como guía, para que cada semana se compare de verdad.",
                  en: "YouCam AI measures spots, acne, redness, hydration, radiance and dark circles, and marks every spot on your photo. Ninemonths maps that onto the 5 melasma zones and tells you which one is growing. Last week's selfie appears as a guide, so every week compares like for like.",
                })}
              </p>
              <Link href={cta} className="feature-link">
                {t({
                  es: "Empieza tu seguimiento",
                  en: "Start your skin story",
                })}
                <ArrowIcon width={16} height={16} />
              </Link>
              <span className="visual-example">
                {t({
                  es: "Visualización ilustrativa",
                  en: "Illustrative visualization",
                })}
              </span>
            </Reveal>
            <Reveal className="experience-card experience-label">
              <div className="feature-heading">
                <span className="feature-number">02</span>
                <BottleIcon />
              </div>
              <div className="feature-visual label-feature">
                <div className="cosmetic-bottle">
                  <div className="bottle-cap" />
                  <div className="bottle-body">
                    <span>N° 09</span>
                    <strong>
                      Daily
                      <br />
                      ritual.
                    </strong>
                    <small>INGREDIENT CHECK</small>
                  </div>
                </div>
                <div className="ingredient-note">
                  <span>
                    <span className="ingredient-dot bg-avoid" />
                    Retinol <b>{t({ es: "Evitar", en: "Avoid" })}</b>
                  </span>
                  <span>
                    <span className="ingredient-dot bg-safe" />
                    Glycerin <CheckIcon width={12} height={12} />
                  </span>
                  <span>
                    <span className="ingredient-dot bg-safe" />
                    Niacinamide <CheckIcon width={12} height={12} />
                  </span>
                </div>
              </div>
              <p className="mini-label">
                {t({ es: "SEGURO PARA TU BEBÉ", en: "SAFE FOR YOUR BABY" })}
              </p>
              <h3>
                {t({
                  es: "¿Puedo usar esta crema embarazada?",
                  en: "Is this cream safe for your baby?",
                })}
              </h3>
              <p>
                {t({
                  es: "Toma una foto de la etiqueta y se lee en tu teléfono. Cada ingrediente recibe su semáforo para el embarazo, con la razón, la fuente médica y qué usar en su lugar.",
                  en: "Snap the label and it's read on your phone. Every ingredient gets a pregnancy traffic light, with the reason, the medical source and what to use instead.",
                })}
              </p>
              <Link href={cta} className="feature-link">
                {t({ es: "Revisa tus productos", en: "Check your products" })}
                <ArrowIcon width={16} height={16} />
              </Link>
              <span className="visual-example">
                {t({ es: "Producto de ejemplo", en: "Example product" })}
              </span>
            </Reveal>
            <Reveal className="experience-card experience-care">
              <div className="feature-heading">
                <span className="feature-number">03</span>
                <PulseIcon />
              </div>
              <div className="feature-visual care-feature">
                <div className="care-orbit orbit-one" />
                <div className="care-orbit orbit-two" />
                <div className="care-heart">
                  <PulseIcon width={52} height={52} />
                </div>
                <div className="care-label">
                  <ShieldIcon width={15} height={15} />
                  {t({
                    es: "Siempre disponible. Siempre gratis.",
                    en: "Always available. Always free.",
                  })}
                </div>
              </div>
              <p className="mini-label">
                {t({ es: "ESCUCHA TU CUERPO", en: "LISTEN TO YOUR BODY" })}
              </p>
              <h3>
                {t({
                  es: "Sabe cuándo consultar.",
                  en: "Know when to reach out.",
                })}
              </h3>
              <p>
                {t({
                  es: "¿Picazón en las palmas por la noche? Puede ser colestasis, un problema del hígado del embarazo: te diremos que llames a tu médico y qué análisis pedir. Lo común, te lo explicamos con calma.",
                  en: "Itchy palms at night? It can be cholestasis, a pregnancy liver condition: we'll tell you to call your doctor and which test to ask for. The common stuff, we explain calmly.",
                })}
              </p>
              <Link href={cta} className="feature-link">
                {t({
                  es: "Conoce la revisión de síntomas",
                  en: "Explore the symptom check",
                })}
                <ArrowIcon width={16} height={16} />
              </Link>
            </Reveal>
          </div>
        </section>

        <ProgressDemo />

        <TintSection />

        <section className="ritual-section section-wrap">
          <Reveal className="ritual-copy">
            <p className="eyebrow">
              03 /{" "}
              {t({
                es: "DE LA INFORMACIÓN AL CUIDADO",
                en: "FROM INSIGHT TO CARE",
              })}
            </p>
            <h2>
              {t({ es: "Un pequeño ritual.", en: "A little ritual." })}
              <br />
              <span className="serif-accent">
                {t({ es: "Solo para ti.", en: "Just for you." })}
              </span>
            </h2>
            <p className="mt-5 max-w-md text-ink-2 leading-relaxed">
              {t({
                es: "Tu semana, tu piel y el sol de tu ciudad. Todo se conecta en una rutina que tiene sentido para ti, con ingredientes en lugar de marcas.",
                en: "Your week, your skin, and the sunshine in your city. It all comes together in a routine that makes sense for you, with ingredients instead of brands.",
              })}
            </p>
            <Link href={cta} className="feature-link mt-7">
              {t({ es: "Encuentra tu rutina", en: "Find your routine" })}
              <ArrowIcon width={16} height={16} />
            </Link>
          </Reveal>
          <Reveal className="ritual-board">
            <div className="ritual-board-header">
              <span className="eyebrow">
                {t({ es: "TU MOMENTO DE CUIDADO", en: "YOUR MOMENT OF CARE" })}
              </span>
              <SunIcon />
            </div>
            <div className="ritual-item">
              <span>01</span>
              <div>
                <h3>{t({ es: "Empieza suave", en: "Start gently" })}</h3>
                <p>
                  {t({
                    es: "Limpiador sin fragancia",
                    en: "Fragrance-free cleanser",
                  })}
                </p>
              </div>
              <span className="ritual-time">AM</span>
            </div>
            <div className="ritual-item">
              <span>02</span>
              <div>
                <h3>
                  {t({
                    es: "Protege lo que cambia",
                    en: "Protect what's changing",
                  })}
                </h3>
                <p>
                  {t({
                    es: "Protector mineral · SPF 50",
                    en: "Mineral sunscreen · SPF 50",
                  })}
                </p>
              </div>
              <span className="ritual-time">AM</span>
            </div>
            <div className="ritual-item">
              <span>03</span>
              <div>
                <h3>{t({ es: "Termina con calma", en: "End with calm" })}</h3>
                <p>
                  {t({
                    es: "Hidratante con ceramidas",
                    en: "Ceramide moisturiser",
                  })}
                </p>
              </div>
              <span className="ritual-time">PM</span>
            </div>
            <p className="text-[10px] text-ink-2 pt-4">
              {t({
                es: "Rutina de ejemplo. La tuya se adapta a tu perfil.",
                en: "Example routine. Yours adapts to your profile.",
              })}
            </p>
          </Reveal>
        </section>

        <section className="privacy-section">
          <div className="section-wrap privacy-inner">
            <div className="privacy-symbol">
              <LockIcon width={38} height={38} />
              <span />
              <span />
            </div>
            <Reveal>
              <p className="eyebrow">
                {t({
                  es: "TU HISTORIA TE PERTENECE",
                  en: "YOUR STORY BELONGS TO YOU",
                })}
              </p>
              <h2>
                {t({
                  es: "Personal, por naturaleza.",
                  en: "Personal, by nature.",
                })}
                <br />
                <span className="serif-accent">
                  {t({ es: "Privado, por diseño.", en: "Private, by design." })}
                </span>
              </h2>
              <p>
                {t({
                  es: "Sin cuentas. Tu historial vive en este navegador. Para analizar la piel, la foto se envía a YouCam; al recibir el resultado solicitamos borrar la tarea. Las etiquetas pueden procesarse con IA externa u OCR local.",
                  en: "No accounts. Your history lives in this browser. For skin analysis, the photo goes to YouCam; after receiving results we request task deletion. Labels can be processed with external AI or local OCR.",
                })}
              </p>
              <span className="privacy-note">
                <ShieldIcon width={14} height={14} />
                {t({
                  es: "Tu seguimiento no se sincroniza entre dispositivos.",
                  en: "Your history does not sync across devices.",
                })}
              </span>
            </Reveal>
          </div>
        </section>

        <section id="precio" className="section-wrap pricing-section">
          <Reveal className="pricing-copy">
            <p className="eyebrow">
              04 /{" "}
              {t({
                es: "ACOMPAÑARTE, SIN COMPLICARTE",
                en: "SUPPORT WITHOUT THE COMPLICATIONS",
              })}
            </p>
            <h2>
              {t({ es: "Nueve meses.", en: "Nine months." })}
              <br />
              <span className="serif-accent">
                {t({ es: "Un solo pase.", en: "One little pass." })}
              </span>
            </h2>
            <p>
              {t({
                es: "Empieza gratis: un análisis de piel, tres revisiones de productos y orientación sobre síntomas siempre disponible.",
                en: "Start free: one skin scan, three product checks, and symptom guidance that's always available.",
              })}
            </p>
            <Link href={cta} className="feature-link">
              {t({ es: "Quiero empezar gratis", en: "I'd like to start free" })}
              <ArrowIcon width={16} height={16} />
            </Link>
          </Reveal>
          <Reveal className="pricing-card">
            <div className="flex items-center justify-between">
              <span className="eyebrow">
                {t({ es: "PASE DE EMBARAZO", en: "PREGNANCY PASS" })}
              </span>
              <SparkleIcon />
            </div>
            <div className="price">
              $9.99<span>{t({ es: "una vez", en: "one time" })}</span>
            </div>
            <p className="text-[13px] text-ink-2">
              {t({
                es: "Un espacio para todo tu embarazo.",
                en: "A space for your whole pregnancy.",
              })}
            </p>
            <ul>
              {[
                {
                  es: "Revisiones de productos ilimitadas",
                  en: "Unlimited product checks",
                },
                {
                  es: "Selfies y evolución semana a semana",
                  en: "Selfies and weekly skin history",
                },
                {
                  es: "Rutina que se adapta a ti",
                  en: "A routine that adapts to you",
                },
                {
                  es: "Resumen para llevar a tu médico",
                  en: "A summary to share with your doctor",
                },
              ].map((item) => (
                <li key={item.en}>
                  <CheckIcon width={16} height={16} />
                  {t(item)}
                </li>
              ))}
            </ul>
            <Link
              href={state?.profile ? "/pase" : "/empezar"}
              className="btn btn-deep w-full"
            >
              {t({ es: "Descubre tu pase", en: "Discover your pass" })}
              <ArrowIcon width={16} height={16} />
            </Link>
            <p className="mt-3 text-center text-[10px] text-ink-2">
              {t({
                es: "Versión demo: el pase se desbloquea sin realizar cobros.",
                en: "Demo build: the pass unlocks without any payment.",
              })}
            </p>
          </Reveal>
        </section>

        <section className="closing-section">
          <Reveal>
            <p className="eyebrow">
              {t({
                es: "UN NUEVO CAPÍTULO EMPIEZA CONTIGO",
                en: "A NEW CHAPTER STARTS WITH YOU",
              })}
            </p>
            <h2>
              {t({
                es: "Tu piel está cambiando.",
                en: "Your skin is changing.",
              })}
              <br />
              <span className="serif-accent">
                {t({
                  es: "Cámbiale la forma de cuidarla.",
                  en: "Change the way you care for it.",
                })}
              </span>
            </h2>
            <Link href={cta} className="btn btn-deep mt-8">
              {ctaLabel}
              <ArrowIcon width={18} height={18} />
            </Link>
          </Reveal>
          <span className="closing-watermark" aria-hidden="true">
            nine.
          </span>
        </section>
      </main>
      <footer className="landing-footer section-wrap">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <Logo />
          <p className="text-[11px] text-ink-2">
            {t({
              es: "Ciencia para tu piel. Espacio para ti.",
              en: "Science for your skin. Space for you.",
            })}
          </p>
          <a href="#precio" className="text-[11px] font-semibold">
            {t({ es: "Empieza tu historia", en: "Start your story" })} ↗
          </a>
        </div>
        <Disclaimer />
        <p className="mt-5 text-[10px] text-ink-2">
          © 2026 Ninemonths ·{" "}
          {t({
            es: "Las ilustraciones y los datos de ejemplo no representan resultados clínicos.",
            en: "Illustrations and example data do not represent clinical results.",
          })}
        </p>
      </footer>
    </div>
  );
}

function ProgressDemo() {
  const { t } = useLang();
  const [selected, setSelected] = useState(1);
  const demo = DEMO[selected];
  return (
    <section id="seguimiento" className="progress-section">
      <div className="section-wrap">
        <Reveal className="section-heading">
          <div>
            <p className="eyebrow">
              02 /{" "}
              {t({
                es: "TU PIEL TIENE UNA HISTORIA",
                en: "YOUR SKIN HAS A STORY",
              })}
            </p>
            <h2>
              {t({ es: "El cambio se ve.", en: "Change becomes visible." })}
              <br />
              <span className="serif-accent">
                {t({ es: "La calma se siente.", en: "Peace of mind, felt." })}
              </span>
            </h2>
          </div>
          <p>
            {t({
              es: "Explora un ejemplo de seguimiento. Cada semana suma contexto a lo que ves en el espejo.",
              en: "Explore an example skin journey. Each week adds context to what you see in the mirror.",
            })}
          </p>
        </Reveal>
        <Reveal className="progress-workspace">
          <div className="progress-sidebar">
            <Logo />
            <div className="progress-profile">
              <span className="profile-monogram">N</span>
              <div>
                <p className="text-[12px] font-semibold">
                  {t({ es: "Tu espacio de cuidado", en: "Your care space" })}
                </p>
                <p className="text-[10px] text-ink-2">
                  {t({ es: "Un día a la vez", en: "One day at a time" })}
                </p>
              </div>
            </div>
            {[
              { Icon: SunIcon, es: "Mi día", en: "My day" },
              { Icon: FaceIcon, es: "Mi piel", en: "My skin" },
              { Icon: BottleIcon, es: "Mis productos", en: "My products" },
              { Icon: PulseIcon, es: "Mi bienestar", en: "My wellbeing" },
            ].map(({ Icon, es, en }, i) => (
              <div
                key={en}
                className={`demo-nav-item ${i === 1 ? "active" : ""}`}
              >
                <Icon width={17} height={17} />
                {t({ es, en })}
              </div>
            ))}
            <div className="sidebar-note">
              <LockIcon width={16} height={16} />
              <p>
                {t({
                  es: "Tu historia se queda contigo.",
                  en: "Your story stays with you.",
                })}
              </p>
            </div>
          </div>
          <div className="progress-content">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="mini-label">
                  {t({
                    es: "ASÍ SE VE TU SEGUIMIENTO",
                    en: "A LOOK INSIDE YOUR SKIN JOURNEY",
                  })}
                </p>
                <h3 className="mt-2 text-2xl font-semibold">
                  {t({
                    es: "Cada semana, más claridad.",
                    en: "A little clearer, every week.",
                  })}
                </h3>
              </div>
              <span className="demo-label">
                {t({ es: "DEMO INTERACTIVA", en: "INTERACTIVE DEMO" })}
              </span>
            </div>
            <div
              className="week-selector"
              role="group"
              aria-label={t({
                es: "Seleccionar semana de ejemplo",
                en: "Select example week",
              })}
            >
              {DEMO.map((d, i) => (
                <button
                  key={d.week}
                  onClick={() => setSelected(i)}
                  aria-pressed={i === selected}
                >
                  {t({ es: "Semana", en: "Week" })} {d.week}
                  <span>{i === selected ? "●" : "○"}</span>
                </button>
              ))}
            </div>
            <div className="progress-data" key={demo.week} aria-live="polite">
              <div className="demo-zone-card">
                <p className="mini-label">
                  {t({
                    es: "TU MAPA DE PIGMENTACIÓN",
                    en: "YOUR PIGMENTATION MAP",
                  })}
                </p>
                <ZoneFace
                  values={{
                    forehead: demo.values[0],
                    cheekL: demo.values[1],
                    cheekR: demo.values[2],
                    upperLip: demo.values[3],
                    chin: demo.values[4],
                  }}
                />
                <div className="map-legend">
                  <span />
                  {t({
                    es: "Intensidad del índice por zona",
                    en: "Zone index intensity",
                  })}
                </div>
              </div>
              <div className="demo-trend-card">
                <p className="mini-label">
                  {t({ es: "TU EVOLUCIÓN", en: "YOUR PROGRESS" })}
                </p>
                <div className="mt-4 flex items-end gap-2">
                  <strong className="text-[44px] leading-none tracking-tighter">
                    {demo.trend.at(-1)}
                  </strong>
                  <span className="mb-1 text-[11px] text-ink-2">/ 100</span>
                </div>
                <p className="mt-2 text-[11px] text-ink-2">
                  {t({
                    es: "Índice de pigmentación · ejemplo",
                    en: "Pigmentation index · example",
                  })}
                </p>
                <Sparkline values={demo.trend} />
                <div className="demo-advice">
                  <SunIcon width={20} height={20} />
                  <p>
                    {t({
                      es: "Tu siguiente paso: protector solar cada mañana y una selfie la próxima semana.",
                      en: "Your next step: sunscreen every morning, and another selfie next week.",
                    })}
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-[10px] text-ink-2">
              {t({
                es: "Datos ilustrativos. El mapa se calcula en el dispositivo; YouCam aporta los puntajes generales y la máscara de manchas.",
                en: "Illustrative data. The zone map is computed on-device; YouCam provides overall scores and the dark-spot mask.",
              })}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Makeup VTO: tinted sunscreen tried on her own face before she buys it. */
function TintSection() {
  const { t } = useLang();
  const [split, setSplit] = useState(50);
  const [shade, setShade] = useState(1);
  const shades = [
    { c: "#e9b9a0", l: { es: "Más claro", en: "Lighter" } },
    { c: "#c98f72", l: { es: "Tu tono", en: "Your match" } },
    { c: "#a8735a", l: { es: "Más profundo", en: "Deeper" } },
  ];
  return (
    <section id="tinted-sunscreen" className="section-wrap tint-story" style={{ paddingBlock: "clamp(64px, 9vw, 120px)" }}>
      <div className="grid items-center gap-10 md:grid-cols-[1fr_1fr]">
        <Reveal>
          <p className="eyebrow">
            <span className="brand-dot" />
            {t({ es: "PRUÉBALO ANTES DE COMPRAR · YOUCAM VTO", en: "TRY BEFORE YOU BUY · YOUCAM VTO" })}
          </p>
          <h2>
            {t({ es: "Protector con color,", en: "Tinted sunscreen," })}
            <br />
            <span className="serif-accent">{t({ es: "en tu propia cara.", en: "on your own face." })}</span>
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-ink-2">
            {t({
              es: "El protector mineral con óxido de hierro es la mejor defensa contra el melasma, pero da miedo que se vea naranja o blanco. Ninemonths mide tu tono en la selfie y YouCam te lo aplica en tres tonos, sin retocar tu piel, para que elijas el que desaparece en ti.",
              en: "Mineral sunscreen with iron oxides is the best defence against melasma, but nobody wants to look orange or chalky. Ninemonths measures your tone from your selfie and YouCam applies the tint in three shades, without airbrushing you, so you pick the one that disappears on you.",
            })}
          </p>
          <div className="tint-shades mt-6" role="group" aria-label={t({ es: "Tonos ilustrativos", en: "Illustrative shades" })}>
            {shades.map((s, i) => (
              <button key={s.c} className="chip" aria-pressed={shade === i} onClick={() => setShade(i)}>
                <span className="h-4 w-4 rounded-full border border-white shadow" style={{ background: s.c }} />
                {t(s.l)}
              </button>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <figure className="tint-editorial-frame"><div className="tint-frame-caption"><span>{t({ es: "UN TONO. TU PROPIA PIEL.", en: "A TINT. STILL YOUR SKIN." })}</span><span>01 — 03</span></div><div className="tint-comparison relative mx-auto aspect-[4/5] w-full overflow-hidden rounded-[24px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/skin-sculpture.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/skin-sculpture.webp"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              style={{ clipPath: `inset(0 0 0 ${split}%)`, filter: `saturate(${[.88, .96, 1.08][shade]}) brightness(${[1.09, 1.03, .96][shade]}) contrast(.96)` }}
            />
            <span className="tint-divider" style={{ left: `${split}%` }}><span className="tint-drag-handle" aria-hidden="true">‹ ›</span></span>
            <input className="tint-range" type="range" min={0} max={100} value={split} onChange={e => setSplit(+e.target.value)} aria-label={t({ es: "Comparar ilustración sin y con tinte", en: "Compare illustrative bare and tinted skin" })} />
            <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-bold text-white">{t({ es: "Sin", en: "Bare" })}</span>
            <span className="absolute right-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-bold text-white">{t({ es: "Con tinte", en: "Tinted" })}</span>
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/85 px-3 py-1 text-[10px] text-ink-2 backdrop-blur">
              {t({ es: "Ejemplo ilustrativo · en la app es tu selfie", en: "Illustrative · in the app it's your selfie" })}
            </span>
          </div><figcaption className="tint-bottom-caption"><span className="brand-dot" />{t({ es: "Arrastra para explorar · Ilustrativo", en: "Drag to explore · Illustrative" })}</figcaption></figure>
        </Reveal>
      </div>
    </section>
  );
}
