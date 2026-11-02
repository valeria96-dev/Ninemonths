"use client";

import { CheckIcon, ShieldIcon } from "@/components/icons";
import { Ready } from "@/components/AppGate";
import { useRouter } from "next/navigation";
import { SectionTitle } from "@/components/ui";
import { useLang } from "@/lib/i18n";
import { update } from "@/lib/store";
import { useProfile } from "@/lib/useProfile";

function Pass() {
  const { t } = useLang();
  const { state } = useProfile();
  const router = useRouter();

  if (state.pass)
    return (
      <SectionTitle title={t({ es: "Tu pase está activo", en: "Your pass is active" })} sub={t({ es: "Todo desbloqueado hasta el parto. Gracias por apoyarnos.", en: "Everything unlocked until birth. Thank you for supporting us." })} />
    );

  return (
    <div>
      <SectionTitle
        kicker={t({ es: "Pase de embarazo", en: "Pregnancy pass" })}
        title={t({ es: "Cuesta menos que una crema equivocada", en: "It costs less than one wrong cream" })}
        sub={t({ es: "Un solo pago de $9.99 cubre todo tu embarazo. Sin suscripción.", en: "One $9.99 payment covers your whole pregnancy. No subscription." })}
      />
      <ul className="card spectral space-y-3.5 p-6 text-[14.5px]">
        {[
          { es: "Revisa todos los productos que quieras: los tuyos, los que te regalan, los de la farmacia", en: "Check every product you want: yours, gifts, the pharmacy's" },
          { es: "Selfie semanal con YouCam y tu mapa de zonas del melasma", en: "Weekly YouCam selfie and your melasma zone map" },
          { es: "Rutina segura que se ajusta a tu piel y a tu semana", en: "Safe routine that adapts to your skin and your week" },
          { es: "Resumen de una hoja para llevar a cada control", en: "One-page summary to bring to every check-up" },
        ].map((x) => (
          <li key={x.es} className="flex gap-2">
            <CheckIcon width={18} height={18} className="mt-0.5 flex-none text-brand" />
            {t(x)}
          </li>
        ))}
        <li className="flex gap-2 text-ink-2">
          <ShieldIcon width={18} height={18} className="mt-0.5 flex-none" />
          {t({ es: "La revisión de síntomas es gratis siempre, con o sin pase.", en: "The symptom check is always free, with or without the pass." })}
        </li>
      </ul>
      <button
        className="btn btn-primary mt-5 w-full"
        onClick={() => {
          update((s) => ({ ...s, pass: true }));
          router.push("/hoy");
        }}
      >
        {t({ es: "Desbloquear el pase", en: "Unlock the pass" })}
      </button>
      <p className="mt-2 text-center text-xs text-ink-2">{t({ es: "Versión de demostración: no se realiza ningún cobro.", en: "Demo build: no payment is taken." })}</p>
    </div>
  );
}

export default function Page() {
  return (
    <Ready>
      <Pass />
    </Ready>
  );
}
