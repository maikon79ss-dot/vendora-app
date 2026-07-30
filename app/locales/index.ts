import bg from "./bg";
import en from "./en";

export const translations = {
  bg,
  en,
};

export type Language = keyof typeof translations;