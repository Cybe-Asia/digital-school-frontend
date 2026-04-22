import { redirect } from "next/navigation";

/**
 * Canonical admin dashboard URL — redirects to the admissions dashboard
 * which is the operator-landing that already exists. Once more pillars
 * come online (SIS admin, billing), this page becomes the composite
 * landing and the individual pillar dashboards keep their own URLs.
 */
export default function AdminDashboardPage() {
  redirect("/admin/admissions");
}
