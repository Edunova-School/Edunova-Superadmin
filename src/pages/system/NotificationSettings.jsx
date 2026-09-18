import React, { useState } from "react";
import { Pencil } from "lucide-react";
import { PageHeader, SectionCard, Field, TextInput, Toggle, Button } from "../../components/ui.jsx";
import { notificationTemplates as initial } from "../../data/mockData.js";

export default function NotificationSettings() {
  const [templates, setTemplates] = useState(initial);

  return (
    <div>
      <PageHeader
        eyebrow="System · Configuration"
        title="Notification Settings"
        description="Manage the message templates EduNova sends automatically, and the providers used to deliver them."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Message templates" description="Toggle a template off to stop that notification from sending." className="lg:col-span-2">
          <ul className="flex flex-col">
            {templates.map((t, i) => (
              <li
                key={t.id}
                className={`flex items-center justify-between py-3.5 ${i < templates.length - 1 ? "border-b border-black/[0.05]" : ""}`}
              >
                <div>
                  <p className="text-sm text-black">{t.name}</p>
                  <p className="text-xs text-black/40 mt-0.5">{t.channel}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="w-8 h-8 rounded-full flex items-center justify-center text-black/35 hover:bg-black/5">
                    <Pencil size={14} />
                  </button>
                  <Toggle
                    checked={t.enabled}
                    onChange={(v) => setTemplates((prev) => prev.map((p) => (p.id === t.id ? { ...p, enabled: v } : p)))}
                    label={t.name}
                  />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Email configuration" description="Used for every email-channel template above.">
          <div className="flex flex-col gap-4">
            <Field label="Sender name">
              <TextInput defaultValue="EduNova Admissions" />
            </Field>
            <Field label="Sender email">
              <TextInput defaultValue="admissions@edunova.edu.ng" type="email" />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="SMS configuration" description="Used for every SMS-channel template above.">
          <div className="flex flex-col gap-4">
            <Field label="SMS sender ID">
              <TextInput defaultValue="EDUNOVA" />
            </Field>
            <Field label="Provider" hint="Currently connected via API key.">
              <TextInput defaultValue="Termii" disabled />
            </Field>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <Button variant="primary">Save settings</Button>
      </div>
    </div>
  );
}
