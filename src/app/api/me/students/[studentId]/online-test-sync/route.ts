// Parent-dashboard-triggered sync of the student's Moodle attempt.
//
// POST /api/me/students/{studentId}/online-test-sync
//
// Proxies to admission-service:
//   POST /api/leads/v1/me/students/{studentId}/online-test/sync
//
// which pulls the Moodle attempt state + writes back to Neo4j +
// cascades applicantStatus from test_pending -> test_completed
// on the first finished attempt. Returns the same state shape
// the frontend's ParentOnlineTestCard consumes.
//
// Called by the ScheduleScreen server component on every render
// (after payment confirmed, before the test has advanced past
// test_completed). Idempotent — repeated calls with the same
// attempt state are no-ops beyond the updatedAt bump.

import { proxyToAdmission } from "@/lib/admission-proxy";

export const POST = (req: Request, ctx: { params: Promise<{ studentId: string }> }) =>
  proxyToAdmission(
    "POST",
    req,
    ctx,
    "/me/students/{studentId}/online-test/sync",
  );
