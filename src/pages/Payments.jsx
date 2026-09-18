import React from "react";
import { PageHeader, Badge, StatCard } from "../components/ui.jsx";
import DataTable from "../components/DataTable.jsx";
import { paymentsList } from "../data/mockData.js";
import { Wallet, RotateCcw, Clock3 } from "lucide-react";

export default function Payments() {
  const columns = [
    { key: "id", label: "Payment ID", render: (r) => <span className="font-mono text-xs text-black/50">{r.id}</span> },
    { key: "applicant", label: "Applicant", render: (r) => <span className="font-medium text-black">{r.applicant}</span> },
    { key: "amount", label: "Amount" },
    { key: "method", label: "Method" },
    { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
    { key: "date", label: "Date", align: "right" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Finance"
        title="Payments"
        description="Application fee transactions across every payment channel connected to EduNova."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Successful this month" value="₦58.2M" icon={Wallet} />
        <StatCard label="Refunded this month" value="₦180,000" icon={RotateCcw} />
        <StatCard label="Pending settlement" value="₦45,000" icon={Clock3} />
      </div>

      <DataTable columns={columns} rows={paymentsList} />
    </div>
  );
}
