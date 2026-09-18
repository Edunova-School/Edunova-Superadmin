import React, { useState } from "react";
import { Plus, Pencil, MoreHorizontal } from "lucide-react";
import { PageHeader, Button, Modal, Field, TextInput, Select, ActionMenu } from "../../components/ui.jsx";
import DataTable from "../../components/DataTable.jsx";
import { programmes as initial, departments } from "../../data/mockData.js";

export default function Programmes() {
  const [programmes, setProgrammes] = useState(initial);
  const [open, setOpen] = useState(false);

  function handleAdd(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const name = form.get("name");
    if (!name) return;
    setProgrammes((prev) => [
      {
        id: `PRG-${String(prev.length + 1).padStart(2, "0")}`,
        name,
        department: form.get("department"),
        capacity: Number(form.get("capacity")) || 0,
        requirements: form.get("requirements"),
        duration: form.get("duration"),
      },
      ...prev,
    ]);
    setOpen(false);
    e.target.reset();
  }

  const columns = [
    { key: "name", label: "Programme", render: (r) => <span className="font-medium text-black">{r.name}</span> },
    { key: "department", label: "Department" },
    { key: "duration", label: "Duration" },
    { key: "capacity", label: "Capacity", render: (r) => r.capacity.toLocaleString() },
    { key: "requirements", label: "Requirements" },
    {
      key: "actions",
      label: "",
      align: "right",
      render: () => (
        <ActionMenu trigger={<MoreHorizontal size={16} />} items={[{ label: "Edit programme", icon: Pencil, onClick: () => {} }]} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="System · Academic structure"
        title="Programmes"
        description="Each programme belongs to a department and defines its own entry requirements and admission capacity."
        action={
          <Button variant="gold" onClick={() => setOpen(true)}>
            <Plus size={15} /> Add Programme
          </Button>
        }
      />

      <DataTable columns={columns} rows={programmes} />

      <Modal open={open} onClose={() => setOpen(false)} title="Add a programme" width="max-w-lg">
        <form id="add-programme" onSubmit={handleAdd} className="flex flex-col gap-4">
          <Field label="Programme name">
            <TextInput name="name" placeholder="e.g. B.Sc. Cybersecurity" required />
          </Field>
          <Field label="Department">
            <Select name="department" defaultValue={departments[0].name}>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Duration">
              <TextInput name="duration" placeholder="e.g. 4 years" defaultValue="4 years" />
            </Field>
            <Field label="Admission capacity">
              <TextInput name="capacity" type="number" placeholder="e.g. 200" required />
            </Field>
          </div>
          <Field label="Entry requirements">
            <TextInput name="requirements" placeholder="e.g. 5 O'Level credits incl. Maths, English" required />
          </Field>
        </form>
        <div className="flex items-center justify-end gap-3 pt-6">
          <Button variant="ghost" onClick={() => setOpen(false)} type="button">Cancel</Button>
          <Button variant="primary" type="submit" form="add-programme">Create programme</Button>
        </div>
      </Modal>
    </div>
  );
}
