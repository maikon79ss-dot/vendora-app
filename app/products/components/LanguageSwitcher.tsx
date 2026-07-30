"use client";

import { useState, useEffect } from "react";

export default function LanguageSwitcher() {
  const [language, setLanguage] = useState("bg");

  useEffect(() => {
    const saved = localStorage.getItem("language");

    if (saved) {
      setLanguage(saved);
    }
  }, []);

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);

    // Засега само запазваме езика.
    // По-късно ще обновим целия интерфейс автоматично.
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => changeLanguage("bg")}
        className={`rounded px-3 py-1 ${
          language === "bg"
            ? "bg-blue-600 text-white"
            : "bg-gray-200"
        }`}
      >
        🇧🇬 BG
      </button>

      <button
        onClick={() => changeLanguage("en")}
        className={`rounded px-3 py-1 ${
          language === "en"
            ? "bg-blue-600 text-white"
            : "bg-gray-200"
        }`}
      >
        🇬🇧 EN
      </button>
    </div>
  );
}