import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileCheck2,
  Wallet,
  GraduationCap,
  Bell,
  BarChart3,
  ShieldCheck,
  KeyRound,
  History,
  Landmark,
  Building2,
  BookOpen,
  CalendarRange,
  SlidersHorizontal,
  CreditCard,
  MessageSquareText,
  FileClock,
  Monitor,
  Siren,
  Settings as SettingsIcon,
} from "lucide-react";

const NAV = [
  {
    section: null,
    items: [
      { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
      { to: "/applicants", label: "Applicants", icon: Users },
      { to: "/applications", label: "Applications", icon: ClipboardList },
      { to: "/documents", label: "Documents", icon: FileCheck2 },
      { to: "/payments", label: "Payments", icon: Wallet },
      { to: "/admissions", label: "Admissions", icon: GraduationCap },
      { to: "/notifications", label: "Notifications", icon: Bell },
      { to: "/reports", label: "Reports", icon: BarChart3 },
    ],
  },
  {
    section: "Administration",
    items: [
      { to: "/administration/admins", label: "Admins", icon: ShieldCheck },
      { to: "/administration/roles", label: "Roles & Permissions", icon: KeyRound },
      { to: "/administration/activity-logs", label: "Activity Logs", icon: History },
    ],
  },
  {
    section: "System",
    items: [
      { to: "/system/faculties", label: "Faculties", icon: Landmark },
      { to: "/system/departments", label: "Departments", icon: Building2 },
      { to: "/system/programmes", label: "Programmes", icon: BookOpen },
      { to: "/system/academic-sessions", label: "Academic Sessions", icon: CalendarRange },
      { to: "/system/application-settings", label: "Application Settings", icon: SlidersHorizontal },
      { to: "/system/payment-settings", label: "Payment Settings", icon: CreditCard },
      { to: "/system/notification-settings", label: "Notification Settings", icon: MessageSquareText },
    ],
  },
  {
    section: "Security",
    items: [
      { to: "/security/audit-logs", label: "Audit Logs", icon: FileClock },
      { to: "/security/login-sessions", label: "Login Sessions", icon: Monitor },
      { to: "/security/security-events", label: "Security Events", icon: Siren },
    ],
  },
];

export default function Sidebar({ open, onNavigate }) {
  return (
    <aside
      className={`fixed lg:sticky top-0 z-40 h-screen w-[268px] shrink-0 bg-navy-950 text-white flex flex-col transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      {/* Brand */}
      <div className="px-6 pt-7 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center">
            <span className="font-serif font-semibold text-gold text-sm">E</span>
          </div>
          <div>
            <p className="font-serif font-semibold text-white text-[0.95rem] leading-none">EduNova</p>
            <p className="font-mono text-[10px] tracking-[0.12em] text-white/35 mt-1 uppercase">Superadmin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-6">
        {NAV.map((group, i) => (
          <div key={group.section || "root"} className={i > 0 ? "mt-6 pt-6 border-t border-white/[0.07]" : ""}>
            {group.section && (
              <p className="px-3 mb-2 font-mono text-[10px] tracking-[0.12em] text-white/30 uppercase">
                {group.section}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
                        isActive
                          ? "bg-white/[0.08] text-white"
                          : "text-white/55 hover:text-white hover:bg-white/[0.04]"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2.5px] rounded-full transition-opacity duration-150 ${
                            isActive ? "bg-gold opacity-100" : "opacity-0"
                          }`}
                        />
                        <item.icon size={16} strokeWidth={1.6} className={isActive ? "text-gold" : "text-white/35"} />
                        {item.label}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-4 pb-5 pt-4 border-t border-white/[0.07]">
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
              isActive ? "bg-white/[0.08] text-white" : "text-white/55 hover:text-white hover:bg-white/[0.04]"
            }`
          }
        >
          <SettingsIcon size={16} strokeWidth={1.6} className="text-white/35" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
