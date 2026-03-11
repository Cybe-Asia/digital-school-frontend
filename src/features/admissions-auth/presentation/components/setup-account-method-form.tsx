"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useGoogleLoginMutation } from "@/features/admissions-auth/presentation/hooks/use-google-login-mutation";
import { useSetupContextQuery } from "@/features/admissions-auth/presentation/hooks/use-setup-context-query";
import { useSetupAccountMutation } from "@/features/admissions-auth/presentation/hooks/use-setup-account-mutation";
import { hasSetupOtpVerified } from "@/features/admissions-auth/presentation/lib/setup-otp-session";
import { setupAccountSchema, type SetupAccountFormValues } from "@/features/admissions-auth/schemas/setup-account-schema";
import { useI18n } from "@/i18n";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { FormField } from "./form-field";
import { SetupContextSummary } from "./setup-context-summary";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.2-1.9 2.9l3 2.3c1.8-1.6 2.8-3.9 2.8-6.7 0-.6-.1-1.2-.2-1.8H12Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.6 0 4.8-.8 6.4-2.2l-3-2.3c-.8.6-1.9 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1l-3.1 2.4C5 20 8.2 22 12 22Z"
      />
      <path
        fill="#4A90E2"
        d="M6.4 14.4c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2L3.3 8C2.5 9.6 2 11.2 2 12.4c0 1.2.5 2.8 1.3 4.4l3.1-2.4Z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.9c1.4 0 2.7.5 3.7 1.5l2.7-2.7C16.8 3.1 14.6 2 12 2 8.2 2 5 4 3.3 8l3.1 2.4c.8-2.3 3-4.5 5.6-4.5Z"
      />
    </svg>
  );
}

export function SetupAccountMethodForm() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";
  const otpVerified = hasSetupOtpVerified(tokenFromUrl);
  const { t } = useI18n();

  const setupContextQuery = useSetupContextQuery(tokenFromUrl, otpVerified);
  const setupAccountMutation = useSetupAccountMutation();
  const googleMutation = useGoogleLoginMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SetupAccountFormValues>({
    resolver: zodResolver(setupAccountSchema),
    defaultValues: {
      token: tokenFromUrl,
      password: "",
      confirmPassword: "",
    },
  });

  const onSetupPassword = handleSubmit(async (values) => {
    const result = await setupAccountMutation.mutateAsync(values);

    if (!result.success) {
      for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
        if (message) {
          setError(field as keyof SetupAccountFormValues, { message });
        }
      }
    }
  });

  const onGoogleSignIn = async () => {
    const result = await googleMutation.mutateAsync("/dashboard/parent");

    if (result.success && result.redirectTo) {
      window.location.href = result.redirectTo;
    }
  };

  const contextSuccess = setupContextQuery.data?.success ? setupContextQuery.data : null;
  const contextFailure = setupContextQuery.data && !setupContextQuery.data.success ? setupContextQuery.data : null;
  const setupSuccess = setupAccountMutation.data?.success ? setupAccountMutation.data : null;
  const setupFailure = setupAccountMutation.data && !setupAccountMutation.data.success ? setupAccountMutation.data : null;

  if (!tokenFromUrl) {
    return (
      <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
        {t("auth.setup.missing_token")}
      </div>
    );
  }

  if (!otpVerified) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
          {t("auth.setup.method.blocked")}
        </div>
        <Link href={`/auth/setup-account/otp?token=${encodeURIComponent(tokenFromUrl)}`} className="inline-flex text-sm font-semibold text-[var(--ds-primary)]">
          {t("auth.setup.method.back_to_verify")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {setupContextQuery.isLoading ? <p className="text-sm text-[var(--ds-text-secondary)]">{t("auth.setup.loading_context")}</p> : null}

      {contextFailure?.formError ? (
        <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
          {t(contextFailure.formError)}
        </div>
      ) : null}

      {contextSuccess ? (
        <SetupContextSummary context={contextSuccess.context} />
      ) : null}

      {contextSuccess && !setupSuccess ? (
        <>
          <div className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{t("auth.setup.choose_method_title")}</p>
            <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">{t("auth.setup.choose_method_hint")}</p>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full gap-2"
            onClick={onGoogleSignIn}
            disabled={googleMutation.isPending}
          >
            <GoogleIcon />
            {googleMutation.isPending ? t("auth.setup.google_loading") : t("auth.setup.google_cta")}
          </Button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--ds-border)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">{t("common.or")}</span>
            <div className="h-px flex-1 bg-[var(--ds-border)]" />
          </div>

          <form className="space-y-4" onSubmit={onSetupPassword} noValidate>
            <input type="hidden" {...register("token")} />

            {setupFailure?.formError ? (
              <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
                {t(setupFailure.formError)}
              </div>
            ) : null}

            <FormField label="auth.setup.password_label" htmlFor="password" error={errors.password?.message}>
              <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
            </FormField>

            <FormField label="auth.setup.confirm_password_label" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
              <Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} />
            </FormField>

            <Button type="submit" className="w-full" disabled={isSubmitting || setupAccountMutation.isPending}>
              {isSubmitting || setupAccountMutation.isPending ? t("auth.setup.submit_loading") : t("auth.setup.submit")}
            </Button>
          </form>
        </>
      ) : null}

      {setupSuccess ? (
        <div className="rounded-2xl border border-[#0f8f63]/20 bg-[#dbf7ee] px-4 py-3 text-sm text-[#0f5c45]">
          <p className="font-semibold">{t("auth.setup.success_title")}</p>
          {setupSuccess.message ? <p className="mt-1">{t(setupSuccess.message)}</p> : null}
          <p className="mt-1">{t("auth.setup.account_ready", { value: t(setupSuccess.accountReady ? "common.boolean.yes" : "common.boolean.no") })}</p>
          <Link href={setupSuccess.redirectTo ?? "/dashboard/parent"} className="mt-2 inline-flex font-semibold text-[var(--ds-primary)]">
            {t("auth.setup.continue_dashboard")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
