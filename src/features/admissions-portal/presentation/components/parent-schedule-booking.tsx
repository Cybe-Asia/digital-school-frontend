"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n";
import { BigButton, Tile } from "@/components/parent-ui";
import { CalendarIcon, CheckCircleIcon } from "@/components/parent-ui/icons";

/**
 * Real test-booking flow wired into the parent application detail
 * page. REPLACES the hardcoded mock slot array that lived in
 * parent-application-detail-view.tsx for months. Hits the existing
 * backend proxies:
 *   - GET  /api/tests/schedules?schoolId=... → list
 *   - POST /api/tests/sessions                → book
 *
 * On success we show a celebrate tile and redirect the parent back
 * to their dashboard after a short beat, so they see the new
 * "test_scheduled" state reflected on their home.
 */

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
  studentName: string;
  schoolId: string;
};

export function ParentScheduleBooking({
  studentId,
  studentName,
  schoolId,
}: Props) {
  const { t, language } = useI18n();
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [bookError, setBookError] = useState<string | null>(null);
  const [justBooked, setJustBooked] = useState<Schedule | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current || !schoolId) return;
    fetched.current = true;
    (async () => {
      try {
        const res = await fetch(
          `/api/tests/schedules?schoolId=${encodeURIComponent(schoolId)}`,
          { cache: "no-store" },
        );
        const body = (await res.json().catch(() => null)) as Envelope<Schedule[]> | null;
        if (!res.ok || !body?.data) {
          setLoadError(body?.responseMessage || `HTTP ${res.status}`);
          return;
        }
        setSchedules(body.data);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : String(err));
      }
    })();
  }, [schoolId]);

  const bookable = useMemo(
    () =>
      (schedules ?? []).filter(
        (s) => s.status === "scheduled" && s.bookedCount < s.capacity,
      ),
    [schedules],
  );

  const firstName = studentName.split(" ")[0] ?? studentName;

  const onBook = async (slot: Schedule) => {
    setPendingId(slot.testScheduleId);
    setBookError(null);
    try {
      const res = await fetch("/api/tests/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          testScheduleId: slot.testScheduleId,
        }),
      });
      const body = (await res.json().catch(() => null)) as
        | { responseCode?: number; responseMessage?: string }
        | null;
      if (!res.ok || (body?.responseCode ?? res.status) >= 400) {
        setBookError(body?.responseMessage || `HTTP ${res.status}`);
        setPendingId(null);
        return;
      }
      // Mutation landed. Flip to the success state and bounce the
      // parent back home — we intentionally don't stay on the booking
      // screen because there's literally nothing else to do here now.
      setJustBooked(slot);
      setTimeout(() => router.push("/parent/dashboard"), 1600);
    } catch (err) {
      setBookError(err instanceof Error ? err.message : String(err));
      setPendingId(null);
    }
  };

  // --- Success view ----------------------------------------------------
  if (justBooked) {
    const when = formatSlotWhen(
      justBooked.scheduledDate,
      justBooked.timeslotStart,
      language,
    );
    return (
      <Tile variant="celebrate">
        <div className="parent-confetti" aria-hidden="true" />
        <div className="relative">
          <span
            className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-[color:var(--brand-strong)]"
            aria-hidden="true"
          >
            <span className="h-6 w-6">
              <CheckCircleIcon />
            </span>
          </span>
          <h2 className="parent-text-serif text-[clamp(26px,5vw,34px)] leading-tight text-[color:var(--ink-900)]">
            {t("parent.detail.schedule.booked_title")}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--ink-700)]">
            {t("parent.detail.schedule.booked_body", {
              name: firstName,
              when,
            })}
          </p>
        </div>
      </Tile>
    );
  }

  // --- Load / error states --------------------------------------------
  if (loadError) {
    return (
      <Tile variant="flat">
        <p className="text-sm text-[color:var(--warm-coral)]">{loadError}</p>
      </Tile>
    );
  }
  if (schedules === null) {
    return (
      <Tile variant="flat">
        <div className="flex items-center gap-3">
          <span
            className="h-4 w-4 animate-pulse rounded-full bg-[color:var(--brand)]"
            aria-hidden="true"
          />
          <p className="text-sm text-[color:var(--ink-500)]">Loading…</p>
        </div>
      </Tile>
    );
  }

  // --- Empty state ----------------------------------------------------
  if (bookable.length === 0) {
    return (
      <Tile>
        <h3 className="parent-text-serif text-[20px] text-[color:var(--ink-900)]">
          {t("parent.detail.schedule.no_slots_title")}
        </h3>
        <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--ink-500)]">
          {t("parent.detail.schedule.no_slots_body")}
        </p>
      </Tile>
    );
  }

  // --- Slot list (each is a tappable tile that IS the button) --------
  return (
    <div className="space-y-3">
      {bookError ? (
        <Tile variant="flat">
          <p className="text-sm text-[color:var(--warm-coral)]">
            {t("parent.detail.schedule.booking_error", { reason: bookError })}
          </p>
        </Tile>
      ) : null}

      {bookable.map((slot) => {
        const seatsLeft = slot.capacity - slot.bookedCount;
        const when = formatSlotWhen(
          slot.scheduledDate,
          slot.timeslotStart,
          language,
        );
        const isBooking = pendingId === slot.testScheduleId;
        const disabled = pendingId !== null;
        return (
          <button
            key={slot.testScheduleId}
            type="button"
            onClick={() => onBook(slot)}
            disabled={disabled}
            className="parent-tile block w-full text-left transition disabled:opacity-60"
          >
            <div className="flex items-start gap-3">
              <span
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--brand-soft)] text-[color:var(--brand-strong)]"
                aria-hidden="true"
              >
                <span className="h-5 w-5">
                  <CalendarIcon />
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="parent-text-serif text-[18px] leading-snug text-[color:var(--ink-900)]">
                  {when}
                </p>
                <p className="mt-1 text-sm text-[color:var(--ink-500)]">
                  {slot.testLocation}
                </p>
                <p className="mt-1 text-xs text-[color:var(--ink-400)]">
                  {t("parent.detail.schedule.seats_left", { count: seatsLeft })}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <BigButton
                variant="primary"
                aria-disabled={disabled}
                disabled={disabled}
                onClick={(e) => {
                  // Prevent the outer button from double-firing (the whole
                  // tile is a button, so clicking the inner CTA would
                  // trigger onBook twice). The CTA is visual polish only.
                  e.stopPropagation();
                  if (!disabled) onBook(slot);
                }}
              >
                {isBooking
                  ? t("parent.detail.schedule.booking")
                  : t("parent.detail.schedule.book_cta")}
              </BigButton>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function formatSlotWhen(
  date: string,
  time: string,
  language: string,
): string {
  try {
    const [y, m, d] = date.split("-").map((n) => parseInt(n, 10));
    const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
    const formatted = new Intl.DateTimeFormat(
      language === "id" ? "id-ID" : "en-GB",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
      },
    ).format(dt);
    return `${formatted}, ${time.slice(0, 5)}`;
  } catch {
    return `${date} ${time}`;
  }
}
