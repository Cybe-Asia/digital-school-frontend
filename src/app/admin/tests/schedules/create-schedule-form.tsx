"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = {
  /** Default school the form pre-selects (admin picks from a dropdown). */
  defaultSchoolId: string;
};

const SCHOOL_OPTIONS: { value: string; label: string }[] = [
  { value: "SCH-IIHS", label: "IIHS" },
  { value: "SCH-IISS", label: "IISS" },
];

const TYPE_OPTIONS = [
  { value: "entrance_test", label: "Entrance test" },
  { value: "interview", label: "Interview" },
];

/**
 * Admin form for creating a new TestSchedule. Server-renders a list of
 * existing schedules next to this; on submit, POSTs and router.refreshes
 * so the new row appears.
 *
 * Inputs kept minimal (date + start/end + location + capacity) so the
 * create experience is fast — extended metadata can be added inline on
 * the schedule detail page later.
 */
export function CreateScheduleForm({ defaultSchoolId }: Props) {
  const router = useRouter();
  const [schoolId, setSchoolId] = useState(defaultSchoolId || SCHOOL_OPTIONS[0].value);
  const [scheduleType, setScheduleType] = useState("entrance_test");
  const [scheduledDate, setScheduledDate] = useState("");
  const [timeslotStart, setTimeslotStart] = useState("09:00");
  const [timeslotEnd, setTimeslotEnd] = useState("11:00");
  const [testLocation, setTestLocation] = useState("");
  const [capacity, setCapacity] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/admin/tests/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId,
          scheduleType,
          scheduledDate,
          timeslotStart,
          timeslotEnd,
          testLocation,
          capacity,
        }),
      });
      const body = (await res.json().catch(() => null)) as
        | { responseCode?: number; responseMessage?: string }
        | null;
      if (!res.ok || (body?.responseCode ?? res.status) >= 400) {
        setError(body?.responseMessage || `HTTP ${res.status}`);
        return;
      }
      // Reset the common fields so the admin can enter another date fast.
      setScheduledDate("");
      setTestLocation("");
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5"
    >
      <h3 className="text-sm font-semibold text-[var(--ds-text-primary)]">New test schedule</h3>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="School">
          <select
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            className={SELECT_CLS}
          >
            {SCHOOL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Type">
          <select
            value={scheduleType}
            onChange={(e) => setScheduleType(e.target.value)}
            className={SELECT_CLS}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <input
            type="date"
            required
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className={INPUT_CLS}
          />
        </Field>
        <Field label="Capacity">
          <input
            type="number"
            min={1}
            required
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 1)}
            className={INPUT_CLS}
          />
        </Field>
        <Field label="Start time">
          <input
            type="time"
            required
            value={timeslotStart}
            onChange={(e) => setTimeslotStart(e.target.value)}
            className={INPUT_CLS}
          />
        </Field>
        <Field label="End time">
          <input
            type="time"
            required
            value={timeslotEnd}
            onChange={(e) => setTimeslotEnd(e.target.value)}
            className={INPUT_CLS}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Location">
            <input
              type="text"
              required
              placeholder="e.g. IIHS Main Campus, Room B-203"
              value={testLocation}
              onChange={(e) => setTestLocation(e.target.value)}
              className={INPUT_CLS}
            />
          </Field>
        </div>
      </div>
      {error ? (
        <p className="mt-3 rounded-lg border border-[#b42318]/15 bg-[#fee9e9] px-3 py-2 text-xs text-[#8b1f1f]">
          {error}
        </p>
      ) : null}
      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-[var(--ds-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {isPending ? "Creating…" : "Create schedule"}
        </button>
      </div>
    </form>
  );
}

const INPUT_CLS =
  "w-full rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-3 py-2 text-sm text-[var(--ds-text-primary)]";
const SELECT_CLS = INPUT_CLS;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-[var(--ds-text-secondary)]">
      <span className="mb-1 block uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}
