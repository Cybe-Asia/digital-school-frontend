import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import type { ParentMePayload, ParentMessage } from "@/lib/dashboard-data";
import { Screen, Tile } from "@/components/parent-ui";
import BottomNavClient from "@/components/parent-ui/bottom-nav-client";
import { getServerI18n } from "@/i18n/server";
import en from "@/i18n/translations/en.json";

const SESSION_COOKIE_NAME = "ds-session";

export const metadata: Metadata = {
  title: "Pesan | Cybe Digital School",
  description: en["parent.messages.metadata_description"] ?? "Pesan dari sekolah",
};

async function fetchWithToken<T>(path: string): Promise<T | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const { admission } = getServerServiceEndpoints();
  try {
    const res = await fetch(`${admission}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json().catch(() => null)) as { data?: T } | null;
    return body?.data ?? null;
  } catch {
    return null;
  }
}

function formatWhen(iso: string, language: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-GB", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(d);
}

/**
 * Full inbox page for the bottom-nav Messages tab. Lists every message
 * across every Lead the parent owns (the backend /me/messages endpoint
 * already unions them). Dedicated route so tapping the nav tab feels
 * like a real page transition, not a hash scroll.
 */
export default async function ParentMessagesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) redirect("/login");

  const [messages, me] = await Promise.all([
    fetchWithToken<ParentMessage[]>("/me/messages"),
    fetchWithToken<ParentMePayload>("/me"),
  ]);

  const { language, t } = await getServerI18n();
  const parentFirst = me?.lead.parentName?.split(" ")[0] ?? "";
  const unread = me?.unreadMessageCount ?? 0;
  const hasUnpaid = me?.latestPayment?.status === "pending";
  const list = (messages ?? []).slice().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

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
            {t("parent.messages.eyebrow")}
          </p>
          <h1 className="parent-text-serif mt-1 text-[clamp(28px,5vw,40px)] leading-tight text-[color:var(--ink-900)]">
            {t("parent.messages.title", { parent: parentFirst })}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--ink-500)]">
            {t("parent.messages.description", { count: list.length })}
          </p>
        </header>

        {list.length === 0 ? (
          <Tile variant="flat" className="mt-8">
            <p className="text-[15px] leading-relaxed text-[color:var(--ink-500)]">
              {t("dashboard.parent.portal.updates.empty")}
            </p>
          </Tile>
        ) : (
          <section className="mt-8 grid gap-3">
            {list.map((m) => (
              <Tile key={m.messageId} variant={m.isRead ? "flat" : "default"}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--brand-strong)]">
                    {t(`dashboard.parent.portal.updates.tag.${m.category}`) ||
                      m.category}
                  </p>
                  {m.isRead ? null : (
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full bg-[color:var(--warm-coral)]"
                      aria-label={t("parent.messages.unread")}
                    />
                  )}
                </div>
                <h2 className="parent-text-serif mt-2 text-lg leading-snug text-[color:var(--ink-900)]">
                  {m.title}
                </h2>
                <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--ink-700)]">
                  {m.body}
                </p>
                <p className="mt-3 text-[12px] text-[color:var(--ink-500)]">
                  {formatWhen(m.createdAt, language)}
                </p>
              </Tile>
            ))}
          </section>
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
