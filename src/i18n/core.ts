import type { LanguageCode } from "@/shared/lib/ui-preferences";
import en from "@/i18n/translations/en.json";
import id from "@/i18n/translations/id.json";

type TranslationMap = Record<string, string>;
export type TemplateValues = Record<string, string | number>;

const dictionaries: Record<LanguageCode, TranslationMap> = {
  en,
  id,
};

function interpolate(template: string, values?: TemplateValues): string {
  if (!values) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = values[key];
    return value === undefined ? match : String(value);
  });
}

export function translate(text: string, language: LanguageCode, values?: TemplateValues): string {
  const dictionary = dictionaries[language];
  const fallbackDictionary = dictionaries.en;
  const template = dictionary[text] ?? fallbackDictionary[text] ?? text;

  return interpolate(template, values);
}
