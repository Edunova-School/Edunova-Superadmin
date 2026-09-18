// import React from "react";
import { PageHeader } from "../../components/ui.jsx";
import DataTable from "../../components/DataTable.jsx";
import { activityLogs } from "../../data/mockData.js";

export default function ActivityLogs() {
  const columns = [
    { key: "who", label: "Admin", render: (r) => <span className="font-mono text-xs text-black/55">{r.who}</span> },
    { key: "action", label: "Action", render: (r) => <span className="text-black">{r.action}</span> },
    { key: "target", label: "Target" },
    { key: "time", label: "Time", align: "right" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Activity Logs"
        description="Day-to-day actions taken by admin accounts across the applications, documents, and payments they manage. For authentication-level events, see Security → Audit Logs."
      />
      <DataTable columns={columns} rows={activityLogs} rowKey="id" />
    </div>
  );
}
