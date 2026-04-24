"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useGoogleLoginMutation } from "@/features/admissions-auth/presentation/hooks/use-google-login-mutation";
import { useLoginMutation } from "@/features/admissions-auth/presentation/hooks/use-login-mutation";
import { setSession } from "@/features/admissions-auth/infrastructure/session-api";
import { loginSchema, type LoginFormValues } from "@/features/admissions-auth/schemas/login-schema";
import { useI18n } from "@/i18n";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { FormField } from "./form-field";

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

export function LoginForm() {
  const mutation = useLoginMutation();
  const googleMutation = useGoogleLoginMutation();
  const { t } = useI18n();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await mutation.mutateAsync(values);

    if (!result.success) {
      if (result.fieldErrors?.email) {
        setError("email", { message: result.fieldErrors.email });
      }

      if (result.fieldErrors?.password) {
        setError("password", { message: result.fieldErrors.password });
      }

      return;
    }

    await setSession(result.accessToken);

    // Route by role. Staff (emails on ADMIN_EMAILS) always land on
    // /admin/admissions — never the parent tree, even if they also
    // happen to have a Lead record from testing. We probe /api/me
    // right after the session is set and trust its `isAdmin` field.
    //
    // Falls back to:
    //  - 404 inference (no Lead at all → must be admin-only) — kept
    //    for backward-compat with older admission-service builds that
    //    predate the `isAdmin` field.
    //  - `result.redirectTo` when /me is unreachable (network blip).
    let target = result.redirectTo ?? "/parent/dashboard";
    try {
      const me = await fetch("/api/me", { cache: "no-store" });
      if (me.status === 404) {
        target = "/admin/admissions";
      } else if (me.ok) {
        const body = (await me.json().catch(() => null)) as
          | { data?: { isAdmin?: boolean } }
          | null;
        if (body?.data?.isAdmin === true) {
          target = "/admin/admissions";
        }
      }
    } catch {
      // Network blip — fall through to the standard target. The
      // parent dashboard's own error panel handles the edge case.
    }
    // window.location.assign() instead of `href = …` so the
    // react-hooks/immutability rule doesn't flag this as mutating
    // an external binding. Semantically identical (hard nav).
    window.location.assign(target);
  });

  const onGoogleSignIn = async () => {
    const result = await googleMutation.mutateAsync("/dashboard/parent");

    if (result.success && result.redirectTo) {
      window.location.href = result.redirectTo;
    }
  };

  const successData = mutation.data?.success ? mutation.data : null;
  const failureData = mutation.data && !mutation.data.success ? mutation.data : null;
  const googleFailureData = googleMutation.data && !googleMutation.data.success ? googleMutation.data : null;

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      {successData ? (
        <div className="rounded-2xl border border-[#0f8f63]/20 bg-[#dbf7ee] px-4 py-3 text-sm text-[#0f5c45]">
          <p className="font-semibold">{t("auth.login.success_title")}</p>
          {successData.message ? <p className="mt-1">{t(successData.message)}</p> : null}
          <p className="mt-1">{t("auth.login.next_route", { route: successData.redirectTo ?? "" })}</p>
        </div>
      ) : null}

      {failureData?.formError ? (
        <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
          {t(failureData.formError)}
        </div>
      ) : null}

      {googleFailureData?.formError ? (
        <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
          {t(googleFailureData.formError)}
        </div>
      ) : null}

      <Button
        type="button"
        variant="secondary"
        className="w-full gap-2"
        onClick={onGoogleSignIn}
        disabled={googleMutation.isPending || isSubmitting || mutation.isPending}
      >
        <GoogleIcon />
          {googleMutation.isPending ? t("auth.login.google_loading") : t("auth.login.google_cta")}
      </Button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--ds-border)]" />
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ds-text-secondary)]">{t("common.or")}</span>
        <div className="h-px flex-1 bg-[var(--ds-border)]" />
      </div>

      <FormField
        label="auth.login.email_label"
        htmlFor="email"
        hint="auth.login.email_hint"
        error={errors.email?.message}
      >
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={t("auth.login.email_placeholder")}
          {...register("email")}
        />
      </FormField>

      <FormField
        label="auth.login.password_label"
        htmlFor="password"
        hint="auth.login.password_hint"
        error={errors.password?.message}
      >
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder={t("auth.login.password_placeholder")}
          {...register("password")}
        />
      </FormField>

      <div className="flex items-center justify-end">
        <Link href="/auth/request-reset" className="text-xs font-semibold text-[var(--ds-primary)] hover:text-[var(--ds-cta-fill-2)]">
          {t("auth.login.forgot_password")}
        </Link>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting || mutation.isPending || googleMutation.isPending}>
        {isSubmitting || mutation.isPending ? t("auth.login.submit_loading") : t("auth.login.submit")}
      </Button>
    </form>
  );
}
