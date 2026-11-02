"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import {
  AlertIcon,
  BottleIcon,
  CheckIcon,
  FaceIcon,
  HomeIcon,
  LockIcon,
  PulseIcon,
  RoutineIcon,
} from "@/components/icons";
import { LangToggle, useLang, type L } from "@/lib/i18n";
import type { Verdict } from "@/lib/ingredients/engine";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Ninemonths">
      <span
        className="grid h-8 w-8 place-items-center rounded-full shadow-[0_6px_16px_rgba(45,154,237,0.3)]"
        style={{ background: "var(--g-action)" }}
      >
        {/* A "9" drawn as a crescent around a dot: the nine months, softly. */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          aria-hidden
        >
          <circle cx="12" cy="9.5" r="4.5" />
          <path d="M16.5 9.5c0 5.5-2.5 9.5-7 10.5" />
        </svg>
      </span>
      <span
        className={`font-display text-[20px] font-bold tracking-[-0.045em] ${light ? "text-white" : ""}`}
      >
        Ninemonths
      </span>
    </Link>
  );
}

type Tone = { label: L; cls: string; icon: "check" | "alert" | "none" };
const VERDICT: Record<Verdict, Tone> = {
  safe: {
    label: { es: "Sin ingredientes de riesgo", en: "No risky ingredients" },
    cls: "bg-safe-tint text-safe",
    icon: "check",
  },
  caution: {
    label: { es: "Con cuidado", en: "Use with care" },
    cls: "bg-caution-tint text-caution",
    icon: "alert",
  },
  avoid: {
    label: { es: "Evítalo en el embarazo", en: "Avoid in pregnancy" },
    cls: "bg-avoid-tint text-avoid",
    icon: "alert",
  },
  unknown: {
    label: { es: "Sin datos", en: "No data" },
    cls: "bg-surface-muted text-ink-2",
    icon: "none",
  },
};

/** Status always carries an icon + words, never colour alone. */
export function VerdictBadge({
  v,
  big = false,
  item = false,
}: {
  v: Verdict;
  big?: boolean;
  item?: boolean;
}) {
  const { t } = useLang();
  const s =
    item && v === "safe"
      ? {
          ...VERDICT.safe,
          label: { es: "Sin riesgo conocido", en: "No known risk" },
        }
      : VERDICT[v];
  const size = big ? 18 : 13;
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-bold ${s.cls} ${big ? "px-4 py-2 text-[15px]" : "px-2.5 py-1 text-[11px]"}`}
    >
      {s.icon === "check" && <CheckIcon width={size} height={size} />}
      {s.icon === "alert" && <AlertIcon width={size} height={size} />}
      {t(s.label)}
    </span>
  );
}

const TABS: Array<{
  href: string;
  label: L;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}> = [
  { href: "/hoy", label: { es: "Hoy", en: "Today" }, Icon: HomeIcon },
  { href: "/revisar", label: { es: "Revisar", en: "Check" }, Icon: BottleIcon },
  { href: "/piel", label: { es: "Mi piel", en: "My skin" }, Icon: FaceIcon },
  {
    href: "/sintomas",
    label: { es: "Síntomas", en: "Symptoms" },
    Icon: PulseIcon,
  },
  { href: "/plan", label: { es: "Rutina", en: "Routine" }, Icon: RoutineIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { t } = useLang();
  return (
    <div className="app-shell">
      <aside className="app-sidebar no-print">
        <Logo />
        <p className="app-sidebar-label">
          {t({ es: "TU ESPACIO DE CUIDADO", en: "YOUR CARE SPACE" })}
        </p>
        <nav
          aria-label={t({ es: "Navegación principal", en: "Main navigation" })}
        >
          {TABS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={path.startsWith(href) ? "page" : undefined}
            >
              <Icon width={19} height={19} />
              {t(label)}
            </Link>
          ))}
          <Link
            href="/resumen"
            aria-current={path === "/resumen" ? "page" : undefined}
          >
            <CheckIcon width={19} height={19} />
            {t({ es: "Mi resumen", en: "My summary" })}
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <p>{t({ es: "Un día a la vez.", en: "One day at a time." })}</p>
          <small className="flex items-center gap-1.5">
            <LockIcon width={12} height={12} />
            {t({
              es: "Tu historial vive en este navegador.",
              en: "Your history lives in this browser.",
            })}
          </small>
        </div>
      </aside>
      <div className="app-body">
        <header className="app-header no-print">
          <div className="app-header-inner">
            <div className="app-header-brand">
              <Logo />
            </div>
            <p className="app-header-label">
              <span className="brand-dot" />
              {t({
                es: "Ciencia para tu piel. Espacio para ti.",
                en: "Science for your skin. Space for you.",
              })}
            </p>
            <LangToggle />
          </div>
        </header>
        <main key={path} className="app-main page-in">
          {children}
        </main>
      </div>
      <nav
        className="floating-nav app-mobile-nav no-print fixed inset-x-3 bottom-[max(10px,env(safe-area-inset-bottom))] z-20 mx-auto p-1.5"
        aria-label={t({ es: "Navegación principal", en: "Main navigation" })}
      >
        <ul className="grid grid-cols-5">
          {TABS.map(({ href, label, Icon }) => {
            const active = path.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-[56px] flex-col items-center justify-center gap-1 rounded-[18px] text-[10px] font-bold transition-colors ${active ? "bg-brand-tint text-brand-deep" : "text-ink-2 hover:text-ink"}`}
                >
                  <Icon width={21} height={21} />
                  {t(label)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  sub,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="app-page-header">
      {eyebrow && <p className="eyebrow eyebrow-dot">{eyebrow}</p>}
      <h1 className="title mt-2">{title}</h1>
      {sub && (
        <p className="mt-2 max-w-md text-[14px] leading-relaxed text-ink-2">
          {sub}
        </p>
      )}
    </div>
  );
}
/** Old name kept for existing pages. */
export const SectionTitle = ({
  kicker,
  title,
  sub,
}: {
  kicker?: string;
  title: string;
  sub?: string;
}) => <PageHeader eyebrow={kicker} title={title} sub={sub} />;

export function Disclaimer() {
  const { t } = useLang();
  return (
    <p className="mt-8 text-[11.5px] leading-relaxed text-ink-3">
      {t({
        es: "Ninemonths se basa en guías médicas publicadas y no reemplaza a tu médico. Ante cualquier duda, consulta con tu ginecólogo o dermatólogo.",
        en: "Ninemonths is based on published medical guidance and does not replace your doctor. When in doubt, ask your obstetrician or dermatologist.",
      })}
    </p>
  );
}

export function Loading() {
  return (
    <div className="space-y-3 py-4" aria-busy>
      {[120, 80, 80].map((h, i) => (
        <div
          key={i}
          className="animate-pulse rounded-[24px] bg-surface-muted"
          style={{ height: h }}
        />
      ))}
    </div>
  );
}

/** Pricing/paywall nudge used across pages. */
export function PassNudge({ title, body }: { title: L; body: L }) {
  const { t } = useLang();
  return (
    <div className="card spectral p-5">
      <p className="font-display text-[19px] font-bold tracking-[-0.02em]">
        {t(title)}
      </p>
      <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">{t(body)}</p>
      <Link href="/pase" className="btn btn-primary mt-4 w-full">
        {t({
          es: "Ver el pase de embarazo · $9.99",
          en: "See the pregnancy pass · $9.99",
        })}
      </Link>
    </div>
  );
}
