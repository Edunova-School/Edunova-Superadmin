import { useEffect, useState } from "react";
import { getAdminAdmissionsSummary } from "../lib/api";
import { PageHeader, Badge } from "../components/ui.jsx";
import DataTable from "../components/DataTable.jsx";

export default function Admissions() {
  const [admissions, setAdmissions] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
useEffect(() => {
  async function loadAdmissions() {
    try {
      const response = await getAdminAdmissionsSummary();
      const admissionData = response?.data ?? response ?? [];
      setAdmissions(
        Array.isArray(admissionData)
          ? admissionData
          : admissionData.items ?? []
      );
    } catch (error) {
      console.error("Failed to load admissions summary:", error);
      setError(
        error.message || "Failed to load admissions summary."
      );
    } finally {
      setLoading(false);
    }
  }

  loadAdmissions();
}, []);
  const columns = [
  {
    key: "programme",
    label: "Programme",
    render: (r) => (
      <div>
        <p className="font-medium text-black">{r.programme}</p>
        <p className="font-mono text-xs text-black/40 mt-1">{r.code}</p>
      </div>
    ),
  },
  {
    key: "total_applications",
    label: "Applications",
    render: (r) => r.total_applications ?? 0,
  },
  {
    key: "submitted",
    label: "Submitted",
    render: (r) => r.submitted ?? 0,
  },
  {
    key: "under_review",
    label: "Under review",
    render: (r) => r.under_review ?? 0,
  },
  {
    key: "offered",
    label: "Offered",
    render: (r) => <Badge>{r.offered ?? 0}</Badge>,
  },
  {
    key: "accepted",
    label: "Accepted",
    render: (r) => <Badge>{r.accepted ?? 0}</Badge>,
  },
  {
    key: "rejected",
    label: "Rejected",
    align: "right",
    render: (r) => <Badge>{r.rejected ?? 0}</Badge>,
  },
];

  return (
    <div>
      <PageHeader
        eyebrow="Admissions pipeline"
        title="Admissions"
        description="Candidates recommended by reviewers, awaiting or having received a final admission decision."
      />
      {loading && (
  <p className="text-sm text-black/50">Loading admissions...</p>
)}

{error && (
  <p className="text-sm text-red-600">{error}</p>
)}

{!loading && !error && (
  <DataTable columns={columns} rows={admissions} />
)}
    </div>
  );
}
