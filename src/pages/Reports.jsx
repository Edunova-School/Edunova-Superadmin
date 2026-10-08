import { useEffect, useState } from "react";
import { getAdminAdmissionsSummary } from "../lib/api";
import { PageHeader, SectionCard, Card } from "../components/ui.jsx";
import { reportsSummary } from "../data/mockData.js";
import { Download } from "lucide-react";
import { Button } from "../components/ui.jsx";



export default function Reports() {
  const [programmeBreakdown, setProgrammeBreakdown] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
  async function loadProgrammeBreakdown() {
    try {
      const response = await getAdminAdmissionsSummary();
      const data = response?.data ?? response ?? [];

      setProgrammeBreakdown(
        Array.isArray(data)
          ? data
          : data.items ?? []
      );
    } catch (error) {
      console.error("Failed to load programme breakdown:", error);
      setError(error.message || "Failed to load programme breakdown.");
    } finally {
      setLoading(false);
    }
  }

  loadProgrammeBreakdown();
}, []);
  return (
    <div>
      <PageHeader
        eyebrow="Insights"
        title="Reports"
        description="Aggregate performance of the admissions cycle — updated hourly from live platform data."
        action={
          <Button variant="outline">
            <Download size={14} /> Export report
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {reportsSummary.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-xs text-black/40">{s.label}</p>
            <p className="font-serif font-semibold text-black text-[1.5rem] mt-2">{s.value}</p>
            <p className="text-xs mt-2 font-medium text-signal-good">{s.change}</p>
          </Card>
        ))}
      </div>

      <SectionCard title="Applications by programme" description="Share of total applications this session, by programme.">
        <div className="flex flex-col gap-4">
          {loading && (
  <p className="text-sm text-black/40">Loading programme data...</p>
)}

{error && (
  <p className="text-sm text-red-600">{error}</p>
)}
          {programmeBreakdown.map((p) => (
  <div key={p.programme_id}>
    <div className="flex items-center justify-between text-sm mb-1.5">
      <span className="text-black">{p.programme}</span>
      <span className="text-black/40">
        {p.total_applications?.toLocaleString() ?? "0"}
      </span>
    </div>

    <div className="h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
      <div
        className="h-full rounded-full bg-navy-800"
        style={{
          width: `${
            p.total_applications
              ? Math.min((p.total_applications / Math.max(
                  ...programmeBreakdown.map(
                    (item) => item.total_applications ?? 0
                  )
                )) * 100, 100)
              : 0
          }%`,
        }}
      />
    </div>
  </div>
))}
        </div>
      </SectionCard>
    </div>
  );
}
