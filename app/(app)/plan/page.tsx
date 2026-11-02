"use client";

import { RoutineIcon, SunIcon, SparkleIcon } from "@/components/icons";
import { Ready } from "@/components/AppGate";
import Link from "next/link";
import { Disclaimer, SectionTitle, VerdictBadge } from "@/components/ui";
import { useLang } from "@/lib/i18n";
import { buildPlan } from "@/lib/plan";
import { useProfile } from "@/lib/useProfile";

function Plan() {
  const { t } = useLang();
  const { state, profile, week } = useProfile();
  const steps = buildPlan(profile, state.scans.at(-1), week);
  const inUse = state.checks.filter((c) => c.inUse);
  const groups = [
    { id: "am", title: { es: "Mañana", en: "Morning" } },
    { id: "pm", title: { es: "Noche", en: "Night" } },
    { id: "body", title: { es: "Cuerpo", en: "Body" } },
  ] as const;

  return (
    <div className="routine-page">
      <SectionTitle
        kicker={t({ es: `Semana ${week}`, en: `Week ${week}` })}
        title={t({ es: "Tu rutina segura", en: "Your safe routine" })}
        sub={t({
          es: "Según lo que te preocupa y lo que mide YouCam. Te decimos qué ingrediente buscar, no qué marca comprar.",
          en: "Based on your concerns and what YouCam measures. We tell you which ingredient to look for, not which brand to buy.",
        })}
      />
      <div className="routine-overview"><SparkleIcon width={21} height={21} /><div><p>{t({ es: "PEQUEÑOS RITUALES, UN DÍA A LA VEZ", en: "SMALL RITUALS, ONE DAY AT A TIME" })}</p><span>{t({ es: "Mañana · Noche · Cuerpo", en: "Morning · Night · Body" })}</span></div></div>
      {state.scans.at(-1) && state.scans.at(-1)!.source !== "youcam" && <p className="routine-sample-label">{t({ es: "EJEMPLO / DEMO · Tu último análisis contiene valores de ejemplo.", en: "SAMPLE / DEMO · Your latest analysis contains sample values." })}</p>}
      <div className="routine-groups">
        {groups.map((g) => (
          <section key={g.id} className={`routine-group routine-${g.id}`}>
            <div className="routine-group-heading">
              <span className="icon-tile">
                {g.id === "am" ? (
                  <SunIcon />
                ) : g.id === "pm" ? (
                  <RoutineIcon />
                ) : (
                  <SparkleIcon />
                )}
              </span>
              <div>
                <p className="mini-label">
                  {g.id === "am"
                    ? "AM"
                    : g.id === "pm"
                      ? "PM"
                      : t({
                          es: "UN POCO MÁS DE CUIDADO",
                          en: "A LITTLE EXTRA CARE",
                        })}
                </p>
                <h2>{t(g.title)}</h2>
              </div>
              <span className="routine-count">
                {steps.filter((s) => s.when === g.id).length}{" "}
                {steps.filter((s) => s.when === g.id).length === 1
                  ? t({ es: "paso", en: "step" })
                  : t({ es: "pasos", en: "steps" })}
              </span>
            </div>
            <ol className="space-y-2">
              {steps
                .filter((s) => s.when === g.id)
                .map((s, i) => (
                  <li key={i} className="routine-step">
                    <span className="routine-step-number">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-semibold">{t(s.title)}</p>
                      <p className="mt-1 text-sm">
                        <span className="text-ink-2">
                          {t({ es: "Busca: ", en: "Look for: " })}
                        </span>
                        {t(s.look)}
                      </p>
                      <p className="mt-1 text-sm text-ink-2">{t(s.why)}</p>
                    </div>
                  </li>
                ))}
            </ol>
          </section>
        ))}
      </div>

      <section className="routine-owned-products mt-6">
        <h2 className="font-display text-xl font-semibold">
          {t({ es: "Lo que usas ahora", en: "What you use now" })}
        </h2>
        {inUse.length === 0 ? (
          <p className="mt-2 text-sm text-ink-2">
            {t({
              es: "Revisa tus productos y márcalos como “Lo uso ahora” para verlos aquí.",
              en: "Check your products and mark them “I use it now” to see them here.",
            })}{" "}
            <Link href="/revisar" className="font-semibold text-brand">
              {t({ es: "Revisar →", en: "Check →" })}
            </Link>
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-line rounded-2xl border border-line bg-surface">
            {inUse.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <span>{c.name}</span>
                <VerdictBadge v={c.verdict} />
              </li>
            ))}
          </ul>
        )}
      </section>
      <Disclaimer />
    </div>
  );
}

export default function Page() {
  return (
    <Ready>
      <Plan />
    </Ready>
  );
}
