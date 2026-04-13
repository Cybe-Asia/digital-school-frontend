"use client";

import { useTheme } from "@/components/theme-provider";
import { useI18n } from "@/i18n";
import { cn } from "@/shared/lib/cn";

type ThemeModeToggleProps = {
  className?: string;
};

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5V5.5M12 18.5V21.5M21.5 12H18.5M5.5 12H2.5M18.7 5.3L16.6 7.4M7.4 16.6L5.3 18.7M18.7 18.7L16.6 16.6M7.4 7.4L5.3 5.3" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a7 7 0 0 0 10.7 10.7Z" />
    </svg>
  );
}

export function ThemeModeToggle({ className }: ThemeModeToggleProps) {
  const mode = useTheme((state) => state.mode);
  const toggleMode = useTheme((state) => state.toggleMode);
  const { t } = useI18n();
  const isDark = mode === "dark";

  return (
    <button
      type="button"
      className={cn(
        "theme-toggle relative inline-flex h-9 w-[64px] items-center rounded-full border p-1 transition",
        isDark
          ? "border-[#7ea3ea]/45 bg-gradient-to-b from-[#7fa6ee] to-[#638fe3]"
          : "border-[#7ea3ea]/45 bg-gradient-to-b from-[#8db2f6] to-[#6d97ea]",
        className,
      )}
      onClick={toggleMode}
      aria-label={t("common.theme.toggle")}
      aria-pressed={isDark}
      title={isDark ? t("common.theme.switch_to_light") : t("common.theme.switch_to_dark")}
    >
      <span
        className={cn(
          "pointer-events-none absolute left-1 top-1 h-7 w-[calc(50%-4px)] rounded-full bg-white/95 shadow-[0_2px_6px_rgba(14,28,58,0.22)] transition-transform duration-300",
          isDark ? "translate-x-full" : "translate-x-0",
        )}
      />

      <span
        className={cn(
          "pointer-events-none relative z-10 inline-flex w-1/2 items-center justify-center transition-colors",
          !isDark ? "text-[var(--ds-secondary)]" : "text-white/95",
        )}
      >
        <SunIcon className="h-4 w-4" />
      </span>
      <span
        className={cn(
          "pointer-events-none relative z-10 inline-flex w-1/2 items-center justify-center transition-colors",
          isDark ? "text-[var(--ds-secondary)]" : "text-[#1d3c78]",
        )}
      >
        <MoonIcon className="h-4 w-4" />
      </span>
    </button>
  );
}
