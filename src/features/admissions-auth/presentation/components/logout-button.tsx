"use client";

import { useState } from "react";
import { clearSession } from "@/features/admissions-auth/infrastructure/session-api";
import { useI18n } from "@/i18n";
import { Button } from "@/shared/ui/button";

export function LogoutButton() {
  const { t } = useI18n();
  const [isPending, setIsPending] = useState(false);

  const onLogout = async () => {
    setIsPending(true);

    try {
      await clearSession();
      sessionStorage.clear();
      window.location.href = "/admissions/login";
    } catch {
      setIsPending(false);
    }
  };

  return (
    <Button variant="ghost" onClick={onLogout} disabled={isPending}>
      {isPending ? t("auth.logout.loading") : t("auth.logout.label")}
    </Button>
  );
}
