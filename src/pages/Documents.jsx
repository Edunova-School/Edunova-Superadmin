// import React from "react";
import { PageHeader, Badge } from "../components/ui.jsx";
import DataTable from "../components/DataTable.jsx";
import { documentsList } from "../data/mockData.js";

export default function Documents() {
  const columns = [
    { key: "id", label: "Document ID", render: (r) => <span className="font-mono text-xs text-black/50">{r.id}</span> },
    { key: "applicant", label: "Applicant", render: (r) => <span className="font-medium text-black">{r.applicant}</span> },
    { key: "type", label: "Document type" },
    { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
    { key: "uploaded", label: "Uploaded", align: "right" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Admissions pipeline"
        title="Documents"
        description="Supporting documents uploaded by applicants — results, identification, and photographs awaiting or under verification."
      />
      <DataTable columns={columns} rows={documentsList} />
    </div>
  );
}
