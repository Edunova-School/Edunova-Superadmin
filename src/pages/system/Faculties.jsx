import React, { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { PageHeader, Button, Modal, Field, TextInput, ActionMenu } from "../../components/ui.jsx";
import DataTable from "../../components/DataTable.jsx";
import { faculties as initial } from "../../data/mockData.js";
import { MoreHorizontal } from "lucide-react";

export default function Faculties() {
  const [faculties, setFaculties] = useState(initial);
  const [open, setOpen] = useState(false);

  function handleAdd(e) {
    e.preventDefault();
    const name = new FormData(e.target).get("name");
    if (!name) return;
    setFaculties((prev) => [
      { id: `FAC-${String(prev.length + 1).padStart(2, "0")}`, name, departments: 0, programmes: 0 },
      ...prev,
    ]);
    setOpen(false);
    e.target.reset();
  }

  const columns = [
    { key: "name", label: "Faculty", render: (r) => <span className="font-medium text-black">{r.name}</span> },
    { key: "departments", label: "Departments" },
    { key: "programmes", label: "Programmes" },
    {
      key: "actions",
      label: "",
      align: "right",
      render: () => (
        <ActionMenu trigger={<MoreHorizontal size={16} />} items={[{ label: "Edit faculty", icon: Pencil, onClick: () => {} }]} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="System · Academic structure"
        title="Faculties"
        description="The top level of EduNova's academic structure. Departments and programmes are organized beneath each faculty."
        action={
          <Button variant="gold" onClick={() => setOpen(true)}>
            <Plus size={15} /> Add Faculty
          </Button>
        }
      />

      <DataTable columns={columns} rows={faculties} />

      <Modal open={open} onClose={() => setOpen(false)} title="Add a faculty" description="Departments can be assigned to it afterwards.">
        <form id="add-faculty" onSubmit={handleAdd} className="flex flex-col gap-4">
          <Field label="Faculty name">
            <TextInput name="name" placeholder="e.g. Faculty of Environmental Sciences" required />
          </Field>
        </form>
        <div className="flex items-center justify-end gap-3 pt-6">
          <Button variant="ghost" onClick={() => setOpen(false)} type="button">Cancel</Button>
          <Button variant="primary" type="submit" form="add-faculty">Create faculty</Button>
        </div>
      </Modal>
    </div>
  );
}
