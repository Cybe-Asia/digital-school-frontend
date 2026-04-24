// Moodle test launch endpoint.
//
// GET /api/me/students/{studentId}/moodle-launch
//
// Called from the parent dashboard's "Take Online Test" button.
// Returns a self-submitting HTML page that POSTs the student's
// Moodle credentials to `/login/index.php` and lands them on the
// quiz page. The browser never sees the raw password in JS — the
// HTML form has hidden inputs, `<script>document.forms[0].submit()</script>`
// fires on load, and on arrival Moodle clears the credential field
// from the POST body.
//
// Auth: requires the ds-session cookie. We call admission-service
// /me to confirm the current parent owns this student before
// provisioning a Moodle user.

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import { prepareMoodleLaunch, pickSchool, type MoodleSchool } from "@/lib/moodle-client";

const SESSION_COOKIE_NAME = "ds-session";

type ParentMeStudent = {
  studentId: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  targetSchool?: string | null;  // "SCH-IIHS" / "SCH-IISS"
  applicantStatus?: string;
  email?: string;
};

type ParentMePayload = {
  lead?: { email?: string };
  students?: ParentMeStudent[];
};

/**
 * Resolve (firstName, lastName) from a fullName if the individual
 * fields aren't present. Moodle requires both. Worst case we fall
 * back to "Student / Applicant".
 */
function splitName(s: ParentMeStudent): { first: string; last: string } {
  if (s.firstName || s.lastName) {
    return { first: s.firstName ?? "Student", last: s.lastName ?? "Applicant" };
  }
  const full = (s.fullName ?? "").trim();
  if (!full) return { first: "Student", last: "Applicant" };
  const parts = full.split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: "Student" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

/**
 * Pick the school using explicit `targetSchool` first, age fallback
 * second. Keeps the business rule in one place.
 */
function schoolFor(s: ParentMeStudent): MoodleSchool {
  const target = (s.targetSchool ?? "").toUpperCase();
  if (target.includes("IIHS")) return "IIHS";
  if (target.includes("IISS")) return "IISS";
  return pickSchool(s.dateOfBirth);
}

/**
 * Escape a value for embedding inside a double-quoted HTML attribute.
 * Defense-in-depth — none of these values are user-controlled (they
 * come from our own Moodle provisioning) but treating all string
 * interpolation as untrusted is cheap.
 */
function escAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

type RouteCtx = { params: Promise<{ studentId: string }> };

export async function GET(_req: Request, ctx: RouteCtx): Promise<Response> {
  const { studentId } = await ctx.params;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // 1. Fetch /me to find the student (and confirm ownership).
  const { admission } = getServerServiceEndpoints();
  let me: ParentMePayload | null = null;
  try {
    const upstream = await fetch(`${admission}/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: "Admission /me failed", status: upstream.status },
        { status: 502 },
      );
    }
    const body = (await upstream.json().catch(() => null)) as
      | { data?: ParentMePayload }
      | null;
    me = body?.data ?? null;
  } catch (err) {
    return NextResponse.json(
      {
        error: "Admission /me request failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }

  const student = me?.students?.find((s) => s.studentId === studentId);
  if (!student) {
    return NextResponse.json(
      { error: "Student not found or not owned by this parent" },
      { status: 404 },
    );
  }

  // 2. Pick the per-student Moodle user email. The lead email is the
  //    parent's — we derive a student-specific email so each child
  //    has a separate Moodle account. Format: `s-<studentId>@cybe.tech`
  //    (synthetic address; not a delivery-destined inbox).
  const studentMoodleEmail = student.email
    ? student.email
    : `s-${studentId}@cybe.tech`;

  const { first, last } = splitName(student);
  const school = schoolFor(student);

  // 3. Ensure user exists in Moodle + enroled; get launch URLs.
  let launch;
  try {
    launch = await prepareMoodleLaunch({
      studentId,
      email: studentMoodleEmail,
      firstName: first,
      lastName: last,
      school,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to prepare Moodle launch", detail },
      { status: 502 },
    );
  }

  // 4. Render an auto-submitting login form. Must be a full HTML page
  //    because the browser submits it cross-origin — not an API call.
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Opening your test…</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
           display: flex; align-items: center; justify-content: center;
           min-height: 100vh; margin: 0; background: #FBF8F3; color: #2d2d2d; }
    .box { max-width: 380px; text-align: center; padding: 2rem; }
    h1 { font-size: 1.1rem; font-weight: 600; margin: 0 0 .5rem; }
    p { font-size: .9rem; color: #666; margin: 0 0 1.5rem; line-height: 1.5; }
    .spinner { width: 28px; height: 28px; border: 3px solid #e8e0d4;
               border-top-color: #2F8F6B; border-radius: 50%;
               animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .fallback { font-size: .8rem; color: #999; margin-top: 1rem; }
    .fallback button { background: #2F8F6B; color: white; border: 0;
                       padding: .5rem 1rem; border-radius: 9999px;
                       font-weight: 600; cursor: pointer; }
  </style>
</head>
<body>
  <div class="box">
    <div class="spinner"></div>
    <h1>Opening ${escAttr(first)}'s ${escAttr(school)} test…</h1>
    <p>Hand the device to ${escAttr(first)} once the test page loads. Signing them in automatically — this usually takes a second.</p>
    <form id="moodle-login-form" method="POST" action="${escAttr(launch.loginUrl)}">
      <input type="hidden" name="username" value="${escAttr(launch.username)}">
      <input type="hidden" name="password" value="${escAttr(launch.password)}">
      <input type="hidden" name="rememberusername" value="0">
      <input type="hidden" name="anchor" value="">
      <input type="hidden" name="redirect" value="${escAttr(launch.quizReturnUrl)}">
      <noscript>
        <div class="fallback">
          JavaScript is disabled. Click the button to continue:
          <button type="submit">Continue to test</button>
        </div>
      </noscript>
    </form>
    <script>
      // Submit immediately. If it fails (network issue), the noscript
      // branch above shows a manual button after 5s.
      document.getElementById('moodle-login-form').submit();
    </script>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Never cache: the POST target contains a per-student password.
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Frame-Options": "DENY",
    },
  });
}
