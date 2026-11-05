import { useState, useCallback } from "react";

const KEY = "dw-language";
const SUPPORTED = ["th", "en", "zh", "ru"];

export default function useLanguage() {
  const [language, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY);
      return SUPPORTED.includes(saved) ? saved : "th";
    } catch {
      return "th";
    }
  });

  const setLanguage = useCallback((code) => {
    setLang(code);
    try {
      localStorage.setItem(KEY, code);
    } catch {
      /* ignore */
    }
  }, []);

  return [language, setLanguage];
}
