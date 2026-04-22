"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type F = { school: string; yearGroup: string; status: string; search: string };
const INPUT_CLS =
  "w-full rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2.5 py-1.5 text-sm text-[var(--ds-text-primary)]";

export function EnrolledFilterBar({ initial }: { initial: F }) {
  const router = useRouter();
  const [state, setState] = useState<F>(initial);

  const apply = () => {
    const qs = new URLSearchParams();
    if (state.school) qs.set("school", state.school);
    if (state.yearGroup) qs.set("yearGroup", state.yearGroup);
    if (state.status) qs.set("status", state.status);
    if (state.search) qs.set("search", state.search);
    qs.set("offset", "0");
    router.push(`?${qs.toString()}`);
  };
  const clear = () => {
    setState({ school: "", yearGroup: "", status: "", search: "" });
    router.push("?offset=0");
  };

  return (
    <form
      className="mt-3 grid grid-cols-1 gap-2 rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-3 sm:grid-cols-5"
      onSubmit={(e) => { e.preventDefault(); apply(); }}
    >
      <input
        type="text"
        placeholder="Search student #, name, parent…"
        value={state.search}
        onChange={(e) => setState({ ...state, search: e.target.value })}
        className={`${INPUT_CLS} sm:col-span-2`}
      />
      <select value={state.school} onChange={(e) => setState({ ...state, school: e.target.value })} className={INPUT_CLS}>
        <option value="">All schools</option>
        <option value="SCH-IIHS">IIHS</option>
        <option value="SCH-IISS">IISS</option>
      </select>
      <input
        type="text"
        placeholder="Year group"
        value={state.yearGroup}
        onChange={(e) => setState({ ...state, yearGroup: e.target.value })}
        className={INPUT_CLS}
      />
      <select value={state.status} onChange={(e) => setState({ ...state, status: e.target.value })} className={INPUT_CLS}>
        <option value="">Any status</option>
        <option value="active">active</option>
        <option value="inactive">inactive</option>
        <option value="alumnus">alumnus</option>
      </select>
      <div className="flex items-center gap-2 sm:col-span-5">
        <button type="submit" className="rounded-lg bg-[var(--ds-primary)] px-3 py-1.5 text-sm font-semibold text-white">Apply</button>
        <button type="button" onClick={clear} className="rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-3 py-1.5 text-sm font-semibold text-[var(--ds-text-primary)]">Clear</button>
      </div>
    </form>
  );
}
