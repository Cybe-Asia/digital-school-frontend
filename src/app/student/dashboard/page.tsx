import type { Metadata } from "next";
import { BigButton, Screen, Tile } from "@/components/parent-ui";
import {
  BookIcon,
  CalendarIcon,
  GraduateIcon,
  SparkleIcon,
} from "@/components/parent-ui/icons";
import { getServerI18n } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Student Portal | Cybe Digital School",
};

/**
 * Placeholder student portal. Until the persona/student persona refactor
 * lands, we can't render real timetable/grade data here — but the old
 * "coming soon" three-liner was boring and reinforced that the portal
 * isn't cared about. This version looks designed: a greeting, a preview
 * of what will be here, a single CTA to go sign in as a parent.
 */
export default async function StudentDashboardPage() {
  const { t } = await getServerI18n();

  return (
    <Screen>
      <Tile variant="hero" className="mb-5">
        <span className="parent-chip">
          <span className="h-3.5 w-3.5">
            <SparkleIcon />
          </span>
          {t("student.home.comingsoon_chip")}
        </span>
        <h1 className="parent-text-serif mt-4 text-[clamp(32px,6vw,46px)] leading-[1.05] text-[color:var(--ink-900)]">
          {t("student.home.headline")}
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-[color:var(--ink-500)]">
          {t("student.home.lede")}
        </p>
      </Tile>

      {/* Preview feed of what WILL live here. Grey/soft so it reads as
          "preview, not live" at a glance. */}
      <div className="space-y-3 opacity-80">
        <Tile variant="flat">
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--brand-soft)] text-[color:var(--brand-strong)]"
              aria-hidden="true"
            >
              <span className="h-5 w-5">
                <CalendarIcon />
              </span>
            </span>
            <div>
              <p className="parent-text-serif text-[17px] text-[color:var(--ink-900)]">
                Today&apos;s schedule
              </p>
              <p className="mt-0.5 text-sm text-[color:var(--ink-500)]">
                Your next class, room, and teacher will appear here.
              </p>
            </div>
          </div>
        </Tile>

        <Tile variant="flat">
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#fdebc8] text-[#8a5b10]"
              aria-hidden="true"
            >
              <span className="h-5 w-5">
                <BookIcon />
              </span>
            </span>
            <div>
              <p className="parent-text-serif text-[17px] text-[color:var(--ink-900)]">
                Assignments
              </p>
              <p className="mt-0.5 text-sm text-[color:var(--ink-500)]">
                Due this week, sorted by subject.
              </p>
            </div>
          </div>
        </Tile>

        <Tile variant="flat">
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#fbdcd0] text-[#8e3824]"
              aria-hidden="true"
            >
              <span className="h-5 w-5">
                <GraduateIcon />
              </span>
            </span>
            <div>
              <p className="parent-text-serif text-[17px] text-[color:var(--ink-900)]">
                Grades
              </p>
              <p className="mt-0.5 text-sm text-[color:var(--ink-500)]">
                Progress across every subject, term by term.
              </p>
            </div>
          </div>
        </Tile>
      </div>

      <div className="mt-8">
        <BigButton href="/login" variant="ghost">
          {t("student.home.login_cta")}
        </BigButton>
      </div>
    </Screen>
  );
}
