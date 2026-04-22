import type { AdmissionsStudentProfile, SchoolCode } from "@/features/admissions-auth/domain/types";
import { getSingleSearchParam, type SearchParamsRecord } from "@/shared/lib/search-params";

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
  href?: string;
  descriptionKey?: string;
  descriptionValues?: TranslationValues;
  badge?: string;
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

export type TranslationValues = Record<string, string | number>;

export type ParentPortalSummaryCard = {
  labelKey: string;
  value: string;
  helperKey: string;
  helperValues?: TranslationValues;
};

export type ParentPortalStudentCard = {
  studentName: string;
  currentSchool: string;
  targetGrade: string;
  studentBirthDate?: string;
  status: StatusId;
  statusLabelKey: string;
  progress: number;
  stageLabelKey: string;
  documentStatusKey: string;
  nextActionLabelKey: string;
  nextActionValues?: TranslationValues;
  nextActionDetailKey: string;
  nextActionDetailValues?: TranslationValues;
  actionLabelKey: string;
  /** Real per-child lifecycle status from the backend. Powers the
   *  stepper + status badge rendered on each student card. Falls back
   *  to "submitted" when unavailable (pre-/me deep links, mock data). */
  applicantStatus?: string;
  /** Neo4j Student node id — used to build the "Book test" deep link. */
  studentId?: string;
};

export type ParentPortalAction = {
  titleKey: string;
  titleValues?: TranslationValues;
  detailKey: string;
  detailValues?: TranslationValues;
  priority: PriorityId;
  ctaLabelKey: string;
};

export type ParentPortalTimelineStep = {
  titleKey: string;
  titleValues?: TranslationValues;
  detailKey: string;
  detailValues?: TranslationValues;
  state: "complete" | "active" | "upcoming";
};

export type ParentPortalExperience = {
  summaryCards: ParentPortalSummaryCard[];
  studentCards: ParentPortalStudentCard[];
  actions: ParentPortalAction[];
  timeline: ParentPortalTimelineStep[];
  schoolShortName: string;
  paymentSummary: {
    amount: string;
    statusKey: string;
    helperKey: string;
    helperValues?: TranslationValues;
    ctaLabelKey: string;
  };
  updates: Array<{
    titleKey: string;
    detailKey: string;
    detailValues?: TranslationValues;
    tagKey: string;
  }>;
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
  admissionsContext?: ParentAdmissionsContext;
  parentPortal?: ParentPortalExperience;
};

export type ParentAdmissionsContext = {
  parentName: string;
  email: string;
  school: SchoolCode;
  students: AdmissionsStudentProfile[];
  studentName: string;
  currentSchool: string;
  targetGrade: string;
  hasExistingStudents: "yes" | "no";
  existingChildrenCount?: number;
  locationSuburb: string;
  notes?: string;
};

export type DashboardSearchParams = SearchParamsRecord;

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

export function getDashboardConfig(role: string, admissionsContext?: ParentAdmissionsContext | null): DashboardConfig | null {
  if (role === "student" || role === "staff") {
    return dashboardData[role];
  }

  if (role === "parent") {
    return admissionsContext ? createParentAdmissionsDashboard(admissionsContext) : dashboardData.parent;
  }

  return null;
}

/**
 * Shape we expect from GET /api/me (admission-service wrapped in Next
 * proxy). Keep narrow — we only read fields we actually use on the
 * dashboard. Any extra fields from the backend are ignored.
 */
export type ParentMePayload = {
  lead: {
    admissionId: string;
    email: string;
    parentName: string;
    whatsappNumber: string;
    schoolSelection: string; // "iihs" | "iiss" (lowercase from admission-services)
    location?: string | null;
    occupation?: string | null;
    isVerified: boolean;
    existingStudents?: number | null;
  };
  students: Array<{
    studentId: string;
    fullName: string;
    dateOfBirth: string;
    currentSchool: string;
    targetGradeLevel: string;
    notes?: string;
    applicantStatus?: string;
  }>;
  latestPayment?: {
    status: "pending" | "paid" | "expired" | "failed" | string;
    hostedInvoiceUrl?: string | null;
  } | null;
};

/**
 * Build a ParentAdmissionsContext from the backend /me payload. Returns null
 * if the payload is missing fields we need to render the parent dashboard
 * (e.g. at least one student, a known school, etc.) — the caller should
 * fall back to URL params in that case.
 */
export function getParentAdmissionsContextFromMePayload(payload: ParentMePayload | null): ParentAdmissionsContext | null {
  if (!payload) return null;

  const { lead, students } = payload;
  const school = lead.schoolSelection?.toLowerCase();
  if (school !== "iihs" && school !== "iiss") return null;
  if (!students || students.length === 0) return null;

  const mapped: AdmissionsStudentProfile[] = students.map((s) => ({
    studentName: s.fullName,
    studentBirthDate: s.dateOfBirth,
    currentSchool: s.currentSchool,
    targetGrade: s.targetGradeLevel,
    notes: s.notes,
    applicantStatus: s.applicantStatus,
    studentId: s.studentId,
  }));
  const primary = mapped[0];

  // The admission-service doesn't record a "did you already have kids
  // enrolled" flag in the lead beyond `existingStudents` (a count). We
  // infer the yes/no field from whether that count is > 0.
  const existingChildrenCount = lead.existingStudents ?? 0;
  const hasExistingStudents: "yes" | "no" = existingChildrenCount > 0 ? "yes" : "no";

  return {
    parentName: lead.parentName,
    email: lead.email,
    school,
    students: mapped,
    studentName: primary.studentName,
    currentSchool: primary.currentSchool,
    targetGrade: primary.targetGrade,
    hasExistingStudents,
    existingChildrenCount: hasExistingStudents === "yes" ? existingChildrenCount : undefined,
    locationSuburb: lead.location ?? "",
  };
}

export function getParentAdmissionsContextFromSearchParams(searchParams: DashboardSearchParams): ParentAdmissionsContext | null {
  const parentName = getSingleSearchParam(searchParams.parentName);
  const email = getSingleSearchParam(searchParams.email);
  const school = getSingleSearchParam(searchParams.school);
  const studentsValue = getSingleSearchParam(searchParams.students);
  const studentName = getSingleSearchParam(searchParams.studentName);
  const currentSchool = getSingleSearchParam(searchParams.currentSchool);
  const targetGrade = getSingleSearchParam(searchParams.targetGrade);
  const hasExistingStudents = getSingleSearchParam(searchParams.hasExistingStudents);
  const locationSuburb = getSingleSearchParam(searchParams.locationSuburb);
  const notes = getSingleSearchParam(searchParams.notes);
  const existingChildrenCountValue = getSingleSearchParam(searchParams.existingChildrenCount);
  const students = parseAdmissionsStudents(studentsValue) ?? parseLegacyAdmissionsStudent(studentName, currentSchool, targetGrade);

  if (!parentName || !email || !locationSuburb || !students?.length) {
    return null;
  }

  if ((school !== "iihs" && school !== "iiss") || (hasExistingStudents !== "yes" && hasExistingStudents !== "no")) {
    return null;
  }

  const primaryStudent = students[0];
  const existingChildrenCount =
    existingChildrenCountValue && Number.isFinite(Number(existingChildrenCountValue))
      ? Number(existingChildrenCountValue)
      : undefined;

  return {
    parentName,
    email,
    school,
    students,
    studentName: primaryStudent.studentName,
    currentSchool: primaryStudent.currentSchool,
    targetGrade: primaryStudent.targetGrade,
    hasExistingStudents,
    existingChildrenCount,
    locationSuburb,
    notes: notes ?? undefined,
  };
}

function createParentAdmissionsDashboard(context: ParentAdmissionsContext): DashboardConfig {
  const primaryStudent = context.students[0];
  const linkedStudents = context.hasExistingStudents === "yes" ? (context.existingChildrenCount ?? 0) + context.students.length : context.students.length;
  const attendanceValue = getAttendanceValue(primaryStudent.targetGrade);
  const assignmentCount = linkedStudents > 1 ? "5" : "3";
  const tuitionDue = context.school === "iihs" ? "Rp 2.400.000" : "Rp 2.100.000";
  const schoolName = context.school === "iihs" ? "IIHS" : "IISS";
  const additionalStudents = linkedStudents - 1;
  const siblingLabel = additionalStudents > 0 ? `${primaryStudent.studentName} + ${additionalStudents} sibling${additionalStudents > 1 ? "s" : ""}` : primaryStudent.studentName;
  const parentPortal = buildParentPortalExperience(context, schoolName);

  return {
    ...dashboardData.parent,
    navItems: buildParentPortalNavItems(context),
    subtitleKey: buildAdmissionsSubtitle(primaryStudent.studentName, context.students.length),
    metrics: [
      { labelKey: "dashboard.parent.metrics.linked_students.label", value: String(linkedStudents), trendKey: siblingLabel },
      { labelKey: "dashboard.parent.metrics.average_attendance.label", value: attendanceValue, trendKey: `Readiness snapshot for ${primaryStudent.studentName}` },
      { labelKey: "dashboard.parent.metrics.upcoming_assignments.label", value: assignmentCount, trendKey: `${primaryStudent.studentName} onboarding tasks` },
      { labelKey: "dashboard.parent.metrics.tuition_due.label", value: tuitionDue, trendKey: `${schoolName} admissions invoice` },
    ],
    progress: [
      { labelKey: `${primaryStudent.studentName} enrollment readiness`, value: 84, max: 100, helperKey: `Target grade ${toReadableGrade(primaryStudent.targetGrade)} at ${schoolName}` },
      { labelKey: `${primaryStudent.studentName} placement checklist`, value: 72, max: 100, helperKey: `Current school: ${primaryStudent.currentSchool}` },
      { labelKey: "Family onboarding completion", value: linkedStudents > 1 ? 78 : 66, max: 100, helperKey: `Parent account owner: ${context.parentName}` },
    ],
    alerts: [
      { titleKey: `${primaryStudent.studentName} file is ready for review`, detailKey: `Admissions has the EOI, OTP verification, and additional details from ${context.parentName}.`, priority: "high" },
      { titleKey: "Welcome call pending confirmation", detailKey: `Use ${context.email} for the first parent onboarding call in ${context.locationSuburb}.`, priority: "medium" },
      { titleKey: `${schoolName} orientation notice`, detailKey: `${primaryStudent.studentName} is queued for the next ${schoolName} orientation update.`, priority: "low" },
    ],
    schedule: [
      { time: "09:00", titleKey: "Admissions document review", metaKey: `${primaryStudent.studentName} · ${toReadableGrade(primaryStudent.targetGrade)}` },
      { time: "11:00", titleKey: "Parent onboarding call", metaKey: `${context.parentName} · ${context.email}` },
      { time: "14:00", titleKey: "Placement readiness check", metaKey: `${primaryStudent.currentSchool}` },
      { time: "16:30", titleKey: "School communication digest", metaKey: `${schoolName} parent bulletin` },
    ],
    tableRows: [
      ...context.students.flatMap((student) => [
        { columnA: student.studentName, columnB: "Admissions status", columnC: "Additional form complete", status: "excellent" as const },
        { columnA: student.studentName, columnB: "Target grade", columnC: toReadableGrade(student.targetGrade), status: "improving" as const },
      ]),
      { columnA: context.parentName, columnB: "Parent account", columnC: "Google / password access ready", status: "excellent" },
    ],
    admissionsContext: context,
    parentPortal,
  };
}

function parseAdmissionsStudents(value: string | null): AdmissionsStudentProfile[] | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return null;
    }

    const students = parsed.filter(isAdmissionsStudentProfile);
    return students.length > 0 ? students : null;
  } catch {
    return null;
  }
}

function parseLegacyAdmissionsStudent(
  studentName: string | null,
  currentSchool: string | null,
  targetGrade: string | null,
): AdmissionsStudentProfile[] | null {
  if (!studentName || !currentSchool || !targetGrade) {
    return null;
  }

  return [
    {
      studentName,
      currentSchool,
      targetGrade,
    },
  ];
}

function isAdmissionsStudentProfile(value: unknown): value is AdmissionsStudentProfile {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const hasRequiredFields =
    typeof candidate.studentName === "string" &&
    candidate.studentName.length > 0 &&
    typeof candidate.currentSchool === "string" &&
    candidate.currentSchool.length > 0 &&
    typeof candidate.targetGrade === "string" &&
    candidate.targetGrade.length > 0;

  if (!hasRequiredFields) {
    return false;
  }

  return candidate.studentBirthDate === undefined || typeof candidate.studentBirthDate === "string";
}

function buildAdmissionsSubtitle(primaryStudentName: string, studentCount: number): string {
  if (studentCount === 1) {
    return `Monitor ${primaryStudentName}'s onboarding, class readiness, tuition, and school communication in one place.`;
  }

  return `Monitor ${primaryStudentName} and ${studentCount - 1} more student${studentCount > 2 ? "s" : ""} across onboarding, class readiness, tuition, and school communication in one place.`;
}

function buildParentPortalExperience(
  context: ParentAdmissionsContext,
  schoolShortName: string,
): ParentPortalExperience {
  const studentCards = context.students.map((student, index) => {
    const templates = [
      {
        status: "excellent" as const,
        statusLabelKey: "dashboard.parent.portal.student.status.review_ready",
        progress: 84,
        stageLabelKey: "dashboard.parent.portal.student.stage.review",
        documentStatusKey: "dashboard.parent.portal.student.document.ready",
        nextActionLabelKey: "dashboard.parent.portal.student.action.book_assessment",
        nextActionDetailKey: "dashboard.parent.portal.student.action_detail.book_assessment",
        actionLabelKey: "dashboard.parent.portal.student.cta.view_file",
      },
      {
        status: "attention_needed" as const,
        statusLabelKey: "dashboard.parent.portal.student.status.documents_needed",
        progress: 68,
        stageLabelKey: "dashboard.parent.portal.student.stage.documents",
        documentStatusKey: "dashboard.parent.portal.student.document.pending",
        nextActionLabelKey: "dashboard.parent.portal.student.action.upload_documents",
        nextActionDetailKey: "dashboard.parent.portal.student.action_detail.upload_documents",
        actionLabelKey: "dashboard.parent.portal.student.cta.complete_requirements",
      },
      {
        status: "improving" as const,
        statusLabelKey: "dashboard.parent.portal.student.status.profile_complete",
        progress: 74,
        stageLabelKey: "dashboard.parent.portal.student.stage.profile",
        documentStatusKey: "dashboard.parent.portal.student.document.synced",
        nextActionLabelKey: "dashboard.parent.portal.student.action.confirm_profile",
        nextActionDetailKey: "dashboard.parent.portal.student.action_detail.confirm_profile",
        actionLabelKey: "dashboard.parent.portal.student.cta.review_details",
      },
    ] as const;
    const template = templates[index % templates.length];

    return {
      studentName: student.studentName,
      currentSchool: student.currentSchool,
      targetGrade: student.targetGrade,
      studentBirthDate: student.studentBirthDate,
      status: template.status,
      statusLabelKey: template.statusLabelKey,
      progress: template.progress,
      stageLabelKey: template.stageLabelKey,
      documentStatusKey: template.documentStatusKey,
      nextActionLabelKey: template.nextActionLabelKey,
      nextActionValues: { student: student.studentName },
      nextActionDetailKey: template.nextActionDetailKey,
      nextActionDetailValues: { student: student.studentName, school: schoolShortName },
      actionLabelKey: template.actionLabelKey,
      applicantStatus: student.applicantStatus,
      studentId: student.studentId,
    };
  });

  const averageProgress = Math.round(
    studentCards.reduce((sum, student) => sum + student.progress, 0) / Math.max(studentCards.length, 1),
  );

  const actions: ParentPortalAction[] = studentCards.slice(0, 3).map((studentCard) => ({
    titleKey: studentCard.nextActionLabelKey,
    titleValues: studentCard.nextActionValues,
    detailKey: studentCard.nextActionDetailKey,
    detailValues: studentCard.nextActionDetailValues,
    priority: studentCard.status === "attention_needed" ? "high" : studentCard.status === "improving" ? "medium" : "low",
    ctaLabelKey: studentCard.actionLabelKey,
  }));

  actions.push(
    context.notes?.trim()
      ? {
          titleKey: "dashboard.parent.portal.family_action.review_notes",
          detailKey: "dashboard.parent.portal.family_action.review_notes_detail",
          detailValues: { parent: context.parentName },
          priority: "medium",
          ctaLabelKey: "dashboard.parent.portal.family_action.cta_open_notes",
        }
      : {
          titleKey: "dashboard.parent.portal.family_action.confirm_contact",
          detailKey: "dashboard.parent.portal.family_action.confirm_contact_detail",
          detailValues: { email: context.email },
          priority: "low",
          ctaLabelKey: "dashboard.parent.portal.family_action.cta_update_contact",
        },
  );

  return {
    schoolShortName,
    summaryCards: [
      {
        labelKey: "dashboard.parent.portal.summary.registered_students.label",
        value: String(context.students.length),
        helperKey: "dashboard.parent.portal.summary.registered_students.helper",
        helperValues: { school: schoolShortName },
      },
      {
        labelKey: "dashboard.parent.portal.summary.active_applications.label",
        value: String(studentCards.length),
        helperKey: "dashboard.parent.portal.summary.active_applications.helper",
        helperValues: { count: studentCards.length },
      },
      {
        labelKey: "dashboard.parent.portal.summary.next_actions.label",
        value: String(actions.length),
        helperKey: "dashboard.parent.portal.summary.next_actions.helper",
        helperValues: { student: context.students[0]?.studentName ?? context.parentName },
      },
      {
        labelKey: "dashboard.parent.portal.summary.family_completion.label",
        value: `${averageProgress}%`,
        helperKey: "dashboard.parent.portal.summary.family_completion.helper",
        helperValues: { school: schoolShortName },
      },
    ],
    studentCards,
    actions,
    timeline: [
      {
        titleKey: "dashboard.parent.portal.timeline.eoi_submitted.title",
        detailKey: "dashboard.parent.portal.timeline.eoi_submitted.detail",
        detailValues: { count: context.students.length },
        state: "complete",
      },
      {
        titleKey: "dashboard.parent.portal.timeline.account_verified.title",
        detailKey: "dashboard.parent.portal.timeline.account_verified.detail",
        detailValues: { parent: context.parentName },
        state: "complete",
      },
      {
        titleKey: "dashboard.parent.portal.timeline.additional_details.title",
        detailKey: "dashboard.parent.portal.timeline.additional_details.detail",
        detailValues: { school: schoolShortName },
        state: "complete",
      },
      {
        titleKey: "dashboard.parent.portal.timeline.review.title",
        detailKey: "dashboard.parent.portal.timeline.review.detail",
        detailValues: { student: context.students[0]?.studentName ?? context.parentName },
        state: "active",
      },
      {
        titleKey: "dashboard.parent.portal.timeline.assessment.title",
        detailKey: "dashboard.parent.portal.timeline.assessment.detail",
        detailValues: { school: schoolShortName },
        state: "upcoming",
      },
      {
        titleKey: "dashboard.parent.portal.timeline.offer.title",
        detailKey: "dashboard.parent.portal.timeline.offer.detail",
        detailValues: { school: schoolShortName },
        state: "upcoming",
      },
    ],
    paymentSummary: {
      amount: context.school === "iihs" ? "Rp 2.400.000" : "Rp 2.100.000",
      statusKey: "dashboard.parent.portal.payments.status.pending",
      helperKey: "dashboard.parent.portal.payments.helper",
      helperValues: { school: schoolShortName },
      ctaLabelKey: "dashboard.parent.portal.payments.cta",
    },
    updates: [
      {
        titleKey: "dashboard.parent.portal.updates.orientation.title",
        detailKey: "dashboard.parent.portal.updates.orientation.detail",
        detailValues: { school: schoolShortName },
        tagKey: "dashboard.parent.portal.updates.tag.school",
      },
      {
        titleKey: "dashboard.parent.portal.updates.documents.title",
        detailKey: "dashboard.parent.portal.updates.documents.detail",
        detailValues: { count: context.students.length },
        tagKey: "dashboard.parent.portal.updates.tag.admissions",
      },
      {
        titleKey: "dashboard.parent.portal.updates.contact.title",
        detailKey: "dashboard.parent.portal.updates.contact.detail",
        detailValues: { email: context.email },
        tagKey: "dashboard.parent.portal.updates.tag.family",
      },
    ],
  };
}

function buildParentPortalNavItems(context: ParentAdmissionsContext): NavItem[] {
  return [
    {
      labelKey: "dashboard.parent.portal.nav.overview.label",
      descriptionKey: "dashboard.parent.portal.nav.overview.description",
      href: "#family-overview",
      active: true,
    },
    {
      labelKey: "dashboard.parent.portal.nav.students.label",
      descriptionKey: "dashboard.parent.portal.nav.students.description",
      descriptionValues: { count: context.students.length },
      href: "#registered-students",
      badge: String(context.students.length),
    },
    {
      labelKey: "dashboard.parent.portal.nav.timeline.label",
      descriptionKey: "dashboard.parent.portal.nav.timeline.description",
      href: "#admissions-timeline",
      badge: "6",
    },
    {
      labelKey: "dashboard.parent.portal.nav.actions.label",
      descriptionKey: "dashboard.parent.portal.nav.actions.description",
      href: "#next-actions",
      badge: String(Math.min(context.students.length + 1, 4)),
    },
    {
      labelKey: "dashboard.parent.portal.nav.payments.label",
      descriptionKey: "dashboard.parent.portal.nav.payments.description",
      href: "#payments-center",
    },
    {
      labelKey: "dashboard.parent.portal.nav.updates.label",
      descriptionKey: "dashboard.parent.portal.nav.updates.description",
      href: "#family-updates",
      badge: "3",
    },
    {
      labelKey: "dashboard.parent.portal.nav.messages.label",
      descriptionKey: "dashboard.parent.portal.nav.messages.description",
      href: "#contact-desk",
    },
  ];
}

function getAttendanceValue(targetGrade: string): string {
  if (targetGrade === "year11" || targetGrade === "year12") {
    return "91%";
  }

  if (targetGrade === "year9" || targetGrade === "year10") {
    return "93%";
  }

  return "95%";
}

function toReadableGrade(targetGrade: string): string {
  const match = /^year(\d+)$/i.exec(targetGrade);

  if (!match) {
    return targetGrade;
  }

  return `Year ${match[1]}`;
}
