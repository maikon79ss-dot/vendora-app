import { translations, Language } from "@/app/locales";

export const DEFAULT_LANGUAGE: Language = "bg";

export function getTranslations(language: Language = DEFAULT_LANGUAGE) {
  return translations[language];
}