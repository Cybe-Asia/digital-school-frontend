import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Fraunces, Inter } from "next/font/google";
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

// Parent-app font pairing (2026 redesign).
//   display: Fraunces — a warm optical-sized serif. Gives headings a
//            "parenting-app" softness; the opposite of the dry uniform
//            sans that made the old revamp feel like a spreadsheet.
//   body:    Inter — neutral, legible at 15-16px, pairs cleanly with
//            Fraunces without competing for attention.
// Exposed via CSS custom properties read by globals.css
// (--font-sans-stack / --font-heading-stack).
const bodyFont = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-parent-body",
});

const displayFont = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-parent-display",
  axes: ["SOFT", "opsz"],
});

export const metadata: Metadata = {
  title: "TWSI Digital School Dashboard",
  description: "Role-based dashboard suite for student, parent, and staff portals.",
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
        // Wire the Next/font CSS variables into the globals.css stacks
        // so parent-app surfaces pick up Inter + Fraunces automatically
        // without admin pages (which rely on --ds-* tokens) changing
        // fonts too — they inherit sans-serif via the same stack.
        // @ts-expect-error - custom properties
        "--font-sans-stack": `var(--font-parent-body), "Inter", "Segoe UI", sans-serif`,
        "--font-heading-stack": `var(--font-parent-display), "Fraunces", Georgia, serif`,
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
