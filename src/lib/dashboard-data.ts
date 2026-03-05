export type DashboardRole = "student" | "parent" | "staff";

export type NavItem = {
  label: string;
  active?: boolean;
};

export type Metric = {
  label: string;
  value: string;
  trend: string;
};

export type ProgressItem = {
  label: string;
  value: number;
  max: number;
  helper: string;
};

export type AlertItem = {
  title: string;
  detail: string;
  priority: "High" | "Medium" | "Low";
};

export type ScheduleItem = {
  time: string;
  title: string;
  meta: string;
};

export type TableRow = {
  columnA: string;
  columnB: string;
  columnC: string;
  status: string;
};

export type DashboardConfig = {
  role: DashboardRole;
  roleLabel: string;
  title: string;
  subtitle: string;
  navItems: NavItem[];
  metrics: Metric[];
  progress: ProgressItem[];
  alerts: AlertItem[];
  schedule: ScheduleItem[];
  tableTitle: string;
  tableColumns: [string, string, string, string];
  tableRows: TableRow[];
};

export const dashboardData: Record<DashboardRole, DashboardConfig> = {
  student: {
    role: "student",
    roleLabel: "Student Portal",
    title: "Learning Command Center",
    subtitle:
      "Track assignments, grades, attendance, and upcoming live classes from one dashboard.",
    navItems: [
      { label: "Dashboard", active: true },
      { label: "My Learning" },
      { label: "Assignments" },
      { label: "Attendance" },
      { label: "Live Sessions" },
      { label: "Messages" },
      { label: "Finance" },
    ],
    metrics: [
      { label: "Active Courses", value: "6", trend: "+1 this term" },
      { label: "Assignments Due", value: "3", trend: "2 due this week" },
      { label: "Attendance", value: "94%", trend: "+2% vs last month" },
      { label: "Outstanding Invoice", value: "Rp 1.250.000", trend: "Due 10 Mar" },
    ],
    progress: [
      { label: "Math Grade Average", value: 82, max: 100, helper: "Aligned with roadmap KPI" },
      { label: "Science Completion", value: 76, max: 100, helper: "3 modules remaining" },
      { label: "Quran Studies", value: 91, max: 100, helper: "On track for distinction" },
    ],
    alerts: [
      {
        title: "Physics Quiz Deadline",
        detail: "Submit Quiz 4 before Friday, 20:00 WIB.",
        priority: "High",
      },
      {
        title: "Attendance Reminder",
        detail: "No absence records this week. Keep the streak.",
        priority: "Low",
      },
      {
        title: "Payment Notice",
        detail: "Tuition invoice #INV-0287 is waiting for payment.",
        priority: "Medium",
      },
    ],
    schedule: [
      { time: "08:00", title: "Live Math Session", meta: "Class 10A · Room Virtual-2" },
      { time: "10:30", title: "Arabic Assignment Review", meta: "Mentor: Ust. Rafi" },
      { time: "13:15", title: "Science Lab Discussion", meta: "Project Team B" },
      { time: "15:00", title: "Tahfidz Checkpoint", meta: "Weekly progress sync" },
    ],
    tableTitle: "Recent Grades",
    tableColumns: ["Subject", "Latest Score", "Teacher", "Status"],
    tableRows: [
      { columnA: "Mathematics", columnB: "84", columnC: "Ms. Dina", status: "Improving" },
      { columnA: "Science", columnB: "79", columnC: "Mr. Arif", status: "Needs Review" },
      { columnA: "English", columnB: "88", columnC: "Ms. Nita", status: "Excellent" },
      { columnA: "Quran Studies", columnB: "93", columnC: "Ust. Fikri", status: "Excellent" },
    ],
  },
  parent: {
    role: "parent",
    roleLabel: "Parent Portal",
    title: "Family Learning Overview",
    subtitle:
      "Monitor child progress, assignments, tuition, and school communications in one place.",
    navItems: [
      { label: "Dashboard", active: true },
      { label: "Children" },
      { label: "Learning Progress" },
      { label: "Attendance" },
      { label: "Payments" },
      { label: "Announcements" },
      { label: "Messages" },
    ],
    metrics: [
      { label: "Linked Students", value: "2", trend: "Aisha & Rayyan" },
      { label: "Average Attendance", value: "92%", trend: "Stable this month" },
      { label: "Upcoming Assignments", value: "5", trend: "Across all children" },
      { label: "Tuition Due", value: "Rp 2.400.000", trend: "2 invoices pending" },
    ],
    progress: [
      { label: "Aisha Academic Progress", value: 87, max: 100, helper: "Top 15% in class" },
      { label: "Rayyan Assignment Completion", value: 72, max: 100, helper: "2 tasks overdue" },
      { label: "Family Payment Completion", value: 68, max: 100, helper: "Target full payment by Mar 12" },
    ],
    alerts: [
      {
        title: "Overdue Tuition Reminder",
        detail: "Invoice #INV-0304 is 4 days overdue.",
        priority: "High",
      },
      {
        title: "Parent-Teacher Meeting",
        detail: "Meeting slot opens tomorrow at 09:00 WIB.",
        priority: "Medium",
      },
      {
        title: "New School Announcement",
        detail: "Ramadan schedule adjustment has been published.",
        priority: "Low",
      },
    ],
    schedule: [
      { time: "09:00", title: "Payment Follow-up Window", meta: "Finance Office" },
      { time: "11:00", title: "Teacher Consultation", meta: "Aisha · Mathematics" },
      { time: "14:00", title: "Assignment Checkpoint", meta: "Rayyan · Science" },
      { time: "16:30", title: "School Broadcast", meta: "Weekly parent bulletin" },
    ],
    tableTitle: "Child Performance Snapshot",
    tableColumns: ["Child", "Focus Area", "Current Result", "Status"],
    tableRows: [
      { columnA: "Aisha", columnB: "Math Average", columnC: "89", status: "Excellent" },
      { columnA: "Aisha", columnB: "Attendance", columnC: "96%", status: "Excellent" },
      { columnA: "Rayyan", columnB: "Science Tasks", columnC: "72%", status: "Attention Needed" },
      { columnA: "Rayyan", columnB: "Attendance", columnC: "88%", status: "Watchlist" },
    ],
  },
  staff: {
    role: "staff",
    roleLabel: "Staff/Admin Portal",
    title: "Operations & Academic Control",
    subtitle:
      "Oversee student lifecycle, academic operations, attendance, finance, and communication performance.",
    navItems: [
      { label: "Dashboard", active: true },
      { label: "Student Management" },
      { label: "Academic Calendar" },
      { label: "Attendance" },
      { label: "Finance" },
      { label: "Admissions" },
      { label: "Reports" },
    ],
    metrics: [
      { label: "Active Students", value: "1,248", trend: "+34 this semester" },
      { label: "Classes Today", value: "46", trend: "5 with live sessions" },
      { label: "Attendance Violations", value: "18", trend: "-6 vs last week" },
      { label: "Overdue Invoices", value: "73", trend: "Collection rate 91%" },
    ],
    progress: [
      { label: "Grade Sync Integrity", value: 99, max: 100, helper: "No reconciliation drift" },
      { label: "Admissions Conversion", value: 64, max: 100, helper: "Phase 1 target: 70%" },
      { label: "Report SLA Completion", value: 83, max: 100, helper: "17 reports pending approval" },
    ],
    alerts: [
      {
        title: "High Priority Attendance Cluster",
        detail: "Class 8B crossed absentee threshold this week.",
        priority: "High",
      },
      {
        title: "Finance Escalation",
        detail: "11 invoices are entering aging bucket 30+ days.",
        priority: "High",
      },
      {
        title: "Admissions Task Queue",
        detail: "24 candidates awaiting document verification.",
        priority: "Medium",
      },
    ],
    schedule: [
      { time: "07:30", title: "Morning Operations Brief", meta: "Staff room sync" },
      { time: "10:00", title: "Attendance Exception Review", meta: "Counselor + Homeroom" },
      { time: "13:00", title: "Finance Reconciliation Check", meta: "Gateway status + aging" },
      { time: "15:30", title: "Daily Reporting Cutoff", meta: "Generate admin summary" },
    ],
    tableTitle: "Operational Queue",
    tableColumns: ["Process", "Owner", "SLA", "Status"],
    tableRows: [
      { columnA: "Grade Sync Verification", columnB: "Academic Ops", columnC: "Today 17:00", status: "On Track" },
      { columnA: "Invoice Aging Escalation", columnB: "Finance Team", columnC: "Today 14:00", status: "At Risk" },
      { columnA: "Admissions Review Batch", columnB: "Admissions Team", columnC: "Tomorrow 10:00", status: "On Track" },
      { columnA: "Attendance Audit Export", columnB: "Discipline Unit", columnC: "Today 16:00", status: "Delayed" },
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
