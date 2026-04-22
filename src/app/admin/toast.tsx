"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type ToastKind = "success" | "error" | "info";
type Toast = { id: number; kind: ToastKind; message: string };

type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastCtx = createContext<ToastApi | null>(null);

/**
 * Minimal toast system — no third-party dep. Portal-less (lives inside
 * the admin shell root so it doesn't compete with the app's cookie
 * banner / modals). Auto-dismisses after 4s; errors after 6s.
 *
 * Kept deliberately small: one stack, bottom-right, no queue cap
 * (runaway bugs will just stack visibly, which is the right signal).
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, kind, message }]);
    const ttl = kind === "error" ? 6000 : 4000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, ttl);
  }, []);

  const api: ToastApi = {
    success: (m) => push("success", m),
    error: (m) => push("error", m),
    info: (m) => push("info", m),
  };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastCard({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  // Enter animation — opacity + slide-up — kept in pure tailwind, no
  // framer-motion dep.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(id);
  }, []);
  const color =
    toast.kind === "success"
      ? "border-[#166534]/30 bg-[#e3fcef] text-[#166534]"
      : toast.kind === "error"
        ? "border-[#b42318]/30 bg-[#fee9e9] text-[#8b1f1f]"
        : "border-[var(--ds-border)] bg-[var(--ds-surface)] text-[var(--ds-text-primary)]";
  const icon = toast.kind === "success" ? "✓" : toast.kind === "error" ? "⚠" : "ℹ";
  return (
    <div
      role={toast.kind === "error" ? "alert" : "status"}
      className={`pointer-events-auto flex items-start gap-2 rounded-xl border px-3 py-2 text-sm shadow-md transition-all ${color} ${
        mounted ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <span aria-hidden="true" className="text-base leading-5">{icon}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="-m-1 rounded p-1 text-xs opacity-60 hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    // Fallback — no-op when used outside provider (e.g. someone renders
    // an admin component in a story). Avoids hard-crashing tests.
    return {
      success: () => {},
      error: () => {},
      info: () => {},
    };
  }
  return ctx;
}
