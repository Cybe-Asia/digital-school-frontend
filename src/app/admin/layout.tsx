import type { ReactNode } from "react";
import { AdminShell } from "./admin-shell";

/**
 * App-router segment layout for every admin page. Wraps children in the
 * shared shell (sidebar + top bar + breadcrumbs). Server component so
 * the shell's static markup renders alongside each page; only the shell
 * itself is hydrated on the client for usePathname + mobile sidebar state.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
