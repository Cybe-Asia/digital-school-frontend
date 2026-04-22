"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/features/admissions-common/status-badge";

type Envelope<T> = { responseCode: number; responseMessage: string; data?: T };

type Offer = {
  offerId: string;
  offerCode: string;
  applicantStudentId: string;
  targetSchoolId: string;
  targetYearGroup?: string | null;
  academicYear?: string | null;
  status: string;
  issuedAt?: string | null;
  acceptanceDueAt?: string | null;
  termsVersion?: string | null;
};

type Enrolled = {
  studentId: string;
  studentNumber: string;
  schoolId: string;
  yearGroup?: string | null;
  status: string;
  enrolmentDate: string;
};

type MyOfferRow = {
  studentId: string;
  studentName: string;
  applicantStatus: string;
  offer: Offer | null;
  enrolled: Enrolled | null;
};

/**
 * Renders all offer + enrolled state for the current parent, one card
 * per student that has something to show. Kids without an offer and
 * without an enrolled record are suppressed (their state lives
 * elsewhere on the dashboard — tests, documents etc).
 *
 * Polls once on mount and on every Accept/Decline. The accept flow
 * routes the parent to the enrolment-fee payment page; the dashboard
 * re-renders when they come back and the polling picks up the
 * `enrolment_paid` / `handed_to_sis` transitions.
 */
export function ParentOffersCard() {
  const router = useRouter();
  const [rows, setRows] = useState<MyOfferRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actingOfferId, setActingOfferId] = useState<string | null>(null);
  const firedRef = useRef(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/me/offers", { cache: "no-store" });
    const body = (await res.json().catch(() => null)) as Envelope<MyOfferRow[]> | null;
    if (!res.ok || !body?.data) {
      setError(body?.responseMessage || `HTTP ${res.status}`);
      return;
    }
    setRows(body.data);
  }, []);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    void refresh();
  }, [refresh]);

  const onAccept = async (offer: Offer) => {
    setActingOfferId(offer.offerId);
    setError(null);
    try {
      const res = await fetch(`/api/offers/${encodeURIComponent(offer.offerId)}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ termsVersion: offer.termsVersion ?? null }),
      });
      const body = (await res.json().catch(() => null)) as Envelope<unknown> | null;
      if (!res.ok || (body?.responseCode ?? res.status) >= 400) {
        setError(body?.responseMessage || `HTTP ${res.status}`);
        setActingOfferId(null);
        return;
      }
      // Offer accepted → jump to enrolment-fee payment. Reuse the
      // existing payment page (same form; just a different payment_type
      // query so the backend charges the right FeeStructure).
      const leadId =
        // admissionId lives in the session cookie URL-context; the
        // payment page pulls it from query so we need to thread it.
        // Use the student's lead mapping via a round-trip — or simpler:
        // send the student_id as admissionId (the payment-service looks
        // up the Lead via the shared graph internally).
        offer.applicantStudentId;
      router.push(
        `/auth/setup-account/payment?admissionId=${encodeURIComponent(leadId)}&paymentType=enrolment_fee`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setActingOfferId(null);
    }
  };

  const onDecline = async (offer: Offer) => {
    const reason = window.prompt("Reason for declining (optional):") ?? "";
    setActingOfferId(offer.offerId);
    setError(null);
    try {
      const res = await fetch(`/api/offers/${encodeURIComponent(offer.offerId)}/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ declineReason: reason }),
      });
      const body = (await res.json().catch(() => null)) as Envelope<unknown> | null;
      if (!res.ok || (body?.responseCode ?? res.status) >= 400) {
        setError(body?.responseMessage || `HTTP ${res.status}`);
        setActingOfferId(null);
        return;
      }
      setActingOfferId(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setActingOfferId(null);
    }
  };

  if (rows === null) return null;

  const visible = rows.filter((r) => r.offer || r.enrolled);
  if (visible.length === 0) return null;

  return (
    <article className="parent-portal-section surface-card rounded-3xl p-5 sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">
          Admissions offer
        </p>
        <h3 className="mt-2 text-lg font-semibold text-[var(--ds-text-primary)]">
          Your offer & enrolment
        </h3>
      </div>

      {error ? (
        <p className="mt-3 rounded-lg border border-[#b42318]/15 bg-[#fee9e9] px-3 py-2 text-sm text-[#8b1f1f]">
          {error}
        </p>
      ) : null}

      <div className="mt-4 space-y-4">
        {visible.map((r) => (
          <OfferRow
            key={r.studentId}
            row={r}
            acting={actingOfferId === r.offer?.offerId}
            onAccept={onAccept}
            onDecline={onDecline}
          />
        ))}
      </div>
    </article>
  );
}

function OfferRow({
  row,
  acting,
  onAccept,
  onDecline,
}: {
  row: MyOfferRow;
  acting: boolean;
  onAccept: (o: Offer) => void;
  onDecline: (o: Offer) => void;
}) {
  if (row.enrolled) {
    return (
      <div className="rounded-2xl border border-[#166534]/20 bg-[#e3fcef] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#166534]">
              Enrolled
            </p>
            <p className="mt-0.5 text-lg font-semibold text-[#166534]">
              🎓 {row.studentName}
            </p>
            <p className="mt-1 text-sm text-[#166534]">
              Student #{row.enrolled.studentNumber}
              {row.enrolled.yearGroup ? ` · ${row.enrolled.yearGroup}` : ""}
              {row.enrolled.schoolId ? ` · ${row.enrolled.schoolId.replace("SCH-", "")}` : ""}
            </p>
            <p className="mt-1 text-xs text-[#166534]/80">
              Enrolled on {row.enrolled.enrolmentDate}. Welcome to the school!
            </p>
          </div>
          <StatusBadge status="active" size="sm" />
        </div>
      </div>
    );
  }

  if (!row.offer) return null;
  const offer = row.offer;
  const isIssued = offer.status === "issued";
  const isAccepted = offer.status === "accepted";
  const isDeclined = offer.status === "declined";

  return (
    <div className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ds-text-secondary)]">
            {row.studentName}
          </p>
          <p className="mt-0.5 text-lg font-semibold text-[var(--ds-text-primary)]">
            Offer {offer.offerCode}
          </p>
          <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">
            {offer.targetSchoolId.replace("SCH-", "")}
            {offer.targetYearGroup ? ` · ${offer.targetYearGroup}` : ""}
            {offer.academicYear ? ` · AY ${offer.academicYear}` : ""}
          </p>
          {offer.acceptanceDueAt ? (
            <p className="mt-1 text-xs text-[var(--ds-text-secondary)]">
              Accept by: {formatDate(offer.acceptanceDueAt)}
            </p>
          ) : null}
        </div>
        <StatusBadge status={offer.status} />
      </div>

      {isIssued ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onAccept(offer)}
            disabled={acting}
            className="rounded-lg bg-[var(--ds-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {acting ? "Processing…" : "Accept offer & pay enrolment fee"}
          </button>
          <button
            type="button"
            onClick={() => onDecline(offer)}
            disabled={acting}
            className="rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-2 text-sm font-semibold text-[var(--ds-text-primary)] disabled:opacity-40"
          >
            Decline
          </button>
        </div>
      ) : null}

      {isAccepted ? (
        <p className="mt-3 text-sm text-[#166534]">
          Offer accepted. Complete the enrolment fee to finalise.
        </p>
      ) : null}

      {isDeclined ? (
        <p className="mt-3 text-sm text-[#8b1f1f]">
          You declined this offer.
        </p>
      ) : null}
    </div>
  );
}

function formatDate(iso: string): string {
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
