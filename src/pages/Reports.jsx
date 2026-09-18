import React from "react";
import { PageHeader, SectionCard, Card } from "../components/ui.jsx";
import { reportsSummary } from "../data/mockData.js";
import { Download } from "lucide-react";
import { Button } from "../components/ui.jsx";

const PROGRAMME_BREAKDOWN = [
  { programme: "B.Sc. Computer Science", applications: 2840, share: 18 },
  { programme: "B.Eng. Electrical Engineering", applications: 2210, share: 14 },
  { programme: "LL.B. Law", applications: 1980, share: 12 },
  { programme: "B.Sc. Software Engineering", applications: 1740, share: 11 },
  { programme: "B.Sc. Physics", applications: 990, share: 6 },
];

export default function Reports() {
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
          {PROGRAMME_BREAKDOWN.map((p) => (
            <div key={p.programme}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-black">{p.programme}</span>
                <span className="text-black/40">{p.applications.toLocaleString()}</span>
              </div>
              <div className="h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
                <div className="h-full rounded-full bg-navy-800" style={{ width: `${p.share * 5}%` }} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
