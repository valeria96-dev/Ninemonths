"use client";

import Link from "next/link";
import { AlertIcon, ArrowIcon, CheckIcon, ClipboardIcon, PulseIcon } from "@/components/icons";
import { Ready } from "@/components/AppGate";
import { useState } from "react";
import { Disclaimer, SectionTitle } from "@/components/ui";
import { useLang } from "@/lib/i18n";
import { SOURCES } from "@/lib/ingredients/data";
import { LEVELS, levelFor, SYMPTOMS } from "@/lib/symptoms";
import { uid, update } from "@/lib/store";
import { useProfile } from "@/lib/useProfile";

const TONE = { safe: "bg-safe-tint text-safe", caution: "bg-caution-tint text-caution", avoid: "bg-avoid-tint text-avoid" };

function Symptoms() {
  const { t } = useLang();
  const { week } = useProfile();
  // A judge preset (/demo) can open this page with symptoms pre-ticked.
  const [picked, setPicked] = useState<string[]>(() => {
    try {
      const v = sessionStorage.getItem("nm.preset.symptoms");
      if (v) {
        sessionStorage.removeItem("nm.preset.symptoms");
        return JSON.parse(v) as string[];
      }
    } catch {}
    return [];
  });
  const [done, setDone] = useState(false);
  const level = levelFor(picked);
  const L = LEVELS[level];

  function submit() {
    setDone(true);
    update((s) => ({ ...s, symptoms: [...s.symptoms, { id: uid(), date: new Date().toISOString(), week, symptomIds: picked, level }] }));
    setTimeout(() => document.getElementById("answer")?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  return (
    <div>
      <SectionTitle
        kicker={t({ es: "Siempre gratis", en: "Always free" })}
        title={t({ es: "¿Esto es normal?", en: "Is this normal?" })}
        sub={t({ es: "Marca lo que notas en tu piel. Te decimos qué es común y qué necesita a tu médico.", en: "Tick what you notice on your skin. We tell you what's common and what needs your doctor." })}
      />
      <div className="symptom-choices grid gap-2">
        {SYMPTOMS.map((s) => {
          const on = picked.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => {
                setDone(false);
                setPicked(on ? picked.filter((x) => x !== s.id) : [...picked, s.id]);
              }}
              aria-pressed={on}
              className="choice !grid-cols-[1fr_auto] text-[13.5px] font-medium"
            >
              {t(s.label)}
              <span className="check">{on && <CheckIcon width={14} height={14} />}</span>
            </button>
          );
        })}
      </div>
      <button className="btn btn-primary mt-4 w-full" disabled={picked.length === 0} onClick={submit}>
        {t({ es: "Ver qué hacer", en: "See what to do" })}
      </button>

      {done && (
        <section id="answer" className="symptom-answer mt-6 space-y-3" aria-live="polite">
          <div className={`symptom-decision rounded-2xl p-4 ${TONE[L.tone]}`} data-level={level}>
            <div className="symptom-decision-top"><span className="symptom-decision-icon">{level >= 2 ? <AlertIcon width={25} height={25} /> : <PulseIcon width={25} height={25} />}</span><span>{t({ es: "TU SIGUIENTE PASO", en: "YOUR NEXT STEP" })}</span></div>
            <p className="font-display text-2xl font-semibold">{t(L.title)}</p>
            <p className="mt-3 text-sm text-ink">{t(L.body)}</p>
            <div className="symptom-decision-foot"><CheckIcon width={13} height={13} />{t({ es: "Añadido a tus notas para la consulta", en: "Added to your notes for the visit" })}</div>
          </div>
          {SYMPTOMS.filter((s) => picked.includes(s.id))
            .sort((a, b) => b.level - a.level)
            .map((s) => (
              <div key={s.id} className="symptom-explanation card p-4 text-sm">
                <p className="font-semibold">{t(s.label)}</p>
                <p className="mt-1 leading-relaxed">{t(s.note)}</p>
                {s.sources && (
                  <p className="mt-2 text-[11px] text-ink-2">
                    {s.sources.map((src) => (
                      <a key={src} href={SOURCES[src].url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                        {SOURCES[src].label}
                      </a>
                    ))}
                  </p>
                )}
              </div>
            ))}
          <Link href="/resumen" className="symptom-summary-link"><ClipboardIcon width={19} height={19} /><span>{t({ es: "Tu registro para el médico", en: "Your record for your doctor" })}<small>{t({ es: "Síntomas, productos y cambios en un lugar", en: "Symptoms, products and changes in one place" })}</small></span><ArrowIcon width={16} height={16} /></Link>
        </section>
      )}
      <Disclaimer />
    </div>
  );
}

export default function Page() {
  return (
    <Ready>
      <Symptoms />
    </Ready>
  );
}
