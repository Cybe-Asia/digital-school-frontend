"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n";
import { cn } from "@/shared/lib/cn";

type LanguageToggleProps = {
  className?: string;
};

function EnglishFlag() {
  return (
    <svg viewBox="0 0 28 20" className="h-3.5 w-5 overflow-hidden rounded-[3px] shadow-sm" aria-hidden="true">
      <rect width="28" height="20" fill="#0A3161" />
      <path d="M0 0 28 20M28 0 0 20" stroke="#FFFFFF" strokeWidth="4" />
      <path d="M0 0 28 20M28 0 0 20" stroke="#B31942" strokeWidth="2" />
      <path d="M14 0v20M0 10h28" stroke="#FFFFFF" strokeWidth="6" />
      <path d="M14 0v20M0 10h28" stroke="#B31942" strokeWidth="3.2" />
    </svg>
  );
}

function IndonesiaFlag() {
  return (
    <svg viewBox="0 0 28 20" className="h-3.5 w-5 overflow-hidden rounded-[3px] shadow-sm" aria-hidden="true">
      <rect width="28" height="10" fill="#CE1126" />
      <rect y="10" width="28" height="10" fill="#FFFFFF" />
    </svg>
  );
}

export default function LanguageToggle({ className }: LanguageToggleProps) {
  const { language, setLanguage, t } = useI18n();
  const router = useRouter();

  const handleSetLanguage = (nextLanguage: "en" | "id") => {
    if (nextLanguage === language) {
      return;
    }

    setLanguage(nextLanguage);
    router.refresh();
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-[var(--ds-border)] bg-[var(--ds-surface)] p-1",
        className,
      )}
      role="group"
      aria-label={t("common.language.toggle")}
    >
      <button
        type="button"
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
          language === "en"
            ? "bg-[var(--ds-primary)] text-[var(--ds-on-primary)]"
            : "text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)]"
        }`}
        onClick={() => handleSetLanguage("en")}
      >
        <EnglishFlag />
        EN
      </button>
      <button
        type="button"
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
          language === "id"
            ? "bg-[var(--ds-primary)] text-[var(--ds-on-primary)]"
            : "text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)]"
        }`}
        onClick={() => handleSetLanguage("id")}
      >
        <IndonesiaFlag />
        ID
      </button>
    </div>
  );
}
