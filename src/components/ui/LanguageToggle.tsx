// src/components/ui/LanguageToggle.tsx
"use client"

import { useLanguage } from "@/context/LanguageContext";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { language, setLanguage } = useLanguage();
  const isHindi = language === "hi";

  return (
    <button
      type="button"
      onClick={() => setLanguage(isHindi ? "en" : "hi")}
      aria-label="Toggle language between Hindi and English"
      title={isHindi ? "Switch to English" : "हिंदी में बदलें"}
      className={`h-8.5 px-2.5 rounded-[8px] border border-border bg-surface hover:bg-surface-secondary text-text-secondary hover:text-text-primary flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 select-none ${className}`}
    >
      {isHindi ? (
        <>
          {/* Showing Hindi, click to go English */}
          <span className="text-[13px] font-bold text-violet-500 leading-none font-sans">अ</span>
          <span className="text-[10px] font-semibold leading-none opacity-60">→</span>
          <span className="text-[11px] font-semibold leading-none">EN</span>
        </>
      ) : (
        <>
          {/* Showing English, click to go Hindi */}
          <span className="text-[11px] font-semibold leading-none">EN</span>
          <span className="text-[10px] font-semibold leading-none opacity-60">→</span>
          <span className="text-[13px] font-bold text-violet-500 leading-none font-sans">अ</span>
        </>
      )}
    </button>
  );
}

export default LanguageToggle;
