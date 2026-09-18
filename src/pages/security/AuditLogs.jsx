// import React from "react";
import { LockKeyhole } from "lucide-react";
import { PageHeader, Badge } from "../../components/ui.jsx";
import DataTable from "../../components/DataTable.jsx";
import { auditLogs } from "../../data/mockData.js";

export default function AuditLogs() {
  const columns = [
    { key: "id", label: "Record", render: (r) => <span className="font-mono text-xs text-black/40">{r.id}</span> },
    { key: "who", label: "Who", render: (r) => <span className="font-mono text-xs text-black/60">{r.who}</span> },
    { key: "action", label: "Action", render: (r) => <span className="text-black">{r.action}</span> },
    { key: "target", label: "Target" },
    {
      key: "severity",
      label: "",
      render: (r) =>
        r.severity !== "info" ? (
          <Badge tone={r.severity === "danger" ? "bad" : "warn"}>{r.severity === "danger" ? "Alert" : "Notice"}</Badge>
        ) : null,
    },
    { key: "time", label: "Time", align: "right" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Security"
        title="Audit Logs"
        description="The complete, tamper-evident record of every consequential action on the platform — who did what, to what, and when."
      />

      <div className="flex items-start gap-3 mb-5 px-4 py-3 rounded-xl bg-navy-950/[0.03] border border-navy-950/[0.06]">
        <LockKeyhole size={16} strokeWidth={1.6} className="text-navy-900 mt-0.5 shrink-0" />
        <p className="text-xs text-black/50 leading-relaxed">
          Audit records cannot be edited or deleted from this interface, including by a Superadmin. This preserves
          the integrity of the trail for compliance and incident review.
        </p>
      </div>

      <DataTable columns={columns} rows={auditLogs} />
    </div>
  );
}
