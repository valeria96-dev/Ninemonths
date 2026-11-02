"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentType, type SVGProps } from "react";
import { Ready } from "@/components/AppGate";
import {
  AlertIcon,
  ArrowIcon,
  BottleIcon,
  ClipboardIcon,
  FaceIcon,
  PulseIcon,
  SunIcon,
} from "@/components/icons";
import { Disclaimer } from "@/components/ui";
import { ScoreRing, Sparkline, ZoneFace } from "@/components/skin-visuals";
import { useLang, type L } from "@/lib/i18n";
import { weekNote } from "@/lib/pregnancy";
import { useProfile } from "@/lib/useProfile";
import { fetchUv, reapplyTimes, uvLabel, type UvToday } from "@/lib/uv";

function Today() {
  const { t, lang } = useLang();
  const { state, profile, week, tri } = useProfile();
  const [uv, setUv] = useState<UvToday | null>(null);
  const [now] = useState(() => Date.now());
  useEffect(() => {
    if (profile.city)
      fetchUv(profile.city.lat, profile.city.lon)
        .then(setUv)
        .catch(() => setUv(null));
  }, [profile.city]);
  const latest = state.scans.at(-1);
  const prev = state.scans.at(-2);
  const spotDelta =
    latest &&
    prev &&
    latest.scores.age_spot != null &&
    prev.scores.age_spot != null
      ? latest.scores.age_spot - prev.scores.age_spot
      : null;
  const flaggedInUse = state.checks.filter(
    (c) => c.inUse && c.verdict === "avoid",
  );
  const daysSinceScan = latest
    ? Math.floor((now - new Date(latest.date).getTime()) / 86_400_000)
    : null;
  const progress = Math.min(100, (week / 40) * 100);
  const trend = state.scans
    .map((s) => s.scores.age_spot)
    .filter((v): v is number => v != null);
  return (
    <div className="care-dashboard">
      <div className="dashboard-welcome">
        <div>
          <p className="eyebrow">
            {t({ es: "TU ESPACIO DE CUIDADO", en: "YOUR CARE SPACE" })}
          </p>
          <h1>
            {t({ es: "Un momento para ti.", en: "A moment for you." })}
            <span className="serif-accent">
              {t({ es: "Y para tu piel.", en: "And for your skin." })}
            </span>
          </h1>
        </div>
        <p className="dashboard-date">
          {new Date(now).toLocaleDateString(lang, {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">
            {t({
              es: `TU HISTORIA · TRIMESTRE ${tri}`,
              en: `YOUR STORY · TRIMESTER ${tri}`,
            })}
          </p>
          <h2>
            {t({ es: "Semana", en: "Week" })} {week}
            <span className="serif-accent">.</span>
          </h2>
          <p>{t(weekNote(week))}</p>
        </div>
        <div
          className="pregnancy-orbit"
          role="img"
          aria-label={t({
            es: `Semana ${week} de 40`,
            en: `Week ${week} of 40`,
          })}
        >
          <svg viewBox="0 0 144 144" aria-hidden="true">
            <circle
              cx="72"
              cy="72"
              r="65"
              fill="none"
              stroke="#d9cbe5"
              strokeWidth="3"
            />
            <circle
              cx="72"
              cy="72"
              r="65"
              fill="none"
              stroke="var(--brand)"
              strokeWidth="4"
              strokeDasharray={`${(progress / 100) * 408.4} 408.4`}
              strokeLinecap="round"
            />
            <circle
              cx="72"
              cy="72"
              r="52"
              fill="none"
              stroke="#ded2e7"
              strokeDasharray="1 7"
            />
          </svg>
          <div>
            <strong>{week}</strong>
            <span>{t({ es: "DE 40 SEMANAS", en: "OF 40 WEEKS" })}</span>
          </div>
        </div>
      </section>
      {flaggedInUse.length > 0 && (
        <Link
          href="/revisar"
          className="dashboard-product-alert card card-tap flex items-center gap-3 p-4"
        >
          <span className="product-alert-symbol"><AlertIcon className="shrink-0 text-avoid" /></span>
          <div className="min-w-0"><p className="mini-label mb-1">{t({ es: "UNA REVISIÓN PENDIENTE", en: "A MOMENT TO REVIEW" })}</p>
            <p className="text-[13px] font-semibold text-avoid">
              {t({
                es: "Revisa los productos que estás usando",
                en: "Review the products you're using",
              })}
            </p>
            <p className="mt-1 text-[11px] text-ink-2">
              {flaggedInUse.map((c) => c.name).join(", ")}
            </p><span className="product-alert-action">{t({ es: "Consulta los ingredientes y sus fuentes", en: "Review the ingredients and their sources" })}</span>
          </div>
          <ArrowIcon
            className="ml-auto shrink-0 text-avoid"
            width={16}
            height={16}
          />
        </Link>
      )}
      <div className="dashboard-section-label">
        {t({ es: "¿Qué necesitas hoy?", en: "What do you need today?" })}
        <span>{t({ es: "Un paso a la vez", en: "One step at a time" })}</span>
      </div>
      <div className="dashboard-actions">
        <Action
          href="/piel"
          Icon={FaceIcon}
          title={{ es: "Mi selfie semanal", en: "My weekly selfie" }}
          sub={
            daysSinceScan === null
              ? { es: "Empieza tu historia", en: "Start your story" }
              : daysSinceScan >= 7
                ? { es: "Ya toca otra selfie", en: "Time for another selfie" }
                : {
                    es: `Hace ${daysSinceScan} días`,
                    en: `${daysSinceScan} days ago`,
                  }
          }
          color="bg-brand-tint text-brand"
          badge={daysSinceScan === null || daysSinceScan >= 7}
        />
        <Action
          href="/revisar"
          Icon={BottleIcon}
          title={{ es: "¿Puedo usar esto?", en: "Can I use this?" }}
          sub={{ es: "Entiende tu etiqueta", en: "Understand your label" }}
          color="bg-lilac text-brand-deep"
        />
        <Action
          href="/sintomas"
          Icon={PulseIcon}
          title={{ es: "¿Esto es normal?", en: "Is this normal?" }}
          sub={{ es: "Escucha a tu cuerpo", en: "Listen to your body" }}
          color="bg-safe-tint text-safe"
        />
        <Action
          href="/resumen"
          Icon={ClipboardIcon}
          title={{ es: "Para mi médico", en: "For my doctor" }}
          sub={{
            es: "Tu historia, en una hoja",
            en: "Your story, on one page",
          }}
          color="bg-peach text-caution"
        />
      </div>
      {latest ? (
        <div className="dashboard-latest">
          <section className="dashboard-skin-card">
            <div className="dashboard-skin-title">
              <h2>{t({ es: "Tu piel, hoy", en: "Your skin, today" })}</h2>
              <Link href="/piel">
                {t({ es: "Ver análisis", en: "View analysis" })} ↗
              </Link>
            </div>
            <p className="mt-2 text-[9px] text-ink-2">
              {t({
                es: `Última medición · semana ${latest.week}`,
                en: `Latest measurement · week ${latest.week}`,
              })}
              {latest.source === "youcam"
                ? " · YouCam AI"
                : latest.source === "sample"
                  ? t({ es: " · EJEMPLO", en: " · SAMPLE" })
                  : " · DEMO"}
            </p>
            <div className="dashboard-stats">
              <Stat
                label={{ es: "Manchas", en: "Dark spots" }}
                value={latest.scores.age_spot}
                delta={spotDelta}
              />
              <Stat
                label={{ es: "Hidratación", en: "Hydration" }}
                value={latest.scores.moisture}
                delta={
                  prev &&
                  latest.scores.moisture != null &&
                  prev.scores.moisture != null
                    ? latest.scores.moisture - prev.scores.moisture
                    : null
                }
              />
            </div>
            {trend.length > 1 && <Sparkline values={trend} />}
            <p className="mt-4 text-[9px] text-ink-2">
              {t({
                es: "Puntajes: más alto = piel más sana.",
                en: "Scores: higher = healthier skin.",
              })}
            </p>
          </section>
          <section className="dashboard-skin-card">
            <div className="dashboard-skin-title">
              <h2>{t({ es: "Cada zona cuenta", en: "Every zone matters" })}</h2>
              <span className="text-[9px] text-ink-2">
                {t({ es: "Índice local", en: "Local index" })}
              </span>
            </div>
            <ZoneFace values={latest.zones} />
            <p className="text-center text-[9px] text-ink-2">
              {t({
                es: "Pigmentación: más alto = más manchas.",
                en: "Pigmentation: higher = more dark spots.",
              })}
            </p>
          </section>
        </div>
      ) : (
        <section className="empty-skin">
          <div>
            <p className="mini-label">
              {t({ es: "EL PRIMER CAPÍTULO", en: "THE FIRST CHAPTER" })}
            </p>
            <h3>
              {t({
                es: "Todo empieza con una selfie.",
                en: "It all starts with a selfie.",
              })}
            </h3>
            <p>
              {t({
                es: "Tu primera medición es tu punto de partida. La próxima semana tendrás algo más que un recuerdo para comparar.",
                en: "Your first measurement is your starting point. Next week, you'll have more than a memory to compare.",
              })}
            </p>
            <Link href="/piel" className="feature-link">
              {t({ es: "Haz tu primer análisis", en: "Take your first scan" })}
              <ArrowIcon width={15} height={15} />
            </Link>
          </div>
          <ZoneFace />
        </section>
      )}
      {profile.city ? (
        uv && (
          <section className="dashboard-uv dashboard-uv-forecast">
            <span className="dashboard-uv-icon">
              <SunIcon width={25} height={25} />
            </span>
            <div>
              <span className="mini-label">
                {t({ es: "EL SOL EN", en: "SUNSHINE IN" })}{" "}
                {profile.city.name.split(",")[0]}
              </span>
              <h3>
                UV {uv.max} · {t(uvLabel(uv.max))}
              </h3>
              <div className="uv-scale" aria-hidden="true"><span style={{ left: `${Math.max(2,Math.min(98,uv.max/12*100))}%` }} /></div><div className="uv-scale-labels" aria-hidden="true"><span>0</span><span>3</span><span>6</span><span>8</span><span>11+</span></div>
              {reapplyTimes(uv).length > 0 && (
                <p>
                  {t({
                    es: "Reaplica tu protector: ",
                    en: "Reapply your sunscreen: ",
                  })}
                  <b>
                    {reapplyTimes(uv)
                      .map((h) => `${h}:00`)
                      .join(" · ")}
                  </b>
                </p>
              )}
            </div>
          </section>
        )
      ) : (
        <Link href="/empezar" className="dashboard-uv">
          <span className="dashboard-uv-icon">
            <SunIcon />
          </span>
          <div>
            <h3>
              {t({
                es: "El sol también cuenta en tu rutina.",
                en: "Sunshine is part of your routine, too.",
              })}
            </h3>
            <p>
              {t({
                es: "Agrega tu ciudad para ver el índice UV de hoy.",
                en: "Add your city to see today's UV index.",
              })}
            </p>
          </div>
          <ArrowIcon className="ml-auto shrink-0" width={17} height={17} />
        </Link>
      )}
      {!state.pass && (
        <Link href="/pase" className="dashboard-pass">
          <div>
            <p className="mini-label">
              {t({ es: "TU HISTORIA COMPLETA", en: "YOUR COMPLETE STORY" })}
            </p>
            <h3 className="mt-1">
              {t({
                es: "Nueve meses. Un solo pase. $9.99",
                en: "Nine months. One pass. $9.99",
              })}
            </h3>
            <p>
              {t({
                es: "Historial, rutina y resumen para tu médico. Desbloqueo demo sin cobro.",
                en: "History, routine and a doctor summary. Demo unlock with no payment.",
              })}
            </p>
          </div>
          <ArrowIcon width={18} height={18} className="shrink-0" />
        </Link>
      )}
      <Disclaimer />
    </div>
  );
}

function Action({
  href,
  Icon,
  title,
  sub,
  color,
  badge,
}: {
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: L;
  sub: L;
  color: string;
  badge?: boolean;
}) {
  const { t } = useLang();
  return (
    <Link href={href}>
      {badge && <span className="dashboard-action-dot" />}
      <span className={`icon-tile ${color}`}>
        <Icon width={18} height={18} />
      </span>
      <h3>{t(title)}</h3>
      <p>{t(sub)}</p>
    </Link>
  );
}
function Stat({
  label,
  value,
  delta,
}: {
  label: L;
  value?: number;
  delta: number | null;
}) {
  const { t } = useLang();
  return (
    <div className="dashboard-stat">
      <ScoreRing value={value} size={52} />
      <div>
        <p>{t(label)}</p>
        <small
          className={delta != null && delta < 0 ? "text-avoid" : "text-safe"}
        >
          {delta != null && delta !== 0
            ? `${delta > 0 ? "+" : ""}${delta} ${t({ es: "vs. anterior", en: "vs. previous" })}`
            : t({ es: "Tu última medición", en: "Your latest score" })}
        </small>
      </div>
    </div>
  );
}
export default function Page() {
  return (
    <Ready>
      <Today />
    </Ready>
  );
}
