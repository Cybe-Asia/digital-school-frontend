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
  /** Numeric badge count. When > 0, renders a highlighted pill beside
   *  the label. Set to 0 to explicitly suppress the badge. */
  badgeCount?: number;
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
  /** @deprecated legacy eyebrow label — kept to avoid breaking old
   *  consumers. New renderers prefer titleKey + subtitleKey. */
  labelKey: string;
  /** @deprecated legacy large number — new cards use sentence title. */
  value: string;
  /** @deprecated legacy helper line. */
  helperKey: string;
  /** @deprecated */
  helperValues?: TranslationValues;
  /** Sentence-style card title, e.g. "Ahmad hadir hari ini ✓". */
  titleKey?: string;
  titleValues?: TranslationValues;
  /** Short supporting copy under the title. */
  subtitleKey?: string;
  subtitleValues?: TranslationValues;
  /** Left-border tone. Drives the accent color. */
  tone?: "positive" | "warning" | "neutral" | "info";
  /** Optional anchor/URL the whole card jumps to on click. */
  href?: string;
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
  /** Per-kid SIS snapshot shown inside the "SIS today" section. Empty
   *  array when no kid is enrolled yet — the section simply hides. */
  sisToday: Array<{
    studentName: string;
    attendanceStatus?: "present" | "late" | "absent" | "excused" | "unknown";
    attendanceLabelKey: string;
    attendanceDetailKey: string;
    attendanceDetailValues?: TranslationValues;
    latestGrade?: {
      subject: string;
      term: string;
      scoreText: string;
      percentage: number;
    };
    sectionName?: string;
    homeroomTeacherName?: string;
  }>;
  /** Count of today's absences across all kids — feeds the nav badge. */
  sisAbsencesToday: number;
  /** Count of unread family updates — feeds the nav badge. We don't
   *  have read-state yet so every update counts as unread. */
  unreadUpdates: number;
  /** True when the outstanding payment is non-zero. Drives payments
   *  nav badge + the mobile "Pay" button destination. */
  hasUnpaidPayment: boolean;
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

/**
 * Static skeleton metadata (i18n keys, table column labels) for the parent
 * dashboard. Used as the chrome around the real data computed from /me +
 * SIS endpoints. There are deliberately no metric values, alerts, or rows
 * here — if the backend can't supply them we'd rather render a lighter
 * shell than invent numbers.
 */
const PARENT_DASHBOARD_SHELL = {
  role: "parent" as const,
  roleLabelKey: "dashboard.parent.role_label",
  titleKey: "dashboard.parent.title",
  subtitleKey: "dashboard.parent.subtitle",
  tableTitleKey: "dashboard.parent.table.title",
  tableColumnKeys: [
    "dashboard.parent.table.columns.child",
    "dashboard.parent.table.columns.focus_area",
    "dashboard.parent.table.columns.current_result",
    "dashboard.parent.table.columns.status",
  ] as [string, string, string, string],
};

export const dashboardRoles: DashboardRole[] = ["student", "parent", "staff"];

/**
 * Parent-scoped SIS data used to compute real metrics on the dashboard.
 * Pass null to fall back to the pre-SIS presentation (still driven by
 * /me context, just without attendance/grade rollups).
 */
export type ParentSisSnapshot = {
  sections: Array<{
    applicantStudentId: string;
    studentName: string;
    studentNumber: string;
    sectionId: string;
    sectionName: string;
    yearGroup: string;
    academicYear: string;
    schoolId: string;
    homeroomTeacherName?: string | null;
    homeroomTeacherEmail?: string | null;
  }>;
  attendance: Array<{
    applicantStudentId: string;
    studentName: string;
    sectionName: string;
    date: string;
    status: string;
  }>;
  grades: Array<{
    applicantStudentId: string;
    studentName: string;
    sectionName: string;
    subject: string;
    term: string;
    score: number;
    maxScore: number;
    recordedAt: string;
  }>;
};

export function getDashboardConfig(
  role: string,
  admissionsContext?: ParentAdmissionsContext | null,
  sisSnapshot?: ParentSisSnapshot | null,
): DashboardConfig | null {
  // The student persona dashboard still needs a real API. Until a backend
  // persona/student endpoint lands, return null and let the route render
  // a 404 rather than populating the screen with placeholder metrics.
  // TODO: real API — wire to student-service when the persona is built.
  if (role === "student") {
    return null;
  }

  // Staff no longer owns a dashboard here — /dashboard/staff redirects to
  // /admin/admissions before this branch is reached. Kept null for safety
  // so any residual direct call also 404s instead of returning fixtures.
  if (role === "staff") {
    return null;
  }

  if (role === "parent") {
    // Parent dashboard is strict: without an admissions context we can't
    // render real data, and we will NOT return a mock shell. The
    // /parent/dashboard page handles this by showing an explicit error
    // panel.
    if (!admissionsContext) {
      return null;
    }
    return createParentAdmissionsDashboard(admissionsContext, sisSnapshot ?? null);
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
  // admission-service stores schoolSelection as either raw "iiss"/"iihs"
  // (legacy) or prefixed "SCH-IISS"/"SCH-IIHS" (current seed format).
  // Strip the prefix before matching so both shapes land on the same
  // dashboard context.
  const school = lead.schoolSelection?.toLowerCase().replace(/^sch-/, "");
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

function createParentAdmissionsDashboard(
  context: ParentAdmissionsContext,
  sis: ParentSisSnapshot | null,
): DashboardConfig {
  const primaryStudent = context.students[0];
  const linkedStudents = context.hasExistingStudents === "yes"
    ? (context.existingChildrenCount ?? 0) + context.students.length
    : context.students.length;
  const schoolName = context.school === "iihs" ? "IIHS" : "IISS";
  const parentPortal = buildParentPortalExperience(context, schoolName, sis);

  // --- Real SIS rollups (fall back to zeros / admissions-stage text when no
  //     SIS data is present yet, e.g. kid still in test/docs stage).
  const attendance = sis?.attendance ?? [];
  const grades = sis?.grades ?? [];
  const sections = sis?.sections ?? [];

  const attendedCount = attendance.filter((a) => a.status === "present" || a.status === "late").length;
  const attendancePct = attendance.length > 0
    ? Math.round((attendedCount / attendance.length) * 100)
    : null;

  // Count outstanding action items: unsubmitted test bookings, unuploaded
  // docs, unaccepted offers — approximated via applicantStatus. Precise
  // counts live in downstream endpoints; this is the 'nudge' cell.
  const outstandingActions = context.students.filter((s) => {
    const st = s.applicantStatus ?? "";
    return ["test_pending", "documents_pending", "offer_issued"].includes(st);
  }).length;

  // --- Metrics (top 4 tiles).
  const metrics = [
    {
      labelKey: "dashboard.parent.metrics.linked_students.label",
      value: String(linkedStudents),
      trendKey: context.students.map((s) => s.studentName).join(" · ") || primaryStudent.studentName,
    },
    {
      labelKey: "dashboard.parent.metrics.average_attendance.label",
      value: attendancePct != null ? `${attendancePct}%` : "—",
      trendKey: attendance.length > 0
        ? `${attendedCount}/${attendance.length} days · ${sections[0]?.sectionName ?? ""}`
        : "Attendance starts once the term begins",
    },
    {
      labelKey: "dashboard.parent.metrics.upcoming_assignments.label",
      value: String(outstandingActions),
      trendKey: outstandingActions > 0 ? "Action needed on your dashboard below" : "Nothing waiting",
    },
    {
      labelKey: "dashboard.parent.metrics.tuition_due.label",
      value: "Rp 0",
      trendKey: "Recurring tuition billing not live yet",
    },
  ];

  // --- Progress bars: per-kid academic average (if grades present) +
  //     per-kid attendance % (if attendance present). Fall back to
  //     admissions-progression signal when SIS silent.
  const perKidGradeAverage = (studentId: string): number | null => {
    const mine = grades.filter((g) => g.applicantStudentId === studentId && g.maxScore > 0);
    if (mine.length === 0) return null;
    const total = mine.reduce((acc, g) => acc + (g.score / g.maxScore) * 100, 0);
    return Math.round(total / mine.length);
  };
  const perKidAttendancePct = (studentId: string): number | null => {
    const mine = attendance.filter((a) => a.applicantStudentId === studentId);
    if (mine.length === 0) return null;
    const attended = mine.filter((a) => a.status === "present" || a.status === "late").length;
    return Math.round((attended / mine.length) * 100);
  };

  const progress = context.students.flatMap((student) => {
    const sid = student.studentId ?? "";
    if (!sid) return [];
    const gradeAvg = perKidGradeAverage(sid);
    const attPct = perKidAttendancePct(sid);
    const rows: { labelKey: string; value: number; max: number; helperKey: string }[] = [];
    if (gradeAvg != null) {
      rows.push({
        labelKey: `${student.studentName} academic average`,
        value: gradeAvg,
        max: 100,
        helperKey: `Across ${grades.filter((g) => g.applicantStudentId === sid).length} graded subject(s)`,
      });
    }
    if (attPct != null) {
      rows.push({
        labelKey: `${student.studentName} attendance`,
        value: attPct,
        max: 100,
        helperKey: `Last ${attendance.filter((a) => a.applicantStudentId === sid).length} days`,
      });
    }
    return rows;
  });

  // --- Alerts: derived from applicantStatus + attendance today.
  const alerts: DashboardConfig["alerts"] = [];
  const todayIso = new Date().toISOString().slice(0, 10);
  const absentToday = attendance.find((a) => a.date === todayIso && a.status === "absent");
  if (absentToday) {
    alerts.push({
      titleKey: `${absentToday.studentName} marked absent today`,
      detailKey: `Section ${absentToday.sectionName}. Contact the homeroom teacher if this is unexpected.`,
      priority: "high",
    });
  }
  for (const s of context.students) {
    const st = s.applicantStatus ?? "";
    if (st === "test_pending") {
      alerts.push({
        titleKey: `${s.studentName} needs to book a test`,
        detailKey: "Use the 'Book test now' card below to pick a slot.",
        priority: "medium",
      });
    } else if (st === "documents_pending") {
      alerts.push({
        titleKey: `${s.studentName} has outstanding documents`,
        detailKey: "Upload the required files from the documents panel.",
        priority: "medium",
      });
    } else if (st === "offer_issued") {
      alerts.push({
        titleKey: `${s.studentName} has an offer waiting`,
        detailKey: "Review and accept the admissions offer on your dashboard.",
        priority: "high",
      });
    }
  }
  if (alerts.length === 0) {
    alerts.push({
      titleKey: "Everything is on track",
      detailKey: "No outstanding admissions actions for your family.",
      priority: "low",
    });
  }

  // --- Schedule: replace the mock timetable with contextual links
  //     ("next steps" list derived from state).
  const schedule = [
    ...(sections[0]?.homeroomTeacherName
      ? [{
          time: "—",
          titleKey: `Homeroom: ${sections[0].homeroomTeacherName}`,
          metaKey: sections[0].homeroomTeacherEmail || sections[0].sectionName,
        }]
      : []),
    ...(grades.slice(0, 3).map((g) => ({
      time: formatShortDate(g.recordedAt),
      titleKey: `${g.studentName} — ${g.subject} ${g.term}`,
      metaKey: `${g.score} / ${g.maxScore} (${Math.round((g.score / g.maxScore) * 100)}%)`,
    }))),
  ];
  if (schedule.length === 0) {
    schedule.push({
      time: "",
      titleKey: "Recent activity will show here",
      metaKey: "Grades and section updates appear once the school posts them.",
    });
  }

  // --- Table: per-kid per-subject grade rows + an attendance row.
  const tableRows = [
    ...context.students.flatMap((student) => {
      const sid = student.studentId ?? "";
      if (!sid) return [];
      const kidGrades = grades.filter((g) => g.applicantStudentId === sid);
      const gradeRows = kidGrades.slice(0, 3).map((g) => ({
        columnA: student.studentName,
        columnB: `${g.subject} · ${g.term}`,
        columnC: `${g.score}/${g.maxScore}`,
        status: (g.score / g.maxScore >= 0.85
          ? "excellent"
          : g.score / g.maxScore >= 0.7
            ? "improving"
            : "attention_needed") as "excellent" | "improving" | "attention_needed",
      }));
      const attPct = perKidAttendancePct(sid);
      const attendanceRow = attPct != null
        ? [{
            columnA: student.studentName,
            columnB: "Attendance",
            columnC: `${attPct}%`,
            status: (attPct >= 90 ? "excellent" : attPct >= 75 ? "watchlist" : "attention_needed") as
              "excellent" | "watchlist" | "attention_needed",
          }]
        : [];
      return [...gradeRows, ...attendanceRow];
    }),
  ];
  if (tableRows.length === 0) {
    // Still pre-enrolment — show admissions progression per kid.
    tableRows.push(
      ...context.students.flatMap((s) => [
        { columnA: s.studentName, columnB: "Admissions stage", columnC: s.applicantStatus ?? "submitted", status: "improving" as const },
      ]),
    );
  }

  return {
    ...PARENT_DASHBOARD_SHELL,
    navItems: buildParentPortalNavItems(context, parentPortal),
    subtitleKey: buildAdmissionsSubtitle(primaryStudent.studentName, context.students.length),
    metrics,
    progress: progress.length > 0
      ? progress
      : [
          // Pre-SIS fallback: show admissions funnel progression per kid.
          ...context.students.slice(0, 3).map((s) => ({
            labelKey: `${s.studentName} admissions progress`,
            value: admissionsProgressValue(s.applicantStatus),
            max: 100,
            helperKey: `Current stage: ${s.applicantStatus ?? "submitted"}`,
          })),
        ],
    alerts,
    schedule,
    tableRows,
    admissionsContext: context,
    parentPortal,
  };
}

/**
 * Maps a Student.applicantStatus to a 0-100 progression value so the
 * pre-SIS dashboard can still show meaningful progress bars.
 */
function admissionsProgressValue(status?: string): number {
  const map: Record<string, number> = {
    draft: 5,
    submitted: 15,
    test_pending: 25,
    test_scheduled: 35,
    test_completed: 45,
    test_approved: 55,
    test_failed: 30,
    documents_pending: 65,
    documents_verified: 75,
    offer_issued: 85,
    offer_accepted: 90,
    offer_declined: 85,
    enrolment_paid: 95,
    handed_to_sis: 100,
    rejected: 10,
    withdrawn: 10,
  };
  return status ? map[status] ?? 10 : 10;
}

function formatShortDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return iso.slice(0, 10);
  }
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
  sis: ParentSisSnapshot | null,
): ParentPortalExperience {
  const todayIso = new Date().toISOString().slice(0, 10);
  const attendance = sis?.attendance ?? [];
  const grades = sis?.grades ?? [];
  const sections = sis?.sections ?? [];

  // Build per-kid SIS "today" snapshot — attendance (if a row exists
  // for today) + the most recent graded subject. Kids without a
  // studentId (pre-/me deep link) are skipped.
  const sisToday: ParentPortalExperience["sisToday"] = context.students
    .filter((s) => Boolean(s.studentId))
    .map((student) => {
      const sid = student.studentId!;
      const todayRow = attendance.find((a) => a.applicantStudentId === sid && a.date === todayIso);
      const kidSection = sections.find((sec) => sec.applicantStudentId === sid);
      const kidGrades = grades
        .filter((g) => g.applicantStudentId === sid)
        .sort((a, b) => (a.recordedAt < b.recordedAt ? 1 : -1));
      const latestGrade = kidGrades[0];
      const status = (todayRow?.status as
        | "present"
        | "late"
        | "absent"
        | "excused"
        | undefined) ?? "unknown";

      const attendanceLabelKey =
        status === "present"
          ? "dashboard.parent.portal.sis_today.attendance.present"
          : status === "late"
            ? "dashboard.parent.portal.sis_today.attendance.late"
            : status === "absent"
              ? "dashboard.parent.portal.sis_today.attendance.absent"
              : status === "excused"
                ? "dashboard.parent.portal.sis_today.attendance.excused"
                : "dashboard.parent.portal.sis_today.attendance.unknown";
      const attendanceDetailKey =
        status === "unknown"
          ? "dashboard.parent.portal.sis_today.attendance.unknown_detail"
          : "dashboard.parent.portal.sis_today.attendance.detail";

      return {
        studentName: student.studentName,
        attendanceStatus: status,
        attendanceLabelKey,
        attendanceDetailKey,
        attendanceDetailValues: {
          section: kidSection?.sectionName ?? "",
        },
        latestGrade: latestGrade
          ? {
              subject: latestGrade.subject,
              term: latestGrade.term,
              scoreText: `${latestGrade.score}/${latestGrade.maxScore}`,
              percentage:
                latestGrade.maxScore > 0
                  ? Math.round((latestGrade.score / latestGrade.maxScore) * 100)
                  : 0,
            }
          : undefined,
        sectionName: kidSection?.sectionName,
        homeroomTeacherName: kidSection?.homeroomTeacherName ?? undefined,
      };
    });

  const sisAbsencesToday = attendance.filter(
    (a) => a.date === todayIso && a.status === "absent",
  ).length;
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

  // --- Sentence-style summary cards. Each card rewrites the old
  //     label/value pair into a full parent-friendly sentence, and
  //     falls back to contextual copy when SIS data isn't there yet
  //     (pre-enrolled kid) — never fakes numbers.
  const primaryKidName = context.students[0]?.studentName ?? context.parentName;
  const primaryKidToday = sisToday[0];
  const attendanceCard: ParentPortalSummaryCard = primaryKidToday
    ? primaryKidToday.attendanceStatus === "present" || primaryKidToday.attendanceStatus === "late"
      ? {
          labelKey: "dashboard.parent.portal.summary.attendance.label",
          value: "",
          helperKey: "dashboard.parent.portal.summary.attendance.helper_present",
          titleKey: "dashboard.parent.portal.summary.attendance.title_present",
          titleValues: { student: primaryKidToday.studentName },
          subtitleKey: "dashboard.parent.portal.summary.attendance.subtitle_present",
          subtitleValues: { section: primaryKidToday.sectionName ?? "" },
          tone: "positive",
          href: "#sis-today",
        }
      : primaryKidToday.attendanceStatus === "absent"
        ? {
            labelKey: "dashboard.parent.portal.summary.attendance.label",
            value: "",
            helperKey: "dashboard.parent.portal.summary.attendance.helper_absent",
            titleKey: "dashboard.parent.portal.summary.attendance.title_absent",
            titleValues: { student: primaryKidToday.studentName },
            subtitleKey: "dashboard.parent.portal.summary.attendance.subtitle_absent",
            tone: "warning",
            href: "#sis-today",
          }
        : {
            labelKey: "dashboard.parent.portal.summary.attendance.label",
            value: "",
            helperKey: "dashboard.parent.portal.summary.attendance.helper_pending",
            titleKey: "dashboard.parent.portal.summary.attendance.title_pending",
            titleValues: { student: primaryKidToday.studentName },
            subtitleKey: "dashboard.parent.portal.summary.attendance.subtitle_pending",
            tone: "neutral",
            href: "#sis-today",
          }
    : {
        labelKey: "dashboard.parent.portal.summary.attendance.label",
        value: "",
        helperKey: "dashboard.parent.portal.summary.attendance.helper_no_data",
        titleKey: "dashboard.parent.portal.summary.attendance.title_no_data",
        titleValues: { student: primaryKidName },
        subtitleKey: "dashboard.parent.portal.summary.attendance.subtitle_no_data",
        tone: "neutral",
        href: "#registered-students",
      };

  // Average grade across all kids with grade data — drops to contextual
  // copy when no grades exist yet.
  const allGraded = grades.filter((g) => g.maxScore > 0);
  const gradeAvg = allGraded.length > 0
    ? Math.round(
        allGraded.reduce((acc, g) => acc + (g.score / g.maxScore) * 100, 0) / allGraded.length,
      )
    : null;
  const gradeCard: ParentPortalSummaryCard = gradeAvg != null
    ? {
        labelKey: "dashboard.parent.portal.summary.grades.label",
        value: "",
        helperKey: "dashboard.parent.portal.summary.grades.helper",
        titleKey: "dashboard.parent.portal.summary.grades.title",
        titleValues: { average: gradeAvg },
        subtitleKey: "dashboard.parent.portal.summary.grades.subtitle",
        subtitleValues: { count: allGraded.length },
        tone: gradeAvg >= 85 ? "positive" : gradeAvg >= 70 ? "info" : "warning",
        href: "#sis-today",
      }
    : {
        labelKey: "dashboard.parent.portal.summary.grades.label",
        value: "",
        helperKey: "dashboard.parent.portal.summary.grades.helper_empty",
        titleKey: "dashboard.parent.portal.summary.grades.title_empty",
        titleValues: { student: primaryKidName },
        subtitleKey: "dashboard.parent.portal.summary.grades.subtitle_empty",
        tone: "neutral",
        href: "#admissions-timeline",
      };

  // Payment card. Recurring tuition billing is not live yet — we don't
  // have a per-kid billing endpoint that returns an amount for the parent
  // dashboard, only admission-stage payments through the admissions
  // portal. Until that lands we render an em-dash placeholder and flag
  // the payment as unpaid so the "Pay" quick action remains visible.
  // TODO: real API — wire `paymentAmount` and `hasUnpaidPayment` to a
  // parent-scoped billing endpoint once finance stands one up.
  const paymentAmount = "—";
  const hasUnpaidPayment = true;
  const paymentCard: ParentPortalSummaryCard = {
    labelKey: "dashboard.parent.portal.summary.tuition.label",
    value: "",
    helperKey: "dashboard.parent.portal.summary.tuition.helper",
    titleKey: "dashboard.parent.portal.summary.tuition.title",
    titleValues: { amount: paymentAmount },
    subtitleKey: "dashboard.parent.portal.summary.tuition.subtitle",
    tone: "info",
    href: "#payments-center",
  };

  // Actions card — counts high-priority items only (avoids "4 tasks" when
  // three are low-priority filler).
  const highPriorityActionCount = actions.filter((a) => a.priority === "high").length;
  const anyActionCount = actions.length;
  const actionsCard: ParentPortalSummaryCard = highPriorityActionCount > 0
    ? {
        labelKey: "dashboard.parent.portal.summary.actions.label",
        value: "",
        helperKey: "dashboard.parent.portal.summary.actions.helper_pending",
        titleKey: "dashboard.parent.portal.summary.actions.title_pending",
        titleValues: { count: highPriorityActionCount },
        subtitleKey: "dashboard.parent.portal.summary.actions.subtitle_pending",
        tone: "warning",
        href: "#action-items",
      }
    : anyActionCount > 0
      ? {
          labelKey: "dashboard.parent.portal.summary.actions.label",
          value: "",
          helperKey: "dashboard.parent.portal.summary.actions.helper_light",
          titleKey: "dashboard.parent.portal.summary.actions.title_light",
          titleValues: { count: anyActionCount },
          subtitleKey: "dashboard.parent.portal.summary.actions.subtitle_light",
          tone: "info",
          href: "#action-items",
        }
      : {
          labelKey: "dashboard.parent.portal.summary.actions.label",
          value: "",
          helperKey: "dashboard.parent.portal.summary.actions.helper_clear",
          titleKey: "dashboard.parent.portal.summary.actions.title_clear",
          subtitleKey: "dashboard.parent.portal.summary.actions.subtitle_clear",
          tone: "positive",
          href: "#action-items",
        };

  return {
    schoolShortName,
    summaryCards: [attendanceCard, gradeCard, paymentCard, actionsCard],
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
    // TODO: real API — bill-of-materials / billing endpoint is not live
    // for parents yet, so the amount stays as an em-dash and the pill
    // says "pending" rather than quoting a fabricated IDR value.
    paymentSummary: {
      amount: paymentAmount,
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
    sisToday,
    sisAbsencesToday,
    // TODO: real API — unread-updates count needs a messages/inbox
    // endpoint; for now we surface zero rather than a canned "3".
    unreadUpdates: 0,
    hasUnpaidPayment,
  };
}

function buildParentPortalNavItems(
  context: ParentAdmissionsContext,
  portal: ParentPortalExperience,
): NavItem[] {
  const highPriorityActionCount = portal.actions.filter((a) => a.priority === "high").length;
  const sisBadge = portal.sisAbsencesToday;
  return [
    {
      labelKey: "dashboard.parent.portal.nav.actions.label",
      descriptionKey: "dashboard.parent.portal.nav.actions.description",
      href: "#action-items",
      badgeCount: highPriorityActionCount,
    },
    {
      labelKey: "dashboard.parent.portal.nav.students.label",
      descriptionKey: "dashboard.parent.portal.nav.students.description",
      descriptionValues: { count: context.students.length },
      href: "#registered-students",
      badgeCount: context.students.length,
    },
    {
      labelKey: "dashboard.parent.portal.nav.sis_today.label",
      descriptionKey: "dashboard.parent.portal.nav.sis_today.description",
      href: "#sis-today",
      badgeCount: sisBadge,
    },
    {
      labelKey: "dashboard.parent.portal.nav.payments.label",
      descriptionKey: "dashboard.parent.portal.nav.payments.description",
      href: "#payments-center",
      badgeCount: portal.hasUnpaidPayment ? 1 : 0,
    },
    {
      labelKey: "dashboard.parent.portal.nav.updates.label",
      descriptionKey: "dashboard.parent.portal.nav.updates.description",
      href: "#family-updates",
      badgeCount: portal.unreadUpdates,
    },
    {
      labelKey: "dashboard.parent.portal.nav.timeline.label",
      descriptionKey: "dashboard.parent.portal.nav.timeline.description",
      href: "#admissions-timeline",
    },
    {
      labelKey: "dashboard.parent.portal.nav.messages.label",
      descriptionKey: "dashboard.parent.portal.nav.messages.description",
      href: "#contact-desk",
    },
  ];
}

// getAttendanceValue + toReadableGrade removed — the real SIS attendance
// percentage now comes from /me/attendance and grade labels from the
// admissionsContext directly.
