"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSendSetupOtpMutation } from "@/features/admissions-auth/presentation/hooks/use-send-setup-otp-mutation";
import { useSetupContextQuery } from "@/features/admissions-auth/presentation/hooks/use-setup-context-query";
import { useVerifySetupOtpMutation } from "@/features/admissions-auth/presentation/hooks/use-verify-setup-otp-mutation";
import { markSetupOtpVerified } from "@/features/admissions-auth/presentation/lib/setup-otp-session";
import { setupOtpSchema, type SetupOtpFormValues } from "@/features/admissions-auth/schemas/setup-otp-schema";
import { useI18n } from "@/i18n";
import { Button } from "@/shared/ui/button";
import { OtpInput } from "./otp-input";

const RESEND_COOLDOWN_SECONDS = 60;

export function SetupAccountOtpForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tokenFromUrl = searchParams.get("token") ?? "";
  const { t } = useI18n();
  const [resendCooldown, setResendCooldown] = useState(0);
  const hasAutoSentRef = useRef(false);

  const setupContextQuery = useSetupContextQuery(tokenFromUrl);
  const sendOtpMutation = useSendSetupOtpMutation();
  const verifyOtpMutation = useVerifySetupOtpMutation();

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SetupOtpFormValues>({
    resolver: zodResolver(setupOtpSchema),
    defaultValues: {
      token: tokenFromUrl,
      otp: "",
    },
  });

  useEffect(() => {
    if (!tokenFromUrl || hasAutoSentRef.current) {
      return;
    }

    hasAutoSentRef.current = true;

    void sendOtpMutation.mutateAsync(tokenFromUrl).then((result) => {
      if (result.success) {
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
      }
    });
  }, [sendOtpMutation, tokenFromUrl]);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [resendCooldown]);

  const onResendOtp = async () => {
    if (!tokenFromUrl || resendCooldown > 0) {
      return;
    }

    const result = await sendOtpMutation.mutateAsync(tokenFromUrl);

    if (result.success) {
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    }
  };

  const onVerifyOtp = handleSubmit(async (values) => {
    const result = await verifyOtpMutation.mutateAsync(values);

    if (!result.success) {
      if (result.fieldErrors?.otp) {
        setError("otp", { message: result.fieldErrors.otp });
      }

      return;
    }

    markSetupOtpVerified(tokenFromUrl);
    router.push(`/auth/setup-account/method?token=${encodeURIComponent(tokenFromUrl)}`);
  });

  const contextSuccess = setupContextQuery.data?.success ? setupContextQuery.data : null;
  const contextFailure = setupContextQuery.data && !setupContextQuery.data.success ? setupContextQuery.data : null;
  const verifyFailure = verifyOtpMutation.data && !verifyOtpMutation.data.success ? verifyOtpMutation.data : null;
  const sendOtpSuccess = sendOtpMutation.data?.success ? sendOtpMutation.data : null;
  const sendOtpFailure = sendOtpMutation.data && !sendOtpMutation.data.success ? sendOtpMutation.data : null;
  const resendButtonLabel =
    resendCooldown > 0 ? t("auth.setup.resend_in", { seconds: resendCooldown }) : t("auth.setup.resend_otp");

  if (!tokenFromUrl) {
    return (
      <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
        {t("auth.setup.missing_token")}
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
        <div className="flex flex-col items-center pt-2">
          {sendOtpSuccess?.message ? (
            <div className="mb-6 w-full rounded-2xl border border-[#0f8f63]/20 bg-[#dbf7ee] px-4 py-3 text-center text-sm text-[#0f5c45]">
              {t(sendOtpSuccess.message)}
            </div>
          ) : null}

          {sendOtpFailure?.formError ? (
            <div className="mb-6 w-full rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-center text-sm text-[#8b1f1f]">
              {t(sendOtpFailure.formError)}
            </div>
          ) : null}

          <div className="mb-8 text-center flex flex-col items-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--ds-primary)]/10 text-[var(--ds-primary)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                <path d="M9 22v-4h6v4" />
                <path d="M8 6h.01" />
                <path d="M16 6h.01" />
                <path d="M12 6h.01" />
                <path d="M12 10h.01" />
                <path d="M12 14h.01" />
                <path d="M16 10h.01" />
                <path d="M16 14h.01" />
                <path d="M8 10h.01" />
                <path d="M8 14h.01" />
              </svg>
            </div>
          </div>

          <form className="w-full" onSubmit={onVerifyOtp} noValidate>
            <input type="hidden" {...register("token")} />

            <div className="mx-auto mb-8 max-w-[280px]">
              <Controller
                control={control}
                name="otp"
                render={({ field }) => (
                  <OtpInput
                    id="otp"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting || verifyOtpMutation.isPending}
                    invalid={Boolean(errors.otp?.message ?? verifyFailure?.fieldErrors?.otp)}
                  />
                )}
              />
              {(errors.otp?.message ?? verifyFailure?.fieldErrors?.otp) && (
                <p className="mt-3 text-center text-sm font-medium text-[#b42318]">
                  {t(errors.otp?.message ?? verifyFailure?.fieldErrors?.otp ?? "")}
                </p>
              )}
            </div>

            <Button type="submit" className="h-14 w-full rounded-xl text-base shadow-sm transition-all hover:shadow-md" disabled={isSubmitting || verifyOtpMutation.isPending}>
              {isSubmitting || verifyOtpMutation.isPending ? t("auth.setup.verify_otp_loading") : t("auth.setup.verify_otp")}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-[var(--ds-text-secondary)]">Didn&apos;t receive the code? </span>
            <button
              type="button"
              className="font-semibold text-[var(--ds-primary)] transition-colors hover:text-[var(--ds-cta-fill-2)] hover:underline disabled:opacity-50 disabled:hover:no-underline"
              onClick={onResendOtp}
              disabled={sendOtpMutation.isPending || resendCooldown > 0}
            >
              {sendOtpMutation.isPending ? t("auth.setup.send_otp_loading") : resendButtonLabel}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
