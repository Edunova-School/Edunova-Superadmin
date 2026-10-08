import { useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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
  PageHeader,
  Button,
  Modal,
  Field,
  TextInput,
  ActionMenu,
} from "../../components/ui.jsx";

import DataTable from "../../components/DataTable.jsx";

import {
  getAdminFaculties,
  getAdminDepartments,
  getAdminProgrammes,
  createAdminFaculty,
  updateAdminFaculty,
} from "../../lib/api";


function normalizeFaculty(faculty) {
  return {
    ...faculty,
    id: faculty.id ?? faculty.faculty_id,
    name:
      faculty.name ??
      faculty.faculty_name ??
      "Unnamed faculty",
  };
}


export default function Faculties() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");

  const [modal, setModal] = useState({
    open: false,
    mode: "create",
    faculty: null,
  });

  const [deactivateModal, setDeactivateModal] = useState({
    open: false,
    faculty: null,
  });

  const [name, setName] = useState("");

  const [notification, setNotification] = useState({
    type: "",
    message: "",
  });


  /*
   * --------------------------------------------------
   * NOTIFICATIONS
   * --------------------------------------------------
   */

  const showNotification = (type, message) => {
    setNotification({
      type,
      message,
    });

    setTimeout(() => {
      setNotification({
        type: "",
        message: "",
      });
    }, 4000);
  };


  /*
   * --------------------------------------------------
   * FACULTIES
   * --------------------------------------------------
   */

  const {
    data: faculties = [],
    isLoading: facultiesLoading,
    error: facultiesError,
  } = useQuery({
    queryKey: ["admin-faculties"],
    queryFn: async () => {
      const response = await getAdminFaculties();

      const list = response?.data ?? response ?? [];

      if (!Array.isArray(list)) {
        return [];
      }

      return list.map(normalizeFaculty);
    },

    staleTime: 2 * 60 * 1000,
  });


  /*
   * --------------------------------------------------
   * DEPARTMENTS
   * --------------------------------------------------
   */

  const {
    data: departments = [],
    isLoading: departmentsLoading,
    error: departmentsError,
  } = useQuery({
    queryKey: ["admin-departments"],
    queryFn: async () => {
      const response = await getAdminDepartments();

      const list = response?.data ?? response ?? [];

      return Array.isArray(list) ? list : [];
    },

    staleTime: 2 * 60 * 1000,
  });


  /*
   * --------------------------------------------------
   * PROGRAMMES
   * --------------------------------------------------
   */

  const {
    data: programmes = [],
    isLoading: programmesLoading,
    error: programmesError,
  } = useQuery({
    queryKey: ["admin-programmes"],
    queryFn: async () => {
      const response = await getAdminProgrammes();

      const list = response?.data ?? response ?? [];

      return Array.isArray(list) ? list : [];
    },

    staleTime: 2 * 60 * 1000,
  });


  /*
   * --------------------------------------------------
   * FACULTY ROWS
   * --------------------------------------------------
   */

  const facultyRows = useMemo(() => {
    return faculties.map((faculty) => {
      const facultyDepartments = departments.filter(
        (department) =>
          department.faculty_id === faculty.id
      );

      const departmentIds = new Set(
        facultyDepartments.map(
          (department) => department.id
        )
      );

      const facultyProgrammes = programmes.filter(
        (programme) =>
          departmentIds.has(programme.department_id)
      );

      return {
        ...faculty,

        departments: facultyDepartments.length,

        programmes: facultyProgrammes.length,
      };
    });
  }, [faculties, departments, programmes]);


  /*
   * --------------------------------------------------
   * SEARCH
   * --------------------------------------------------
   */

  const filteredFaculties = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return facultyRows;
    }

    return facultyRows.filter((faculty) => {
      return (
        faculty.name
          ?.toLowerCase()
          .includes(value) ||
        faculty.code
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [facultyRows, search]);


  /*
   * --------------------------------------------------
   * CREATE FACULTY
   * --------------------------------------------------
   */

  const createMutation = useMutation({
    mutationFn: async () => {
      const trimmedName = name.trim();

      if (!trimmedName) {
        throw new Error("Faculty name is required.");
      }

      const existingFaculty = faculties.find(
        (faculty) =>
          faculty.name?.trim().toLowerCase() ===
          trimmedName.toLowerCase()
      );

      if (existingFaculty) {
        throw new Error(
          "A faculty with this name already exists."
        );
      }

      return createAdminFaculty(trimmedName);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-faculties"],
      });

      setModal({
        open: false,
        mode: "create",
        faculty: null,
      });

      setName("");

      showNotification(
        "success",
        "Faculty created successfully."
      );
    },

    onError: (error) => {
      showNotification(
        "error",
        error?.message ||
          "Failed to create faculty."
      );
    },
  });


  /*
   * --------------------------------------------------
   * UPDATE FACULTY
   * --------------------------------------------------
   */

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!modal.faculty?.id) {
        throw new Error("Faculty ID is missing.");
      }

      const trimmedName = name.trim();

      if (!trimmedName) {
        throw new Error("Faculty name is required.");
      }

      const existingFaculty = faculties.find(
        (faculty) =>
          faculty.id !== modal.faculty.id &&
          faculty.name?.trim().toLowerCase() ===
            trimmedName.toLowerCase()
      );

      if (existingFaculty) {
        throw new Error(
          "A faculty with this name already exists."
        );
      }

      return updateAdminFaculty(
        modal.faculty.id,
        {
          name: trimmedName,
        }
      );
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-faculties"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["admin-departments"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["admin-programmes"],
      });

      setModal({
        open: false,
        mode: "create",
        faculty: null,
      });

      setName("");

      showNotification(
        "success",
        "Faculty updated successfully."
      );
    },

    onError: (error) => {
      showNotification(
        "error",
        error?.message ||
          "Failed to update faculty."
      );
    },
  });


  /*
   * --------------------------------------------------
   * ACTIVATE / DEACTIVATE FACULTY
   * --------------------------------------------------
   */

  const statusMutation = useMutation({
    mutationFn: async ({ faculty, isActive }) => {
      if (!faculty?.id) {
        throw new Error("Faculty ID is missing.");
      }

      return updateAdminFaculty(
        faculty.id,
        {
          is_active: isActive,
        }
      );
    },

    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-faculties"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["admin-departments"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["admin-programmes"],
      });

      setDeactivateModal({
        open: false,
        faculty: null,
      });

      showNotification(
        "success",
        variables.isActive
          ? "Faculty activated successfully."
          : "Faculty deactivated successfully."
      );
    },

    onError: (error) => {
      showNotification(
        "error",
        error?.message ||
          "Failed to update faculty status."
      );
    },
  });


  /*
   * --------------------------------------------------
   * MODAL HELPERS
   * --------------------------------------------------
   */

  const openCreateModal = () => {
    setName("");

    setModal({
      open: true,
      mode: "create",
      faculty: null,
    });
  };


  const openEditModal = (faculty) => {
    setName(faculty.name || "");

    setModal({
      open: true,
      mode: "edit",
      faculty,
    });
  };


  const closeModal = () => {
    if (
      createMutation.isPending ||
      updateMutation.isPending
    ) {
      return;
    }

    setModal({
      open: false,
      mode: "create",
      faculty: null,
    });

    setName("");
  };


  const openDeactivateModal = (faculty) => {
    setDeactivateModal({
      open: true,
      faculty,
    });
  };


  const closeDeactivateModal = () => {
    if (statusMutation.isPending) {
      return;
    }

    setDeactivateModal({
      open: false,
      faculty: null,
    });
  };


  /*
   * --------------------------------------------------
   * LOADING / ERROR
   * --------------------------------------------------
   */

  const isLoading =
    facultiesLoading ||
    departmentsLoading ||
    programmesLoading;

  const error =
    facultiesError ||
    departmentsError ||
    programmesError;


  /*
   * --------------------------------------------------
   * TABLE COLUMNS
   * --------------------------------------------------
   */

  const columns = [
    {
      key: "name",
      label: "Faculty",
      render: (faculty) => (
        <div>
          <p className="font-medium text-black">
            {faculty.name}
          </p>

          {faculty.code && (
            <p className="text-xs text-black/40 mt-0.5">
              {faculty.code}
            </p>
          )}
        </div>
      ),
    },

    {
      key: "departments",
      label: "Departments",
      render: (faculty) => (
        <span className="text-sm text-black/70">
          {faculty.departments}
        </span>
      ),
    },

    {
      key: "programmes",
      label: "Programmes",
      render: (faculty) => (
        <span className="text-sm text-black/70">
          {faculty.programmes}
        </span>
      ),
    },

    {
      key: "is_active",
      label: "Status",
      render: (faculty) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            faculty.is_active
              ? "bg-green-50 text-green-700"
              : "bg-black/5 text-black/50"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              faculty.is_active
                ? "bg-green-500"
                : "bg-black/30"
            }`}
          />

          {faculty.is_active
            ? "Active"
            : "Inactive"}
        </span>
      ),
    },

    {
      key: "actions",
      label: "",
      render: (faculty) => (
        <ActionMenu
         trigger={<MoreHorizontal size={18} strokeWidth={1.8} />}
          items={[
            {
              label: "Edit",
              icon: Pencil,
              onClick: () =>
                openEditModal(faculty),
            },

            faculty.is_active
              ? {
                  label: "Deactivate",
                  icon: Power,
                  onClick: () =>
                    openDeactivateModal(faculty),
                }
              : {
                  label: "Activate",
                  icon: Power,
                  onClick: () =>
                    statusMutation.mutate({
                      faculty,
                      isActive: true,
                    }),
                },
          ]}
        />
      ),
    },
  ];


  /*
   * --------------------------------------------------
   * RENDER
   * --------------------------------------------------
   */

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculties"
        description="Manage faculties and their academic structure."
      >
        <Button
          onClick={openCreateModal}
          className="flex items-center gap-2"
        >
          <Plus size={16} />

          Add Faculty
        </Button>
      </PageHeader>


      {/* NOTIFICATION */}

      {notification.message && (
        <div
          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
            notification.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <span>
            {notification.message}
          </span>

          <button
            type="button"
            onClick={() =>
              setNotification({
                type: "",
                message: "",
              })
            }
            className="ml-4 opacity-60 hover:opacity-100"
          >
            <X size={16} />
          </button>
        </div>
      )}


      {/* SEARCH */}

      <div className="bg-white border border-black/5 rounded-xl p-4">
        <div className="relative max-w-md">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search faculties..."
            className="w-full border border-black/10 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]"
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


      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error.message ||
            "Failed to load faculty data."}
        </div>
      )}


      {/* TABLE */}

      <DataTable
        columns={columns}
        rows={filteredFaculties}
        loading={isLoading}
        emptyLabel={
          search
            ? "No faculties match your search."
            : "No faculties found."
        }
      />


      {/* CREATE / EDIT MODAL */}

      <Modal
        open={modal.open}
        onClose={closeModal}
        title={
          modal.mode === "edit"
            ? "Edit Faculty"
            : "Add Faculty"
        }
      >
        <div className="space-y-5">

          <Field label="Faculty name">
            <TextInput
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="e.g. Faculty of Engineering"
              disabled={
                createMutation.isPending ||
                updateMutation.isPending
              }
            />
          </Field>


          {modal.mode === "edit" &&
            modal.faculty && (
              <div className="rounded-lg bg-black/[0.03] px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-black/50">
                    Status
                  </span>

                  <span
                    className={
                      modal.faculty.is_active
                        ? "text-green-600"
                        : "text-black/45"
                    }
                  >
                    {modal.faculty.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>
              </div>
            )}


          <div className="flex justify-end gap-3 pt-2">

            <Button
              type="button"
              variant="secondary"
              onClick={closeModal}
              disabled={
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={() => {
                if (
                  modal.mode === "edit"
                ) {
                  updateMutation.mutate();
                } else {
                  createMutation.mutate();
                }
              }}
              disabled={
                !name.trim() ||
                createMutation.isPending ||
                updateMutation.isPending
              }
              className="flex items-center gap-2"
            >
              {(createMutation.isPending ||
                updateMutation.isPending) && (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              )}

              {createMutation.isPending
                ? "Creating..."
                : updateMutation.isPending
                ? "Saving..."
                : modal.mode === "edit"
                ? "Save Changes"
                : "Create Faculty"}
            </Button>

          </div>

        </div>
      </Modal>


      {/* DEACTIVATE MODAL */}

      <Modal
        open={deactivateModal.open}
        onClose={closeDeactivateModal}
        title="Deactivate Faculty"
      >
        {deactivateModal.faculty && (
          <div className="space-y-5">

            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">

              <div className="flex gap-3">

                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Power
                    size={18}
                    className="text-amber-700"
                  />
                </div>

                <div>
                  <p className="font-medium text-black">
                    Deactivate{" "}
                    {deactivateModal.faculty.name}?
                  </p>

                  <p className="text-sm text-black/55 mt-1">
                    This will prevent the faculty
                    from being treated as active,
                    but its academic records will
                    remain in the system.
                  </p>
                </div>

              </div>

            </div>


            <div className="grid grid-cols-2 gap-3">

              <div className="rounded-lg border border-black/5 bg-black/[0.02] px-4 py-3">
                <p className="text-xs text-black/40">
                  Departments
                </p>

                <p className="text-lg font-semibold mt-1">
                  {deactivateModal.faculty.departments}
                </p>
              </div>


              <div className="rounded-lg border border-black/5 bg-black/[0.02] px-4 py-3">
                <p className="text-xs text-black/40">
                  Programmes
                </p>

                <p className="text-lg font-semibold mt-1">
                  {deactivateModal.faculty.programmes}
                </p>
              </div>

            </div>


            {deactivateModal.faculty.departments > 0 && (
              <p className="text-sm text-black/55">
                This faculty currently has{" "}
                <strong>
                  {deactivateModal.faculty.departments}
                </strong>{" "}
                department
                {deactivateModal.faculty.departments !==
                1
                  ? "s"
                  : ""}
                . Deactivating it will not
                remove those departments or
                programmes.
              </p>
            )}


            <div className="flex justify-end gap-3 pt-2">

              <Button
                type="button"
                variant="secondary"
                onClick={closeDeactivateModal}
                disabled={
                  statusMutation.isPending
                }
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={() =>
                  statusMutation.mutate({
                    faculty:
                      deactivateModal.faculty,
                    isActive: false,
                  })
                }
                disabled={
                  statusMutation.isPending
                }
                className="flex items-center gap-2"
              >
                {statusMutation.isPending && (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                )}

                {statusMutation.isPending
                  ? "Deactivating..."
                  : "Deactivate Faculty"}
              </Button>

            </div>

          </div>
        )}
      </Modal>

    </div>
  );
}