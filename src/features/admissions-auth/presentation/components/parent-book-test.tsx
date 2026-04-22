"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n";
import { Button } from "@/shared/ui/button";
import { StatusBadge } from "@/features/admissions-common/status-badge";

type Schedule = {
  testScheduleId: string;
  schoolId: string;
  scheduleType: string;
  testLocation: string;
  scheduledDate: string;
  timeslotStart: string;
  timeslotEnd: string;
  capacity: number;
  bookedCount: number;
  status: string;
};

type Envelope<T> = { responseCode: number; responseMessage: string; data?: T };

type Props = {
  studentId: string;
  schoolId: string;
};

/**
 * Full test-booking flow for parents. Steps:
 *  1. Fetch available schedules for the kid's target school.
 *  2. Render one card per schedule with capacity chip; full ones are
 *     greyed out and not selectable.
 *  3. On "Book this slot" → POST /api/tests/sessions → on 200, push
 *     to /dashboard/parent so the parent sees their new upcoming
 *     test row. On 409 (full / already booked) show an inline error.
 */
export function ParentBookTestClient({ studentId, schoolId }: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const [schedules, setSchedules] = useState<Schedule[] | null>(null);
  // Missing-school is a synchronous derived error (not from an async
  // load) — deriving from props avoids the "setState-in-effect"
  // cascading-render lint that the auth-continue page hit earlier.
  const missingSchool = !schoolId;
  const [asyncLoadError, setAsyncLoadError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookError, setBookError] = useState<string | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    if (missingSchool) return;
    firedRef.current = true;
    (async () => {
      try {
        const res = await fetch(`/api/tests/schedules?schoolId=${encodeURIComponent(schoolId)}`, {
          cache: "no-store",
        });
        const body = (await res.json().catch(() => null)) as Envelope<Schedule[]> | null;
        if (!res.ok || !body?.data) {
          setAsyncLoadError(body?.responseMessage || `HTTP ${res.status}`);
          return;
        }
        setSchedules(body.data);
      } catch (err) {
        setAsyncLoadError(err instanceof Error ? err.message : String(err));
      }
    })();
  }, [schoolId, missingSchool]);

  const loadError = missingSchool ? t("auth.booktest.missing_school") : asyncLoadError;

  const bookable = useMemo(() => {
    return (schedules ?? []).filter(
      (s) => s.status === "scheduled" && s.bookedCount < s.capacity,
    );
  }, [schedules]);

  const onBook = async (scheduleId: string) => {
    if (!studentId) {
      setBookError(t("auth.booktest.missing_student"));
      return;
    }
    setBookingId(scheduleId);
    setBookError(null);
    try {
      const res = await fetch("/api/tests/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, testScheduleId: scheduleId }),
      });
      const body = (await res.json().catch(() => null)) as
        | { responseCode?: number; responseMessage?: string }
        | null;
      if (!res.ok || (body?.responseCode ?? res.status) >= 400) {
        setBookError(body?.responseMessage || `HTTP ${res.status}`);
        setBookingId(null);
        return;
      }
      router.push("/dashboard/parent");
    } catch (err) {
      setBookError(err instanceof Error ? err.message : String(err));
      setBookingId(null);
    }
  };

  if (!studentId) {
    return (
      <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
        {t("auth.booktest.missing_student")}
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
        {loadError}
      </div>
    );
  }
  if (schedules === null) {
    return <p className="text-sm text-[var(--ds-text-secondary)]">{t("auth.booktest.loading")}</p>;
  }
  if (bookable.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-5 py-6 text-sm">
        <p className="font-semibold text-[var(--ds-text-primary)]">
          {t("auth.booktest.empty_title")}
        </p>
        <p className="mt-1 text-[var(--ds-text-secondary)]">
          {t("auth.booktest.empty_description")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookError ? (
        <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
          {bookError}
        </div>
      ) : null}

      <div className="space-y-3">
        {bookable.map((s) => {
          const full = s.bookedCount >= s.capacity;
          const booking = bookingId === s.testScheduleId;
          return (
            <div
              key={s.testScheduleId}
              className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--ds-text-primary)]">
                    {formatDate(s.scheduledDate)} &middot; {s.timeslotStart}–{s.timeslotEnd}
                  </p>
                  <p className="mt-1 text-sm text-[var(--ds-text-secondary)]">
                    {s.testLocation}
                  </p>
                  <p className="mt-2 text-xs text-[var(--ds-text-secondary)]">
                    Type: {s.scheduleType.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <StatusBadge status={s.status} size="sm" />
                  <span className="rounded-full bg-[var(--ds-soft)] px-2 py-0.5 text-xs font-semibold">
                    {s.capacity - s.bookedCount} seats left
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  type="button"
                  disabled={full || booking || bookingId !== null}
                  onClick={() => onBook(s.testScheduleId)}
                  className="px-5 py-2 text-sm"
                >
                  {booking ? t("auth.booktest.booking") : t("auth.booktest.book_cta")}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatDate(yyyy_mm_dd: string): string {
  try {
    const [y, m, d] = yyyy_mm_dd.split("-").map((n) => parseInt(n, 10));
    const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
    return dt.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return yyyy_mm_dd;
  }
}
