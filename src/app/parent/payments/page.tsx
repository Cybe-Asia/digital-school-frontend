import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import type { ParentMePayload } from "@/lib/dashboard-data";
import { Screen, Tile } from "@/components/parent-ui";
import { WalletIcon } from "@/components/parent-ui/icons";
import BottomNavClient from "@/components/parent-ui/bottom-nav-client";
import { PayButtonClient } from "@/components/parent-ui/pay-button-client";
import { getServerI18n } from "@/i18n/server";
import en from "@/i18n/translations/en.json";

const SESSION_COOKIE_NAME = "ds-session";

export const metadata: Metadata = {
  title: "Pembayaran | TWSI",
  description: en["parent.payments.metadata_description"] ?? "Detail tagihan Anda",
};

async function loadParentMe(): Promise<ParentMePayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const { admission } = getServerServiceEndpoints();
  try {
    const res = await fetch(`${admission}/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json().catch(() => null)) as { data?: ParentMePayload } | null;
    return body?.data ?? null;
  } catch {
    return null;
  }
}

function formatAmount(amount: number | null | undefined, currency: string): string {
  if (typeof amount !== "number" || amount <= 0) return "—";
  const prefix = currency === "IDR" ? "Rp " : `${currency} `;
  return prefix + amount.toLocaleString("id-ID");
}

/**
 * Dedicated payments tab for the bottom nav. Surfaces the latest
 * invoice (paid / pending / none) with a proper payment-focused
 * layout. Separate route from /parent/dashboard so the bottom nav
 * tab is a real navigation, not a scroll-to-section.
 */
export default async function ParentPaymentsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) redirect("/login");

  const me = await loadParentMe();
  if (!me) redirect("/parent/dashboard");

  const { t } = await getServerI18n();
  const parentFirst = me.lead.parentName?.split(" ")[0] ?? "";
  const unread = me.unreadMessageCount ?? 0;
  const payment = me.latestPayment ?? null;
  const isPaid = payment?.status === "paid";
  const isPending = payment?.status === "pending";
  const hasUnpaid = isPending;
  const amount = formatAmount(payment?.amount ?? null, payment?.currency ?? "IDR");
  const lineItems = Array.isArray(payment?.lineItems) ? payment?.lineItems ?? [] : [];

  return (
    <Screen>
      <div className="mx-auto max-w-[640px] px-5 pt-6 pb-24 sm:pt-10 sm:pb-10">
        <Link
          href="/parent/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--ink-500)] transition hover:text-[color:var(--ink-900)]"
        >
          ← {t("parent.nav.home")}
        </Link>

        <header className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-strong)]">
            {t("parent.payments.eyebrow")}
          </p>
          <h1 className="parent-text-serif mt-1 text-[clamp(28px,5vw,40px)] leading-tight text-[color:var(--ink-900)]">
            {t("parent.payments.title", { parent: parentFirst })}
          </h1>
        </header>

        {!payment ? (
          <Tile variant="flat" className="mt-8">
            <p className="text-[15px] leading-relaxed text-[color:var(--ink-500)]">
              {t("parent.payments.none_body")}
            </p>
          </Tile>
        ) : (
          <>
            <Tile variant={isPaid ? "celebrate" : "hero"} className="mt-8">
              <span
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-[color:var(--brand-strong)]"
                aria-hidden="true"
              >
                <span className="h-6 w-6">
                  <WalletIcon />
                </span>
              </span>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--brand-strong)]">
                {isPaid
                  ? t("parent.payments.paid_eyebrow")
                  : isPending
                    ? t("parent.payments.pending_eyebrow")
                    : t("parent.payments.generic_eyebrow")}
              </p>
              <h2 className="parent-text-serif mt-2 text-[clamp(32px,6vw,44px)] leading-none text-[color:var(--ink-900)]">
                {amount}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--ink-700)]">
                {isPaid
                  ? t("parent.payments.paid_body")
                  : isPending
                    ? t("parent.payments.pending_body")
                    : t("parent.payments.generic_body")}
              </p>
              {isPending ? (
                <div className="mt-5">
                  <PayButtonClient
                    existingInvoiceUrl={payment?.hostedInvoiceUrl ?? null}
                    admissionId={me.lead.admissionId}
                  />
                </div>
              ) : null}
            </Tile>

            {lineItems.length > 0 ? (
              <section className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-strong)]">
                  {t("parent.payments.breakdown_eyebrow")}
                </p>
                <Tile variant="default" className="mt-3">
                  <ul className="divide-y divide-[color:var(--ink-100)]">
                    {lineItems.map((item, i) => (
                      <li key={`${item.description}-${i}`} className="flex items-baseline justify-between gap-3 py-3 first:pt-0 last:pb-0">
                        <span className="text-[14px] text-[color:var(--ink-700)]">
                          {item.description}
                        </span>
                        <span className="font-semibold tabular-nums text-[color:var(--ink-900)]">
                          {formatAmount(item.amount, item.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Tile>
              </section>
            ) : null}
          </>
        )}
      </div>

      <BottomNavClient
        unreadMessages={unread}
        hasUnpaidPayment={hasUnpaid}
        homeLabel={t("parent.nav.home")}
        messagesLabel={t("parent.nav.messages")}
        paymentsLabel={t("parent.nav.payments")}
        kidsLabel={t("parent.nav.kids")}
      />
    </Screen>
  );
}
