// import React from "react";
import { Link } from "react-router-dom";
import { Users, ClipboardList, GraduationCap, Wallet, ArrowRight, Activity } from "lucide-react";
import { PageHeader, Card, SectionCard, StatCard, Badge } from "../components/ui.jsx";
import { platformStats, systemHealth, activityLogs, academicSessions } from "../data/mockData.js";

function formatNaira(n) {
  return `₦${n.toLocaleString("en-NG")}`;
}

export default function Overview() {
  const activeSession = academicSessions.find((s) => s.status === "Active");
  const incidents = systemHealth.filter((s) => s.status !== "operational");

  return (
    <div>
      <PageHeader
        eyebrow="Platform overview"
        title="Good morning, Superadmin"
        description="A live snapshot of the EduNova platform — applicants, admissions, revenue, and system status in one place."
      />

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Applicants" value={platformStats.applicants.toLocaleString()} change="+4.6%" icon={Users} />
        <StatCard label="Applications" value={platformStats.applications.toLocaleString()} change="+8.2%" icon={ClipboardList} />
        <StatCard label="Admissions offered" value={platformStats.admissionsOffered.toLocaleString()} change="+1.1%" icon={GraduationCap} />
        <StatCard label="Revenue collected" value={formatNaira(platformStats.revenue)} change="+3.4%" icon={Wallet} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-6 mt-6">
        {/* Active session hero */}
        <div className="rounded-[24px] overflow-hidden relative bg-gradient-to-br from-navy-950 via-navy-800 to-navy-700">
          <svg className="absolute -right-8 -top-8 opacity-[0.12]" width="220" height="220" viewBox="0 0 220 220" fill="none">
            <circle cx="110" cy="110" r="108" stroke="#B8901F" strokeWidth="1" />
            <circle cx="110" cy="110" r="86" stroke="#B8901F" strokeWidth="1" />
            <circle cx="110" cy="110" r="64" stroke="#B8901F" strokeWidth="1" />
          </svg>
          <div className="relative p-7 md:p-8 text-white h-full flex flex-col justify-between">
            <div>
              <p className="text-xs text-white/50">Active academic session</p>
              <h2 className="font-serif font-semibold text-[1.7rem] mt-2">{activeSession?.label}</h2>
              <div className="flex items-center gap-2 mt-3">
                <Badge tone="good">Applications {activeSession?.applicationStatus}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
              <div>
                <p className="text-[11px] text-white/40">Opened</p>
                <p className="text-sm mt-1">{activeSession?.start}</p>
              </div>
              <div>
                <p className="text-[11px] text-white/40">Deadline</p>
                <p className="text-sm mt-1">{activeSession?.deadline}</p>
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
