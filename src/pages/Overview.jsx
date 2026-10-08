import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Users, ClipboardList, GraduationCap, Wallet, ArrowRight, Activity } from "lucide-react";
import { PageHeader, Card, SectionCard, StatCard, Badge } from "../components/ui.jsx";
import { systemHealth, activityLogs } from "../data/mockData.js";
import { getAdminDashboardSummary, getAdminApplications, getAcademicSessions, getApplicationWindow, } from "../lib/api";

function formatNaira(n) {
  return `₦${n.toLocaleString("en-NG")}`;
}

export default function Overview() {
 const {
  data: summary,
  isLoading: summaryLoading,
} = useQuery({
  queryKey: ["admin-dashboard-summary"],
  queryFn: async () => {
    const response = await getAdminDashboardSummary();
    return response?.data ?? response ?? null;
  },
  staleTime: 0,
});
const {
  data: submittedApplications = [],
  isLoading: applicationsLoading,
} = useQuery({
  queryKey: ["admin-applications", "submitted-pipeline"],
  queryFn: async () => {
    const response = await getAdminApplications();

    const applications = response?.data ?? response ?? [];

    return Array.isArray(applications)
      ? applications.filter(
          (application) => application.status !== "DRAFT"
        )
      : [];
  },
  staleTime: 0,
}); 
const applicantCount = new Set(
  submittedApplications
    .map((application) => application.email)
    .filter(Boolean)
).size;
const {
  data: activeSession,
  isLoading: sessionLoading,
} = useQuery({
  queryKey: ["academic-sessions"],
  queryFn: async () => {
    const response = await getAcademicSessions();
    const sessions = response?.data ?? response ?? [];

    return sessions.find((session) => session.is_current) ?? null;
  },
  staleTime: 0,
});

const {
  data: applicationWindow,
  isLoading: windowLoading,
} = useQuery({
  queryKey: ["application-window", activeSession?.id],
  queryFn: async () => {
    const response = await getApplicationWindow(activeSession.id);
    return response?.data ?? response ?? null;
  },
  enabled: !!activeSession?.id,
  staleTime: 0,
});

const loading =
  summaryLoading ||
  applicationsLoading ||
  sessionLoading ||
  windowLoading;

const incidents = systemHealth.filter((s) => s.status !== "operational");

  return (
    <div>
      <PageHeader eyebrow="Platform overview" title="Good morning, Superadmin" description="A live snapshot of the EduNova platform — applicants, admissions, revenue, and system status in one place."/>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
  label="Applicants"
  value={applicantCount.toLocaleString()}
  icon={Users}
/>

<StatCard
  label="Applications"
  value={submittedApplications.length.toLocaleString()}
  icon={ClipboardList}
/>
<StatCard
  label="Awaiting review"
  value={summary?.applications?.awaiting_review?.toLocaleString() ?? "0"}
  icon={GraduationCap}
/>

<StatCard
  label="Documents needing review"
  value={ summary?.documents?.by_review_status?.NOT_REVIEWED?.toLocaleString() ?? "0"
  }
  icon={Wallet}
/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-6 mt-6">
        <div className="rounded-[24px] overflow-hidden relative bg-gradient-to-br from-navy-950 via-navy-800 to-navy-700">
          <svg className="absolute -right-8 -top-8 opacity-[0.12]" width="220" height="220" viewBox="0 0 220 220" fill="none">
            <circle cx="110" cy="110" r="108" stroke="#B8901F" strokeWidth="1" />
            <circle cx="110" cy="110" r="86" stroke="#B8901F" strokeWidth="1" />
            <circle cx="110" cy="110" r="64" stroke="#B8901F" strokeWidth="1" />
          </svg>
          <div className="relative p-7 md:p-8 text-white h-full flex flex-col ">
            <div>
              <p className="text-xs text-white/50">Active academic session</p>
              <h2 className="font-serif font-semibold text-[1.7rem] mt-2">{activeSession?.name ?? "No current session"}</h2>
              <div className="flex items-center gap-2 mt-3">
                <Badge tone={applicationWindow?.is_open ? "good" : "neutral"}>
  Applications {applicationWindow?.is_open ? "OPEN" : "CLOSED"}
</Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
<div>
  <p className="text-[11px] text-white/40">Opened</p>
  <p className="text-sm mt-1">
    {applicationWindow?.application_start_date
      ? new Date(applicationWindow.application_start_date).toLocaleString()
      : "Not configured"}
  </p>
</div>
              <div>
  <p className="text-[11px] text-white/40">Deadline</p>
  <p className="text-sm mt-1">
    {applicationWindow?.application_end_date
      ? new Date(applicationWindow.application_end_date).toLocaleString()
      : "Not configured"}
  </p>
</div>
              <div>
                <p className="text-[11px] text-white/40">Application fee</p>
                <p className="text-sm mt-1">{activeSession?.fee}</p>
              </div>
            </div>

            <Link
              to="/system/academic-sessions"
              className="inline-flex items-center gap-2 text-sm font-medium mt-6 text-gold hover:gap-3 transition-all w-fit"
            >
              Manage academic sessions
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* System health */}
        <SectionCard
          title="System health"
          description={incidents.length ? `${incidents.length} service needs attention` : "All services operating normally"}
          action={<Activity size={17} strokeWidth={1.6} className="text-black/25" />}
        >
          <ul className="flex flex-col gap-3">
            {systemHealth.map((s) => (
              <li key={s.name} className="flex items-center justify-between py-1.5">
                <div>
                  <p className="text-sm text-black">{s.name}</p>
                  <p className="text-xs text-black/35 mt-0.5">{s.detail}</p>
                </div>
                <Badge tone={s.status === "operational" ? "good" : s.status === "degraded" ? "warn" : "bad"}>
                  {s.status === "operational" ? "Operational" : s.status === "degraded" ? "Degraded" : "Down"}
                </Badge>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* Recent activity */}
      <SectionCard
        title="Recent admin activity"
        description="The latest actions taken across the platform by admin accounts."
        action={
          <Link to="/administration/activity-logs" className="text-xs font-medium text-black/40 hover:text-black flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        }
        className="mt-6"
      >
        <ul className="flex flex-col">
          {activityLogs.map((log, i) => (
            <li
              key={log.id}
              className={`flex items-center justify-between gap-4 py-3.5 ${
                i < activityLogs.length - 1 ? "border-b border-black/[0.05]" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="text-sm text-black truncate">
                  <span className="font-medium">{log.action}</span>{" "}
                  <span className="text-black/40">→ {log.target}</span>
                </p>
                <p className="text-xs text-black/35 mt-0.5 font-mono">{log.who}</p>
              </div>
              <span className="text-xs text-black/35 shrink-0">{log.time}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
