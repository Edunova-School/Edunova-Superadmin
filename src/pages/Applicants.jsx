import React from "react";
import { Search, Download } from "lucide-react";
import { PageHeader, Button } from "../components/ui.jsx";
import DataTable from "../components/DataTable.jsx";
import { applicantsList } from "../data/mockData.js";

export default function Applicants() {
  const columns = [
    { key: "id", label: "Applicant No.", render: (r) => <span className="font-mono text-xs text-black/50">{r.id}</span> },
    { key: "name", label: "Name", render: (r) => <span className="font-medium text-black">{r.name}</span> },
    { key: "email", label: "Email" },
    { key: "programme", label: "Programme" },
    { key: "stage", label: "Stage" },
    { key: "updated", label: "Updated", align: "right" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Admissions pipeline"
        title="Applicants"
        description="Everyone who has started an application on the EduNova platform, across every programme and session."
        action={
          <Button variant="outline">
            <Download size={14} /> Export CSV
          </Button>
        }
      />

      <div className="relative max-w-sm mb-5">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30" />
        <input
          type="text"
          placeholder="Search by name, email, or applicant number…"
          className="w-full bg-white border border-black/10 rounded-full pl-9 pr-4 py-2.5 text-sm placeholder:text-black/30 focus:border-navy-800 transition-colors"
        />
      </div>

      <DataTable columns={columns} rows={applicantsList} />
    </div>
  );
}
