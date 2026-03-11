"use client";

import { useI18n } from "@/i18n";

export function SetupAccountLoading() {
  const { t } = useI18n();

  return <p className="text-sm text-[var(--ds-text-secondary)]">{t("auth.setup.loading")}</p>;
}
