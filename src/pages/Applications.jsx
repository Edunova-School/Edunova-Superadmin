import React from "react";
import { PageHeader, Badge } from "../components/ui.jsx";
import DataTable from "../components/DataTable.jsx";
import { applicationsList } from "../data/mockData.js";

export default function Applications() {
  const columns = [
    { key: "id", label: "Application ID", render: (r) => <span className="font-mono text-xs text-black/50">{r.id}</span> },
    { key: "applicant", label: "Applicant", render: (r) => <span className="font-medium text-black">{r.applicant}</span> },
    { key: "programme", label: "Programme" },
    { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
    { key: "submitted", label: "Submitted", align: "right" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Admissions pipeline"
        title="Applications"
        description="Full applications submitted for review, with their current status across the pipeline."
      />
      <DataTable columns={columns} rows={applicationsList} />
    </div>
  );
}
