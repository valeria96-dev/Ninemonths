"use client";
import { CameraIcon } from "@/components/icons";
import { useLang } from "@/lib/i18n";
export function LabelScan({ src, reading, progress, sample }: { src: string; reading: boolean; progress: number; sample: boolean }) {
 const { t } = useLang();
 const pct = Math.round(progress * 100);
 return <figure className={`label-photo-preview ${reading ? "is-reading" : ""}`}>
   <div className="label-photo-topline"><span><CameraIcon width={13} height={13} />{t({ es: "DE LA ETIQUETA A LA CLARIDAD", en: "FROM LABEL TO CLARITY" })}</span>{sample && <span>{t({ es: "EJEMPLO", en: "SAMPLE" })}</span>}</div>
   <div className="label-photo-image">
     {/* eslint-disable-next-line @next/next/no-img-element */}
     <img src={src} alt={t({ es: "Foto de la lista de ingredientes", en: "Photo of the ingredient list" })} />
     <span className="label-corner corner-tl" /><span className="label-corner corner-tr" /><span className="label-corner corner-bl" /><span className="label-corner corner-br" />
     {reading && <div className="label-scan-line" aria-hidden="true" />}
   </div>
   <figcaption><span role="status">{reading ? t({ es: "Leyendo tu lista de ingredientes…", en: "Reading your ingredient list…" }) : t({ es: "Tu foto, para contrastar el texto", en: "Your photo, to check against the text" })}</span>{reading && progress > 0 && <b>{pct}%</b>}</figcaption>
   {reading && <div className="label-ocr-progress" role="progressbar" aria-valuenow={progress > 0 ? pct : undefined} aria-valuemin={0} aria-valuemax={100} aria-label={t({ es: "Leyendo ingredientes", en: "Reading ingredients" })}><span style={progress > 0 ? {width:`${pct}%`} : undefined} /></div>}
 </figure>;
}
