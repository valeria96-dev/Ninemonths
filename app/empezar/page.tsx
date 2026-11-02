"use client";

import { CheckIcon, SparkleIcon, SunIcon } from "@/components/icons";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/ui";
import { LangToggle, useLang } from "@/lib/i18n";
import { dueDateFromWeek, weekFromDueDate, trimester } from "@/lib/pregnancy";
import { update, type Profile } from "@/lib/store";
import { searchCity } from "@/lib/uv";

const CONCERNS: Array<{
  id: Profile["concerns"][number];
  label: { es: string; en: string };
}> = [
  {
    id: "spots",
    label: { es: "Manchas en la cara", en: "Dark patches on my face" },
  },
  { id: "acne", label: { es: "Acné", en: "Acne" } },
  {
    id: "dryness",
    label: { es: "Piel seca o sensible", en: "Dry or sensitive skin" },
  },
  { id: "stretch", label: { es: "Estrías", en: "Stretch marks" } },
  { id: "itch", label: { es: "Picazón", en: "Itching" } },
];

export default function Onboarding() {
  const { t, lang } = useLang();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"date" | "week">("week");
  const [dueDate, setDueDate] = useState("");
  const [week, setWeek] = useState(20);
  const [concerns, setConcerns] = useState<Profile["concerns"]>([]);
  const [q, setQ] = useState("");
  const [cities, setCities] = useState<Profile["city"][]>([]);
  const [city, setCity] = useState<Profile["city"]>(null);

  const [shownWeek, setShownWeek] = useState<number | null>(null);

  function finish() {
    const finalDue =
      mode === "date" && dueDate ? dueDate : dueDateFromWeek(week);
    update((s) => ({
      ...s,
      profile: {
        dueDate: finalDue,
        concerns,
        city,
        fitzpatrick: s.profile?.fitzpatrick ?? null,
        createdAt: new Date().toISOString(),
      },
    }));
    router.push("/hoy");
  }

  async function find() {
    if (q.trim().length < 2) return;
    setCities(await searchCity(q, lang).catch(() => []));
  }

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 page-in onboarding-wrap">
      <header className="flex items-center justify-between py-4">
        <Logo />
        <LangToggle />
      </header>
      <p className="onboarding-kicker">
        <span className="brand-dot" />
        {t({
          es: `TU HISTORIA EMPIEZA AQUÍ · PASO ${step + 1} DE 3`,
          en: `YOUR STORY STARTS HERE · STEP ${step + 1} OF 3`,
        })}
      </p>
      <div className="mb-6 flex gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-[5px] flex-1 rounded-full transition-colors duration-300"
            style={{ background: i <= step ? "var(--brand)" : "var(--line)" }}
          />
        ))}
      </div>

      {step === 0 && (
        <section className="onboarding-scene">
          <h1 className="title">
            {t({ es: "¿En qué semana estás?", en: "Which week are you in?" })}
          </h1>
          <p className="mt-2 text-ink-2">
            {t({
              es: "Así sabemos qué cambios de piel esperar y qué reglas aplican.",
              en: "So we know which skin changes to expect and which rules apply.",
            })}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-1 rounded-[16px] bg-surface-muted p-[5px]">
            <button
              className={`min-h-10 rounded-[12px] text-[13px] font-bold transition-colors ${mode === "week" ? "bg-brand-deep text-white" : "text-ink-2"}`}
              onClick={() => setMode("week")}
            >
              {t({ es: "Sé mi semana", en: "I know my week" })}
            </button>
            <button
              className={`min-h-10 rounded-[12px] text-[13px] font-bold transition-colors ${mode === "date" ? "bg-brand-deep text-white" : "text-ink-2"}`}
              onClick={() => setMode("date")}
            >
              {t({ es: "Sé mi fecha de parto", en: "I know my due date" })}
            </button>
          </div>
          {mode === "week" ? (
            <div className="week-moment card mt-5 p-5 text-center">
              <div className="week-moment-label"><SparkleIcon width={15} height={15} />{t({ es: `TU EMBARAZO · TRIMESTRE ${trimester(week)}`, en: `YOUR PREGNANCY · TRIMESTER ${trimester(week)}` })}</div>
              <div className="week-orbit" aria-hidden="true"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="85" fill="none" stroke="#e1d5eb" strokeWidth="2" /><circle cx="100" cy="100" r="85" fill="none" stroke="var(--brand)" strokeWidth="3" strokeDasharray={`${Math.min(40,week)/40*534} 534`} strokeLinecap="round" /><circle cx="100" cy="100" r="70" fill="none" stroke="#d9c8e4" strokeDasharray="1 10" /></svg><span className="week-orbit-seed" /></div>
              <p className="week-number font-display text-[64px] font-bold leading-none tracking-[-0.05em] text-brand">
                {week}
              </p>
              <p className="text-sm text-ink-2">
                {t({ es: "semanas", en: "weeks" })}
              </p>
              <p className="week-moment-note">{t({ es: "Cada semana, una nueva forma de conocerte.", en: "A new way to know yourself, every week." })}</p>
              <input
                type="range"
                min={4}
                max={41}
                value={week}
                onChange={(e) => setWeek(Number(e.target.value))}
                className="mt-4 w-full accent-[var(--brand)]"
                aria-label="week"
              />
            </div>
          ) : (
            <div className="mt-5">
              <input
                type="date"
                className="input"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  setShownWeek(
                    e.target.value ? weekFromDueDate(e.target.value) : null,
                  );
                }}
              />
              {shownWeek !== null && (
                <p className="mt-2 text-sm text-ink-2">
                  {t({
                    es: `Estás en la semana ${shownWeek}`,
                    en: `You are in week ${shownWeek}`,
                  })}
                </p>
              )}
            </div>
          )}
          <button
            className="btn btn-primary mt-6 w-full"
            onClick={() => setStep(1)}
            disabled={mode === "date" && !dueDate}
          >
            {t({ es: "Siguiente", en: "Next" })}
          </button>
        </section>
      )}

      {step === 1 && (
        <section className="onboarding-scene">
          <h1 className="title">
            {t({
              es: "¿Qué te preocupa de tu piel?",
              en: "What worries you about your skin?",
            })}
          </h1>
          <p className="mt-2 text-ink-2">
            {t({
              es: "Elige todas las que quieras.",
              en: "Pick as many as you like.",
            })}
          </p>
          <div className="onboarding-concern-note"><span className="brand-dot" />{t({ es: "Tu rutina empieza con lo que tú notas.", en: "Your routine starts with what you notice." })}</div>
          <div className="mt-5 grid gap-2">
            {CONCERNS.map((c) => {
              const on = concerns.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() =>
                    setConcerns(
                      on
                        ? concerns.filter((x) => x !== c.id)
                        : [...concerns, c.id],
                    )
                  }
                  className="choice !grid-cols-[1fr_auto] font-semibold"
                  aria-pressed={on}
                >
                  {t(c.label)}
                  <span className="check">
                    {on && <CheckIcon width={14} height={14} />}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex gap-2">
            <button className="btn btn-ghost" onClick={() => setStep(0)}>
              {t({ es: "Atrás", en: "Back" })}
            </button>
            <button
              className="btn btn-primary flex-1"
              onClick={() => setStep(2)}
            >
              {t({ es: "Siguiente", en: "Next" })}
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="onboarding-scene">
          <h1 className="title">
            {t({ es: "¿Dónde vives?", en: "Where do you live?" })}
          </h1>
          <p className="mt-2 text-ink-2">
            {t({
              es: "El sol es lo que más empeora las manchas del embarazo. Con tu ciudad te avisamos cuándo reaplicar protector.",
              en: "Sun is what worsens pregnancy dark patches most. With your city we tell you when to reapply sunscreen.",
            })}
          </p>
          <div className="onboarding-sun"><SunIcon width={35} height={35} /><span>{t({ es: "El cuidado también depende del lugar.", en: "Care is local, too." })}</span></div>
          <form
            className="mt-5 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              find();
            }}
          >
            <input
              className="input"
              placeholder={t({ es: "Ej. Quito", en: "e.g. Quito" })}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button className="btn btn-ghost" type="submit">
              {t({ es: "Buscar", en: "Search" })}
            </button>
          </form>
          <div className="mt-3 grid gap-2">
            {cities.map((c) => (
              <button
                key={`${c!.lat},${c!.lon}`}
                onClick={() => setCity(c)}
                aria-pressed={city?.lat === c!.lat && city?.lon === c!.lon}
                className="choice !grid-cols-1 text-sm font-semibold"
              >
                {c!.name}
              </button>
            ))}
          </div>
          {city && (
            <p className="mt-3 flex items-center gap-1.5 text-sm font-bold text-brand">
              <CheckIcon width={16} height={16} />
              {city.name}
            </p>
          )}
          <div className="mt-6 flex gap-2">
            <button className="btn btn-ghost" onClick={() => setStep(1)}>
              {t({ es: "Atrás", en: "Back" })}
            </button>
            <button className="btn btn-primary flex-1" onClick={finish}>
              {city
                ? t({ es: "Listo", en: "Done" })
                : t({ es: "Saltar por ahora", en: "Skip for now" })}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
