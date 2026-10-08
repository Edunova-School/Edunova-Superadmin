import React, { useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  MoreHorizontal,
  Search,
  Power,
  X,
  Loader2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  PageHeader,
  Button,
  Modal,
  Field,
  TextInput,
  Select,
  ActionMenu,
} from "../../components/ui.jsx";

import DataTable from "../../components/DataTable.jsx";

import {
  getAdminDepartments,
  getAdminFaculties,
  getAdminProgrammes,
  getAcademicSessions,
  createAdminDepartment,
  updateAdminDepartment,
  getProgrammeCapacities,
  createProgrammeCapacity,
  updateProgrammeCapacity,
  
} from "../../lib/api";

export default function Departments() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");

  const [modal, setModal] = useState({
    open: false,
    mode: "create",
    department: null,
  });

  const [departmentName, setDepartmentName] = useState("");
  const [facultyId, setFacultyId]  = useState("");
  

const [capacityValues, setCapacityValues] = useState({});
const [capacitySaving, setCapacitySaving] = useState(false);
  const [deactivateModal, setDeactivateModal] = useState({
    open: false,
    department: null,
  });

  const [notification, setNotification] = useState(null);
  const [capacityModal, setCapacityModal] = useState({
  open: false,
  department: null,
});

  function showNotification(type, message) {
    setNotification({ type, message });

    window.setTimeout(() => {
      setNotification(null);
    }, 3500);
  }

  // -----------------------------
  // Departments
  // -----------------------------

  const {
    data: departments = [],
    isLoading: departmentsLoading,
    error: departmentsError,
  } = useQuery({
    queryKey: ["admin-departments"],
    queryFn: async () => {
      const response = await getAdminDepartments();
      const data = response?.data ?? response;

      return Array.isArray(data) ? data : [];
    },
    staleTime: 2 * 60 * 1000,
  });


const {
  data: academicSessions = [],
  isLoading: academicSessionsLoading,
  error: academicSessionsError,
} = useQuery({
  queryKey: ["academic-sessions"],
  queryFn: async () => {
    const response = await getAcademicSessions();
    const data = response?.data ?? response;

    return Array.isArray(data) ? data : [];
  },
  staleTime: 2 * 60 * 1000,
});
const currentAcademicSession = useMemo(() => {
  return academicSessions.find(
    (session) => session.is_current
  ) ?? null;
}, [academicSessions]);

const {
  data: programmeCapacities = [],
  isLoading: programmeCapacitiesLoading,
  error: programmeCapacitiesError,
} = useQuery({
  queryKey: [
    "programme-capacities",
    currentAcademicSession?.id,
  ],
  queryFn: async () => {
    if (!currentAcademicSession?.id) {
      return [];
    }

    const response = await getProgrammeCapacities(
      currentAcademicSession.id
    );

    const data = response?.data ?? response;

    return Array.isArray(data) ? data : [];
  },
  enabled: Boolean(currentAcademicSession?.id),
  staleTime: 2 * 60 * 1000,
});
console.log(
  "PROGRAMME CAPACITIES:",
  programmeCapacities
);
  // -----------------------------
  // Faculties
  // -----------------------------

  const {
    data: faculties = [],
    isLoading: facultiesLoading,
    error: facultiesError,
  } = useQuery({
    queryKey: ["admin-faculties"],
    queryFn: async () => {
      const response = await getAdminFaculties();
      const data = response?.data ?? response;

      return Array.isArray(data) ? data : [];
    },
    staleTime: 2 * 60 * 1000,
  });

  // -----------------------------
  // Programmes
  // -----------------------------

  const {
    data: programmes = [],
    isLoading: programmesLoading,
    error: programmesError,
  } = useQuery({
    queryKey: ["admin-programmes"],
    queryFn: async () => {
      const response = await getAdminProgrammes();
      const data = response?.data ?? response;

      return Array.isArray(data) ? data : [];
    },
    staleTime: 2 * 60 * 1000,
  });

  // -----------------------------
  // Add department
  // -----------------------------

  const createMutation = useMutation({
    mutationFn: async () => {
      const name = departmentName.trim();

      if (!name) {
        throw new Error("Department name is required.");
      }

      if (!facultyId) {
        throw new Error("Please select a faculty.");
      }

      const duplicate = departments.some(
        (department) =>
          department.name?.trim().toLowerCase() ===
            name.toLowerCase() &&
          department.faculty_id === facultyId
      );

      if (duplicate) {
        throw new Error(
          "A department with this name already exists in this faculty."
        );
      }

      return createAdminDepartment(name, facultyId);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-departments"],
      });

      setModal({
        open: false,
        mode: "create",
        department: null,
      });

      setDepartmentName("");
      setFacultyId("");

      showNotification(
        "success",
        "Department created successfully."
      );
    },

    onError: (error) => {
      showNotification(
        "error",
        error?.message || "Failed to create department."
      );
    },
  });

  // -----------------------------
  // Edit department
  // -----------------------------

  const updateMutation = useMutation({
    mutationFn: async () => {
      const department = modal.department;
      const name = departmentName.trim();

      if (!department?.id) {
        throw new Error("Department ID is missing.");
      }

      if (!name) {
        throw new Error("Department name is required.");
      }

      if (!facultyId) {
        throw new Error("Please select a faculty.");
      }

      const duplicate = departments.some(
        (item) =>
          item.id !== department.id &&
          item.name?.trim().toLowerCase() ===
            name.toLowerCase() &&
          item.faculty_id === facultyId
      );

      if (duplicate) {
        throw new Error(
          "A department with this name already exists in this faculty."
        );
      }

      return updateAdminDepartment(department.id, {
        name,
        faculty_id: facultyId,
      });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-departments"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["admin-programmes"],
      });

      setModal({
        open: false,
        mode: "create",
        department: null,
      });

      setDepartmentName("");
      setFacultyId("");

      showNotification(
        "success",
        "Department updated successfully."
      );
    },

    onError: (error) => {
      showNotification(
        "error",
        error?.message || "Failed to update department."
      );
    },
  });

  // -----------------------------
  // Activate / deactivate
  // -----------------------------

  const statusMutation = useMutation({
    mutationFn: async ({ department, isActive }) => {
      if (!department?.id) {
        throw new Error("Department ID is missing.");
      }

      return updateAdminDepartment(department.id, {
        is_active: isActive,
      });
    },

    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-departments"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["admin-programmes"],
      });

      setDeactivateModal({
        open: false,
        department: null,
      });

      showNotification(
        "success",
        variables.isActive
          ? "Department activated successfully."
          : "Department deactivated successfully."
      );
    },

    onError: (error) => {
      showNotification(
        "error",
        error?.message ||
          "Failed to update department status."
      );
    },
  });

  // -----------------------------
  // Department rows
  // -----------------------------

const departmentRows = useMemo(() => {
  return departments.map((department) => {
    const departmentProgrammes = programmes.filter(
      (programme) =>
        programme.department_id === department.id
    );

    const programmeCount = departmentProgrammes.length;

    const totalCapacity = departmentProgrammes.reduce(
      (total, programme) => {
        const capacity = programmeCapacities.find(
          (item) =>
            item.programme_id === programme.id
        );

        return total + Number(capacity?.capacity ?? 0);
      },
      0
    );

    return {
      ...department,
      programmes: programmeCount,
      capacity: totalCapacity,
    };
  });
}, [
  departments,
  programmes,
  programmeCapacities,
]);

  // -----------------------------
  // Search
  // -----------------------------

  const filteredDepartments = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return departmentRows;
    }

    return departmentRows.filter((department) => {
      return (
        department.name?.toLowerCase().includes(value) ||
        department.code?.toLowerCase().includes(value) ||
        department.faculty_name
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [departmentRows, search]);

  // -----------------------------
  // Modal helpers
  // -----------------------------

  function openCreateModal() {
    setDepartmentName("");
    setFacultyId(faculties[0]?.id ?? "");

    setModal({
      open: true,
      mode: "create",
      department: null,
    });
  }

  function openEditModal(department) {
    setDepartmentName(department.name ?? "");
    setFacultyId(department.faculty_id ?? "");

    setModal({
      open: true,
      mode: "edit",
      department,
    });
  }

  function closeModal() {
    if (
      createMutation.isPending ||
      updateMutation.isPending
    ) {
      return;
    }

    setModal({
      open: false,
      mode: "create",
      department: null,
    });

    setDepartmentName("");
    setFacultyId("");
  }
function openCapacityModal(department) {
  const departmentProgrammes = programmes.filter(
    (programme) =>
      programme.department_id === department.id
  );

  const initialValues = {};

  departmentProgrammes.forEach((programme) => {
    const existingCapacity = programmeCapacities.find(
      (item) =>
        item.programme_id === programme.id
    );

    initialValues[programme.id] =
      existingCapacity?.capacity ?? "";
  });

  setCapacityValues(initialValues);

  setCapacityModal({
    open: true,
    department,
  });
}
function closeCapacityModal() {
  if (capacitySaving) {
    return;
  }

  setCapacityModal({
    open: false,
    department: null,
  });

  setCapacityValues({});
}
async function handleSaveCapacities() {
  const department = capacityModal.department;

  if (!department?.id) {
    return;
  }

  const departmentProgrammes = programmes.filter(
    (programme) =>
      programme.department_id === department.id
  );

  try {
    setCapacitySaving(true);

    for (const programme of departmentProgrammes) {
      const rawValue = capacityValues[programme.id];

      if (
        rawValue === "" ||
        rawValue === undefined ||
        rawValue === null
      ) {
        continue;
      }

      const capacity = Number(rawValue);

      if (!Number.isInteger(capacity) || capacity < 0) {
        throw new Error(
          `Capacity for ${programme.name} must be a valid whole number.`
        );
      }

      const existingCapacity =
        programmeCapacities.find(
          (item) =>
            item.programme_id === programme.id
        );

      if (existingCapacity?.id) {
        await updateProgrammeCapacity(
          existingCapacity.id,
          capacity
        );
      } else {
        await createProgrammeCapacity({
          academic_session_id:
            currentAcademicSession.id,
          programme_id: programme.id,
          capacity,
        });
      }
    }

    await queryClient.invalidateQueries({
      queryKey: [
        "programme-capacities",
        currentAcademicSession?.id,
      ],
    });

    closeCapacityModal();

    showNotification(
      "success",
      "Programme capacities saved successfully."
    );
  } catch (error) {
    showNotification(
      "error",
      error?.message ||
        "Failed to save programme capacities."
    );
  } finally {
    setCapacitySaving(false);
  }
}
  function handleSubmit(event) {
    event.preventDefault();

    if (modal.mode === "edit") {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  }

  function openDeactivateModal(department) {
    setDeactivateModal({
      open: true,
      department,
    });
  }

  function closeDeactivateModal() {
    if (statusMutation.isPending) {
      return;
    }

    setDeactivateModal({
      open: false,
      department: null,
    });
  }

  // -----------------------------
  // Loading / errors
  // -----------------------------

 const isLoading =
  departmentsLoading ||
  facultiesLoading ||
  programmesLoading ||
  academicSessionsLoading ||
  programmeCapacitiesLoading;

const error =
  departmentsError ||
  facultiesError ||
  programmesError ||
  academicSessionsError||
  programmeCapacitiesError;
  // -----------------------------
  // Table columns
  // -----------------------------

  const columns = [
    {
      key: "name",
      label: "Department",
      render: (department) => (
        <div>
          <div className="font-medium text-black">
            {department.name}
          </div>

          {department.code && (
            <div className="text-xs text-black/40 mt-0.5">
              {department.code}
            </div>
          )}
        </div>
      ),
    },

    {
      key: "faculty_name",
      label: "Faculty",
      render: (department) => (
        <span className="text-black/65">
          {department.faculty_name || "—"}
        </span>
      ),
    },

    {
      key: "programmes",
      label: "Programmes",
      render: (department) => (
        <span className="text-black/65">
          {department.programmes}
        </span>
      ),
    },
    {
  key: "capacity",
  label: "Capacity",
  render: (department) => (
    <span>
      {department.capacity}
      
    </span>
  ),
},
    {
      key: "status",
      label: "Status",
      render: (department) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
            department.is_active
              ? "bg-emerald-500/10 text-emerald-700"
              : "bg-black/5 text-black/45"
          }`}
        >
          {department.is_active
            ? "Active"
            : "Inactive"}
        </span>
      ),
    },

    {
      key: "actions",
      label: "",
      align: "right",

      render: (department) => (
        <ActionMenu
  trigger={
    <MoreHorizontal
      size={18}
      strokeWidth={1.8}
    />
  }
  items={[
    {
      label: "Edit",
      icon: Pencil,
      onClick: () => openEditModal(department),
    },
    {
      label: "Configure Capacity",
      onClick: () => openCapacityModal(department),
    },
    department.is_active
      ? {
          label: "Deactivate",
          icon: Power,
          danger: true,
          onClick: () =>
            openDeactivateModal(department),
        }
      : {
          label: "Activate",
          icon: Power,
          onClick: () =>
            statusMutation.mutate({
              department,
              isActive: true,
            }),
        },
  ]}
/>  
      ),
    },
  ];

  return (
    <div className="relative">
      {notification && (
        <div
          className={`fixed right-6 top-6 z-[100] rounded-xl px-4 py-3 text-sm shadow-lg ${
            notification.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      <PageHeader
        eyebrow="System · Academic structure"
        title="Departments"
        description="Departments sit beneath a faculty and group related programmes together."
        action={
          <Button
            variant="gold"
            onClick={openCreateModal}
            disabled={facultiesLoading}
          >
            <Plus size={15} />
            Add Department
          </Button>
        }
      />

      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35"
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search departments..."
            className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-9 pr-9 text-sm outline-none transition focus:border-black/20"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black/35 hover:text-black"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error?.message ||
            "Failed to load departments."}
        </div>
      )}

      <DataTable
        columns={columns}
        rows={filteredDepartments}
        loading={isLoading}
        emptyLabel={
          search
            ? "No departments match your search."
            : "No departments found."
        }
      />

      {/* Create / Edit modal */}

      <Modal
        open={modal.open}
        onClose={closeModal}
        title={
          modal.mode === "edit"
            ? "Edit department"
            : "Add a department"
        }
        description={
          modal.mode === "edit"
            ? "Update the department details and faculty assignment."
            : "Assign the department to a faculty so it appears in the right place."
        }
      >
        <form
          id="department-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <Field label="Department name">
            <TextInput
              name="name"
              placeholder="e.g. Chemical Engineering"
              value={departmentName}
              onChange={(e) =>
                setDepartmentName(e.target.value)
              }
              required
            />
          </Field>

          <Field label="Faculty">
            <Select
              name="faculty"
              value={facultyId}
              onChange={(e) =>
                setFacultyId(e.target.value)
              }
              required
            >
              <option value="" disabled>
                Select faculty
              </option>

              {faculties.map((faculty) => (
                <option
                  key={faculty.id}
                  value={faculty.id}
                >
                  {faculty.name}
                </option>
              ))}
            </Select>
          </Field>
        </form>

        <div className="flex items-center justify-end gap-3 pt-6">
          <Button
            variant="ghost"
            onClick={closeModal}
            type="button"
            disabled={
              createMutation.isPending ||
              updateMutation.isPending
            }
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            type="submit"
            form="department-form"
            disabled={
              createMutation.isPending ||
              updateMutation.isPending
            }
          >
            {(createMutation.isPending ||
              updateMutation.isPending) && (
              <Loader2
                size={15}
                className="animate-spin"
              />
            )}

            {modal.mode === "edit"
              ? "Save changes"
              : "Create department"}
          </Button>
        </div>
      </Modal>
       {/* Programme capacity configuration */}

<Modal
  open={capacityModal.open}
  onClose={closeCapacityModal}
  title="Configure programme capacity"
  description={
    capacityModal.department
      ? `Set admission capacity for programmes under ${capacityModal.department.name}.`
      : ""
  }
>
  <div className="space-y-5">
    <div className="rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3">
      <div className="text-xs text-black/40">
        Academic session
      </div>

      <div className="mt-1 text-sm font-medium text-black">
        {currentAcademicSession?.name || "—"}
      </div>
    </div>

    {(() => {
      const departmentProgrammes =
        programmes.filter(
          (programme) =>
            programme.department_id ===
            capacityModal.department?.id
        );

      if (!departmentProgrammes.length) {
        return (
          <div className="rounded-xl border border-black/10 px-4 py-6 text-center">
            <p className="text-sm text-black/50">
              No programmes are assigned to this
              department.
            </p>
          </div>
        );
      }

      return (
        <div className="space-y-3">
          {departmentProgrammes.map(
            (programme) => (
              <div
                key={programme.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-black/10 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-black">
                    {programme.name}
                  </div>

                  {programme.code && (
                    <div className="mt-0.5 text-xs text-black/40">
                      {programme.code}
                    </div>
                  )}
                </div>

                <div className="w-28 shrink-0">
                  <TextInput
                    type="number"
                    min="0"
                    step="1"
                    value={
                      capacityValues[
                        programme.id
                      ] ?? ""
                    }
                    onChange={(e) =>
                      setCapacityValues(
                        (current) => ({
                          ...current,
                          [programme.id]:
                            e.target.value,
                        })
                      )
                    }
                    placeholder="Capacity"
                  />
                </div>
              </div>
            )
          )}
        </div>
      );
    })()}
  </div>

  <div className="flex items-center justify-end gap-3 pt-6">
    <Button
      variant="ghost"
      type="button"
      onClick={closeCapacityModal}
      disabled={capacitySaving}
    >
      Cancel
    </Button>

    <Button
      variant="primary"
      type="button"
      onClick={handleSaveCapacities}
      disabled={
        capacitySaving ||
        !currentAcademicSession
      }
    >
      {capacitySaving && (
        <Loader2
          size={15}
          className="animate-spin"
        />
      )}

      Save capacities
    </Button>
  </div>
</Modal>       
      {/* Deactivate confirmation */}

      <Modal
        open={deactivateModal.open}
        onClose={closeDeactivateModal}
        title="Deactivate department?"
        description={
          deactivateModal.department
            ? `This will deactivate ${deactivateModal.department.name}. It will no longer be active in the academic structure.`
            : ""
        }
      >
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            variant="ghost"
            onClick={closeDeactivateModal}
            disabled={statusMutation.isPending}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={() => {
              statusMutation.mutate({
                department:
                  deactivateModal.department,
                isActive: false,
              });
            }}
            disabled={statusMutation.isPending}
          >
            {statusMutation.isPending && (
              <Loader2
                size={15}
                className="animate-spin"
              />
            )}

            Deactivate
          </Button>
        </div>
      </Modal>
    </div>
  );
}