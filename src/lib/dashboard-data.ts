export type DashboardRole = "student" | "parent" | "staff";
export type PriorityId = "high" | "medium" | "low";
export type StatusId =
  | "excellent"
  | "improving"
  | "needs_review"
  | "attention_needed"
  | "watchlist"
  | "on_track"
  | "at_risk"
  | "delayed";

export type NavItem = {
  labelKey: string;
  active?: boolean;
};

export type Metric = {
  labelKey: string;
  value: string;
  trendKey: string;
};

export type ProgressItem = {
  labelKey: string;
  value: number;
  max: number;
  helperKey: string;
};

export type AlertItem = {
  titleKey: string;
  detailKey: string;
  priority: PriorityId;
};

export type ScheduleItem = {
  time: string;
  titleKey: string;
  metaKey: string;
};

export type TableRow = {
  columnA?: string;
  columnAKey?: string;
  columnB?: string;
  columnBKey?: string;
  columnC?: string;
  columnCKey?: string;
  status: StatusId;
};

export type DashboardConfig = {
  role: DashboardRole;
  roleLabelKey: string;
  titleKey: string;
  subtitleKey: string;
  navItems: NavItem[];
  metrics: Metric[];
  progress: ProgressItem[];
  alerts: AlertItem[];
  schedule: ScheduleItem[];
  tableTitleKey: string;
  tableColumnKeys: [string, string, string, string];
  tableRows: TableRow[];
};

export const dashboardData: Record<DashboardRole, DashboardConfig> = {
  student: {
    role: "student",
    roleLabelKey: "dashboard.student.role_label",
    titleKey: "dashboard.student.title",
    subtitleKey: "dashboard.student.subtitle",
    navItems: [
      { labelKey: "dashboard.student.nav.dashboard", active: true },
      { labelKey: "dashboard.student.nav.learning" },
      { labelKey: "dashboard.student.nav.assignments" },
      { labelKey: "dashboard.student.nav.attendance" },
      { labelKey: "dashboard.student.nav.live_sessions" },
      { labelKey: "dashboard.student.nav.messages" },
      { labelKey: "dashboard.student.nav.finance" },
    ],
    metrics: [
      { labelKey: "dashboard.student.metrics.active_courses.label", value: "6", trendKey: "dashboard.student.metrics.active_courses.trend" },
      { labelKey: "dashboard.student.metrics.assignments_due.label", value: "3", trendKey: "dashboard.student.metrics.assignments_due.trend" },
      { labelKey: "dashboard.student.metrics.attendance.label", value: "94%", trendKey: "dashboard.student.metrics.attendance.trend" },
      { labelKey: "dashboard.student.metrics.outstanding_invoice.label", value: "Rp 1.250.000", trendKey: "dashboard.student.metrics.outstanding_invoice.trend" },
    ],
    progress: [
      { labelKey: "dashboard.student.progress.math_average.label", value: 82, max: 100, helperKey: "dashboard.student.progress.math_average.helper" },
      { labelKey: "dashboard.student.progress.science_completion.label", value: 76, max: 100, helperKey: "dashboard.student.progress.science_completion.helper" },
      { labelKey: "dashboard.student.progress.quran_studies.label", value: 91, max: 100, helperKey: "dashboard.student.progress.quran_studies.helper" },
    ],
    alerts: [
      { titleKey: "dashboard.student.alerts.physics_quiz.title", detailKey: "dashboard.student.alerts.physics_quiz.detail", priority: "high" },
      { titleKey: "dashboard.student.alerts.attendance_reminder.title", detailKey: "dashboard.student.alerts.attendance_reminder.detail", priority: "low" },
      { titleKey: "dashboard.student.alerts.payment_notice.title", detailKey: "dashboard.student.alerts.payment_notice.detail", priority: "medium" },
    ],
    schedule: [
      { time: "08:00", titleKey: "dashboard.student.schedule.live_math.title", metaKey: "dashboard.student.schedule.live_math.meta" },
      { time: "10:30", titleKey: "dashboard.student.schedule.arabic_review.title", metaKey: "dashboard.student.schedule.arabic_review.meta" },
      { time: "13:15", titleKey: "dashboard.student.schedule.science_discussion.title", metaKey: "dashboard.student.schedule.science_discussion.meta" },
      { time: "15:00", titleKey: "dashboard.student.schedule.tahfidz.title", metaKey: "dashboard.student.schedule.tahfidz.meta" },
    ],
    tableTitleKey: "dashboard.student.table.title",
    tableColumnKeys: [
      "dashboard.student.table.columns.subject",
      "dashboard.student.table.columns.latest_score",
      "dashboard.student.table.columns.teacher",
      "dashboard.student.table.columns.status",
    ],
    tableRows: [
      { columnAKey: "dashboard.student.table.rows.mathematics.subject", columnB: "84", columnC: "Ms. Dina", status: "improving" },
      { columnAKey: "dashboard.student.table.rows.science.subject", columnB: "79", columnC: "Mr. Arif", status: "needs_review" },
      { columnAKey: "dashboard.student.table.rows.english.subject", columnB: "88", columnC: "Ms. Nita", status: "excellent" },
      { columnAKey: "dashboard.student.table.rows.quran.subject", columnB: "93", columnC: "Ust. Fikri", status: "excellent" },
    ],
  },
  parent: {
    role: "parent",
    roleLabelKey: "dashboard.parent.role_label",
    titleKey: "dashboard.parent.title",
    subtitleKey: "dashboard.parent.subtitle",
    navItems: [
      { labelKey: "dashboard.parent.nav.dashboard", active: true },
      { labelKey: "dashboard.parent.nav.children" },
      { labelKey: "dashboard.parent.nav.learning_progress" },
      { labelKey: "dashboard.parent.nav.attendance" },
      { labelKey: "dashboard.parent.nav.payments" },
      { labelKey: "dashboard.parent.nav.announcements" },
      { labelKey: "dashboard.parent.nav.messages" },
    ],
    metrics: [
      { labelKey: "dashboard.parent.metrics.linked_students.label", value: "2", trendKey: "dashboard.parent.metrics.linked_students.trend" },
      { labelKey: "dashboard.parent.metrics.average_attendance.label", value: "92%", trendKey: "dashboard.parent.metrics.average_attendance.trend" },
      { labelKey: "dashboard.parent.metrics.upcoming_assignments.label", value: "5", trendKey: "dashboard.parent.metrics.upcoming_assignments.trend" },
      { labelKey: "dashboard.parent.metrics.tuition_due.label", value: "Rp 2.400.000", trendKey: "dashboard.parent.metrics.tuition_due.trend" },
    ],
    progress: [
      { labelKey: "dashboard.parent.progress.aisha_progress.label", value: 87, max: 100, helperKey: "dashboard.parent.progress.aisha_progress.helper" },
      { labelKey: "dashboard.parent.progress.rayyan_completion.label", value: 72, max: 100, helperKey: "dashboard.parent.progress.rayyan_completion.helper" },
      { labelKey: "dashboard.parent.progress.family_payment.label", value: 68, max: 100, helperKey: "dashboard.parent.progress.family_payment.helper" },
    ],
    alerts: [
      { titleKey: "dashboard.parent.alerts.overdue_tuition.title", detailKey: "dashboard.parent.alerts.overdue_tuition.detail", priority: "high" },
      { titleKey: "dashboard.parent.alerts.parent_teacher.title", detailKey: "dashboard.parent.alerts.parent_teacher.detail", priority: "medium" },
      { titleKey: "dashboard.parent.alerts.school_announcement.title", detailKey: "dashboard.parent.alerts.school_announcement.detail", priority: "low" },
    ],
    schedule: [
      { time: "09:00", titleKey: "dashboard.parent.schedule.payment_followup.title", metaKey: "dashboard.parent.schedule.payment_followup.meta" },
      { time: "11:00", titleKey: "dashboard.parent.schedule.teacher_consultation.title", metaKey: "dashboard.parent.schedule.teacher_consultation.meta" },
      { time: "14:00", titleKey: "dashboard.parent.schedule.assignment_checkpoint.title", metaKey: "dashboard.parent.schedule.assignment_checkpoint.meta" },
      { time: "16:30", titleKey: "dashboard.parent.schedule.school_broadcast.title", metaKey: "dashboard.parent.schedule.school_broadcast.meta" },
    ],
    tableTitleKey: "dashboard.parent.table.title",
    tableColumnKeys: [
      "dashboard.parent.table.columns.child",
      "dashboard.parent.table.columns.focus_area",
      "dashboard.parent.table.columns.current_result",
      "dashboard.parent.table.columns.status",
    ],
    tableRows: [
      { columnA: "Aisha", columnBKey: "dashboard.parent.table.rows.aisha_math.focus_area", columnC: "89", status: "excellent" },
      { columnA: "Aisha", columnBKey: "dashboard.parent.table.rows.aisha_attendance.focus_area", columnC: "96%", status: "excellent" },
      { columnA: "Rayyan", columnBKey: "dashboard.parent.table.rows.rayyan_science.focus_area", columnC: "72%", status: "attention_needed" },
      { columnA: "Rayyan", columnBKey: "dashboard.parent.table.rows.rayyan_attendance.focus_area", columnC: "88%", status: "watchlist" },
    ],
  },
  staff: {
    role: "staff",
    roleLabelKey: "dashboard.staff.role_label",
    titleKey: "dashboard.staff.title",
    subtitleKey: "dashboard.staff.subtitle",
    navItems: [
      { labelKey: "dashboard.staff.nav.dashboard", active: true },
      { labelKey: "dashboard.staff.nav.student_management" },
      { labelKey: "dashboard.staff.nav.academic_calendar" },
      { labelKey: "dashboard.staff.nav.attendance" },
      { labelKey: "dashboard.staff.nav.finance" },
      { labelKey: "dashboard.staff.nav.admissions" },
      { labelKey: "dashboard.staff.nav.reports" },
    ],
    metrics: [
      { labelKey: "dashboard.staff.metrics.active_students.label", value: "1,248", trendKey: "dashboard.staff.metrics.active_students.trend" },
      { labelKey: "dashboard.staff.metrics.classes_today.label", value: "46", trendKey: "dashboard.staff.metrics.classes_today.trend" },
      { labelKey: "dashboard.staff.metrics.attendance_violations.label", value: "18", trendKey: "dashboard.staff.metrics.attendance_violations.trend" },
      { labelKey: "dashboard.staff.metrics.overdue_invoices.label", value: "73", trendKey: "dashboard.staff.metrics.overdue_invoices.trend" },
    ],
    progress: [
      { labelKey: "dashboard.staff.progress.grade_sync.label", value: 99, max: 100, helperKey: "dashboard.staff.progress.grade_sync.helper" },
      { labelKey: "dashboard.staff.progress.admissions_conversion.label", value: 64, max: 100, helperKey: "dashboard.staff.progress.admissions_conversion.helper" },
      { labelKey: "dashboard.staff.progress.report_sla.label", value: 83, max: 100, helperKey: "dashboard.staff.progress.report_sla.helper" },
    ],
    alerts: [
      { titleKey: "dashboard.staff.alerts.attendance_cluster.title", detailKey: "dashboard.staff.alerts.attendance_cluster.detail", priority: "high" },
      { titleKey: "dashboard.staff.alerts.finance_escalation.title", detailKey: "dashboard.staff.alerts.finance_escalation.detail", priority: "high" },
      { titleKey: "dashboard.staff.alerts.admissions_queue.title", detailKey: "dashboard.staff.alerts.admissions_queue.detail", priority: "medium" },
    ],
    schedule: [
      { time: "07:30", titleKey: "dashboard.staff.schedule.operations_brief.title", metaKey: "dashboard.staff.schedule.operations_brief.meta" },
      { time: "10:00", titleKey: "dashboard.staff.schedule.attendance_review.title", metaKey: "dashboard.staff.schedule.attendance_review.meta" },
      { time: "13:00", titleKey: "dashboard.staff.schedule.finance_check.title", metaKey: "dashboard.staff.schedule.finance_check.meta" },
      { time: "15:30", titleKey: "dashboard.staff.schedule.reporting_cutoff.title", metaKey: "dashboard.staff.schedule.reporting_cutoff.meta" },
    ],
    tableTitleKey: "dashboard.staff.table.title",
    tableColumnKeys: [
      "dashboard.staff.table.columns.process",
      "dashboard.staff.table.columns.owner",
      "dashboard.staff.table.columns.sla",
      "dashboard.staff.table.columns.status",
    ],
    tableRows: [
      {
        columnAKey: "dashboard.staff.table.rows.grade_sync.process",
        columnBKey: "dashboard.staff.table.rows.grade_sync.owner",
        columnCKey: "dashboard.staff.table.rows.grade_sync.sla",
        status: "on_track",
      },
      {
        columnAKey: "dashboard.staff.table.rows.invoice_aging.process",
        columnBKey: "dashboard.staff.table.rows.invoice_aging.owner",
        columnCKey: "dashboard.staff.table.rows.invoice_aging.sla",
        status: "at_risk",
      },
      {
        columnAKey: "dashboard.staff.table.rows.admissions_review.process",
        columnBKey: "dashboard.staff.table.rows.admissions_review.owner",
        columnCKey: "dashboard.staff.table.rows.admissions_review.sla",
        status: "on_track",
      },
      {
        columnAKey: "dashboard.staff.table.rows.attendance_audit.process",
        columnBKey: "dashboard.staff.table.rows.attendance_audit.owner",
        columnCKey: "dashboard.staff.table.rows.attendance_audit.sla",
        status: "delayed",
      },
    ],
  },
};

export const dashboardRoles: DashboardRole[] = ["student", "parent", "staff"];

export function getDashboardConfig(role: string): DashboardConfig | null {
  if (role === "student" || role === "parent" || role === "staff") {
    return dashboardData[role];
  }

  return null;
}
