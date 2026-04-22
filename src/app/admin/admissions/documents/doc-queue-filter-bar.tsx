"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type F = { status: string; school: string; search: string; minAgeDays: string };
const INPUT_CLS =
  "w-full rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2.5 py-1.5 text-sm text-[var(--ds-text-primary)]";

export function DocQueueFilterBar({ initial }: { initial: F }) {
  const router = useRouter();
  const [state, setState] = useState<F>(initial);

  const apply = () => {
    const qs = new URLSearchParams();
    if (state.status) qs.set("status", state.status);
    if (state.school) qs.set("school", state.school);
    if (state.search) qs.set("search", state.search);
    if (state.minAgeDays) qs.set("minAgeDays", state.minAgeDays);
    qs.set("offset", "0");
    router.push(`?${qs.toString()}`);
  };
  const clear = () => {
    setState({ status: "", school: "", search: "", minAgeDays: "" });
    router.push("?offset=0");
  };

  return (
    <form
      className="mt-3 grid grid-cols-1 gap-2 rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-3 sm:grid-cols-5"
      onSubmit={(e) => { e.preventDefault(); apply(); }}
    >
      <input
        type="text"
        placeholder="Search file, applicant, parent…"
        value={state.search}
        onChange={(e) => setState({ ...state, search: e.target.value })}
        className={`${INPUT_CLS} sm:col-span-2`}
      />
      <select value={state.status} onChange={(e) => setState({ ...state, status: e.target.value })} className={INPUT_CLS}>
        <option value="">uploaded (default)</option>
        <option value="uploaded">uploaded</option>
        <option value="validated">validated</option>
        <option value="rejected">rejected</option>
        <option value="expired">expired</option>
      </select>
      <select value={state.school} onChange={(e) => setState({ ...state, school: e.target.value })} className={INPUT_CLS}>
        <option value="">All schools</option>
        <option value="SCH-IIHS">IIHS</option>
        <option value="SCH-IISS">IISS</option>
      </select>
      <input
        type="number"
        min={0}
        max={365}
        placeholder="Min age (days)"
        value={state.minAgeDays}
        onChange={(e) => setState({ ...state, minAgeDays: e.target.value })}
        className={INPUT_CLS}
      />
      <div className="flex items-center gap-2 sm:col-span-5">
        <button type="submit" className="rounded-lg bg-[var(--ds-primary)] px-3 py-1.5 text-sm font-semibold text-white">Apply</button>
        <button type="button" onClick={clear} className="rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-3 py-1.5 text-sm font-semibold text-[var(--ds-text-primary)]">Clear</button>
      </div>
    </form>
  );
}
