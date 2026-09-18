import React, { useState } from "react";
import { Plus, Power } from "lucide-react";
import { PageHeader, Card, Badge, Button, Modal, Field, TextInput } from "../../components/ui.jsx";
import { academicSessions as initial } from "../../data/mockData.js";

export default function AcademicSessions() {
  const [sessions, setSessions] = useState(initial);
  const [open, setOpen] = useState(false);

  function handleAdd(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const label = form.get("label");
    if (!label) return;
    setSessions((prev) => [
      {
        id: `SESN-${Date.now()}`,
        label,
        status: "Draft",
        applicationStatus: "NOT STARTED",
        start: form.get("start"),
        deadline: form.get("deadline"),
        fee: form.get("fee") ? `₦${Number(form.get("fee")).toLocaleString()}` : "—",
        applicants: 0,
      },
      ...prev,
    ]);
    setOpen(false);
    e.target.reset();
  }

  function toggleActivation(id) {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const nowActivating = s.status !== "Active";
        return {
          ...s,
          status: nowActivating ? "Active" : "Draft",
          applicationStatus: nowActivating ? "OPEN" : "NOT STARTED",
        };
      })
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="System · Admission cycle"
        title="Academic Sessions"
        description="Only one session should be active at a time. Activating a session opens it to applicants once its start date arrives."
        action={
          <Button variant="gold" onClick={() => setOpen(true)}>
            <Plus size={15} /> Create Session
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sessions.map((s) => (
          <Card key={s.id} className={`p-6 ${s.status === "Active" ? "ring-1 ring-gold/40" : ""}`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif font-semibold text-xl text-black">{s.label}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge tone={s.status === "Active" ? "good" : s.status === "Draft" ? "neutral" : "bad"}>{s.status}</Badge>
                  <Badge>{s.applicationStatus}</Badge>
                </div>
              </div>
              <button
                onClick={() => toggleActivation(s.id)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  s.status === "Active" ? "bg-signal-good/10 text-signal-good" : "bg-black/5 text-black/35 hover:bg-black/10"
                }`}
                title={s.status === "Active" ? "Deactivate session" : "Activate session"}
              >
                <Power size={15} />
              </button>
            </div>

            <dl className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-black/[0.06]">
              <div>
                <dt className="text-[11px] text-black/35">Start</dt>
                <dd className="text-sm text-black mt-1">{s.start}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-black/35">Deadline</dt>
                <dd className="text-sm text-black mt-1">{s.deadline}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-black/35">Fee</dt>
                <dd className="text-sm text-black mt-1">{s.fee}</dd>
              </div>
            </dl>

            <p className="text-xs text-black/35 mt-5">{s.applicants.toLocaleString()} applicants so far</p>
          </Card>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Create academic session" description="New sessions start as a draft until you activate them.">
        <form id="add-session" onSubmit={handleAdd} className="flex flex-col gap-4">
          <Field label="Session label">
            <TextInput name="label" placeholder="e.g. 2028/2029" required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Application opens">
              <TextInput name="start" placeholder="e.g. September 1, 2028" required />
            </Field>
            <Field label="Application deadline">
              <TextInput name="deadline" placeholder="e.g. October 30, 2028" required />
            </Field>
          </div>
          <Field label="Application fee (₦)">
            <TextInput name="fee" type="number" placeholder="15000" required />
          </Field>
        </form>
        <div className="flex items-center justify-end gap-3 pt-6">
          <Button variant="ghost" onClick={() => setOpen(false)} type="button">Cancel</Button>
          <Button variant="primary" type="submit" form="add-session">Create as draft</Button>
        </div>
      </Modal>
    </div>
  );
}
