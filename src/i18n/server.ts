import { cookies } from "next/headers";
import { translate, type TemplateValues } from "@/i18n/core";
import { DEFAULT_LANGUAGE, LANGUAGE_COOKIE_NAME, parseLanguage, type LanguageCode } from "@/shared/lib/ui-preferences";

export async function getServerLanguage(): Promise<LanguageCode> {
  const cookieStore = await cookies();
  return parseLanguage(cookieStore.get(LANGUAGE_COOKIE_NAME)?.value) ?? DEFAULT_LANGUAGE;
}

export async function getServerI18n() {
  const language = await getServerLanguage();

  return {
    language,
    t: (text: string, values?: TemplateValues) => translate(text, language, values),
  };
}
