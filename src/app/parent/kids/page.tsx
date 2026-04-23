import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import {
  getParentAdmissionsContextFromMePayload,
  type ParentMePayload,
} from "@/lib/dashboard-data";
import { KidAvatar, Screen, Tile } from "@/components/parent-ui";
import { ArrowIcon } from "@/components/parent-ui/icons";
import BottomNavClient from "@/components/parent-ui/bottom-nav-client";
import { getServerI18n } from "@/i18n/server";
import en from "@/i18n/translations/en.json";

const SESSION_COOKIE_NAME = "ds-session";

export const metadata: Metadata = {
  title: "Anak | Cybe Digital School",
  description: en["parent.kids.metadata_description"] ?? "Daftar anak Anda",
};

async function loadParentMe(): Promise<ParentMePayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const { admission } = getServerServiceEndpoints();
  try {
    const res = await fetch(`${admission}/me`, {
      method: "GET",
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

function slugifyName(name: string, index: number): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `student-${index + 1}-${slug}`;
}

/**
 * Dedicated "My children" route for the bottom-nav Kids tab. Each kid
 * is a big tappable tile that deep-links to their application detail.
 * A dedicated route (not a hash-anchor on the dashboard) is what makes
 * the bottom nav feel like real native tab navigation instead of a
 * scroll-to-section hack.
 */
export default async function ParentKidsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) redirect("/login");

  const me = await loadParentMe();
  const context = me ? getParentAdmissionsContextFromMePayload(me) : null;
  if (!context) redirect("/parent/dashboard");

  const { t } = await getServerI18n();
  const firstName = context.parentName.split(" ")[0];
  const unread = me?.unreadMessageCount ?? 0;
  const hasUnpaid = me?.latestPayment?.status === "pending";

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
            {t("parent.kids.eyebrow")}
          </p>
          <h1 className="parent-text-serif mt-1 text-[clamp(28px,5vw,40px)] leading-tight text-[color:var(--ink-900)]">
            {t("parent.kids.title", { parent: firstName })}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--ink-500)]">
            {t("parent.kids.description", { count: context.students.length })}
          </p>
        </header>

        <section className="mt-8 grid gap-4">
          {context.students.map((student, index) => {
            const applicationId = slugifyName(student.studentName, index);
            const firstStudentName = student.studentName.split(" ")[0];
            const grade = student.targetGrade ?? "";
            return (
              <Tile
                key={applicationId}
                href={`/dashboard/parent/applications/${applicationId}`}
                variant="default"
              >
                <div className="flex items-center gap-4">
                  <KidAvatar name={student.studentName} size={56} />
                  <div className="flex-1 min-w-0">
                    <h2 className="parent-text-serif text-xl leading-tight text-[color:var(--ink-900)]">
                      {firstStudentName}
                    </h2>
                    <p className="mt-1 text-sm text-[color:var(--ink-500)]">
                      {grade || t("common.not_provided")} · {student.currentSchool ?? ""}
                    </p>
                  </div>
                  <span className="h-5 w-5 shrink-0 text-[color:var(--ink-500)]" aria-hidden="true">
                    <ArrowIcon />
                  </span>
                </div>
              </Tile>
            );
          })}
        </section>
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
