import React, { useState } from "react";
import { PageHeader, SectionCard, Field, TextInput, Toggle, Button } from "../../components/ui.jsx";

const REQUIRED_DOCS = [
  { key: "passport", label: "Passport photograph" },
  { key: "olevel", label: "O'Level result" },
  { key: "jamb", label: "JAMB result" },
  { key: "birth", label: "Birth certificate" },
  { key: "medical", label: "Medical certificate" },
];

export default function ApplicationSettings() {
  const [fee, setFee] = useState(15000);
  const [maxSubjects, setMaxSubjects] = useState(9);
  const [docs, setDocs] = useState({ passport: true, olevel: true, jamb: true, birth: true, medical: false });
  const [submissionEnabled, setSubmissionEnabled] = useState(true);

  return (
    <div>
      <PageHeader
        eyebrow="System · Configuration"
        title="Application Settings"
        description="These rules apply platform-wide to the currently active academic session."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Application rules" description="Core parameters that shape every application form.">
          <div className="flex flex-col gap-4">
            <Field label="Application fee (₦)">
              <TextInput type="number" value={fee} onChange={(e) => setFee(e.target.value)} />
            </Field>
            <Field label="Maximum O'Level subjects" hint="Applicants cannot list more subjects than this.">
              <TextInput type="number" value={maxSubjects} onChange={(e) => setMaxSubjects(e.target.value)} />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Required documents" description="Applicants must upload every document toggled on here before they can submit.">
          <ul className="flex flex-col gap-4">
            {REQUIRED_DOCS.map((doc) => (
              <li key={doc.key} className="flex items-center justify-between">
                <span className="text-sm text-black">{doc.label}</span>
                <Toggle
                  checked={docs[doc.key]}
                  onChange={(v) => setDocs((prev) => ({ ...prev, [doc.key]: v }))}
                  label={doc.label}
                />
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title="Application submission"
          description="Turning this off immediately closes new submissions across the platform, even during an open session — use it for emergencies."
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-black">{submissionEnabled ? "Enabled" : "Disabled"}</span>
            <Toggle checked={submissionEnabled} onChange={setSubmissionEnabled} label="Application submission" />
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <Button variant="primary">Save settings</Button>
      </div>
    </div>
  );
}
