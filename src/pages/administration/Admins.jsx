import React, { useState } from "react";
import {
  MoreHorizontal,
  UserPlus,
  Ban,
  CheckCircle2,
  KeyRound,
  LogOut,
  History,
} from "lucide-react";
import { PageHeader, Badge, Button, Modal, Field, TextInput, Select, ActionMenu } from "../../components/ui.jsx";
import DataTable from "../../components/DataTable.jsx";
import { admins as initialAdmins, roleHierarchy } from "../../data/mockData.js";

export default function Admins() {
  const [admins, setAdmins] = useState(initialAdmins);
  const [addOpen, setAddOpen] = useState(false);
  const [confirm, setConfirm] = useState(null); // { type, admin }

  function updateStatus(id, status) {
    setAdmins((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    setConfirm(null);
  }

  function handleAdd(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const name = form.get("name");
    const email = form.get("email");
    const role = form.get("role");
    if (!name || !email) return;
    setAdmins((prev) => [
      { id: `ADM-${String(prev.length + 1).padStart(3, "0")}`, name, email, role, status: "Active", lastActive: "Just now" },
      ...prev,
    ]);
    setAddOpen(false);
    e.target.reset();
  }

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (r) => (
        <div>
          <p className="font-medium text-black">{r.name}</p>
          <p className="text-xs text-black/35 mt-0.5">{r.email}</p>
        </div>
      ),
    },
    { key: "role", label: "Role" },
    { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
    { key: "lastActive", label: "Last active" },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (r) => (
        <ActionMenu
          trigger={<MoreHorizontal size={16} />}
          items={[
            { label: "View activity", icon: History, onClick: () => {} },
            { label: "Reset access", icon: KeyRound, onClick: () => setConfirm({ type: "reset", admin: r }) },
            { label: "Revoke sessions", icon: LogOut, onClick: () => setConfirm({ type: "revoke", admin: r }) },
            { divider: true },
            r.status === "Suspended" || r.status === "Disabled"
              ? { label: "Activate account", icon: CheckCircle2, onClick: () => setConfirm({ type: "activate", admin: r }) }
              : { label: "Suspend account", icon: Ban, danger: true, onClick: () => setConfirm({ type: "suspend", admin: r }) },
          ]}
        />
      ),
    },
  ];

  const confirmCopy = {
    reset: { title: "Reset admin access", body: `Send a password reset link to ${confirm?.admin?.name}? Their current session will remain active until they set a new password.`, action: "Send reset link", status: null },
    revoke: { title: "Revoke all sessions", body: `${confirm?.admin?.name} will be signed out of every device immediately and asked to sign in again.`, action: "Revoke sessions", status: null },
    activate: { title: "Activate account", body: `${confirm?.admin?.name} will regain full access to their assigned role and permissions.`, action: "Activate", status: "Active" },
    suspend: { title: "Suspend account", body: `${confirm?.admin?.name} will immediately lose access to the platform. This can be reversed at any time.`, action: "Suspend", status: "Suspended" },
  };

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Admin Management"
        description="Create and manage the admin accounts who operate the EduNova platform, and control what each one can access."
        action={
          <Button variant="gold" onClick={() => setAddOpen(true)}>
            <UserPlus size={15} /> Add Admin
          </Button>
        }
      />

      <DataTable columns={columns} rows={admins} />

      {/* Add admin modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add a new admin"
        description="They'll receive an email invite to set up their password and sign in."
      >
        <form id="add-admin-form" onSubmit={handleAdd} className="flex flex-col gap-4">
          <Field label="Full name">
            <TextInput name="name" placeholder="e.g. Adaeze Obi" required />
          </Field>
          <Field label="Email address">
            <TextInput name="email" type="email" placeholder="name@edunova.edu.ng" required />
          </Field>
          <Field label="Role" hint="Determines what this admin can view and do. Manage roles under Roles & Permissions.">
            <Select name="role" defaultValue={roleHierarchy[1].name}>
              {roleHierarchy.slice(1).map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name}
                </option>
              ))}
            </Select>
          </Field>
        </form>
        <div className="flex items-center justify-end gap-3 pt-6">
          <Button variant="ghost" onClick={() => setAddOpen(false)} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="add-admin-form">
            Send invite
          </Button>
        </div>
      </Modal>

      {/* Confirm action modal */}
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm ? confirmCopy[confirm.type].title : ""}
        footer={
          confirm && (
            <>
              <Button variant="ghost" onClick={() => setConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant={confirm.type === "suspend" ? "danger" : "primary"}
                onClick={() =>
                  confirmCopy[confirm.type].status
                    ? updateStatus(confirm.admin.id, confirmCopy[confirm.type].status)
                    : setConfirm(null)
                }
              >
                {confirmCopy[confirm.type].action}
              </Button>
            </>
          )
        }
      >
        {confirm && <p className="text-sm text-black/60 leading-relaxed">{confirmCopy[confirm.type].body}</p>}
      </Modal>
    </div>
  );
}
