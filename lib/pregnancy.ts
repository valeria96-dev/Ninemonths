import type { L } from "@/lib/i18n";

const DAY = 86_400_000;

/** Gestational week from the due date (40 weeks = due date). */
export function weekFromDueDate(dueDate: string, now = new Date()): number {
  const due = new Date(dueDate + "T12:00:00");
  const daysLeft = Math.round((due.getTime() - now.getTime()) / DAY);
  return Math.max(1, Math.min(42, Math.floor(40 - daysLeft / 7)));
}

export function dueDateFromWeek(week: number, now = new Date()): string {
  const due = new Date(now.getTime() + (40 - week) * 7 * DAY);
  // Local calendar date: toISOString() would shift it a day west of UTC.
  return `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, "0")}-${String(due.getDate()).padStart(2, "0")}`;
}

export function trimester(week: number): 1 | 2 | 3 {
  return week <= 13 ? 1 : week <= 27 ? 2 : 3;
}

/** What is normal to expect in the skin at this point, in plain words. */
export function weekNote(week: number): L {
  if (week <= 13)
    return {
      es: "Primer trimestre: las hormonas suben rápido. Es común que aparezca acné o que la piel esté más sensible. Las manchas suelen empezar más adelante, pero el protector solar diario desde ahora es lo que más las previene.",
      en: "First trimester: hormones rise fast. Acne and sensitive skin are common. Dark patches usually start later, but daily sunscreen from now on is what prevents them most.",
    };
  if (week <= 27)
    return {
      es: "Segundo trimestre: es cuando más aparece el melasma (manchas en mejillas, frente y bigote) y la línea oscura del abdomen. Es normal, pero el sol lo empeora mucho: este es el momento de ser constante con el protector.",
      en: "Second trimester: this is when melasma (patches on cheeks, forehead and upper lip) and the dark belly line appear most. It is normal, but sun makes it much worse: now is the time to be consistent with sunscreen.",
    };
  return {
    es: "Tercer trimestre: la piel del abdomen se estira al máximo; aparecen estrías y picazón. La picazón leve es común. La picazón intensa en palmas y plantas no lo es: revisa la sección de síntomas.",
    en: "Third trimester: the belly skin stretches the most; stretch marks and itching appear. Mild itching is common. Intense itching on palms and soles is not: check the symptoms section.",
  };
}
