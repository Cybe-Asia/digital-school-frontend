import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Cinzel, Montserrat } from "next/font/google";
import Providers from "@/app/providers";
import type { ThemeId } from "@/components/theme-provider";
import type { LanguageCode } from "@/components/language-provider";
import {
  DEFAULT_LANGUAGE,
  DEFAULT_THEME_ID,
  LANGUAGE_COOKIE_NAME,
  THEME_COOKIE_NAME,
  parseLanguage,
  parseThemeId,
} from "@/shared/lib/ui-preferences";
import { resolveUnleashConfig } from "@/shared/feature-flags/runtime-config";
import "./globals.css";

// TWSI typography system (per brand guidelines):
//   Cinzel    — the TWSI wordmark ONLY (logo). A classical Roman
//               serif; too stately for body or headings.
//   Montserrat — literally everything else. Bold for titles,
//               Semi-Bold for sub-headings, Regular for body.
// Exposed via CSS custom properties read by globals.css
// (--font-sans-stack / --font-heading-stack / --font-display-stack).
const bodyFont = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-parent-body",
  weight: ["400", "500", "600", "700"],
});

// Cinzel is reserved for the logo wordmark. Kept in the subset list
// so the fonts payload is small; only the `TWSI` logo component
// actually applies this stack.
const displayFont = Cinzel({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-parent-display",
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "TWSI · The World Scholars Institute",
  description: "Admissions and student portal for The World Scholars Institute.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialLanguage = (parseLanguage(cookieStore.get(LANGUAGE_COOKIE_NAME)?.value) ?? DEFAULT_LANGUAGE) as LanguageCode;
  const initialThemeId = (parseThemeId(cookieStore.get(THEME_COOKIE_NAME)?.value) ?? DEFAULT_THEME_ID) as ThemeId;

  // Resolve feature-flag runtime config on the server. This reads
  // k8s-injected env vars (UNLEASH_URL, UNLEASH_FRONTEND_TOKEN,
  // UNLEASH_ENVIRONMENT) so the same image can point at different
  // Unleash environments per deploy target.
  const featureFlagsConfig = resolveUnleashConfig();

  return (
    <html
      lang={initialLanguage}
      data-theme={initialThemeId}
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable}`}
      style={{
        // Wire the Next/font CSS variables into the globals.css stacks.
        // Per TWSI guidelines, Montserrat is the universal face for both
        // body and headings; Cinzel is reserved for the logo wordmark
        // and only applied to `--font-display-stack` (consumed by the
        // `<TwsiLogo>` component — not the rest of the UI).
        // @ts-expect-error - custom properties
        "--font-sans-stack": `var(--font-parent-body), "Montserrat", "Segoe UI", sans-serif`,
        "--font-heading-stack": `var(--font-parent-body), "Montserrat", "Segoe UI", sans-serif`,
        "--font-display-stack": `var(--font-parent-display), "Cinzel", "Palatino Linotype", Georgia, serif`,
      }}
    >
      <body className="antialiased">
        <Providers
          initialLanguage={initialLanguage}
          initialThemeId={initialThemeId}
          featureFlagsConfig={featureFlagsConfig}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}
