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
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

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
   getAdminProgrammes,
  getAdminDepartments,
  getAcademicSessions,
  getProgrammeCapacities,
  createAdminProgramme,
  updateAdminProgramme,
} from "../../lib/api";

export default function Programmes() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");

  const [modal, setModal] = useState({
    open: false,
    mode: "create",
    programme: null,
  });

  const [programmeName, setProgrammeName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [duration, setDuration] = useState("4");
  
  const [requirements, setRequirements] = useState("");

  const [deactivateModal, setDeactivateModal] =
    useState({
      open: false,
      programme: null,
    });

  const [notification, setNotification] =
    useState(null);

  function showNotification(type, message) {
    setNotification({ type, message });

    window.setTimeout(() => {
      setNotification(null);
    }, 3500);
  }

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
  return (
    academicSessions.find(
      (session) => session.is_current
    ) ?? null
  );
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
  // -----------------------------
  // Create programme
  // -----------------------------

  const createMutation = useMutation({
    mutationFn: async () => {
      const name = programmeName.trim();

      if (!name) {
        throw new Error(
          "Programme name is required."
        );
      }

      if (!departmentId) {
        throw new Error(  
          "Please select a department."   
        );
      }

      const duplicate = programmes.some(
        (programme) =>
          programme.name?.trim().toLowerCase() ===
            name.toLowerCase() &&
          programme.department_id === departmentId
      );

      if (duplicate) {
        throw new Error(
          "A programme with this name already exists in this department."
        );
      }

      return createAdminProgramme({
        name,
        department_id: departmentId,
        duration_years: Number(duration) || 0,
        requirements: requirements.trim(),
      });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-programmes"],
      });

      setModal({
        open: false,
        mode: "create",
        programme: null,
      });

      resetForm();

      showNotification(
        "success",
        "Programme created successfully."
      );
    },

    onError: (error) => {
      showNotification(
        "error",
        error?.message ||
          "Failed to create programme."
      );
    },
  });

  // -----------------------------
  // Edit programme
  // -----------------------------

  const updateMutation = useMutation({
    mutationFn: async () => {
      const programme = modal.programme;
      const name = programmeName.trim();

      if (!programme?.id) {
        throw new Error(
          "Programme ID is missing."
        );
      }

      if (!name) {
        throw new Error(
          "Programme name is required."
        );
      }

      if (!departmentId) {
        throw new Error(
          "Please select a department."
        );
      }

      const duplicate = programmes.some(
        (item) =>
          item.id !== programme.id &&
          item.name?.trim().toLowerCase() ===
            name.toLowerCase() &&
          item.department_id === departmentId
      );

      if (duplicate) {
        throw new Error(
          "A programme with this name already exists in this department."
        );
      }

      return updateAdminProgramme(
        programme.id,
        {
          name,
          department_id: departmentId,
          duration_years:
            Number(duration) || 0,
          requirements: requirements.trim(),
        }
      );
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-programmes"],
      });

      setModal({
        open: false,
        mode: "create",
        programme: null,
      });

      resetForm();

      showNotification(
        "success",
        "Programme updated successfully."
      );
    },

    onError: (error) => {
      showNotification(
        "error",
        error?.message ||
          "Failed to update programme."
      );
    },
  });

  // -----------------------------
  // Activate / deactivate
  // -----------------------------

  const statusMutation = useMutation({
    mutationFn: async ({
      programme,
      isActive,
    }) => {
      if (!programme?.id) {
        throw new Error(
          "Programme ID is missing."
        );
      }

      return updateAdminProgramme(
        programme.id,
        {
          is_active: isActive,
        }
      );
    },

    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-programmes"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["admin-departments"],
      });

      setDeactivateModal({
        open: false,
        programme: null,
      });

      showNotification(
        "success",
        variables.isActive
          ? "Programme activated successfully."
          : "Programme deactivated successfully."
      );
    },

    onError: (error) => {
      showNotification(
        "error",
        error?.message ||
          "Failed to update programme status."
      );
    },
  });

  // -----------------------------
  // Search
  // -----------------------------

  const filteredProgrammes = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return programmes;
    }

    return programmes.filter((programme) => {
      return (
        programme.name
          ?.toLowerCase()
          .includes(value) ||
        programme.code
          ?.toLowerCase()
          .includes(value) ||
        programme.department_name
          ?.toLowerCase()
          .includes(value) ||
        programme.faculty_name
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [programmes, search]);

  // -----------------------------
  // Form helpers
  // -----------------------------

  function resetForm() {
    setProgrammeName("");
    setDepartmentId("");
    setDuration("4");
    setRequirements("");
  }

  function openCreateModal() {
    resetForm();

    setDepartmentId(
      departments[0]?.id ?? ""
    );

    setModal({
      open: true,
      mode: "create",
      programme: null,
    });
  }

  function openEditModal(programme) {
    setProgrammeName(programme.name ?? "");

    setDepartmentId(
      programme.department_id ?? ""
    );

    setDuration(
      programme.duration_years
        ? String(programme.duration_years)
        : "4"
    );


    setRequirements(
      programme.requirements ?? ""
    );

    setModal({
      open: true,
      mode: "edit",
      programme,
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
      programme: null,
    });

    resetForm();
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (modal.mode === "edit") {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  }

  function openDeactivateModal(programme) {
    setDeactivateModal({
      open: true,
      programme,
    });
  }

  function closeDeactivateModal() {
    if (statusMutation.isPending) {
      return;
    }

    setDeactivateModal({
      open: false,
      programme: null,
    });
  }

  // -----------------------------
  // Loading / errors
  // -----------------------------

  const isLoading =
  programmesLoading ||
  departmentsLoading ||
  academicSessionsLoading ||
  programmeCapacitiesLoading;

const error =
  programmesError ||
  departmentsError ||
  academicSessionsError ||
  programmeCapacitiesError;
  // -----------------------------
  // Table columns
  // -----------------------------

  const columns = [
    {
      key: "name",
      label: "Programme",

      render: (programme) => (
        <div>
          <div className="font-medium text-black">
            {programme.name}
          </div>

          {programme.code && (
            <div className="text-xs text-black/40 mt-0.5">
              {programme.code}
            </div>
          )}
        </div>
      ),
    },

    {
      key: "department_name",
      label: "Department",

      render: (programme) => (
        <div>
          <div className="text-black/70">
            {programme.department_name ||
              "—"}
          </div>

          {programme.faculty_name && (
            <div className="text-xs text-black/40 mt-0.5">
              {programme.faculty_name}
            </div>
          )}
        </div>
      ),
    },

    {
      key: "duration_years",
      label: "Duration",

      render: (programme) => (
        <span className="text-black/65">
          {programme.duration_years
            ? `${programme.duration_years} years`
            : "—"}
        </span>
      ),
    },

  {
  key: "capacity",
  label: "Capacity",

  render: (programme) => {
    const capacityRecord =
      programmeCapacities.find(
        (item) =>
          item.programme_id === programme.id
      );

    return (
      <span className="text-black/65">
        {capacityRecord?.capacity ?? "—"}
      </span>
    );
  },
},

    {
      key: "requirements",
      label: "Requirements",

      render: (programme) => (
        <span
          className="block max-w-xs truncate text-black/55"
          title={programme.requirements || ""}
        >
          {programme.requirements || "—"}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",

      render: (programme) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
            programme.is_active
              ? "bg-emerald-500/10 text-emerald-700"
              : "bg-black/5 text-black/45"
          }`}
        >
          {programme.is_active
            ? "Active"
            : "Inactive"}
        </span>
      ),
    },

    {
      key: "actions",
      label: "",
      align: "right",

      render: (programme) => (
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
              onClick: () =>
                openEditModal(programme),
            },

            programme.is_active
              ? {
                  label: "Deactivate",
                  icon: Power,
                  danger: true,
                  onClick: () =>
                    openDeactivateModal(
                      programme
                    ),
                }
              : {
                  label: "Activate",
                  icon: Power,
                  onClick: () =>
                    statusMutation.mutate({
                      programme,
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
      {/* Notification */}

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
        title="Programmes"
        description="Each programme belongs to a department and defines its own entry requirements and admission capacity."
        action={
          <Button
            variant="gold"
            onClick={openCreateModal}
            disabled={departmentsLoading}
          >
            <Plus size={15} />
            Add Programme
          </Button>
        }
      />

      {/* Search */}

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
            placeholder="Search programmes..."
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

      {/* Error */}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error?.message ||
            "Failed to load programmes."}
        </div>
      )}

      {/* Table */}

      <DataTable
        columns={columns}
        rows={filteredProgrammes}
        loading={isLoading}
        emptyLabel={
          search
            ? "No programmes match your search."
            : "No programmes found."
        }
      />

      {/* Create / Edit modal */}

      <Modal
        open={modal.open}
        onClose={closeModal}
        title={
          modal.mode === "edit"
            ? "Edit programme"
            : "Add a programme"
        }
        description={
          modal.mode === "edit"
            ? "Update the programme details and department assignment."
            : "Create a programme and assign it to a department."
        }
        width="max-w-lg"
      >
        <form
          id="programme-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <Field label="Programme name">
            <TextInput
              name="name"
              placeholder="e.g. B.Sc. Cybersecurity"
              value={programmeName}
              onChange={(e) =>
                setProgrammeName(e.target.value)
              }
              required
            />
          </Field>

          <Field label="Department">
            <Select
              name="department"
              value={departmentId}
              onChange={(e) =>
                setDepartmentId(e.target.value)
              }
              required
            >
              <option value="" disabled>
                Select department
              </option>

              {departments.map((department) => (
                <option
                  key={department.id}
                  value={department.id}
                >
                  {department.name}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Duration">
              <TextInput
                name="duration"
                type="number"
                min="1"
                placeholder="e.g. 4"
                value={duration}
                onChange={(e) =>
                  setDuration(e.target.value)
                }
                required
              />
            </Field>
          </div>

          <Field label="Entry requirements">
            <TextInput
              name="requirements"
              placeholder="e.g. 5 O'Level credits incl. Maths, English"
              value={requirements}
              onChange={(e) =>
                setRequirements(e.target.value)
              }
              required
            />
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
            form="programme-form"
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
              : "Create programme"}
          </Button>
        </div>
      </Modal>

      {/* Deactivate confirmation */}

      <Modal
        open={deactivateModal.open}
        onClose={closeDeactivateModal}
        title="Deactivate programme?"
        description={
          deactivateModal.programme
            ? `This will deactivate ${deactivateModal.programme.name}. It will no longer be active in the academic structure.`
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
                programme:
                  deactivateModal.programme,
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