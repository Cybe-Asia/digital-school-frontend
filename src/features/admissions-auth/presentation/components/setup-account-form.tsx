"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { checkVerification } from "@/features/admissions-auth/application/check-verification";
import { sendSetupOtp } from "@/features/admissions-auth/application/send-setup-otp";
import { createAdmissionsAuthRepository } from "@/features/admissions-auth/infrastructure/create-admissions-auth-repository";
import { useVerifyEmailMutation } from "@/features/admissions-auth/presentation/hooks/use-verify-email-mutation";
import { getSetupOtpHref } from "@/features/admissions-auth/presentation/lib/setup-account-routes";
import { markOtpAlreadySent, saveDevOtpCode } from "@/features/admissions-auth/presentation/lib/setup-otp-session";
import {
  mapAdmissionToSetupContext,
  cacheSetupContext,
  readCachedSetupContext,
} from "@/features/admissions-auth/infrastructure/setup-context-cache";
import { useI18n } from "@/i18n";
import { Button } from "@/shared/ui/button";
import { SetupContextSummary } from "./setup-context-summary";
import { VerificationErrorState } from "./verification-error-state";

type SetupAccountFormProps = {
  /** JWT verification token from the email link (?token=...) */
  token: string;
  /** Fallback admissionId for backwards compat (?admissionId=...) */
  admissionId: string;
};

export function SetupAccountForm({ token, admissionId }: SetupAccountFormProps) {
  const router = useRouter();
  const { t } = useI18n();
  const hasVerifiedRef = useRef(false);
  const [sendOtpState, setSendOtpState] = useState<"idle" | "loading" | "error">("idle");
  const [sendOtpError, setSendOtpError] = useState("");

  const verifyEmailMutation = useVerifyEmailMutation();

  const verifyResult = verifyEmailMutation.data;
  const verifySuccess = verifyResult?.success ? verifyResult : null;
  const verifyFailure = verifyResult && !verifyResult.success ? verifyResult : null;

  // Derive admissionId + context from the verify response
  const resolvedAdmissionId = verifySuccess?.admission.admissionId ?? admissionId;
  const admissionPhone = verifySuccess?.admission.whatsappNumber ?? "";

  // Build SetupContext from verify response or from cache (for page revisits)
  const setupContext = verifySuccess
    ? mapAdmissionToSetupContext(verifySuccess.admission)
    : readCachedSetupContext(resolvedAdmissionId);

  // Auto-verify on mount when a token is present
  useEffect(() => {
    if (!token || hasVerifiedRef.current) {
      return;
    }

    hasVerifiedRef.current = true;
    void verifyEmailMutation.mutateAsync(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Cache the context once we have it, so method/additional pages can read it
  useEffect(() => {
    if (verifySuccess && resolvedAdmissionId) {
      const context = mapAdmissionToSetupContext(verifySuccess.admission);
      cacheSetupContext(resolvedAdmissionId, context);
    }
  }, [verifySuccess, resolvedAdmissionId]);

  /**
   * Click handler: isVerify → sendOTP → navigate to OTP page
   */
  const onSendOtp = async () => {
    setSendOtpState("loading");
    setSendOtpError("");

    try {
      const repo = createAdmissionsAuthRepository();

      // Step 1: Check verification via isVerify
      const verifyCheck = await checkVerification(repo, resolvedAdmissionId);

      if (!verifyCheck.success) {
        setSendOtpState("error");
        setSendOtpError(verifyCheck.formError ?? "api.error.unable_to_process");
        return;
      }

      if (!verifyCheck.isVerified) {
        setSendOtpState("error");
        setSendOtpError("auth.setup.email_not_verified");
        return;
      }

      // Step 2: Send OTP
      const phone = admissionPhone || setupContext?.whatsapp || "";

      if (!phone) {
        setSendOtpState("error");
        setSendOtpError("auth.setup.missing_phone");
        return;
      }

      const otpResult = await sendSetupOtp(repo, phone);

      if (!otpResult.success) {
        setSendOtpState("error");
        setSendOtpError(otpResult.formError ?? "api.error.unable_to_process");
        return;
      }

      // Step 3: Mark OTP as already sent so OTP page skips auto-send
      markOtpAlreadySent(resolvedAdmissionId);

      // Step 3b: Save dev OTP code so OTP page can display it
      if (otpResult.otp) {
        saveDevOtpCode(resolvedAdmissionId, otpResult.otp);
      }

      // Step 4: Navigate to OTP page
      router.push(getSetupOtpHref(resolvedAdmissionId, phone));
    } catch {
      setSendOtpState("error");
      setSendOtpError("api.error.network");
    }
  };

  // --- Error states ---

  if (!token && !admissionId) {
    return <VerificationErrorState variant="missing-token" />;
  }

  if (!token && admissionId) {
    // User arrived with ?admissionId= but no token — check if we have cached context
    if (setupContext) {
      return (
        <div className="space-y-5">
          <SetupContextSummary context={setupContext} />

          {sendOtpError ? (
            <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
              {t(sendOtpError)}
            </div>
          ) : null}

          <Button className="w-full" onClick={onSendOtp} disabled={sendOtpState === "loading"}>
            {sendOtpState === "loading" ? t("auth.setup.verifying") : t("auth.setup.send_otp")}
          </Button>
        </div>
      );
    }

    return <VerificationErrorState variant="missing-token" />;
  }

  if (verifyFailure?.formError) {
    const isExpired = verifyFailure.formError.includes("expired") || verifyFailure.formError.includes("Expired");
    return (
      <VerificationErrorState
        variant={isExpired ? "token-expired" : "verify-failed"}
        onRetry={() => {
          hasVerifiedRef.current = false;
          void verifyEmailMutation.mutateAsync(token);
        }}
        isRetrying={verifyEmailMutation.isPending}
      />
    );
  }

  // --- Loading state ---

  if (verifyEmailMutation.isPending || (!verifyResult && token)) {
    return (
      <p className="text-sm text-[var(--ds-text-secondary)]">{t("auth.setup.loading_context")}</p>
    );
  }

  // --- Success state ---

  if (verifySuccess && setupContext) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-[#0f8f63]/20 bg-[#dbf7ee] px-4 py-3 text-sm text-[#0f5c45]">
          {t("auth.setup.verify_email_success")}
        </div>

        <SetupContextSummary context={setupContext} />

        {sendOtpError ? (
          <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
            {t(sendOtpError)}
          </div>
        ) : null}

        <Button
          className="w-full"
          onClick={onSendOtp}
          disabled={sendOtpState === "loading"}
        >
          {sendOtpState === "loading" ? t("auth.setup.verifying") : t("auth.setup.send_otp")}
        </Button>
      </div>
    );
  }

  return null;
}
