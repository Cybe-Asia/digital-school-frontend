// Moodle test launch endpoint.
//
// GET /api/me/students/{studentId}/moodle-launch
//
// Called from the parent dashboard's "Take Online Test" button.
// Returns an HTTP 302 to a one-shot auth_userkey login URL that
// drops the student directly on the quiz page after silently
// authenticating against Moodle. No form submission, no password
// in the browser, no CSRF/logintoken juggling.
//
// Auth: requires the ds-session cookie. We call admission-service
// /me to confirm the current parent owns this student before
// asking Moodle for the SSO URL.

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

  // 3. Ensure user exists in Moodle + enroled; get SSO URL.
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

  // 4. Redirect the browser straight to Moodle's auth_userkey login.
  //    The key is single-use and expires in 60 s, so caching the
  //    redirect would be a bug. No HTML body needed — this endpoint
  //    is opened in a new tab so the browser will just follow the
  //    302 transparently.
  void escAttr; // previously used for the HTML form; retained import.
  void first;
  void school;
  return new Response(null, {
    status: 302,
    headers: {
      Location: launch.ssoUrl,
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Frame-Options": "DENY",
    },
  });
}
