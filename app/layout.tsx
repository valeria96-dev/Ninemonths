import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { LangProvider } from "@/lib/i18n";
import "./globals.css";
import "./refresh.css";
import "./video-polish.css";

// One family throughout, like getclearapp.com: DM Sans, bold and tight for
// headlines (with italic for the accent words), regular for reading.
const display = DM_Sans({ variable: "--font-display", subsets: ["latin"], weight: ["400", "500", "700"], style: ["normal", "italic"] });
const body = DM_Sans({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "700"] });

export const metadata: Metadata = {
  title: "Ninemonths — Track your pregnancy skin, week by week",
  description:
    "One guided selfie a week: YouCam AI measures melasma zone by zone. Plus pregnancy-safe product checks and symptom triage for your doctor.",
};

export const viewport: Viewport = {
  themeColor: "#f7f5fa",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* Palette preview: /variantes stores a choice; apply it before paint. */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("nm.theme");if(t)document.documentElement.dataset.theme=t}catch(e){}` }} />
      </head>
      <body className="min-h-full flex flex-col">
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
