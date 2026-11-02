"use client";

import { Ready } from "@/components/AppGate";
import Link from "next/link";
import { useLang, type L } from "@/lib/i18n";
import { ENTRIES } from "@/lib/ingredients/data";
import { LEVELS, SYMPTOMS } from "@/lib/symptoms";
import { CONCERN_LABEL, CONCERNS, ZONE_LABEL, ZONES } from "@/lib/skin/types";
import { useProfile } from "@/lib/useProfile";

const VERDICT: Record<string, L> = {
  safe: { es: "Sin riesgo conocido", en: "No known risk" },
  caution: { es: "Con cuidado", en: "Use with care" },
  avoid: { es: "Evitar", en: "Avoid" },
  unknown: { es: "Sin datos", en: "No data" },
};

function Summary() {
  const { t, lang } = useLang();
  const { state, profile, week } = useProfile();
  const first = state.scans[0];
  const latest = state.scans.at(-1);
  const inUse = state.checks.filter((c) => c.inUse);
  const flagged = state.checks.filter((c) => c.verdict === "avoid" || c.verdict === "caution");
  const symptoms = [...state.symptoms].reverse().slice(0, 8);
  const entryName = (id: string) => {
    const e = ENTRIES.find((x) => x.id === id);
    return e ? t(e.name) : id;
  };

  const questions: L[] = [];
  inUse.filter((c) => c.verdict !== "safe").forEach((c) => questions.push({ es: `Uso “${c.name}”. ¿Lo dejo o lo cambio por otro?`, en: `I use “${c.name}”. Should I stop or switch it?` }));
  if (state.symptoms.some((s) => s.symptomIds.includes("palm-itch"))) questions.push({ es: "Tengo picazón en palmas y plantas. ¿Me puede pedir ácidos biliares y pruebas de hígado?", en: "I have itchy palms and soles. Can you order bile acids and liver tests?" });
  if (first && latest && first !== latest && (latest.scores.age_spot ?? 0) < (first.scores.age_spot ?? 0) - 4)
    questions.push({ es: "Mis manchas están aumentando. ¿Qué tratamiento seguro para el melasma me recomienda?", en: "My dark patches are increasing. Which safe melasma treatment do you recommend?" });

  if (!state.pass)
    return (
      <div className="card p-5">
        <p className="font-display text-2xl font-semibold">{t({ es: "Resumen para tu médico", en: "Summary for your doctor" })}</p>
        <p className="mt-2 text-sm text-ink-2">
          {t({ es: "Una hoja con tus productos, síntomas y la evolución de tu piel, con las preguntas que conviene hacer. Lista para mostrar o imprimir en tu control.", en: "One page with your products, symptoms and skin progress, plus the questions worth asking. Ready to show or print at your check-up." })}
        </p>
        <Link href="/pase" className="btn btn-primary mt-4">
          {t({ es: "Incluido en el pase · $9.99", en: "Included in the pass · $9.99" })}
        </Link>
      </div>
    );

  return (
    <div className="summary-workspace">
      <div className="summary-toolbar no-print"><div><p className="eyebrow">{t({ es: "PARA TU PRÓXIMA CONSULTA", en: "FOR YOUR NEXT APPOINTMENT" })}</p><p>{t({ es: "Tu historia, lista para compartir.", en: "Your story, ready to share." })}</p></div><button className="btn btn-ghost text-sm" onClick={() => window.print()}>{t({ es: "Imprimir", en: "Print" })} ↗</button></div>
      <article className="doctor-summary text-sm">
        <header className="summary-letterhead"><div><p className="summary-brand">Ninemonths</p><span>{t({ es: "REGISTRO PERSONAL DE LA PIEL", en: "PERSONAL SKIN RECORD" })}</span></div><span className="summary-document-mark" aria-hidden="true">09</span></header>
        <h1>{t({ es: "Resumen de piel para la consulta", en: "Skin summary for the visit" })}</h1>
        <dl className="summary-metadata"><div><dt>{t({ es: "SEMANA", en: "WEEK" })}</dt><dd>{week}</dd></div><div><dt>{t({ es: "FECHA PROBABLE DE PARTO", en: "DUE DATE" })}</dt><dd>{profile.dueDate}</dd></div><div><dt>{t({ es: "PREPARADO EL", en: "PREPARED ON" })}</dt><dd>{new Date().toLocaleDateString(lang)}</dd></div></dl>
        {state.scans.some(s=>s.source!=="youcam") && <p className="summary-source-note">{t({ es: "EJEMPLO / DEMO · Este registro incluye valores de ejemplo, no mediciones reales de YouCam.", en: "SAMPLE / DEMO · This record includes sample values, not real YouCam measurements." })}</p>}
        <div className="summary-document-sections">
          {questions.length > 0 && <section className="summary-questions"><h2><span>01</span>{t({ es: "Preguntas para hoy", en: "Questions for today" })}</h2><ol>{questions.map((q,i)=><li key={i}>{t(q)}</li>)}</ol></section>}
          <section className="summary-products"><h2><span>02</span>{t({ es: "Productos que usa", en: "Products in use" })}</h2>
            {inUse.length===0 ? <p>{t({ es: "Ninguno registrado.", en: "None recorded." })}</p> : <table><thead><tr><th scope="col">{t({ es: "Producto", en: "Product" })}</th><th scope="col">{t({ es: "Revisión", en: "Review" })}</th><th scope="col">{t({ es: "Ingredientes señalados", en: "Flagged ingredients" })}</th></tr></thead><tbody>{inUse.map(c=><tr key={c.id}><td>{c.name}</td><td><b>{t(VERDICT[c.verdict])}</b></td><td>{c.flagged.map(entryName).join(", ") || "—"}</td></tr>)}</tbody></table>}
            {flagged.filter(c=>!c.inUse).length>0 && <p className="summary-discarded"><b>{t({ es: "Revisados y descartados: ", en: "Checked and set aside: " })}</b>{flagged.filter(c=>!c.inUse).map(c=>c.name).join(", ")}</p>}
          </section>
          <section className="summary-symptoms"><h2><span>03</span>{t({ es: "Síntomas registrados", en: "Recorded symptoms" })}</h2>
            {symptoms.length===0 ? <p>{t({ es: "Ninguno.", en: "None." })}</p> : <ul>{symptoms.map(s=><li key={s.id}><b>{t({ es: `Semana ${s.week}`, en: `Week ${s.week}` })}:</b> {s.symptomIds.map(id=>t(SYMPTOMS.find(x=>x.id===id)!.label)).join("; ")} — <i>{t(LEVELS[s.level as 0].title)}</i></li>)}</ul>}
          </section>
          {latest && <section className="summary-skin"><h2><span>04</span>{t({ es: "Evolución de la piel", en: "Skin progress" })}</h2><p className="summary-measurement-note">{latest.source==="youcam" ? t({ es: "YouCam AI · 1–100, más alto = más sana", en: "YouCam AI · 1–100, higher = healthier" }) : t({ es: "Valores de ejemplo · 1–100, más alto = más sana", en: "Sample values · 1–100, higher = healthier" })}</p>
            <div className="summary-measurement-grid"><div><table><thead><tr><th scope="col">{t({ es: "Indicador", en: "Concern" })}</th>{first!==latest && <th scope="col">{t({ es: `Semana ${first.week}`, en: `Week ${first.week}` })}{first.source!=="youcam" && <small>{t({ es: "Ejemplo", en: "Sample" })}</small>}</th>}<th scope="col">{t({ es: `Semana ${latest.week}`, en: `Week ${latest.week}` })}{latest.source!=="youcam" && <small>{t({ es: "Ejemplo", en: "Sample" })}</small>}</th></tr></thead><tbody>{CONCERNS.map(c=><tr key={c}><td>{t(CONCERN_LABEL[c])}</td>{first!==latest && <td>{first.scores[c]??"—"}</td>}<td>{latest.scores[c]??"—"}</td></tr>)}</tbody></table></div>
            {ZONES.some(z=>latest.zones[z]!=null) && <div><h3>{t({ es: "Mapa local por zona", en: "Local zone map" })}</h3><p className="summary-measurement-note">{t({ es: "Índice local de pigmentación", en: "Local pigmentation index" })}</p><table><thead><tr><th scope="col">{t({ es: "Zona", en: "Zone" })}</th>{first!==latest && <th scope="col">{t({ es: `S${first.week}`, en: `W${first.week}` })}</th>}<th scope="col">{t({ es: `S${latest.week}`, en: `W${latest.week}` })}</th></tr></thead><tbody>{ZONES.map(z=><tr key={z}><td>{t(ZONE_LABEL[z])}</td>{first!==latest && <td>{first.zones[z]??"—"}</td>}<td>{latest.zones[z]??"—"}{first!==latest && latest.zones[z]!=null && first.zones[z]!=null && latest.zones[z]!-first.zones[z]!>=10 && <b className="ml-1.5 text-avoid">↑ {latest.zones[z]!-first.zones[z]!}</b>}</td></tr>)}</tbody></table></div>}</div>
            {profile.fitzpatrick && <p className="summary-phototype">{t({ es: "Fototipo Fitzpatrick:", en: "Fitzpatrick phototype:" })} <b>{profile.fitzpatrick}</b></p>}
            {latest.source!=="youcam" && <p className="summary-measurement-note">{t({ es: "Valores de ejemplo.", en: "Sample values." })}</p>}
          </section>}
        </div>
        <footer className="summary-footer">{t({ es: "Generado por la paciente con Ninemonths. No es un diagnóstico.", en: "Generated by the patient with Ninemonths. Not a diagnosis." })}</footer>
      </article>
    </div>
  );
}

export default function Page() {
  return (
    <Ready>
      <Summary />
    </Ready>
  );
}
