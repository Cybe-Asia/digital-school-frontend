"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type F = { actorEmail: string; action: string; targetType: string; targetId: string };
const INPUT_CLS =
  "w-full rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-2.5 py-1.5 text-sm text-[var(--ds-text-primary)]";

export function AuditFilterBar({ initial }: { initial: F }) {
  const router = useRouter();
  const [state, setState] = useState<F>(initial);

  const apply = () => {
    const qs = new URLSearchParams();
    if (state.actorEmail) qs.set("actorEmail", state.actorEmail);
    if (state.action) qs.set("action", state.action);
    if (state.targetType) qs.set("targetType", state.targetType);
    if (state.targetId) qs.set("targetId", state.targetId);
    qs.set("offset", "0");
    router.push(`?${qs.toString()}`);
  };
  const clear = () => {
    setState({ actorEmail: "", action: "", targetType: "", targetId: "" });
    router.push("?offset=0");
  };

  return (
    <form
      className="grid grid-cols-1 gap-2 rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface)] p-3 sm:grid-cols-5"
      onSubmit={(e) => { e.preventDefault(); apply(); }}
    >
      <input
        type="text"
        placeholder="Actor email contains…"
        value={state.actorEmail}
        onChange={(e) => setState({ ...state, actorEmail: e.target.value })}
        className={INPUT_CLS}
      />
      <select value={state.action} onChange={(e) => setState({ ...state, action: e.target.value })} className={INPUT_CLS}>
        <option value="">Any action</option>
        <option value="lead.status.override">lead.status.override</option>
        <option value="settings.upsert">settings.upsert</option>
        <option value="offer.issued">offer.issued</option>
        <option value="offer.cancelled">offer.cancelled</option>
      </select>
      <select value={state.targetType} onChange={(e) => setState({ ...state, targetType: e.target.value })} className={INPUT_CLS}>
        <option value="">Any target</option>
        <option value="lead">lead</option>
        <option value="student">student</option>
        <option value="offer">offer</option>
        <option value="settings">settings</option>
      </select>
      <input
        type="text"
        placeholder="Target ID (exact)"
        value={state.targetId}
        onChange={(e) => setState({ ...state, targetId: e.target.value })}
        className={INPUT_CLS}
      />
      <div className="flex items-center gap-2">
        <button type="submit" className="rounded-lg bg-[var(--ds-primary)] px-3 py-1.5 text-sm font-semibold text-white">Apply</button>
        <button type="button" onClick={clear} className="rounded-lg border border-[var(--ds-border)] bg-[var(--ds-surface)] px-3 py-1.5 text-sm font-semibold text-[var(--ds-text-primary)]">Clear</button>
      </div>
    </form>
  );
}
