import React, { useState } from "react";
import { PageHeader, SectionCard, PermissionMark } from "../../components/ui.jsx";
import { roleHierarchy, permissionModules } from "../../data/mockData.js";
import { ChevronDown } from "lucide-react";

export default function RolesPermissions() {
  const [activeRole, setActiveRole] = useState(roleHierarchy[1].name);
  const editableRoles = roleHierarchy.slice(1); // exclude Superadmin from the editable matrix

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Roles & Permissions"
        description="EduNova uses role-based access control. Each role below inherits nothing automatically — permissions are set explicitly, module by module."
      />

      {/* Hierarchy */}
      <SectionCard title="Role hierarchy" description="Seniority runs top to bottom. Superadmin sits above the hierarchy with unrestricted access." className="mb-6">
        <div className="flex flex-col items-stretch max-w-md mx-auto">
          {roleHierarchy.map((role, i) => (
            <div key={role.name} className="flex flex-col items-center">
              <div
                className={`w-full rounded-xl px-5 py-3.5 border ${
                  i === 0
                    ? "bg-navy-950 border-navy-950 text-white"
                    : "bg-white border-black/10 text-black"
                }`}
              >
                <p className="text-sm font-medium">{role.name}</p>
                <p className={`text-xs mt-0.5 ${i === 0 ? "text-white/50" : "text-black/40"}`}>{role.note}</p>
              </div>
              {i < roleHierarchy.length - 1 && (
                <ChevronDown size={16} className="text-black/20 my-1.5 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Permission matrix */}
      <SectionCard
        title="Permissions"
        description="Choose a role to see exactly what it can and can't do across each module."
      >
        <div className="flex flex-wrap gap-2 mb-6">
          {editableRoles.map((r) => (
            <button
              key={r.name}
              onClick={() => setActiveRole(r.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeRole === r.name ? "bg-navy-900 text-white" : "bg-black/[0.04] text-black/55 hover:bg-black/[0.07]"
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {permissionModules.map((mod) => {
            const perms = mod.permissions[activeRole] || {};
            return (
              <div key={mod.module} className="rounded-xl border border-black/[0.06] p-4">
                <p className="text-sm font-medium text-black mb-3">{mod.module}</p>
                <ul className="flex flex-col gap-2.5">
                  {Object.entries(perms).map(([action, granted]) => (
                    <li key={action} className="flex items-center justify-between">
                      <span className="text-sm text-black/60">{action}</span>
                      <PermissionMark granted={granted} />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
