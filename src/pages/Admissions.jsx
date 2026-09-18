import React from "react";
import { PageHeader, Badge } from "../components/ui.jsx";
import DataTable from "../components/DataTable.jsx";
import { admissionsList } from "../data/mockData.js";

export default function Admissions() {
  const columns = [
    { key: "id", label: "Candidate ID", render: (r) => <span className="font-mono text-xs text-black/50">{r.id}</span> },
    { key: "applicant", label: "Applicant", render: (r) => <span className="font-medium text-black">{r.applicant}</span> },
    { key: "programme", label: "Programme" },
    { key: "recommendation", label: "Reviewer recommendation", render: (r) => <Badge>{r.recommendation}</Badge> },
    { key: "decision", label: "Decision", align: "right", render: (r) => <Badge>{r.decision}</Badge> },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Admissions pipeline"
        title="Admissions"
        description="Candidates recommended by reviewers, awaiting or having received a final admission decision."
      />
      <DataTable columns={columns} rows={admissionsList} />
    </div>
  );
}
