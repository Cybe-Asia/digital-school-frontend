import type { ReactNode } from "react";
import { AdminShell } from "./admin-shell";
import AdminShellHeader from "./_components/admin-shell-header";

/**
 * App-router segment layout for every admin page. Wraps children in the
 * shared shell (sidebar + top bar + breadcrumbs). Server component so
 * the shell's static markup renders alongside each page; only the shell
 * itself is hydrated on the client for usePathname + mobile sidebar state.
 *
 * Hoists `<AdminShellHeader>` so every admin page has the same identity
 * strip at the top — design principle #8 (consistent admin header).
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminShell>
      <div className="px-6 pt-6">
        <AdminShellHeader />
      </div>
      {children}
    </AdminShell>
  );
}
