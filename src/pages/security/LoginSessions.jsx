import React, { useState } from "react";
import { LogOut } from "lucide-react";
import { PageHeader, Badge, Button, Modal } from "../../components/ui.jsx";
import DataTable from "../../components/DataTable.jsx";
import { loginSessions as initial } from "../../data/mockData.js";

export default function LoginSessions() {
  const [sessions, setSessions] = useState(initial);
  const [confirmId, setConfirmId] = useState(null);

  function revoke(id) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setConfirmId(null);
  }

  const columns = [
    { key: "user", label: "User", render: (r) => <span className="font-mono text-xs text-black/60">{r.user}</span> },
    { key: "device", label: "Device" },
    { key: "location", label: "Location" },
    { key: "started", label: "Signed in" },
    {
      key: "status",
      label: "",
      render: (r) => (r.current ? <Badge tone="good">This session</Badge> : null),
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (r) =>
        !r.current && (
          <Button variant="outline" size="sm" onClick={() => setConfirmId(r.id)}>
            <LogOut size={13} /> Revoke
          </Button>
        ),
    },
  ];

  const target = sessions.find((s) => s.id === confirmId);

  return (
    <div>
      <PageHeader
        eyebrow="Security"
        title="Login Sessions"
        description="Every device currently signed in across every admin account. Revoking a session signs that device out immediately."
      />

      <DataTable columns={columns} rows={sessions} />

      <Modal
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        title="Revoke this session?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmId(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => revoke(confirmId)}>Revoke session</Button>
          </>
        }
      >
        {target && (
          <p className="text-sm text-black/60 leading-relaxed">
            {target.user} will be signed out of {target.device} in {target.location} immediately, and will need to sign in again.
          </p>
        )}
      </Modal>
    </div>
  );
}
