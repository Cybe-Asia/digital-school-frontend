"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRequestPasswordResetMutation } from "@/features/admissions-auth/presentation/hooks/use-request-password-reset-mutation";
import {
  requestPasswordResetSchema,
  type RequestPasswordResetFormValues,
} from "@/features/admissions-auth/schemas/request-password-reset-schema";
import { useI18n } from "@/i18n";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { FormField } from "./form-field";

export function RequestPasswordResetForm() {
  const mutation = useRequestPasswordResetMutation();
  const { t } = useI18n();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RequestPasswordResetFormValues>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await mutation.mutateAsync(values);

    if (!result.success && result.fieldErrors?.email) {
      setError("email", { message: result.fieldErrors.email });
    }
  });

  const successData = mutation.data?.success ? mutation.data : null;
  const failureData = mutation.data && !mutation.data.success ? mutation.data : null;

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      {successData ? (
        <div className="rounded-2xl border border-[#0f8f63]/20 bg-[#dbf7ee] px-4 py-3 text-sm text-[#0f5c45]">
          <p className="font-semibold">{t("auth.reset.success_title")}</p>
          {successData.message ? <p className="mt-1">{t(successData.message)}</p> : null}
          <Link href="/admissions/login" className="mt-2 inline-flex font-semibold text-[var(--ds-primary)]">
            {t("auth.reset.back_to_login")}
          </Link>
        </div>
      ) : null}

      {failureData?.formError ? (
        <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
          {t(failureData.formError)}
        </div>
      ) : null}

      <FormField
        label="auth.reset.email_label"
        htmlFor="email"
        hint="auth.reset.email_hint"
        error={errors.email?.message}
      >
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={t("auth.reset.email_placeholder")}
          {...register("email")}
        />
      </FormField>

      <Button type="submit" className="w-full" disabled={isSubmitting || mutation.isPending}>
        {isSubmitting || mutation.isPending ? t("auth.reset.submit_loading") : t("auth.reset.submit")}
      </Button>
    </form>
  );
}
