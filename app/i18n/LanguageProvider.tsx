"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  isLanguage,
  LANGUAGE_STORAGE_KEY,
  resolveLanguage,
  translate,
  type Language,
} from "./language";

function snapshot(): Language {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    /* Private storage can be unavailable. */
  }
  return resolveLanguage(
    new URL(location.href).searchParams.get("lang"),
    saved,
    navigator.languages?.length ? navigator.languages : [navigator.language],
  );
}
function subscribe(callback: () => void) {
  const events = ["adelvio-language", "storage", "languagechange", "popstate"];
  events.forEach((name) => window.addEventListener(name, callback));
  return () =>
    events.forEach((name) => window.removeEventListener(name, callback));
}
function setLanguage(language: Language) {
  if (!isLanguage(language)) return;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    /* The current URL still preserves the choice. */
  }
  const url = new URL(location.href);
  url.searchParams.set("lang", language);
  history.replaceState(history.state, "", url);
  window.dispatchEvent(new Event("adelvio-language"));
}
const LanguageContext = createContext({
  language: "es" as Language,
  setLanguage,
  t: (source: string, values?: Record<string, string | number>) =>
    translate("es", source, values),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(
    subscribe,
    snapshot,
    () => "es" as Language,
  );
  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (source: string, values?: Record<string, string | number>) =>
        translate(language, source, values),
    }),
    [language],
  );
  useEffect(() => {
    document.documentElement.lang = language;
    const title =
      language === "es"
        ? "Adelvio | Estudio digital independiente en Puerto Rico"
        : "Adelvio | Independent digital studio in Puerto Rico";
    const description =
      language === "es"
        ? "Buen diseño. Grandes posibilidades. Adelvio es un estudio digital independiente en Puerto Rico que crea sitios web y experiencias digitales conectadas."
        : "Good design. Real possibility. Adelvio is an independent digital studio in Puerto Rico, creating thoughtful websites and connected digital experiences.";
    document.title = title;
    for (const selector of [
      'meta[name="description"]',
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
    ])
      document.querySelector(selector)?.setAttribute("content", description);
    for (const selector of [
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
    ])
      document.querySelector(selector)?.setAttribute("content", title);
  }, [language]);
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
export const useLanguage = () => useContext(LanguageContext);
