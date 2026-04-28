"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n";
import { getServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";

type MagicLinkLoginClientProps = {
  token: string;
  /** Where to send the parent after a successful exchange. Defaults
   *  to the add-student form so the EOI->magic-link flow lands them
   *  in the right spot. */
  returnTo: string;
};

/**
 * Posts the magic-link token to the backend, stores the returned
 * session bearer, and redirects to `returnTo`. Runs immediately on
 * mount via a `useEffect` guard so the parent doesn't even see a
 * "click here" button — clicking the email IS the action.
 */
export function MagicLinkLoginClient({ token, returnTo }: MagicLinkLoginClientProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    // StrictMode + dev double-effect: guard so we never POST twice.
    if (ranRef.current) return;
    ranRef.current = true;

    if (!token) {
      setError(t("auth.magic_link.missing_token"));
      return;
    }

    (async () => {
      try {
        const url = `${getServiceEndpoints().admission}/magic-link-login`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
          credentials: "same-origin",
        });
        if (!response.ok) {
          setError(t("auth.magic_link.invalid_token"));
          return;
        }
        const parsed = (await response.json()) as {
          responseCode: number;
          data?: { accessToken?: string; userId?: string };
        };
        if (
          parsed.responseCode < 200 ||
          parsed.responseCode >= 300 ||
          !parsed.data?.accessToken
        ) {
          setError(t("auth.magic_link.invalid_token"));
          return;
        }
        // Persist the session token using the same key the rest of
        // the auth flow reads.
        try {
          sessionStorage.setItem("ds-access-token", parsed.data.accessToken);
        } catch {
          // ignored — sessionStorage may be blocked in private mode.
        }
        router.replace(returnTo);
      } catch {
        setError(t("auth.magic_link.network"));
      }
    })();
  }, [token, returnTo, router, t]);

  if (error) {
    return (
      <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
        {error}
      </div>
    );
  }

  return (
    <p className="text-sm text-[var(--ds-text-secondary)]">
      {t("auth.magic_link.signing_in")}
    </p>
  );
}
