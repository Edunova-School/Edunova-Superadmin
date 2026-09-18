import React, { useState } from "react";
import { Plus, Pencil, MoreHorizontal } from "lucide-react";
import { PageHeader, Button, Modal, Field, TextInput, Select, ActionMenu } from "../../components/ui.jsx";
import DataTable from "../../components/DataTable.jsx";
import { departments as initial, faculties } from "../../data/mockData.js";

export default function Departments() {
  const [departments, setDepartments] = useState(initial);
  const [open, setOpen] = useState(false);

  function handleAdd(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const name = form.get("name");
    const faculty = form.get("faculty");
    if (!name) return;
    setDepartments((prev) => [
      { id: `DEP-${String(prev.length + 1).padStart(2, "0")}`, name, faculty, programmes: 0 },
      ...prev,
    ]);
    setOpen(false);
    e.target.reset();
  }

  const columns = [
    { key: "name", label: "Department", render: (r) => <span className="font-medium text-black">{r.name}</span> },
    { key: "faculty", label: "Faculty" },
    { key: "programmes", label: "Programmes" },
    {
      key: "actions",
      label: "",
      align: "right",
      render: () => (
        <ActionMenu trigger={<MoreHorizontal size={16} />} items={[{ label: "Edit department", icon: Pencil, onClick: () => {} }]} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="System · Academic structure"
        title="Departments"
        description="Departments sit beneath a faculty and group related programmes together."
        action={
          <Button variant="gold" onClick={() => setOpen(true)}>
            <Plus size={15} /> Add Department
          </Button>
        }
      />

      <DataTable columns={columns} rows={departments} />

      <Modal open={open} onClose={() => setOpen(false)} title="Add a department" description="Assign it to a faculty so it appears in the right place.">
        <form id="add-department" onSubmit={handleAdd} className="flex flex-col gap-4">
          <Field label="Department name">
            <TextInput name="name" placeholder="e.g. Chemical Engineering" required />
          </Field>
          <Field label="Faculty">
            <Select name="faculty" defaultValue={faculties[0].name}>
              {faculties.map((f) => (
                <option key={f.id} value={f.name}>{f.name}</option>
              ))}
            </Select>
          </Field>
        </form>
        <div className="flex items-center justify-end gap-3 pt-6">
          <Button variant="ghost" onClick={() => setOpen(false)} type="button">Cancel</Button>
          <Button variant="primary" type="submit" form="add-department">Create department</Button>
        </div>
      </Modal>
    </div>
  );
}
