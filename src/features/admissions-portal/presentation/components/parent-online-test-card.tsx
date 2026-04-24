// "Take online test" card for the parent detail screen.
//
// Renders above the in-person schedule picker once payment is done.
// Parent has TWO independent ways to satisfy the test step:
//
//   A) Online  — one click, we SSO them into Moodle, they take the
//      timed quiz, score is auto-graded and reviewable in-platform.
//   B) On-campus — existing ParentScheduleBooking flow; pick a real
//      time slot, show up in person.
//
// For the MVP we show both unconditionally once payment is confirmed.
// Later we'll gate (a) by age — K-G2 kids are required in-person.
//
// The "Start" link opens `/api/me/students/{studentId}/moodle-launch`
// in a new tab. That endpoint is server-side; it auto-provisions the
// Moodle user, enrols into the right course, and returns an HTML
// page that immediately POSTs the login form. Student lands on the
// quiz page; parent returns here to see the score once submitted.

import { Tile } from "@/components/parent-ui";

type Props = {
  /** Neo4j Student id. Passed into the launch URL. */
  studentId: string;
  /** For the heading — "Your IIHS test is ready, Fatima." */
  firstName: string;
  /** "IIHS" or "IISS" — shown as the eyebrow + determines quiz. */
  schoolShortName: string;
  /** i18n helper from getServerI18n. */
  t: (key: string, values?: Record<string, string | number>) => string;
};

export function ParentOnlineTestCard({
  studentId,
  firstName,
  schoolShortName,
  t,
}: Props) {
  const launchHref = `/api/me/students/${encodeURIComponent(studentId)}/moodle-launch`;

  return (
    <Tile variant="hero">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-strong)]">
            {t("parent.detail.schedule.online_eyebrow", {
              school: schoolShortName,
            })}
          </p>
          <h2 className="parent-text-serif mt-2 text-[clamp(22px,4vw,28px)] leading-tight">
            {t("parent.detail.schedule.online_title", { name: firstName })}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--ink-500)]">
            {t("parent.detail.schedule.online_body")}
          </p>
        </div>

        <ul className="flex flex-col gap-2 text-sm text-[color:var(--ink-700)]">
          <li className="flex items-start gap-2">
            <span
              aria-hidden="true"
              className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-strong)] text-[11px] font-bold text-white"
            >
              ✓
            </span>
            {t("parent.detail.schedule.online_bullet_time", { name: firstName })}
          </li>
          <li className="flex items-start gap-2">
            <span
              aria-hidden="true"
              className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-strong)] text-[11px] font-bold text-white"
            >
              ✓
            </span>
            {t("parent.detail.schedule.online_bullet_autograde", { name: firstName })}
          </li>
          <li className="flex items-start gap-2">
            <span
              aria-hidden="true"
              className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-strong)] text-[11px] font-bold text-white"
            >
              ✓
            </span>
            {t("parent.detail.schedule.online_bullet_oneattempt", { name: firstName })}
          </li>
        </ul>

        {/*
         * New-tab on purpose: the Moodle site owns its own navigation
         * (quiz timer, review page, logout). Keeping the admissions
         * portal open in the original tab means the parent can come
         * back to check the score once the student submits.
         */}
        <a
          href={launchHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center justify-center rounded-full bg-[color:var(--brand-strong)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--brand-strong-hover,#247b5a)]"
        >
          {t("parent.detail.schedule.online_cta", { name: firstName })}
          <span aria-hidden="true" className="ml-2">
            →
          </span>
        </a>

        <p className="text-xs text-[color:var(--ink-500)]">
          {t("parent.detail.schedule.online_fineprint", { name: firstName })}
        </p>
      </div>
    </Tile>
  );
}
