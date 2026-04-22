"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type F = {
  status: string;
  school: string;
  search: string;
  dateFrom: string;
  dateTo: string;
  hasApplication: string;
};

const INPUT_CLS =
  "w-full rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2.5 py-1.5 text-sm text-[var(--ds-text-primary)]";

export function ApplicationsFilterBar({ initial }: { initial: F }) {
  const router = useRouter();
  const [state, setState] = useState<F>(initial);

  const apply = () => {
    const qs = new URLSearchParams();
    if (state.status) qs.set("status", state.status);
    if (state.school) qs.set("school", state.school);
    if (state.search) qs.set("search", state.search);
    if (state.dateFrom) qs.set("dateFrom", state.dateFrom);
    if (state.dateTo) qs.set("dateTo", state.dateTo);
    if (state.hasApplication) qs.set("hasApplication", state.hasApplication);
    qs.set("offset", "0");
    router.push(`?${qs.toString()}`);
  };
  const clear = () => {
    setState({ status: "", school: "", search: "", dateFrom: "", dateTo: "", hasApplication: "" });
    router.push("?offset=0");
  };

  return (
    <form
      className="mb-5 grid grid-cols-1 gap-2 rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-3 sm:grid-cols-6"
      onSubmit={(e) => { e.preventDefault(); apply(); }}
    >
      <input
        type="text"
        placeholder="Search name or email…"
        value={state.search}
        onChange={(e) => setState({ ...state, search: e.target.value })}
        className={`${INPUT_CLS} sm:col-span-2`}
      />
      <select value={state.status} onChange={(e) => setState({ ...state, status: e.target.value })} className={INPUT_CLS}>
        <option value="">All Lead statuses</option>
        <option value="new">new (unverified)</option>
        <option value="verified">verified</option>
        <option value="paid">paid</option>
        <option value="dropped">dropped</option>
      </select>
      <select value={state.school} onChange={(e) => setState({ ...state, school: e.target.value })} className={INPUT_CLS}>
        <option value="">All schools</option>
        <option value="SCH-IIHS">IIHS</option>
        <option value="SCH-IISS">IISS</option>
      </select>
      <select value={state.hasApplication} onChange={(e) => setState({ ...state, hasApplication: e.target.value })} className={INPUT_CLS}>
        <option value="">Any progression</option>
        <option value="true">Has application</option>
        <option value="false">EOI only</option>
      </select>
      <div className="flex items-center gap-2 sm:col-span-1">
        <button type="submit" className="rounded-lg bg-[var(--ds-primary)] px-3 py-1.5 text-sm font-semibold text-white">Apply</button>
        <button type="button" onClick={clear} className="rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-3 py-1.5 text-sm font-semibold text-[var(--ds-text-primary)]">Clear</button>
      </div>
      <input
        type="date"
        value={state.dateFrom ? state.dateFrom.slice(0, 10) : ""}
        onChange={(e) => setState({ ...state, dateFrom: e.target.value ? `${e.target.value}T00:00:00Z` : "" })}
        className={INPUT_CLS}
      />
      <input
        type="date"
        value={state.dateTo ? state.dateTo.slice(0, 10) : ""}
        onChange={(e) => setState({ ...state, dateTo: e.target.value ? `${e.target.value}T23:59:59Z` : "" })}
        className={INPUT_CLS}
      />
    </form>
  );
}
