import React, { useState } from "react";
import { PageHeader, SectionCard, Field, TextInput, Toggle, Button, Badge } from "../../components/ui.jsx";

const GATEWAYS = [
  { key: "paystack", name: "Paystack", note: "Cards, bank transfer, USSD", enabled: true },
  { key: "remita", name: "Remita", note: "Bank transfer, RRR", enabled: true },
  { key: "flutterwave", name: "Flutterwave", note: "Cards, mobile money", enabled: false },
];

export default function PaymentSettings() {
  const [gateways, setGateways] = useState(GATEWAYS);
  const [autoRefund, setAutoRefund] = useState(false);

  return (
    <div>
      <PageHeader
        eyebrow="System · Configuration"
        title="Payment Settings"
        description="Control which payment gateways are live and how refunds are handled."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Payment gateways" description="At least one gateway must remain enabled.">
          <ul className="flex flex-col gap-4">
            {gateways.map((g) => (
              <li key={g.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-black">{g.name}</p>
                  <p className="text-xs text-black/40 mt-0.5">{g.note}</p>
                </div>
                <Toggle
                  checked={g.enabled}
                  onChange={(v) =>
                    setGateways((prev) => prev.map((p) => (p.key === g.key ? { ...p, enabled: v } : p)))
                  }
                  label={g.name}
                />
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Fees & refunds" description="Applies to the currently active academic session.">
          <div className="flex flex-col gap-5">
            <Field label="Application fee (₦)">
              <TextInput type="number" defaultValue={15000} />
            </Field>
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm text-black">Automatic refunds</p>
                <p className="text-xs text-black/40 mt-0.5">Refund failed or duplicate payments without manual review.</p>
              </div>
              <Toggle checked={autoRefund} onChange={setAutoRefund} label="Automatic refunds" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Gateway status" className="lg:col-span-2">
          <div className="flex flex-wrap gap-3">
            {gateways.map((g) => (
              <div key={g.key} className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-black/[0.06]">
                <span className="text-sm text-black">{g.name}</span>
                <Badge tone={g.enabled ? "good" : "neutral"}>{g.enabled ? "Live" : "Off"}</Badge>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <Button variant="primary">Save settings</Button>
      </div>
    </div>
  );
}
