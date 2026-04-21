"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSendSetupOtpMutation } from "@/features/admissions-auth/presentation/hooks/use-send-setup-otp-mutation";
import { useVerifySetupOtpMutation } from "@/features/admissions-auth/presentation/hooks/use-verify-setup-otp-mutation";
import { getSetupMethodHref } from "@/features/admissions-auth/presentation/lib/setup-account-routes";
import { setSession } from "@/features/admissions-auth/infrastructure/session-api";
import { markSetupOtpVerified, saveSetupAccessToken, wasOtpAlreadySent, clearOtpAlreadySent, readDevOtpCode, clearDevOtpCode, saveDevOtpCode } from "@/features/admissions-auth/presentation/lib/setup-otp-session";
import { setupOtpSchema, type SetupOtpFormValues } from "@/features/admissions-auth/schemas/setup-otp-schema";
import { useI18n } from "@/i18n";
import { Button } from "@/shared/ui/button";
import { OtpInput } from "./otp-input";

const RESEND_COOLDOWN_SECONDS = 60;
const IS_DEV = process.env.NODE_ENV !== "production";

type SetupAccountOtpFormProps = {
  admissionId: string;
  phoneNumber: string;
};

export function SetupAccountOtpForm({ admissionId, phoneNumber }: SetupAccountOtpFormProps) {
  const router = useRouter();
  const { t } = useI18n();
  // Read the "already-sent" flag synchronously during state init so we
  // don't need to setState inside the mount effect (the linter rule
  // react-hooks/set-state-in-effect flags that pattern). The effect
  // below is then purely a side-effect cleanup of the localStorage
  // flag + fallback OTP send when the flag was absent.
  const [resendCooldown, setResendCooldown] = useState(() => {
    if (typeof window === "undefined") return 0;
    return wasOtpAlreadySent(admissionId) ? RESEND_COOLDOWN_SECONDS : 0;
  });
  const hasAutoSentRef = useRef(false);

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
      phoneNumber,
      otp: "",
    },
  });

  // Auto-send OTP on page load — skip if already sent from the setup-account page
  useEffect(() => {
    if (!phoneNumber || hasAutoSentRef.current) {
      return;
    }

    hasAutoSentRef.current = true;

    if (wasOtpAlreadySent(admissionId)) {
      // Cooldown was already seeded by useState initializer above; just
      // consume the localStorage flag so a subsequent refresh doesn't
      // repeat the initial cooldown.
      clearOtpAlreadySent(admissionId);
      return;
    }

    void sendOtpMutation.mutateAsync({ admissionId, phoneNumber }).then((result) => {
      if (result.success) {
        // setState inside an async callback is fine — not synchronous
        // in the effect body.
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
      }
    });
  }, [sendOtpMutation, phoneNumber, admissionId]);

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
    if (!phoneNumber || resendCooldown > 0) {
      return;
    }

    clearDevOtpCode(admissionId);
    const result = await sendOtpMutation.mutateAsync({ admissionId, phoneNumber });

    if (result.success) {
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      if (IS_DEV && result.otp) {
        saveDevOtpCode(admissionId, result.otp);
      }
    }
  };

  const onVerifyOtp = handleSubmit(async (values) => {
    const result = await verifyOtpMutation.mutateAsync({ ...values, admissionId });

    if (!result.success) {
      if (result.fieldErrors?.otp) {
        setError("otp", { message: result.fieldErrors.otp });
      }

      return;
    }

    markSetupOtpVerified(admissionId);
    if (result.success) {
      saveSetupAccessToken(admissionId, result.accessToken);
      await setSession(result.accessToken);
    }
    router.push(getSetupMethodHref(admissionId));
  });

  const verifyFailure = verifyOtpMutation.data && !verifyOtpMutation.data.success ? verifyOtpMutation.data : null;
  const sendOtpSuccess = sendOtpMutation.data?.success ? sendOtpMutation.data : null;
  const sendOtpFailure = sendOtpMutation.data && !sendOtpMutation.data.success ? sendOtpMutation.data : null;
  const resendButtonLabel =
    resendCooldown > 0 ? t("auth.setup.resend_in", { seconds: resendCooldown }) : t("auth.setup.resend_otp");

  // Dev-only: OTP code from the backend response or saved from setup-account page
  const devOtpCode = IS_DEV
    ? sendOtpSuccess?.otp || readDevOtpCode(admissionId)
    : null;

  if (!phoneNumber) {
    return (
      <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
        {t("auth.setup.missing_token")}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center pt-2">
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
          <input type="hidden" {...register("phoneNumber")} />

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

            {devOtpCode ? (
              <div className="mt-4 rounded-xl border border-dashed border-amber-400 bg-amber-50 px-3 py-2 text-center">
                <p className="text-xs font-medium text-amber-700">DEV ONLY</p>
                <p className="mt-0.5 font-mono text-lg font-bold tracking-[0.3em] text-amber-900">{devOtpCode}</p>
              </div>
            ) : null}
          </div>

          <Button type="submit" className="h-14 w-full rounded-xl text-base shadow-sm transition-all hover:shadow-md" disabled={isSubmitting || verifyOtpMutation.isPending}>
            {isSubmitting || verifyOtpMutation.isPending ? t("auth.setup.verify_otp_loading") : t("auth.setup.verify_otp")}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-[var(--ds-text-secondary)]">{t("auth.setup.didnt_receive_code")} </span>
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
    </div>
  );
}
