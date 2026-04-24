// Poll the student's current Moodle attempt state.
//
// GET /api/me/students/{studentId}/test-status
// → 200 { state: "not_started" | "in_progress" | "finished",
//         score?, maxScore?, percentage? }
//
// Called by the parent dashboard after the student returns from
// Moodle, to decide whether to show "Test in progress", "Score 4/5",
// or "Take the test". No attempt state is persisted in our DB yet —
// Moodle is the source of truth for the MVP. A later iteration will
// shadow the score onto the Student node so admin views don't need
// a live Moodle hop.

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import { fetchMoodleAttemptStatus, pickSchool, type MoodleSchool } from "@/lib/moodle-client";

const SESSION_COOKIE_NAME = "ds-session";

type ParentMeStudent = {
  studentId: string;
  dateOfBirth?: string;
  targetSchool?: string | null;
  email?: string;
};

type ParentMePayload = { lead?: unknown; students?: ParentMeStudent[] };

function schoolFor(s: ParentMeStudent): MoodleSchool {
  const target = (s.targetSchool ?? "").toUpperCase();
  if (target.includes("IIHS")) return "IIHS";
  if (target.includes("IISS")) return "IISS";
  return pickSchool(s.dateOfBirth);
}

type RouteCtx = { params: Promise<{ studentId: string }> };

export async function GET(_req: Request, ctx: RouteCtx): Promise<Response> {
  const { studentId } = await ctx.params;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { admission } = getServerServiceEndpoints();
  let me: ParentMePayload | null = null;
  try {
    const upstream = await fetch(`${admission}/me`, {
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
        error: "Admission /me failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }

  const student = me?.students?.find((s) => s.studentId === studentId);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const studentEmail = student.email ?? `s-${studentId}@cybe.tech`;
  const school = schoolFor(student);
  try {
    const status = await fetchMoodleAttemptStatus(studentEmail, school);
    return NextResponse.json({ ...status, school });
  } catch (err) {
    // Moodle might be down or misconfigured. Don't blow up the
    // whole dashboard — surface a benign "not started" so the
    // parent still sees the Take Test button.
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { state: "not_started", school, error: "Failed to fetch status", detail },
      { status: 200 },
    );
  }
}
