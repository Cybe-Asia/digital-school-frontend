import { QueryProvider } from "@/components/query-provider";
import { LanguageProvider } from "@/components/language-provider";
import { ThemeProvider } from "@/components/theme-provider";
import GlobalPreferenceBar from "@/components/global-preference-bar";
import type { ThemeId } from "@/components/theme-provider";
import type { LanguageCode } from "@/components/language-provider";
import type { ReactNode } from "react";

type ProvidersProps = {
  children: ReactNode;
  initialLanguage: LanguageCode;
  initialThemeId: ThemeId;
};

export default function Providers({ children, initialLanguage, initialThemeId }: ProvidersProps) {
  return (
    <LanguageProvider key={initialLanguage} initialLanguage={initialLanguage}>
      <ThemeProvider key={initialThemeId} initialThemeId={initialThemeId}>
        <QueryProvider>
          <GlobalPreferenceBar />
          {children}
        </QueryProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
