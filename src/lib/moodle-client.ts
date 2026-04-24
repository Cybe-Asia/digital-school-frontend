// Moodle LMS integration — server-only helpers for the admissions
// online-test flow. The parent portal hands students off to Moodle's
// quiz engine; this module owns every call to Moodle's REST API
// (user provisioning, enrolment, attempt lookups, score fetches).
//
// Architecture notes:
//  - The frontend pod calls Moodle over the cluster-internal service
//    (`http://moodle:80`). Moodle reads HTTP_HOST to build URLs, so
//    we send the public hostname as Host header — that way any URL
//    Moodle echoes back (assets, redirects) points at the public
//    domain the browser can reach.
//  - Moodle passwords for students are derived deterministically from
//    a per-env salt + the student's admission id. The password is
//    never exposed to the browser — the login form is server-rendered
//    and auto-submitted from the admission-service-issued HTML page.
//  - IIHS (senior high, grades 10-12) and IISS (junior high, grades
//    7-9) each have a dedicated Moodle course + quiz. Which one a
//    student gets is decided by their age (computed from DOB) and/or
//    their schoolSelection. Defaults: age >= 15 → IIHS, else IISS.
//
// Env vars expected (set in the frontend deployment manifest):
//   MOODLE_INTERNAL_URL      internal base, e.g. "http://moodle:80"
//   MOODLE_PUBLIC_URL        public base, e.g. "http://school-test-moodle.cybe.tech"
//   MOODLE_API_TOKEN         web-service token for `admissionsvc` user
//   MOODLE_STUDENT_PASSWORD_SALT   random secret, never logged
//   MOODLE_IIHS_COURSE_ID    int — Moodle course id for IIHS test
//   MOODLE_IIHS_QUIZ_CMID    int — course module id of the IIHS quiz
//   MOODLE_IISS_COURSE_ID    int — Moodle course id for IISS test
//   MOODLE_IISS_QUIZ_CMID    int — course module id of the IISS quiz

import { createHash } from "node:crypto";
import * as http from "node:http";
import * as https from "node:https";

/** School selection / age band → which Moodle course to enrol. */
export type MoodleSchool = "IIHS" | "IISS";

export type MoodleConfig = {
  internalUrl: string;
  publicUrl: string;
  apiToken: string;
  passwordSalt: string;
  iihsCourseId: number;
  iihsQuizCmid: number;
  iissCourseId: number;
  iissQuizCmid: number;
};

/**
 * Read Moodle config from process.env. Throws if a required var is
 * missing — we surface configuration holes loudly at call time rather
 * than producing silent HTTP failures.
 */
export function getMoodleConfig(): MoodleConfig {
  const required = {
    MOODLE_INTERNAL_URL: process.env.MOODLE_INTERNAL_URL,
    MOODLE_PUBLIC_URL: process.env.MOODLE_PUBLIC_URL,
    MOODLE_API_TOKEN: process.env.MOODLE_API_TOKEN,
    MOODLE_STUDENT_PASSWORD_SALT: process.env.MOODLE_STUDENT_PASSWORD_SALT,
    MOODLE_IIHS_COURSE_ID: process.env.MOODLE_IIHS_COURSE_ID,
    MOODLE_IIHS_QUIZ_CMID: process.env.MOODLE_IIHS_QUIZ_CMID,
    MOODLE_IISS_COURSE_ID: process.env.MOODLE_IISS_COURSE_ID,
    MOODLE_IISS_QUIZ_CMID: process.env.MOODLE_IISS_QUIZ_CMID,
  };
  const missing = Object.entries(required)
    .filter(([, v]) => !v || !String(v).trim())
    .map(([k]) => k);
  if (missing.length > 0) {
    throw new Error(
      `Moodle integration not configured. Missing env vars: ${missing.join(", ")}`,
    );
  }
  return {
    internalUrl: required.MOODLE_INTERNAL_URL!.replace(/\/$/, ""),
    publicUrl: required.MOODLE_PUBLIC_URL!.replace(/\/$/, ""),
    apiToken: required.MOODLE_API_TOKEN!,
    passwordSalt: required.MOODLE_STUDENT_PASSWORD_SALT!,
    iihsCourseId: Number(required.MOODLE_IIHS_COURSE_ID),
    iihsQuizCmid: Number(required.MOODLE_IIHS_QUIZ_CMID),
    iissCourseId: Number(required.MOODLE_IISS_COURSE_ID),
    iissQuizCmid: Number(required.MOODLE_IISS_QUIZ_CMID),
  };
}

/**
 * Derive a deterministic password for a Moodle student account.
 *
 * The student never needs to know this password — it's only used by
 * the admission-service's server-side HTML form that auto-submits
 * Moodle's login. Regenerating from the same studentId + salt always
 * produces the same password, so we can re-provision idempotently.
 *
 * Moodle requires min 8 chars including an uppercase, lowercase,
 * digit and symbol — we fix a known compliant prefix + append the
 * hash to satisfy that.
 */
export function deriveMoodlePassword(studentId: string, salt: string): string {
  const hash = createHash("sha256")
    .update(`${salt}:${studentId}`)
    .digest("hex")
    .slice(0, 20);
  return `Adm!${hash}`;
}

/**
 * Pick which school's quiz a student should take. Business rule,
 * easy to override per-env later:
 *   - Age >= 15 → IIHS (senior high)
 *   - Age 12..14 → IISS (junior high)
 *   - Age < 12 → IISS anyway for now (school typically won't offer
 *     online test for this age; UI should gate before getting here)
 */
export function pickSchool(dateOfBirth: string | null | undefined): MoodleSchool {
  if (!dateOfBirth) return "IISS";
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return "IISS";
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const mDiff = now.getMonth() - dob.getMonth();
  if (mDiff < 0 || (mDiff === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age >= 15 ? "IIHS" : "IISS";
}

/** Build the pair of (courseId, quizCmid) for a school selection. */
export function courseForSchool(
  school: MoodleSchool,
  cfg: MoodleConfig,
): { courseId: number; quizCmid: number } {
  return school === "IIHS"
    ? { courseId: cfg.iihsCourseId, quizCmid: cfg.iihsQuizCmid }
    : { courseId: cfg.iissCourseId, quizCmid: cfg.iissQuizCmid };
}

/** Derived Moodle username from student email — lowercase, safe chars. */
export function moodleUsernameFor(studentEmail: string): string {
  return studentEmail.toLowerCase().replace(/[^a-z0-9._-]/g, "-").slice(0, 100);
}

type MoodleApiBody = Record<string, string | number | undefined>;

/**
 * Low-level REST call to Moodle. All Moodle web-service endpoints
 * share one base URL + token scheme; this wraps the boilerplate.
 *
 * Uses Node's raw `http`/`https` module instead of `fetch` for ONE
 * critical reason: we need to set the Host header to the public
 * Moodle hostname so Moodle's wwwroot canonicalization doesn't
 * redirect us. The Fetch standard intentionally forbids setting the
 * Host header (it's derived from the URL), but Moodle inside the
 * cluster is reached at `http://moodle:80` — if Moodle sees
 * `Host: moodle`, it 303-redirects to the canonical
 * `https://school-test-moodle.cybe.tech/...` and we end up trying
 * to follow a cert chain the pod doesn't trust (lab-ca).
 *
 * Passing Host explicitly via http.request makes Moodle see the
 * canonical host on the first hop and respond without redirect.
 * X-Forwarded-Proto: https goes along so sslproxy in Moodle accepts
 * the request as TLS-terminated already.
 */
function moodleRest<T>(
  cfg: MoodleConfig,
  wsfunction: string,
  body: MoodleApiBody,
): Promise<T> {
  const form = new URLSearchParams();
  form.set("wstoken", cfg.apiToken);
  form.set("wsfunction", wsfunction);
  form.set("moodlewsrestformat", "json");
  for (const [k, v] of Object.entries(body)) {
    if (v !== undefined && v !== null) form.set(k, String(v));
  }
  const bodyStr = form.toString();

  const internalUrl = new URL(cfg.internalUrl);
  const publicHost = new URL(cfg.publicUrl).host;
  const useTls = internalUrl.protocol === "https:";
  const transport = useTls ? https : http;

  return new Promise<T>((resolve, reject) => {
    const req = transport.request(
      {
        host: internalUrl.hostname,
        port: internalUrl.port
          ? Number(internalUrl.port)
          : useTls
          ? 443
          : 80,
        path: "/webservice/rest/server.php",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(bodyStr),
          // Override Host so Moodle sees the canonical public name,
          // not the in-cluster service name.
          "Host": publicHost,
          // Tell Moodle (with sslproxy=true) that this request is
          // already HTTPS-terminated upstream — so it doesn't redirect.
          "X-Forwarded-Proto": "https",
          "X-Forwarded-Host": publicHost,
        },
        // Intranet self-signed cert acceptance is irrelevant here
        // because internalUrl is plain http://moodle. Kept explicit
        // in case someone flips internalUrl to https:// later.
        rejectUnauthorized: false,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          if (!res.statusCode || res.statusCode >= 400) {
            reject(
              new Error(
                `Moodle ${wsfunction} HTTP ${res.statusCode}: ${raw.slice(
                  0,
                  200,
                )}`,
              ),
            );
            return;
          }
          // Moodle returns 303 with an HTML "Redirect" page when it
          // disagrees with our Host header. Treat that as an error
          // so we don't try to JSON-parse HTML.
          if (res.statusCode >= 300 && res.statusCode < 400) {
            reject(
              new Error(
                `Moodle ${wsfunction} unexpected redirect: ${res.statusCode} -> ${
                  res.headers.location ?? "(no location)"
                }`,
              ),
            );
            return;
          }
          let parsed: unknown;
          try {
            parsed = JSON.parse(raw);
          } catch (e) {
            reject(
              new Error(
                `Moodle ${wsfunction} non-JSON response: ${raw.slice(0, 200)}`,
              ),
            );
            return;
          }
          if (
            parsed &&
            typeof parsed === "object" &&
            "exception" in (parsed as Record<string, unknown>)
          ) {
            const err = parsed as { exception?: string; message?: string };
            reject(
              new Error(
                `Moodle ${wsfunction} failed: ${err.exception ?? ""} ${
                  err.message ?? ""
                }`.trim(),
              ),
            );
            return;
          }
          resolve(parsed as T);
        });
      },
    );
    req.on("error", (e) => reject(e));
    req.write(bodyStr);
    req.end();
  });
}

type MoodleUser = { id: number; username: string; email?: string };

/**
 * Look up a Moodle user by email. Returns null if not found. Uses
 * `core_user_get_users_by_field` which takes an array of values and
 * returns matches.
 */
async function findMoodleUserByEmail(
  cfg: MoodleConfig,
  email: string,
): Promise<MoodleUser | null> {
  const body: MoodleApiBody = {
    field: "email",
    "values[0]": email,
  };
  const list = await moodleRest<MoodleUser[]>(cfg, "core_user_get_users_by_field", body);
  return list.length > 0 ? list[0] : null;
}

/**
 * Ensure a Moodle user exists for the given student. Creates the
 * user (deterministic password) if missing; returns the Moodle id
 * either way. Safe to call repeatedly.
 */
async function ensureMoodleUser(
  cfg: MoodleConfig,
  studentId: string,
  email: string,
  firstName: string,
  lastName: string,
): Promise<{ userId: number; username: string; password: string }> {
  const username = moodleUsernameFor(email);
  const password = deriveMoodlePassword(studentId, cfg.passwordSalt);

  const existing = await findMoodleUserByEmail(cfg, email);
  if (existing) {
    return { userId: existing.id, username: existing.username, password };
  }

  const body: MoodleApiBody = {
    "users[0][username]": username,
    "users[0][password]": password,
    "users[0][firstname]": firstName || "Student",
    "users[0][lastname]": lastName || "Applicant",
    "users[0][email]": email,
    "users[0][auth]": "manual",
  };
  const created = await moodleRest<Array<{ id: number; username: string }>>(
    cfg,
    "core_user_create_users",
    body,
  );
  if (!created || created.length === 0) {
    throw new Error("Moodle core_user_create_users returned no user");
  }
  return { userId: created[0].id, username: created[0].username, password };
}

/**
 * Enrol a user into a course with the student role (id 5). Idempotent
 * — Moodle silently ignores duplicate enrolments.
 */
async function enrolUserInCourse(
  cfg: MoodleConfig,
  userId: number,
  courseId: number,
): Promise<void> {
  const body: MoodleApiBody = {
    // roleid 5 = 'student' in every default Moodle install
    "enrolments[0][roleid]": 5,
    "enrolments[0][userid]": userId,
    "enrolments[0][courseid]": courseId,
  };
  await moodleRest<unknown>(cfg, "enrol_manual_enrol_users", body);
}

export type MoodleLaunchContext = {
  studentId: string;
  email: string;
  firstName: string;
  lastName: string;
  school: MoodleSchool;
};

export type MoodleLaunchResult = {
  /**
   * One-shot auth_userkey URL. When the student's browser visits it,
   * Moodle logs them in and (via the internal `wantsurl` param built
   * into the URL) drops them on the quiz page. No form submission,
   * no credentials in the client. Single-use: consuming the URL
   * invalidates the key.
   */
  ssoUrl: string;
};

/**
 * Request a one-shot auth_userkey login URL from Moodle via the
 * web-service API. Under the hood this:
 *   - Ensures the target user exists in Moodle (creates if absent,
 *     since the plugin is configured with createuser=1).
 *   - Generates a time-bound key (60 s) tied to the student's email.
 *   - Returns a fully-qualified login URL that, when visited, logs
 *     the student in and redirects to `wantsUrl`.
 */
async function requestUserKeyLoginUrl(
  cfg: MoodleConfig,
  email: string,
  firstName: string,
  lastName: string,
  wantsUrl: string,
): Promise<string> {
  // Synthetic username matching what the rest of our code expects
  // (derived from email). The plugin uses `mappingfield=email` so
  // username is cosmetic; we still pass it so user creation is
  // deterministic.
  const username = moodleUsernameFor(email);
  const body: MoodleApiBody = {
    "user[email]": email,
    "user[firstname]": firstName || "Student",
    "user[lastname]": lastName || "Applicant",
    "user[username]": username,
  };
  const resp = await moodleRest<{ loginurl?: string }>(
    cfg,
    "auth_userkey_request_login_url",
    body,
  );
  if (!resp.loginurl) {
    throw new Error(
      "Moodle auth_userkey returned no loginurl; check plugin config",
    );
  }
  // Append wantsurl so Moodle post-login lands on the quiz. The
  // plugin's login.php honours this query param.
  const url = new URL(resp.loginurl);
  url.searchParams.set("wantsurl", wantsUrl);
  return url.toString();
}

/**
 * End-to-end "prepare for quiz" flow:
 *   1. Ensure Moodle user exists + enrol in the right course.
 *   2. Ask auth_userkey for a one-shot login URL that lands on
 *      the quiz page.
 *
 * The caller just redirects the browser to the returned URL. No
 * credentials in client HTML, no form auto-submit, no Moodle CSRF
 * concerns.
 */
export async function prepareMoodleLaunch(
  ctx: MoodleLaunchContext,
): Promise<MoodleLaunchResult> {
  const cfg = getMoodleConfig();
  const user = await ensureMoodleUser(
    cfg,
    ctx.studentId,
    ctx.email,
    ctx.firstName,
    ctx.lastName,
  );
  const { courseId, quizCmid } = courseForSchool(ctx.school, cfg);
  await enrolUserInCourse(cfg, user.userId, courseId);

  const quizReturnUrl = `${cfg.publicUrl}/mod/quiz/view.php?id=${quizCmid}`;
  const ssoUrl = await requestUserKeyLoginUrl(
    cfg,
    ctx.email,
    ctx.firstName,
    ctx.lastName,
    quizReturnUrl,
  );
  return { ssoUrl };
}

/** Attempt state for a single student on a single quiz. */
export type MoodleAttemptStatus =
  | { state: "not_started" }
  | { state: "in_progress" }
  | { state: "finished"; score: number; maxScore: number; percentage: number };

type MoodleAttempt = {
  id: number;
  state: "inprogress" | "overdue" | "finished" | "abandoned";
  sumgrades: number | null;
};

type MoodleQuiz = {
  id: number;
  sumgrades: number;
  grade: number;
};

/**
 * Pull the student's latest attempt score from Moodle. Returns a
 * normalized status so the UI can branch on a small enum. If the
 * student has no attempts yet, returns { state: "not_started" }.
 *
 * Error handling: any failure throws; caller decides UI fallback
 * (usually "we couldn't fetch the score — please refresh").
 */
export async function fetchMoodleAttemptStatus(
  studentEmail: string,
  school: MoodleSchool,
): Promise<MoodleAttemptStatus> {
  const cfg = getMoodleConfig();
  const user = await findMoodleUserByEmail(cfg, studentEmail);
  if (!user) return { state: "not_started" };

  const { courseId, quizCmid } = courseForSchool(school, cfg);
  // Quiz id (instance id) from the cmid — we look it up via the course.
  const quizzesResp = await moodleRest<{ quizzes: MoodleQuiz[] }>(
    cfg,
    "mod_quiz_get_quizzes_by_courses",
    { "courseids[0]": courseId },
  );
  const quiz = quizzesResp.quizzes?.[0];
  if (!quiz) {
    throw new Error(`No quiz found in Moodle course ${courseId}`);
  }

  const attempts = await moodleRest<{ attempts: MoodleAttempt[] }>(
    cfg,
    "mod_quiz_get_user_attempts",
    {
      userid: user.id,
      quizid: quiz.id,
      // Include all states so we can surface 'in progress' to the UI.
      status: "all",
    },
  );
  if (!attempts.attempts || attempts.attempts.length === 0) {
    return { state: "not_started" };
  }
  // Latest attempt = highest id.
  const latest = attempts.attempts.sort((a, b) => b.id - a.id)[0];
  if (latest.state === "inprogress" || latest.state === "overdue") {
    return { state: "in_progress" };
  }
  const score = latest.sumgrades ?? 0;
  const maxScore = quiz.sumgrades ?? 5;
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  return { state: "finished", score, maxScore, percentage };
  // Note: quizCmid is unused here but kept in scope so future code can
  // return it for deep-linking into Moodle's review page.
  void quizCmid;
}
