import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import AdminShellHeader from "@/app/admin/_components/admin-shell-header";

export const metadata: Metadata = {
  title: "Admissions Dashboard | Admin",
  description: "Operator landing page for admissions.",
};

const SESSION_COOKIE_NAME = "ds-session";

type ApiEnvelope<T> = { responseCode: number; responseMessage: string; data?: T };

type FunnelResponse = {
  leadCounts: Record<string, number>;
  studentCounts: Record<string, number>;
  stuckCounts: {
    stuckTestPending7d: number;
    stuckDocsPending7d: number;
    stuckOfferIssued7d: number;
  };
  weeklyNewLeads: number;
  weeklyEnrolled: number;
  computedAt: string;
};

type AuditEvent = {
  eventId: string;
  actorLeadId: string;
  actorEmail?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  createdAt: string;
};

/**
 * Single-pane-of-glass admissions landing. Fetches one aggregated roll-up
 * from `/admin/funnel` and renders:
 *   - top-line "this week" tiles (new leads + enrolled)
 *   - stuck-in-stage alerts (≥ 7d)
 *   - funnel stage tables (Lead status + Applicant status counts)
 *   - nav links into the deeper lists
 *
 * Replaced the previous mock-data AdmissionsAdminDashboard component so
 * the landing reflects live school-test data instead of static cards.
 */
export default async function AdminAdmissionsDashboardPage() {
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
  let payload: ApiEnvelope<FunnelResponse> | null = null;
  let httpStatus = 0;
  let auditEvents: AuditEvent[] = [];
  try {
    const [funnelRes, auditRes] = await Promise.all([
      fetch(`${admission}/admin/funnel`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
      fetch(`${admission}/admin/audit?limit=10&offset=0`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }).catch(() => null),
    ]);
    httpStatus = funnelRes.status;
    payload = (await funnelRes.json().catch(() => null)) as ApiEnvelope<FunnelResponse> | null;
    if (auditRes && auditRes.ok) {
      const auditBody = (await auditRes.json().catch(() => null)) as
        | ApiEnvelope<AuditEvent[]>
        | null;
      auditEvents = auditBody?.data ?? [];
    }
  } catch {
    // upstream down — payload stays null
  }

  if (httpStatus === 403) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-sm">
        <h1 className="text-xl font-semibold">Admin access required</h1>
        <p className="mt-2 text-[var(--ds-text-secondary)]">
          Your account isn&apos;t configured as an admin. Ask the cluster operator
          to add your email to <code className="rounded bg-[var(--ds-soft)] px-1.5 py-0.5">ADMIN_EMAILS</code>.
        </p>
      </div>
    );
  }

  const f = payload?.data ?? null;
  if (!f) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-sm">
        <h1 className="text-xl font-semibold">Couldn&apos;t load admissions dashboard</h1>
        <p className="mt-2 text-[var(--ds-text-secondary)]">{payload?.responseMessage || `HTTP ${httpStatus}`}</p>
      </div>
    );
  }

  const totalLeads = sumValues(f.leadCounts);
  const totalApplicants = sumValues(f.studentCounts);
  const hasStuck =
    f.stuckCounts.stuckTestPending7d +
      f.stuckCounts.stuckDocsPending7d +
      f.stuckCounts.stuckOfferIssued7d >
    0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <AdminShellHeader />
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
            Admissions
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--ds-text-primary)]">Dashboard</h1>
          <p className="mt-1 text-xs text-[var(--ds-text-secondary)]">
            as of {formatDate(f.computedAt)}
          </p>
        </div>
        <nav className="flex flex-wrap gap-2 text-xs">
          <NavLink href="/admin/admissions/leads">Leads</NavLink>
          <NavLink href="/admin/admissions/applications">Applications</NavLink>
          <NavLink href="/admin/admissions/offers">Offers</NavLink>
          <NavLink href="/admin/admissions/documents">Doc queue</NavLink>
          <NavLink href="/admin/admissions/enrolled">Enrolled</NavLink>
          <NavLink href="/admin/sis/sections">SIS · Sections</NavLink>
          <NavLink href="/admin/tests/schedules">Test schedules</NavLink>
        </nav>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Total leads" value={totalLeads.toLocaleString()} href="/admin/admissions/leads" />
        <Tile label="Active applicants" value={totalApplicants.toLocaleString()} href="/admin/admissions/applications" />
        <Tile label="New leads (7d)" value={f.weeklyNewLeads.toLocaleString()} accent="green" />
        <Tile label="Enrolled (7d)" value={f.weeklyEnrolled.toLocaleString()} accent="green" />
      </div>

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
          Needs attention
        </h2>
        {hasStuck ? (
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StuckTile
              label="Stuck in test_pending ≥ 7d"
              value={f.stuckCounts.stuckTestPending7d}
              href="/admin/admissions/applications"
            />
            <StuckTile
              label="Stuck in documents_pending ≥ 7d"
              value={f.stuckCounts.stuckDocsPending7d}
              href="/admin/admissions/applications"
            />
            <StuckTile
              label="Stuck in offer_issued ≥ 7d"
              value={f.stuckCounts.stuckOfferIssued7d}
              href="/admin/admissions/applications"
            />
          </div>
        ) : (
          <p className="mt-2 rounded-2xl border border-[#166534]/20 bg-[#e3fcef] px-4 py-3 text-sm text-[#166534]">
            🎉 Nothing stuck for more than a week. Intake is healthy.
          </p>
        )}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <CountsCard
          title="Leads by status"
          counts={f.leadCounts}
          highlight={{ new: "amber", verified: "blue", paid: "green", dropped: "red" }}
        />
        <CountsCard
          title="Applicants by stage"
          counts={f.studentCounts}
          highlight={{
            test_approved: "green",
            documents_verified: "green",
            offer_accepted: "green",
            handed_to_sis: "green",
            rejected: "red",
            withdrawn: "red",
            test_failed: "red",
            offer_declined: "red",
          }}
        />
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
          Quick actions
        </h2>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionTile
            icon="📝"
            title="Review applications terbaru"
            description="Proses pendaftar yang menunggu review."
            href="/admin/admissions/applications?status=pending"
          />
          <QuickActionTile
            icon="📄"
            title="Verifikasi dokumen"
            description="Antrian dokumen yang belum diverifikasi."
            href="/admin/admissions/documents?status=pending"
          />
          <QuickActionTile
            icon="✉️"
            title="Generate offer letter"
            description="Buat offer baru dan kirim ke orang tua."
            href="/admin/admissions/offers"
          />
          <QuickActionTile
            icon="🏫"
            title="Tambah section / kelas"
            description="Atur kelas dan wali kelas baru di SIS."
            href="/admin/sis/sections"
          />
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
            Recent admin activity
          </h2>
          <Link
            href="/admin/admissions/audit"
            className="text-xs font-semibold text-[var(--ds-primary)] hover:underline"
          >
            View full log →
          </Link>
        </div>
        {auditEvents.length === 0 ? (
          <p className="mt-2 rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-4 text-sm text-[var(--ds-text-secondary)]">
            No admin activity recorded in this window.
          </p>
        ) : (
          <ol className="mt-2 divide-y divide-[var(--ds-border)] overflow-hidden rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)]">
            {auditEvents.slice(0, 10).map((e) => (
              <li key={e.eventId} className="flex flex-wrap items-center gap-2 px-4 py-3 text-sm">
                <span className="font-mono text-xs text-[var(--ds-primary)]">{e.action}</span>
                <span className="text-[var(--ds-text-secondary)]">{e.targetType}</span>
                <span className="truncate font-mono text-xs text-[var(--ds-text-primary)]">
                  {e.targetId}
                </span>
                <span className="ml-auto text-xs text-[var(--ds-text-secondary)]">
                  {e.actorEmail ?? e.actorLeadId} · {formatDate(e.createdAt)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function QuickActionTile({
  icon,
  title,
  description,
  href,
}: {
  icon: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-4 transition hover:border-[var(--ds-primary)] hover:shadow-[var(--ds-shadow-soft)]"
    >
      <p aria-hidden="true" className="text-2xl leading-none">
        {icon}
      </p>
      <p className="mt-3 text-sm font-semibold text-[var(--ds-text-primary)] group-hover:text-[var(--ds-primary)]">
        {title}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-[var(--ds-text-secondary)]">{description}</p>
    </Link>
  );
}

function Tile({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: string;
  href?: string;
  accent?: "green" | "red";
}) {
  const accentCls =
    accent === "green"
      ? "border-[#166534]/20 bg-[#e3fcef]"
      : accent === "red"
        ? "border-[#b42318]/20 bg-[#fee9e9]"
        : "border-[var(--ds-border)] bg-[var(--ds-surface)]";
  const body = (
    <div className={`rounded-2xl border ${accentCls} p-4`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-[var(--ds-text-primary)]">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

function StuckTile({ label, value, href }: { label: string; value: number; href: string }) {
  const hot = value > 0;
  return (
    <Link
      href={href}
      className={`block rounded-2xl border p-4 ${
        hot ? "border-[#b42318]/25 bg-[#fee9e9]" : "border-[var(--ds-border)] bg-[var(--ds-surface)]"
      }`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-wider ${
          hot ? "text-[#8b1f1f]" : "text-[var(--ds-text-secondary)]"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-semibold ${
          hot ? "text-[#8b1f1f]" : "text-[var(--ds-text-primary)]"
        }`}
      >
        {value}
      </p>
    </Link>
  );
}

type Accent = "green" | "red" | "amber" | "blue";
function CountsCard({
  title,
  counts,
  highlight,
}: {
  title: string;
  counts: Record<string, number>;
  highlight: Partial<Record<string, Accent>>;
}) {
  const total = sumValues(counts);
  const entries = Object.entries(counts).sort(([, a], [, b]) => b - a);
  return (
    <div className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
        {title}
      </h3>
      <p className="mt-0.5 text-xs text-[var(--ds-text-secondary)]">{total.toLocaleString()} total</p>
      <ul className="mt-3 space-y-1.5 text-sm">
        {entries.map(([status, n]) => {
          const accent = highlight[status];
          const dotColor =
            accent === "green" ? "bg-[#22c55e]"
              : accent === "red" ? "bg-[#ef4444]"
              : accent === "amber" ? "bg-[#f59e0b]"
              : accent === "blue" ? "bg-[#3b82f6]"
              : "bg-[var(--ds-border)]";
          return (
            <li key={status} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[var(--ds-text-primary)]">
                <span className={`inline-block h-2 w-2 rounded-full ${dotColor}`}></span>
                {status}
              </span>
              <span className="font-semibold text-[var(--ds-text-primary)]">{n.toLocaleString()}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-3 py-1.5 font-semibold text-[var(--ds-text-primary)] hover:bg-[var(--ds-soft)]"
    >
      {children}
    </Link>
  );
}

function sumValues(o: Record<string, number>): number {
  return Object.values(o).reduce((a, b) => a + b, 0);
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
