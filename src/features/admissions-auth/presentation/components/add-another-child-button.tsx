"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCreateApplicationMutation } from "@/features/admissions-auth/presentation/hooks/use-create-application";
import { getSetupAdditionalFormHref } from "@/features/admissions-auth/presentation/lib/setup-account-routes";
import { useI18n } from "@/i18n";
import { Button } from "@/shared/ui/button";

/**
 * Dashboard CTA that lets an authenticated parent start a new application
 * for another child. No form here — just one click. Parent info (name,
 * phone, email, school preference) is copied server-side from their
 * existing Lead. After the new Lead is created we route them to the
 * students form where they fill in the new child's details, then payment.
 */
export function AddAnotherChildButton() {
  const router = useRouter();
  const { t } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const mutation = useCreateApplicationMutation();

  const onClick = async () => {
    setError(null);
    try {
      const result = await mutation.mutateAsync({});
      router.push(getSetupAdditionalFormHref(result.admissionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="secondary"
        className="px-4 py-2 text-sm"
        disabled={mutation.isPending}
        onClick={onClick}
      >
        {mutation.isPending
          ? t("dashboard.parent.portal.students.add_loading")
          : t("dashboard.parent.portal.students.add_another")}
      </Button>
      {error ? (
        <p className="text-xs text-[#8b1f1f]">{error}</p>
      ) : null}
    </div>
  );
}
