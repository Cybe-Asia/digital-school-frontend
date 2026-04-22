import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import { StatusBadge } from "@/features/admissions-common/status-badge";

export const metadata: Metadata = {
  title: "Applicant Detail | Admin",
};

const SESSION_COOKIE_NAME = "ds-session";

type ApiEnvelope<T> = { responseCode: number; responseMessage: string; data?: T };

type Overview = {
  student: {
    studentId: string;
    leadId: string;
    fullName: string;
    dateOfBirth: string;
    currentSchool: string;
    targetGradeLevel: string;
    notes?: string;
    applicantStatus: string;
    applicationMode: string;
    ageAtApplication?: number | null;
    createdAt: string;
    updatedAt: string;
  };
  lead: {
    lead_id: string;
    parent_name: string;
    email: string;
    whatsapp: string;
    target_school_preference: string;
    status: string;
    eoi_submitted_at: string;
  };
  application?: {
    applicationId: string;
    applicationCode: string;
    status: string;
  } | null;
  tests: Array<{
    testSessionId: string;
    testScheduleId: string;
    studentId: string;
    bookedAt: string;
    attendanceStatus: string;
    status: string;
  }>;
  documents: Array<{
    request: {
      documentRequestId: string;
      requestType: string;
      requiredDocumentTypes: string;
      status: string;
      dueAt?: string | null;
      createdAt: string;
    };
    artifacts: Array<{
      documentArtifactId: string;
      documentType: string;
      fileName: string;
      sizeBytes: number;
      status: string;
      uploadedAt: string;
    }>;
  }>;
  decisions: Array<{
    admissionDecisionId: string;
    decisionType: string;
    decisionStatus: string;
    decisionNotes?: string | null;
    decidedAt: string;
    decidedBy?: string | null;
  }>;
  offer?: {
    offerId: string;
    offerCode: string;
    status: string;
    targetSchoolId?: string;
    targetYearGroup?: string | null;
    academicYear?: string | null;
    issuedAt?: string | null;
    acceptanceDueAt?: string | null;
  } | null;
  offerAcceptance?: {
    offerAcceptanceId: string;
    status: string;
    respondedAt: string;
    declineReason?: string | null;
  } | null;
  enrolledStudent?: {
    studentId: string;
    studentNumber: string;
    schoolId: string;
    yearGroup?: string | null;
    status: string;
    enrolmentDate: string;
  } | null;
  timeline: Array<{ at: string; kind: string; message: string }>;
};

type TabKey = "overview" | "tests" | "documents" | "decisions" | "offer" | "enrolment" | "timeline";
const TAB_ORDER: TabKey[] = ["overview", "tests", "documents", "decisions", "offer", "enrolment", "timeline"];

type SP = Record<string, string | string[] | undefined>;

export default async function AdminApplicantDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SP>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const tabRaw = typeof sp.tab === "string" ? sp.tab : "overview";
  const tab: TabKey = (TAB_ORDER as string[]).includes(tabRaw) ? (tabRaw as TabKey) : "overview";

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-sm text-[var(--ds-text-primary)]">
        Please log in first.
      </div>
    );
  }

  const { admission } = getServerServiceEndpoints();
  let payload: ApiEnvelope<Overview> | null = null;
  let httpStatus = 0;
  try {
    const res = await fetch(
      `${admission}/admin/students/${encodeURIComponent(id)}/overview`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
    );
    httpStatus = res.status;
    payload = (await res.json().catch(() => null)) as ApiEnvelope<Overview> | null;
  } catch {
    // upstream down
  }

  if (httpStatus === 403) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-sm">
        <h1 className="text-xl font-semibold">Admin access required</h1>
      </div>
    );
  }
  if (!payload?.data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-sm">
        <h1 className="text-xl font-semibold">Applicant not found</h1>
        <p className="mt-2 text-[var(--ds-text-secondary)]">{payload?.responseMessage || `HTTP ${httpStatus}`}</p>
        <Link href="/admin/admissions/applications" className="mt-3 inline-block text-sm text-[var(--ds-primary)]">
          ← Back to applications
        </Link>
      </div>
    );
  }

  const o = payload.data;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <nav className="mb-3 text-xs">
        <Link
          href={`/admin/admissions/applications/${encodeURIComponent(o.lead.lead_id)}`}
          className="text-[var(--ds-primary)] hover:underline"
        >
          ← Back to application
        </Link>
      </nav>

      <header className="mb-4 rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
              Applicant
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-[var(--ds-text-primary)]">{o.student.fullName}</h1>
            <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">
              {o.student.targetGradeLevel} · {o.lead.target_school_preference}
              {typeof o.student.ageAtApplication === "number" ? ` · age ${o.student.ageAtApplication}` : ""}
            </p>
            <p className="mt-1 text-xs text-[var(--ds-text-secondary)]">
              Parent: {o.lead.parent_name} · {o.lead.email} · {o.lead.whatsapp}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge status={o.student.applicantStatus} />
            {o.application ? <StatusBadge status={o.application.status} size="sm" /> : null}
            {o.enrolledStudent ? (
              <StatusBadge status="enrolled" size="sm" label={`🎓 ${o.enrolledStudent.studentNumber}`} />
            ) : null}
          </div>
        </div>
      </header>

      <nav className="mb-4 flex flex-wrap gap-2 text-xs">
        {TAB_ORDER.map((t) => {
          const active = t === tab;
          return (
            <Link
              key={t}
              href={`?tab=${t}`}
              className={`rounded-lg border px-3 py-1.5 font-semibold ${
                active
                  ? "border-[var(--ds-primary)] bg-[var(--ds-primary)]/10 text-[var(--ds-primary)]"
                  : "border-[var(--ds-border)] bg-[var(--ds-surface)] text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)]"
              }`}
            >
              {labelFor(t)}{badgeFor(t, o)}
            </Link>
          );
        })}
      </nav>

      <section className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5">
        {tab === "overview" ? <OverviewTab o={o} /> : null}
        {tab === "tests" ? <TestsTab tests={o.tests} /> : null}
        {tab === "documents" ? <DocumentsTab documents={o.documents} /> : null}
        {tab === "decisions" ? <DecisionsTab decisions={o.decisions} /> : null}
        {tab === "offer" ? <OfferTab o={o.offer ?? null} a={o.offerAcceptance ?? null} /> : null}
        {tab === "enrolment" ? <EnrolmentTab e={o.enrolledStudent ?? null} /> : null}
        {tab === "timeline" ? <TimelineTab events={o.timeline} /> : null}
      </section>
    </div>
  );
}

function labelFor(t: TabKey): string {
  switch (t) {
    case "overview": return "Overview";
    case "tests": return "Tests";
    case "documents": return "Documents";
    case "decisions": return "Decisions";
    case "offer": return "Offer";
    case "enrolment": return "Enrolment";
    case "timeline": return "Timeline";
  }
}

function badgeFor(t: TabKey, o: Overview): string {
  switch (t) {
    case "tests": return o.tests.length > 0 ? ` (${o.tests.length})` : "";
    case "documents": return o.documents.length > 0 ? ` (${o.documents.length})` : "";
    case "decisions": return o.decisions.length > 0 ? ` (${o.decisions.length})` : "";
    case "offer": return o.offer ? " ✓" : "";
    case "enrolment": return o.enrolledStudent ? " 🎓" : "";
    case "timeline": return o.timeline.length > 0 ? ` (${o.timeline.length})` : "";
    default: return "";
  }
}

function OverviewTab({ o }: { o: Overview }) {
  const s = o.student;
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
      <dt className="text-[var(--ds-text-secondary)]">Student ID</dt>
      <dd className="font-mono text-xs text-[var(--ds-text-primary)]">{s.studentId}</dd>
      <dt className="text-[var(--ds-text-secondary)]">Date of birth</dt>
      <dd className="text-[var(--ds-text-primary)]">{s.dateOfBirth}</dd>
      <dt className="text-[var(--ds-text-secondary)]">Current school</dt>
      <dd className="text-[var(--ds-text-primary)]">{s.currentSchool}</dd>
      <dt className="text-[var(--ds-text-secondary)]">Target grade</dt>
      <dd className="text-[var(--ds-text-primary)]">{s.targetGradeLevel}</dd>
      <dt className="text-[var(--ds-text-secondary)]">Application mode</dt>
      <dd className="text-[var(--ds-text-primary)]">{s.applicationMode}</dd>
      <dt className="text-[var(--ds-text-secondary)]">Applicant status</dt>
      <dd><StatusBadge status={s.applicantStatus} size="sm" /></dd>
      <dt className="text-[var(--ds-text-secondary)]">Record created</dt>
      <dd className="text-[var(--ds-text-primary)]">{formatDate(s.createdAt)}</dd>
      <dt className="text-[var(--ds-text-secondary)]">Last updated</dt>
      <dd className="text-[var(--ds-text-primary)]">{formatDate(s.updatedAt)}</dd>
      {s.notes ? (
        <>
          <dt className="text-[var(--ds-text-secondary)]">Notes</dt>
          <dd className="text-[var(--ds-text-primary)]">{s.notes}</dd>
        </>
      ) : null}
    </dl>
  );
}

function TestsTab({ tests }: { tests: Overview["tests"] }) {
  if (tests.length === 0) return <Empty>No test sessions booked yet.</Empty>;
  return (
    <ul className="space-y-2">
      {tests.map((t) => (
        <li key={t.testSessionId} className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/30 p-3 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[var(--ds-text-primary)]">Session {t.testSessionId}</p>
              <p className="mt-0.5 text-xs text-[var(--ds-text-secondary)]">
                Booked {formatDate(t.bookedAt)} · Schedule {t.testScheduleId}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <StatusBadge status={t.attendanceStatus} size="sm" />
              <StatusBadge status={t.status} size="sm" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function DocumentsTab({ documents }: { documents: Overview["documents"] }) {
  if (documents.length === 0) return <Empty>No document requests opened yet.</Empty>;
  return (
    <div className="space-y-4">
      {documents.map((d) => (
        <div key={d.request.documentRequestId} className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/30 p-3">
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="font-semibold text-[var(--ds-text-primary)]">{d.request.requestType} — {d.request.status}</p>
              <p className="mt-0.5 text-xs text-[var(--ds-text-secondary)]">
                Required: {d.request.requiredDocumentTypes}
              </p>
              <p className="mt-0.5 text-xs text-[var(--ds-text-secondary)]">
                Opened {formatDate(d.request.createdAt)}
                {d.request.dueAt ? ` · Due ${formatDate(d.request.dueAt)}` : ""}
              </p>
            </div>
            <StatusBadge status={d.request.status} size="sm" />
          </div>
          {d.artifacts.length > 0 ? (
            <ul className="mt-2 space-y-1 text-xs">
              {d.artifacts.map((a) => (
                <li key={a.documentArtifactId} className="flex items-center justify-between">
                  <span className="text-[var(--ds-text-primary)]">
                    {a.documentType}: {a.fileName} ({formatBytes(a.sizeBytes)})
                  </span>
                  <StatusBadge status={a.status} size="sm" />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function DecisionsTab({ decisions }: { decisions: Overview["decisions"] }) {
  if (decisions.length === 0) return <Empty>No admissions decisions recorded yet.</Empty>;
  return (
    <ul className="space-y-2">
      {decisions.map((d) => (
        <li key={d.admissionDecisionId} className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/30 p-3 text-sm">
          <p className="font-semibold text-[var(--ds-text-primary)]">{d.decisionType}</p>
          <p className="mt-0.5 text-xs">
            <StatusBadge status={d.decisionStatus} size="sm" />
            <span className="ml-2 text-[var(--ds-text-secondary)]">{formatDate(d.decidedAt)}</span>
          </p>
          {d.decisionNotes ? (
            <p className="mt-1 text-xs text-[var(--ds-text-primary)]">{d.decisionNotes}</p>
          ) : null}
          {d.decidedBy ? (
            <p className="mt-0.5 text-xs text-[var(--ds-text-secondary)]">by {d.decidedBy}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function OfferTab({ o, a }: { o: Overview["offer"]; a: Overview["offerAcceptance"] }) {
  if (!o) return <Empty>No offer issued yet.</Empty>;
  return (
    <div className="space-y-3 text-sm">
      <div className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/30 p-3">
        <p className="font-semibold text-[var(--ds-text-primary)]">{o.offerCode}</p>
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <dt className="text-[var(--ds-text-secondary)]">Status</dt>
          <dd><StatusBadge status={o.status} size="sm" /></dd>
          <dt className="text-[var(--ds-text-secondary)]">Target school</dt>
          <dd className="text-[var(--ds-text-primary)]">{o.targetSchoolId ?? "—"}</dd>
          <dt className="text-[var(--ds-text-secondary)]">Year group</dt>
          <dd className="text-[var(--ds-text-primary)]">{o.targetYearGroup ?? "—"}</dd>
          <dt className="text-[var(--ds-text-secondary)]">Academic year</dt>
          <dd className="text-[var(--ds-text-primary)]">{o.academicYear ?? "—"}</dd>
          <dt className="text-[var(--ds-text-secondary)]">Issued</dt>
          <dd className="text-[var(--ds-text-primary)]">{o.issuedAt ? formatDate(o.issuedAt) : "—"}</dd>
          <dt className="text-[var(--ds-text-secondary)]">Accept by</dt>
          <dd className="text-[var(--ds-text-primary)]">{o.acceptanceDueAt ? formatDate(o.acceptanceDueAt) : "—"}</dd>
        </dl>
      </div>
      {a ? (
        <div className="rounded-xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/30 p-3">
          <p className="font-semibold text-[var(--ds-text-primary)]">Parent response</p>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <dt className="text-[var(--ds-text-secondary)]">Status</dt>
            <dd><StatusBadge status={a.status} size="sm" /></dd>
            <dt className="text-[var(--ds-text-secondary)]">Responded</dt>
            <dd className="text-[var(--ds-text-primary)]">{formatDate(a.respondedAt)}</dd>
            {a.declineReason ? (
              <>
                <dt className="text-[var(--ds-text-secondary)]">Decline reason</dt>
                <dd className="text-[var(--ds-text-primary)]">{a.declineReason}</dd>
              </>
            ) : null}
          </dl>
        </div>
      ) : null}
    </div>
  );
}

function EnrolmentTab({ e }: { e: Overview["enrolledStudent"] }) {
  if (!e) return <Empty>Not enrolled yet. Enrolment record is created after the parent pays the enrolment fee.</Empty>;
  return (
    <div className="rounded-xl border border-[#166534]/20 bg-[#e3fcef] p-4 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#166534]">Enrolled</p>
      <p className="mt-1 text-lg font-semibold text-[#166534]">🎓 #{e.studentNumber}</p>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <dt className="text-[#166534]/70">School</dt>
        <dd className="text-[#166534]">{e.schoolId}</dd>
        <dt className="text-[#166534]/70">Year group</dt>
        <dd className="text-[#166534]">{e.yearGroup ?? "—"}</dd>
        <dt className="text-[#166534]/70">Status</dt>
        <dd className="text-[#166534]">{e.status}</dd>
        <dt className="text-[#166534]/70">Enrolment date</dt>
        <dd className="text-[#166534]">{e.enrolmentDate}</dd>
      </dl>
    </div>
  );
}

function TimelineTab({ events }: { events: Overview["timeline"] }) {
  if (events.length === 0) return <Empty>Timeline is empty.</Empty>;
  return (
    <ol className="relative space-y-3 border-l-2 border-[var(--ds-border)] pl-4">
      {events.map((e, idx) => (
        <li key={`${e.at}-${idx}`} className="text-sm">
          <p className="text-xs text-[var(--ds-text-secondary)]">
            {formatDate(e.at)} · <span className="font-semibold uppercase tracking-wider">{e.kind}</span>
          </p>
          <p className="mt-0.5 text-[var(--ds-text-primary)]">{e.message}</p>
        </li>
      ))}
    </ol>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[var(--ds-text-secondary)]">{children}</p>;
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}
