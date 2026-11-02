import type { L } from "@/lib/i18n";
import type { SourceId } from "@/lib/ingredients/data";

// The symptom check never diagnoses. It sorts what she describes into four
// levels of "what to do next", with the cholestasis red flag first because
// it is the one skin symptom that can matter for the baby.

export type Level = 0 | 1 | 2 | 3;

export const LEVELS: Record<Level, { title: L; body: L; tone: "safe" | "caution" | "avoid" }> = {
  0: {
    title: { es: "Es común en el embarazo", en: "Common in pregnancy" },
    body: { es: "Lo que describes es un cambio normal de la piel en el embarazo. Si te molesta, coméntalo en tu próximo control.", en: "What you describe is a normal pregnancy skin change. If it bothers you, mention it at your next check-up." },
    tone: "safe",
  },
  1: {
    title: { es: "Coméntalo en tu próximo control", en: "Mention it at your next check-up" },
    body: { es: "No parece urgente, pero vale la pena que tu médico lo vea. Lo agregamos a tu resumen para la consulta.", en: "It does not look urgent, but your doctor should see it. We added it to your visit summary." },
    tone: "caution",
  },
  2: {
    title: { es: "Consulta pronto (hoy o mañana)", en: "See your doctor soon (today or tomorrow)" },
    body: { es: "Esto necesita que un médico lo revise en los próximos 1–2 días. Llama a tu ginecólogo o a tu centro de salud.", en: "This needs a doctor within the next 1–2 days. Call your obstetrician or clinic." },
    tone: "avoid",
  },
  3: {
    title: { es: "Busca atención ahora", en: "Get care now" },
    body: { es: "Ve a emergencias o llama a tu médico ahora mismo.", en: "Go to the emergency room or call your doctor right now." },
    tone: "avoid",
  },
};

export type Symptom = { id: string; label: L; level: Level; note: L; sources?: SourceId[] };

export const SYMPTOMS: Symptom[] = [
  {
    id: "palm-itch",
    label: { es: "Picazón intensa en palmas de las manos o plantas de los pies, peor de noche", en: "Intense itching on palms or soles, worse at night" },
    level: 2,
    note: {
      es: "Puede ser colestasis del embarazo, un problema del hígado que se confirma con un análisis de sangre (ácidos biliares). Pide ese análisis por nombre.",
      en: "This can be intrahepatic cholestasis of pregnancy, a liver condition confirmed with a blood test (bile acids). Ask for that test by name.",
    },
    sources: ["rcog"],
  },
  {
    id: "yellow",
    label: { es: "Piel u ojos amarillos, orina oscura", en: "Yellow skin or eyes, dark urine" },
    level: 3,
    note: { es: "Puede indicar un problema del hígado que necesita atención inmediata.", en: "This can signal a liver problem that needs immediate care." },
  },
  {
    id: "fewer-movements",
    label: { es: "El bebé se mueve menos de lo normal", en: "The baby is moving less than usual" },
    level: 3,
    note: { es: "Siempre es motivo de consulta inmediata, con o sin síntomas en la piel.", en: "Always a reason for immediate care, with or without skin symptoms." },
  },
  {
    id: "blisters",
    label: { es: "Ampollas que empiezan alrededor del ombligo y se extienden", en: "Blisters starting around the belly button and spreading" },
    level: 2,
    note: { es: "Puede ser penfigoide gestacional, poco frecuente, que necesita un dermatólogo.", en: "This can be pemphigoid gestationis, rare, and needs a dermatologist." },
    sources: ["acog"],
  },
  {
    id: "rash-fever",
    label: { es: "Sarpullido con fiebre o malestar general", en: "Rash with fever or feeling unwell" },
    level: 2,
    note: { es: "Algunas infecciones con sarpullido importan en el embarazo; un médico debe verlo.", en: "Some infections with a rash matter in pregnancy; a doctor should see it." },
  },
  {
    id: "stretch-rash",
    label: { es: "Ronchas rojas que pican sobre las estrías del abdomen (tercer trimestre)", en: "Itchy red bumps over belly stretch marks (third trimester)" },
    level: 1,
    note: {
      es: "Suele ser la erupción polimorfa del embarazo (PUPPP): molesta pero no daña al bebé. Tu médico puede darte algo para la picazón.",
      en: "Often polymorphic eruption of pregnancy (PUPPP): uncomfortable but harmless to the baby. Your doctor can treat the itch.",
    },
    sources: ["acog"],
  },
  {
    id: "mole-change",
    label: { es: "Un lunar que cambió de forma, color o sangra", en: "A mole that changed shape or colour, or bleeds" },
    level: 1,
    note: { es: "Los lunares pueden oscurecerse en el embarazo, pero un cambio de forma debe verlo un dermatólogo.", en: "Moles can darken in pregnancy, but a shape change should be seen by a dermatologist." },
  },
  {
    id: "face-patches",
    label: { es: "Manchas oscuras en mejillas, frente o bigote", en: "Dark patches on cheeks, forehead or upper lip" },
    level: 0,
    note: { es: "Es melasma, muy común. El protector solar diario es lo que más ayuda.", en: "This is melasma, very common. Daily sunscreen helps most." },
    sources: ["acog"],
  },
  {
    id: "dark-line",
    label: { es: "Línea oscura en el centro del abdomen", en: "Dark line down the middle of the belly" },
    level: 0,
    note: { es: "Es la línea negra; suele aclararse sola después del parto.", en: "This is the linea nigra; it usually fades after birth." },
    sources: ["acog"],
  },
  {
    id: "acne",
    label: { es: "Acné o granitos nuevos", en: "New acne or breakouts" },
    level: 0,
    note: { es: "Es frecuente por las hormonas. Revisa que tus productos para acné sean seguros.", en: "Common because of hormones. Check that your acne products are safe." },
    sources: ["aad"],
  },
  {
    id: "stretch-marks",
    label: { es: "Estrías nuevas", en: "New stretch marks" },
    level: 0,
    note: { es: "Son muy comunes y dependen sobre todo de la genética. Ninguna crema ha demostrado prevenirlas.", en: "Very common and mostly genetic. No cream has been shown to prevent them." },
    sources: ["cochrane"],
  },
  {
    id: "belly-itch",
    label: { es: "Picazón leve en el abdomen que crece", en: "Mild itching on the growing belly" },
    level: 0,
    note: { es: "Es por la piel estirada y seca; una crema hidratante simple ayuda.", en: "It comes from stretched, dry skin; a simple moisturiser helps." },
  },
  {
    id: "spider-veins",
    label: { es: "Arañitas rojas en la piel o palmas enrojecidas", en: "Small red spider veins or red palms" },
    level: 0,
    note: { es: "Se deben al aumento de estrógenos y del volumen de sangre; suelen desaparecer después del parto.", en: "Caused by higher estrogen and blood volume; they usually fade after birth." },
    sources: ["acog"],
  },
];

export function levelFor(ids: string[]): Level {
  return ids.reduce<Level>((max, id) => Math.max(max, SYMPTOMS.find((s) => s.id === id)?.level ?? 0) as Level, 0);
}
