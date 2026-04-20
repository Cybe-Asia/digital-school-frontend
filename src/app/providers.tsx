import { QueryProvider } from "@/components/query-provider";
import { LanguageProvider } from "@/components/language-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { FeatureFlagsProvider } from "@/components/feature-flags-provider";
import GlobalPreferenceBar from "@/components/global-preference-bar";
import type { ThemeId } from "@/components/theme-provider";
import type { LanguageCode } from "@/components/language-provider";
import type { UnleashRuntimeConfig } from "@/shared/feature-flags/runtime-config";
import type { ReactNode } from "react";

type ProvidersProps = {
  children: ReactNode;
  initialLanguage: LanguageCode;
  initialThemeId: ThemeId;
  featureFlagsConfig: UnleashRuntimeConfig;
};

export default function Providers({
  children,
  initialLanguage,
  initialThemeId,
  featureFlagsConfig,
}: ProvidersProps) {
  return (
    <LanguageProvider key={initialLanguage} initialLanguage={initialLanguage}>
      <ThemeProvider key={initialThemeId} initialThemeId={initialThemeId}>
        <QueryProvider>
          <FeatureFlagsProvider config={featureFlagsConfig}>
            <GlobalPreferenceBar />
            {children}
          </FeatureFlagsProvider>
        </QueryProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
