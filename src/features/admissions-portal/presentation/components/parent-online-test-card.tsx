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
// The card renders differently depending on the Moodle attempt state
// that the ScheduleScreen fetches for this student:
//
//   state="not_started"  → hero CTA, 3 bullets, "Open test for Name"
//   state="in_progress"  → "Test in progress" + "Return to test"
//   state="finished"     → big score card + "Review your answers"
//
// The "Start" link opens `/api/me/students/{studentId}/moodle-launch`
// in a new tab. That endpoint is server-side; it auto-provisions the
// Moodle user, enrols into the right course, and returns an HTML
// page that immediately POSTs the login form. Student lands on the
// quiz page; parent returns here to see the score once submitted.

import { Tile } from "@/components/parent-ui";

export type OnlineTestState =
  | { state: "not_started" }
  | { state: "in_progress" }
  | { state: "finished"; score: number; maxScore: number; percentage: number };

type Props = {
  /** Neo4j Student id. Passed into the launch URL. */
  studentId: string;
  /** For the heading — "Open test for Fatima". */
  firstName: string;
  /** "IIHS" or "IISS" — shown as the eyebrow + determines quiz. */
  schoolShortName: string;
  /** Current Moodle attempt state. Defaults to not_started if omitted. */
  status?: OnlineTestState;
  /** i18n helper from getServerI18n. */
  t: (key: string, values?: Record<string, string | number>) => string;
};

export function ParentOnlineTestCard({
  studentId,
  firstName,
  schoolShortName,
  status = { state: "not_started" },
  t,
}: Props) {
  const launchHref = `/api/me/students/${encodeURIComponent(studentId)}/moodle-launch`;

  // Finished — celebrate + show score. Uses the "celebrate" tile
  // variant (pastel confetti backdrop) so it feels like a milestone
  // rather than a transactional status row.
  if (status.state === "finished") {
    const passed = status.percentage >= 60;
    return (
      <Tile variant="celebrate">
        <div className="parent-confetti" aria-hidden="true" />
        <div className="relative flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-strong)]">
              {t("parent.detail.schedule.online_eyebrow", {
                school: schoolShortName,
              })}
            </p>
            <h2 className="parent-text-serif mt-2 text-[clamp(22px,4vw,28px)] leading-tight">
              {passed
                ? t("parent.detail.schedule.online_done_passed_title", { name: firstName })
                : t("parent.detail.schedule.online_done_title", { name: firstName })}
            </h2>
          </div>

          <div className="flex items-baseline gap-3 rounded-2xl bg-white/70 px-5 py-4 shadow-sm">
            <span className="parent-text-serif text-[clamp(36px,7vw,56px)] font-semibold leading-none text-[color:var(--brand-strong)]">
              {status.score}
            </span>
            <span className="text-[clamp(18px,3.5vw,24px)] text-[color:var(--ink-500)]">
              / {status.maxScore}
            </span>
            <span className="ml-auto rounded-full bg-[color:var(--brand-strong)] px-3 py-1 text-xs font-semibold text-white">
              {status.percentage}%
            </span>
          </div>

          <p className="text-[15px] leading-relaxed text-[color:var(--ink-700)]">
            {passed
              ? t("parent.detail.schedule.online_done_passed_body", { name: firstName })
              : t("parent.detail.schedule.online_done_body")}
          </p>
        </div>
      </Tile>
    );
  }

  // In progress — student is mid-attempt. Offer a "return to test"
  // link so the student (or parent) can resume from a different tab
  // or after a brief disconnect.
  if (status.state === "in_progress") {
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
              {t("parent.detail.schedule.online_inprogress_title", { name: firstName })}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--ink-500)]">
              {t("parent.detail.schedule.online_inprogress_body", { name: firstName })}
            </p>
          </div>
          <a
            href={launchHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--brand-strong)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--brand-strong-hover,#247b5a)]"
          >
            {t("parent.detail.schedule.online_inprogress_cta")}
            <span aria-hidden="true" className="ml-2">
              →
            </span>
          </a>
        </div>
      </Tile>
    );
  }

  // not_started — default. Hero card with three selling-point bullets
  // + the big "Open test" CTA. Copy makes clear the student takes
  // the test (not the parent), and that the parent hands the device
  // over once the page loads.
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
            {t("parent.detail.schedule.online_body", { name: firstName })}
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
