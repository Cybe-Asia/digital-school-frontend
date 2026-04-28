import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { MagicLinkLoginClient } from "@/features/admissions-auth/presentation/components/magic-link-login-client";
import { getSingleSearchParam } from "@/shared/lib/search-params";

export const metadata: Metadata = {
  title: "Sign in | TWSI",
  description: "Sign in via your magic-link email.",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Magic-link landing for returning parents. The EOI form's
 * `magic_link_sent` branch emails a URL pointing here with `?token=`;
 * client trades it for a session bearer via /magic-link-login then
 * forwards to /auth/me/add-student.
 */
export default async function MagicLinkLoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const token = getSingleSearchParam(sp.token) ?? "";
  const returnTo = getSingleSearchParam(sp.returnTo) ?? "/auth/me/add-student";

  return (
    <AuthShell
      eyebrow="auth.magic_link.eyebrow"
      title="auth.magic_link.title"
      description="auth.magic_link.description"
    >
      <MagicLinkLoginClient token={token} returnTo={returnTo} />
    </AuthShell>
  );
}
