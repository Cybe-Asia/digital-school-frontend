import type { Metadata } from "next";
import { cookies } from "next/headers";
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
    <html lang={initialLanguage} data-theme={initialThemeId} suppressHydrationWarning>
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
