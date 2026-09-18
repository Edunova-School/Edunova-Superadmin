import React from "react";
import { PageHeader, Card, Badge } from "../../components/ui.jsx";
import { securityEvents } from "../../data/mockData.js";
import { ShieldAlert, ShieldCheck, TriangleAlert } from "lucide-react";

const ICONS = { danger: ShieldAlert, warn: TriangleAlert, info: ShieldCheck };
const TONE = { danger: "bad", warn: "warn", info: "good" };

export default function SecurityEvents() {
  return (
    <div>
      <PageHeader
        eyebrow="Security"
        title="Security Events"
        description="Automated signals raised by the platform's security monitoring — sign-in anomalies, access-pattern flags, and account changes."
      />

      <Card className="divide-y divide-black/[0.05] overflow-hidden">
        {securityEvents.map((e) => {
          const Icon = ICONS[e.severity];
          return (
            <div key={e.id} className="flex items-start gap-4 p-5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  e.severity === "danger" ? "bg-signal-bad/10" : e.severity === "warn" ? "bg-gold/10" : "bg-signal-good/10"
                }`}
              >
                <Icon
                  size={16}
                  strokeWidth={1.7}
                  className={e.severity === "danger" ? "text-signal-bad" : e.severity === "warn" ? "text-gold-dark" : "text-signal-good"}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-black">{e.type}</p>
                  <span className="text-xs text-black/35 shrink-0">{e.time}</span>
                </div>
                <p className="text-sm text-black/50 mt-1 leading-relaxed">{e.detail}</p>
                <div className="mt-2">
                  <Badge tone={TONE[e.severity]}>{e.severity === "danger" ? "High priority" : e.severity === "warn" ? "Review" : "Informational"}</Badge>
                </div>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
