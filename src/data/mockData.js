// Central mock data source for the EduNova Superadmin dashboard.
// In production this would be replaced by API calls; the shapes below
// are what the UI is designed against.

export const platformStats = {
  applicants: 18420,
  applications: 15932,
  admissionsOffered: 4210,
  revenue: 238680000, // kobo-free naira figure for display
};

export const systemHealth = [
  { name: "API", status: "operational", detail: "142ms avg response" },
  { name: "Database", status: "operational", detail: "12ms query latency" },
  { name: "Storage", status: "operational", detail: "62% capacity used" },
  { name: "Authentication", status: "operational", detail: "0 failed handshakes" },
  { name: "Email", status: "degraded", detail: "Queue backlog: 340 messages" },
  { name: "Payment Gateway", status: "operational", detail: "Paystack · Remita" },
];

export const admins = [
  { id: "ADM-001", name: "John Adams", email: "j.adams@edunova.edu.ng", role: "Admissions Admin", status: "Active", lastActive: "2 min ago" },
  { id: "ADM-002", name: "Sarah Williams", email: "s.williams@edunova.edu.ng", role: "Reviewer", status: "Active", lastActive: "14 min ago" },
  { id: "ADM-003", name: "Michael Cole", email: "m.cole@edunova.edu.ng", role: "Finance Admin", status: "Suspended", lastActive: "6 days ago" },
  { id: "ADM-004", name: "Grace Nnamdi", email: "g.nnamdi@edunova.edu.ng", role: "Application Reviewer", status: "Active", lastActive: "1 hr ago" },
  { id: "ADM-005", name: "Tunde Bakare", email: "t.bakare@edunova.edu.ng", role: "Support Officer", status: "Active", lastActive: "38 min ago" },
  { id: "ADM-006", name: "Amara Chukwu", email: "a.chukwu@edunova.edu.ng", role: "Finance Officer", status: "Disabled", lastActive: "22 days ago" },
];

export const roleHierarchy = [
  { name: "Superadmin", note: "Full platform control" },
  { name: "Admissions Admin", note: "Manages the admissions pipeline" },
  { name: "Application Reviewer", note: "Reviews and scores applications" },
  { name: "Finance Officer", note: "Handles payments and reconciliation" },
  { name: "Support Officer", note: "Applicant-facing assistance" },
];

export const permissionModules = [
  {
    module: "Applicants",
    permissions: {
      Superadmin: { View: true, Search: true, Delete: true },
      "Admissions Admin": { View: true, Search: true, Delete: false },
      "Application Reviewer": { View: true, Search: true, Delete: false },
      "Finance Officer": { View: true, Search: false, Delete: false },
      "Support Officer": { View: true, Search: true, Delete: false },
    },
  },
  {
    module: "Applications",
    permissions: {
      Superadmin: { View: true, Review: true, Approve: true, Delete: true },
      "Admissions Admin": { View: true, Review: true, Approve: true, Delete: false },
      "Application Reviewer": { View: true, Review: true, Approve: false, Delete: false },
      "Finance Officer": { View: true, Review: false, Approve: false, Delete: false },
      "Support Officer": { View: true, Review: false, Approve: false, Delete: false },
    },
  },
  {
    module: "Payments",
    permissions: {
      Superadmin: { View: true, Refund: true },
      "Admissions Admin": { View: true, Refund: false },
      "Application Reviewer": { View: false, Refund: false },
      "Finance Officer": { View: true, Refund: true },
      "Support Officer": { View: true, Refund: false },
    },
  },
  {
    module: "Admissions",
    permissions: {
      Superadmin: { View: true, Recommend: true, Finalize: true },
      "Admissions Admin": { View: true, Recommend: true, Finalize: true },
      "Application Reviewer": { View: true, Recommend: true, Finalize: false },
      "Finance Officer": { View: true, Recommend: false, Finalize: false },
      "Support Officer": { View: true, Recommend: false, Finalize: false },
    },
  },
];

export const activityLogs = [
  { id: 1, who: "j.adams@edunova.edu.ng", action: "Approved application", target: "APP-2026-V55MMC", time: "Today, 08:47" },
  { id: 2, who: "s.williams@edunova.edu.ng", action: "Uploaded review notes", target: "APP-2026-K21QRT", time: "Today, 08:31" },
  { id: 3, who: "g.nnamdi@edunova.edu.ng", action: "Flagged missing document", target: "APP-2026-P90XLA", time: "Today, 07:58" },
  { id: 4, who: "t.bakare@edunova.edu.ng", action: "Responded to applicant enquiry", target: "APL-100422", time: "Today, 07:40" },
  { id: 5, who: "m.cole@edunova.edu.ng", action: "Reconciled payment batch", target: "BATCH-0912", time: "Yesterday, 17:12" },
];

export const auditLogs = [
  { id: "AUD-9001", who: "superadmin@edunova.edu.ng", action: "Created new Admin", target: "Sarah Williams", time: "Today, 08:43", severity: "info" },
  { id: "AUD-9000", who: "admissions@edunova.edu.ng", action: "Approved Application", target: "APP-2026-V55MMC", time: "Today, 08:47", severity: "info" },
  { id: "AUD-8999", who: "superadmin@edunova.edu.ng", action: "Suspended Admin account", target: "Michael Cole", time: "Today, 08:12", severity: "warn" },
  { id: "AUD-8998", who: "superadmin@edunova.edu.ng", action: "Updated Application Settings", target: "Application fee: ₦15,000", time: "Yesterday, 19:05", severity: "info" },
  { id: "AUD-8997", who: "finance@edunova.edu.ng", action: "Issued refund", target: "PAY-88213", time: "Yesterday, 16:40", severity: "warn" },
  { id: "AUD-8996", who: "unknown", action: "Failed login attempt (5x)", target: "m.cole@edunova.edu.ng", time: "Yesterday, 03:14", severity: "danger" },
  { id: "AUD-8995", who: "superadmin@edunova.edu.ng", action: "Created Academic Session", target: "2027/2028", time: "3 days ago", severity: "info" },
];

export const loginSessions = [
  { id: "SES-401", user: "superadmin@edunova.edu.ng", device: "Chrome · macOS", location: "Lagos, NG", started: "Today, 08:02", current: true },
  { id: "SES-400", user: "j.adams@edunova.edu.ng", device: "Chrome · Windows", location: "Abuja, NG", started: "Today, 07:51", current: false },
  { id: "SES-399", user: "s.williams@edunova.edu.ng", device: "Safari · iOS", location: "Lagos, NG", started: "Today, 07:10", current: false },
  { id: "SES-398", user: "t.bakare@edunova.edu.ng", device: "Edge · Windows", location: "Ibadan, NG", started: "Yesterday, 21:44", current: false },
  { id: "SES-397", user: "m.cole@edunova.edu.ng", device: "Chrome · Android", location: "Port Harcourt, NG", started: "6 days ago", current: false },
];

export const securityEvents = [
  { id: "SEC-221", type: "Failed login attempts", detail: "5 consecutive failures on m.cole@edunova.edu.ng", time: "Yesterday, 03:14", severity: "danger" },
  { id: "SEC-220", type: "New device sign-in", detail: "superadmin@edunova.edu.ng from a new device in Lagos, NG", time: "Today, 08:02", severity: "info" },
  { id: "SEC-219", type: "Password changed", detail: "g.nnamdi@edunova.edu.ng updated their password", time: "2 days ago", severity: "info" },
  { id: "SEC-218", type: "Unusual access pattern", detail: "Bulk applicant export from a Support Officer account", time: "3 days ago", severity: "warn" },
  { id: "SEC-217", type: "Session revoked", detail: "Superadmin revoked session SES-390 for m.cole@edunova.edu.ng", time: "6 days ago", severity: "info" },
];

export const academicSessions = [
  {
    id: "SESN-2627",
    label: "2026/2027",
    status: "Active",
    applicationStatus: "OPEN",
    start: "September 1, 2026",
    deadline: "October 30, 2026",
    fee: "₦15,000",
    applicants: 18420,
  },
  {
    id: "SESN-2728",
    label: "2027/2028",
    status: "Draft",
    applicationStatus: "NOT STARTED",
    start: "September 1, 2027",
    deadline: "October 30, 2027",
    fee: "₦15,000",
    applicants: 0,
  },
  {
    id: "SESN-2526",
    label: "2025/2026",
    status: "Closed",
    applicationStatus: "CLOSED",
    start: "September 1, 2025",
    deadline: "October 31, 2025",
    fee: "₦12,500",
    applicants: 16904,
  },
];

export const faculties = [
  { id: "FAC-01", name: "Faculty of Engineering", departments: 5, programmes: 14 },
  { id: "FAC-02", name: "Faculty of Science", departments: 6, programmes: 17 },
  { id: "FAC-03", name: "Faculty of Arts", departments: 4, programmes: 9 },
  { id: "FAC-04", name: "Faculty of Law", departments: 1, programmes: 2 },
  { id: "FAC-05", name: "Faculty of Social Sciences", departments: 5, programmes: 11 },
];

export const departments = [
  { id: "DEP-01", name: "Computer Science", faculty: "Faculty of Engineering", programmes: 3 },
  { id: "DEP-02", name: "Electrical Engineering", faculty: "Faculty of Engineering", programmes: 2 },
  { id: "DEP-03", name: "Mechanical Engineering", faculty: "Faculty of Engineering", programmes: 2 },
  { id: "DEP-04", name: "Physics", faculty: "Faculty of Science", programmes: 2 },
  { id: "DEP-05", name: "Mathematics", faculty: "Faculty of Science", programmes: 2 },
  { id: "DEP-06", name: "English & Literary Studies", faculty: "Faculty of Arts", programmes: 2 },
  { id: "DEP-07", name: "Private & Property Law", faculty: "Faculty of Law", programmes: 1 },
];

export const programmes = [
  { id: "PRG-01", name: "B.Sc. Computer Science", department: "Computer Science", capacity: 250, requirements: "5 O'Level credits incl. Maths, English", duration: "4 years" },
  { id: "PRG-02", name: "B.Sc. Software Engineering", department: "Computer Science", capacity: 150, requirements: "5 O'Level credits incl. Maths, English", duration: "4 years" },
  { id: "PRG-03", name: "B.Eng. Electrical Engineering", department: "Electrical Engineering", capacity: 180, requirements: "5 O'Level credits incl. Physics, Maths", duration: "5 years" },
  { id: "PRG-04", name: "B.Sc. Physics", department: "Physics", capacity: 120, requirements: "5 O'Level credits incl. Physics, Maths", duration: "4 years" },
  { id: "PRG-05", name: "LL.B. Law", department: "Private & Property Law", capacity: 200, requirements: "5 O'Level credits incl. Literature, Government", duration: "5 years" },
];

export const applicantsList = [
  { id: "APL-100422", name: "Ifeoma Obi", email: "ifeoma.obi@example.com", programme: "B.Sc. Computer Science", stage: "Documents", updated: "Today" },
  { id: "APL-100411", name: "David Eze", email: "david.eze@example.com", programme: "B.Eng. Electrical Engineering", stage: "Submitted", updated: "Today" },
  { id: "APL-100388", name: "Blessing Udo", email: "blessing.udo@example.com", programme: "LL.B. Law", stage: "Personal information", updated: "Yesterday" },
  { id: "APL-100350", name: "Chinedu Okafor", email: "chinedu.okafor@example.com", programme: "B.Sc. Physics", stage: "Under review", updated: "Yesterday" },
  { id: "APL-100299", name: "Fatima Bello", email: "fatima.bello@example.com", programme: "B.Sc. Software Engineering", stage: "Admitted", updated: "3 days ago" },
];

export const applicationsList = [
  { id: "APP-2026-V55MMC", applicant: "David Eze", programme: "B.Eng. Electrical Engineering", status: "Approved", submitted: "Today, 08:20" },
  { id: "APP-2026-K21QRT", applicant: "Blessing Udo", programme: "LL.B. Law", status: "Under review", submitted: "Yesterday, 14:02" },
  { id: "APP-2026-P90XLA", applicant: "Chinedu Okafor", programme: "B.Sc. Physics", status: "Needs documents", submitted: "Yesterday, 11:47" },
  { id: "APP-2026-T14BNC", applicant: "Fatima Bello", programme: "B.Sc. Software Engineering", status: "Admitted", submitted: "3 days ago" },
  { id: "APP-2026-Q77DPX", applicant: "Ifeoma Obi", programme: "B.Sc. Computer Science", status: "Draft", submitted: "—" },
];

export const documentsList = [
  { id: "DOC-5521", applicant: "David Eze", type: "O'Level Result", status: "Verified", uploaded: "Today" },
  { id: "DOC-5520", applicant: "Blessing Udo", type: "Birth Certificate", status: "Pending review", uploaded: "Yesterday" },
  { id: "DOC-5519", applicant: "Chinedu Okafor", type: "Passport Photograph", status: "Rejected", uploaded: "Yesterday" },
  { id: "DOC-5518", applicant: "Fatima Bello", type: "JAMB Result", status: "Verified", uploaded: "3 days ago" },
];

export const paymentsList = [
  { id: "PAY-88213", applicant: "Chinedu Okafor", amount: "₦15,000", method: "Card · Paystack", status: "Refunded", date: "Yesterday" },
  { id: "PAY-88190", applicant: "David Eze", amount: "₦15,000", method: "Bank Transfer · Remita", status: "Successful", date: "Today" },
  { id: "PAY-88175", applicant: "Fatima Bello", amount: "₦15,000", method: "Card · Paystack", status: "Successful", date: "3 days ago" },
  { id: "PAY-88160", applicant: "Blessing Udo", amount: "₦15,000", method: "USSD", status: "Pending", date: "Yesterday" },
];

export const admissionsList = [
  { id: "ADM-CAND-01", applicant: "Fatima Bello", programme: "B.Sc. Software Engineering", recommendation: "Recommend", decision: "Admitted" },
  { id: "ADM-CAND-02", applicant: "David Eze", programme: "B.Eng. Electrical Engineering", recommendation: "Recommend", decision: "Pending finalization" },
  { id: "ADM-CAND-03", applicant: "Chinedu Okafor", programme: "B.Sc. Physics", recommendation: "Hold", decision: "Not decided" },
];

export const notificationsList = [
  { id: 1, title: "Payment gateway latency", body: "Paystack webhook delays affected 12 transactions between 02:00–02:40.", time: "Today, 03:10", read: false },
  { id: 2, title: "New admin created", body: "Sarah Williams was added as a Reviewer by superadmin@edunova.edu.ng.", time: "Today, 08:43", read: false },
  { id: 3, title: "Academic session drafted", body: "2027/2028 session created and awaiting configuration.", time: "3 days ago", read: true },
  { id: 4, title: "Bulk export flagged", body: "A Support Officer account exported 2,400 applicant records.", time: "3 days ago", read: true },
];

export const reportsSummary = [
  { label: "Applications this session", value: "15,932", change: "+8.2%" },
  { label: "Conversion to admission", value: "26.4%", change: "+1.1%" },
  { label: "Average review time", value: "2.3 days", change: "-0.4 days" },
  { label: "Payment success rate", value: "97.1%", change: "+0.3%" },
];

export const notificationTemplates = [
  { id: "TPL-01", name: "Application received", channel: "Email + SMS", enabled: true },
  { id: "TPL-02", name: "Document rejected", channel: "Email", enabled: true },
  { id: "TPL-03", name: "Payment confirmation", channel: "Email + SMS", enabled: true },
  { id: "TPL-04", name: "Admission decision", channel: "Email", enabled: true },
  { id: "TPL-05", name: "Session closing reminder", channel: "SMS", enabled: false },
];
