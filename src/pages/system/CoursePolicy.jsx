import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Power, Search, RefreshCw } from "lucide-react";

import { PageHeader, Button, Modal, Field, TextInput } from "../../components/ui.jsx";

import {
  getAdminCourses,
  createAdminCourse,
  getAdminProgrammes,
  getCourseRegistrationPolicies,
  createCourseRegistrationPolicy,
  updateCourseRegistrationPolicy,
  activateCourseRegistrationPolicy,
  getSemesters,
  getAcademicSessions,
} from "../../lib/api";

const emptyForm = {
  academic_session_id: "",
  faculty_name: "",
  department_id: "",
  semester_id: "",
  level: "100",
  minimum_units: "16",
  maximum_units: "20",
};

function getRows(response) {
  if (Array.isArray(response)) return response;

  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.results)) return response.results;

  return [];
}

function getItemId(item) {
  return String(item?.id ?? item?.uuid ?? "");
}

function getItemName(item) {
  return String(
    item?.name ??
    item?.title ??
    item?.label ??
    item?.session_name ??
    item?.semester_name ??
    ""
  );
}

function getErrorMessage(error) {
  return error?.message || "Something went wrong. Please try again.";
}

export default function CoursePolicy() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");


  const emptyCourseForm = {
    code: "",
    title: "",
    credit_units: "3",
    level: "400",
    semester: "1",
    programme_id: "",
  };
  const [courseSearch, setCourseSearch] = useState("");
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseForm, setCourseForm] = useState({ ...emptyCourseForm });
  const [courseFormError, setCourseFormError] = useState("");


  const createCourseMutation = useMutation({
    mutationFn: createAdminCourse,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-courses"],
      });

      setIsCourseModalOpen(false);
      setCourseForm({ ...emptyCourseForm });
      setCourseFormError("");
    },
    onError: (error) => {
      setCourseFormError(getErrorMessage(error));
    },
  });
  const policiesQuery = useQuery({
    queryKey: ["admin-course-registration-policies"],
    queryFn: getCourseRegistrationPolicies,
  });

  const coursesQuery = useQuery({
    queryKey: ["admin-courses"],
    queryFn: getAdminCourses,
  });

  const programmesQuery = useQuery({
    queryKey: ["admin-programmes"],
    queryFn: getAdminProgrammes,
  });

  const semestersQuery = useQuery({
    queryKey: ["admin-semesters"],
    queryFn: getSemesters,
  });

  const sessionsQuery = useQuery({
    queryKey: ["admin-academic-sessions"],
    queryFn: getAcademicSessions,
  });

  const courses = useMemo(
    () => getRows(coursesQuery.data),
    [coursesQuery.data]
  );
  const programmes = useMemo(
    () => getRows(programmesQuery.data),
    [programmesQuery.data]
  );
  const visibleCourses = useMemo(() => {
    const query = courseSearch.trim().toLowerCase();

    if (!query) return courses;

    return courses.filter((course) =>
      [
        course.code,
        course.title,
        course.level,
        course.semester,
        course.credit_units,
        programmes.find(
          (programme) => programme.id === course.programme_id
        )?.name,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      )
    );
  }, [courses, programmes]);


  const policies = useMemo(
    () => getRows(policiesQuery.data),
    [policiesQuery.data]
  );



  const semesters = useMemo(
    () =>
      getRows(semestersQuery.data)
        .map((item) => ({
          id: getItemId(item),
          name: getItemName(item),
        }))
        .filter((item) => item.id && item.name),
    [semestersQuery.data]
  );

  const sessions = useMemo(
    () =>
      getRows(sessionsQuery.data)
        .map((item) => ({
          id: getItemId(item),
          name: getItemName(item),
        }))
        .filter((item) => item.id && item.name),
    [sessionsQuery.data]
  );

  // Derive faculty choices from the programmes already returned by the API.
  const faculties = useMemo(
    () =>
      [
        ...new Set(
          programmes
            .map((programme) => programme.faculty_name)
            .filter(Boolean)
        ),
      ].sort(),
    [programmes]
  );

  // A department may have several programmes, so deduplicate departments.
  const departments = useMemo(() => {
    const departmentMap = new Map();

    programmes.forEach((programme) => {
      if (programme.department_id && programme.department_name) {
        departmentMap.set(programme.department_id, {
          id: programme.department_id,
          name: programme.department_name,
        });
      }
    });

    return [...departmentMap.values()].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [programmes]);

  const filteredDepartments = useMemo(
    () =>
      departments.filter((department) =>
        programmes.some(
          (programme) =>
            programme.department_id === department.id &&
            programme.faculty_name === form.faculty_name
        )
      ),
    [departments, programmes, form.faculty_name]
  );

  const createMutation = useMutation({
    mutationFn: createCourseRegistrationPolicy,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-course-registration-policies"],
      });

      closeModal();
    },
    onError: (error) => {
      setFormError(getErrorMessage(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      updateCourseRegistrationPolicy(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-course-registration-policies"],
      });

      closeModal();
    },
    onError: (error) => {
      setFormError(getErrorMessage(error));
    },
  });

  const activateMutation = useMutation({
    mutationFn: activateCourseRegistrationPolicy,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["admin-course-registration-policies"],
      }),
  });

  function closeModal() {
    setIsModalOpen(false);
    setEditingPolicy(null);
    setForm({ ...emptyForm });
    setFormError("");
  }

  function openCreateModal() {
    setEditingPolicy(null);
    setForm({ ...emptyForm });
    setFormError("");
    setIsModalOpen(true);
  }

  function openEditModal(policy) {
  const programme = programmes.find(
    (item) => item.department_id === policy.department_id
  );

  setEditingPolicy(policy);

  setForm({
    academic_session_id: policy.academic_session_id || "",
    faculty_name: programme?.faculty_name || "",
    department_id: policy.department_id || "",
    semester_id: policy.semester_id || "",
    level: String(policy.level ?? 100),
    minimum_units: String(policy.minimum_units ?? 16),
    maximum_units: String(policy.maximum_units ?? 20),
  });

  setFormError("");
  setIsModalOpen(true);
}
  function submitCourseForm(event) {
    event.preventDefault();
    setCourseFormError("");

    const creditUnits = Number(courseForm.credit_units);
    const level = Number(courseForm.level);
    const semester = Number(courseForm.semester);

    if (
      !courseForm.code.trim() ||
      !courseForm.title.trim() ||
      !courseForm.programme_id
    ) {
      setCourseFormError(
        "Enter the course code, title, and programme."
      );
      return;
    }

    if (!Number.isInteger(creditUnits) || creditUnits < 1) {
      setCourseFormError("Credit units must be a positive integer.");
      return;
    }

    if (
      !Number.isInteger(level) ||
      level < 100 ||
      level > 800 ||
      level % 100 !== 0
    ) {
      setCourseFormError("Select a valid academic level.");
      return;
    }

    if (![1, 2].includes(semester)) {
      setCourseFormError("Select semester 1 or 2.");
      return;
    }

    createCourseMutation.mutate({
      code: courseForm.code.trim().toUpperCase(),
      title: courseForm.title.trim(),
      credit_units: creditUnits,
      level,
      semester,
      programme_id: courseForm.programme_id,
    });
  }
  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function submitForm(event) {
    event.preventDefault();
    setFormError("");

    const level = Number(form.level);
    const minimumUnits = Number(form.minimum_units);
    const maximumUnits = Number(form.maximum_units);

    if (
      !form.academic_session_id ||
      !form.faculty_name ||
      !form.department_id ||
      !form.semester_id
    ) {
      setFormError(
        "Select an academic session, faculty, department, and semester."
      );
      return;
    }

    if (!Number.isInteger(level) || level < 100 || level > 800) {
      setFormError("Enter a valid academic level.");
      return;
    }

    if (
      !Number.isInteger(minimumUnits) ||
      !Number.isInteger(maximumUnits) ||
      minimumUnits < 0 ||
      maximumUnits < 1 ||
      minimumUnits > maximumUnits
    ) {
      setFormError(
        "Enter valid unit limits. Minimum units cannot exceed maximum units."
      );
      return;
    }

    const payload = {
      academic_session_id: form.academic_session_id,
      department_id: form.department_id,
      semester_id: form.semester_id,
      level,
      minimum_units: minimumUnits,
      maximum_units: maximumUnits,
    };

    if (editingPolicy) {
  const policyId = getItemId(editingPolicy);

  if (!policyId) {
    setFormError("Could not identify this policy. Please refresh and try again.");
    return;
  }

  updateMutation.mutate({
    id: policyId,
    payload,
  });
} else {
  createMutation.mutate(payload);
}
  }

  const visiblePolicies = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return policies;

    return policies.filter((policy) => {
      const department = departments.find(
        (item) => item.id === policy.department_id
      )?.name;

      const session = sessions.find(
        (item) => item.id === policy.academic_session_id
      )?.name;

      const semester = semesters.find(
        (item) => item.id === policy.semester_id
      )?.name;

      return [
        department,
        session,
        semester,
        policy.level,
        policy.minimum_units,
        policy.maximum_units,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      );
    });
  }, [policies, search, departments, sessions, semesters]);

  const columns = [
    {
      header: "Department",
      accessorKey: "department_id",
      cell: ({ row }) =>
        departments.find(
          (item) => item.id === row.original.department_id
        )?.name || row.original.department_id,
    },
    {
      header: "Academic Session",
      accessorKey: "academic_session_id",
      cell: ({ row }) =>
        sessions.find(
          (item) => item.id === row.original.academic_session_id
        )?.name || row.original.academic_session_id,
    },
    {
      header: "Semester",
      accessorKey: "semester_id",
      cell: ({ row }) =>
        semesters.find(
          (item) => item.id === row.original.semester_id
        )?.name || row.original.semester_id,
    },
    {
      header: "Level",
      accessorKey: "level",
    },
    {
      header: "Minimum Units",
      accessorKey: "minimum_units",
    },
    {
      header: "Maximum Units",
      accessorKey: "maximum_units",
    },
    {
      header: "Status",
      accessorKey: "is_active",
      cell: ({ row }) => (
        <span
          className={
            row.original.is_active
              ? "font-medium text-green-600"
              : "text-gray-500"
          }
        >
          {row.original.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => {
        const policy = row.original;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openEditModal(policy)}
            >
              <Pencil size={14} />
              Edit
            </Button>

            {!policy.is_active && (
              <Button
                variant="outline"
                size="sm"
                disabled={activateMutation.isPending}
                onClick={() => activateMutation.mutate(policy.id)}
              >
                <Power size={14} />
                Activate
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const isSaving =
    createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
  
      <PageHeader
        title="Course Registration Policies"
        description="Manage course-unit limits by department, academic session, level, and semester."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <TextInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search registration policies..."
          />
        </div>

        <Button onClick={openCreateModal}>
          <Plus size={16} />
          Create Policy
        </Button>
      </div>

      {(policiesQuery.isError ||
        programmesQuery.isError ||
        semestersQuery.isError ||
        sessionsQuery.isError) && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Some data could not be loaded. Check the API responses and try again.

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                policiesQuery.refetch();
                programmesQuery.refetch();
                semestersQuery.refetch();
                sessionsQuery.refetch();
              }}
            >
              <RefreshCw size={14} />
              Retry
            </Button>
          </div>
        )}

      {policiesQuery.isLoading ? (
        <p className="text-sm text-gray-500">
          Loading registration policies...
        </p>
      ) : policiesQuery.isError ? (
        <p className="text-sm text-red-600">
          {getErrorMessage(policiesQuery.error)}
        </p>
      ) : (

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Academic Session</th>
                <th className="px-4 py-3">Semester</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Min Units</th>
                <th className="px-4 py-3">Max Units</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {visiblePolicies.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No registration policies found.
                  </td>
                </tr>
              ) : (
                visiblePolicies.map((policy) => {
                  const department = departments.find(
                    (item) => item.id === policy.department_id
                  );

                  const session = sessions.find(
                    (item) => item.id === policy.academic_session_id
                  );

                  const semester = semesters.find(
                    (item) => item.id === policy.semester_id
                  );

                  return (
                    <tr key={policy.id}>
                      <td className="px-4 py-3">
                        {department?.name || policy.department_id}
                      </td>

                      <td className="px-4 py-3">
                        {session?.name || policy.academic_session_id}
                      </td>

                      <td className="px-4 py-3">
                        {semester?.name || policy.semester_id}
                      </td>

                      <td className="px-4 py-3">{policy.level}</td>
                      <td className="px-4 py-3">{policy.minimum_units}</td>
                      <td className="px-4 py-3">{policy.maximum_units}</td>

                      <td className="px-4 py-3">
                        <span
                          className={
                            policy.is_active
                              ? "font-medium text-green-600"
                              : "text-gray-500"
                          }
                        >
                          {policy.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(policy)}
                          >
                            Edit
                          </Button>

                          {!policy.is_active && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={activateMutation.isPending}
                              onClick={() => activateMutation.mutate(policy.id)}
                            >
                              Activate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      )}

      <Modal
        open={isModalOpen}
        onClose={closeModal}
        title={
          editingPolicy
            ? "Edit Registration Policy"
            : "Create Registration Policy"
        }
      >
        <form onSubmit={submitForm} className="space-y-4">
          <Field label="Academic Session">
            <select
              value={form.academic_session_id}
              onChange={(event) =>
                updateField("academic_session_id", event.target.value)
              }
              required
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="">Select academic session</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Faculty">
            <select
              value={form.faculty_name}
              onChange={(event) => {
                updateField("faculty_name", event.target.value);
                updateField("department_id", "");
              }}
              required
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="">Select faculty</option>
              {faculties.map((faculty) => (
                <option key={faculty} value={faculty}>
                  {faculty}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Department">
            <select
              value={form.department_id}
              onChange={(event) =>
                updateField("department_id", event.target.value)
              }
              required
              disabled={!form.faculty_name}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="">Select department</option>
              {filteredDepartments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Semester">
            <select
              value={form.semester_id}
              onChange={(event) =>
                updateField("semester_id", event.target.value)
              }
              required
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="">Select semester</option>
              {semesters.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  {semester.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Level">
            <select
              value={form.level}
              onChange={(event) => updateField("level", event.target.value)}
              required
              className="w-full rounded-md border px-3 py-2"
            >
              {[100, 200, 300, 400, 500, 600, 700, 800].map((level) => (
                <option key={level} value={level}>
                  {level} Level
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Minimum Units">
              <TextInput
                inputType="number"
                value={form.minimum_units}
                onChange={(event) =>
                  updateField("minimum_units", event.target.value)
                }
                min={0}
                required
              />
            </Field>

            <Field label="Maximum Units">
              <TextInput
                inputType="number"
                value={form.maximum_units}
                onChange={(event) =>
                  updateField("maximum_units", event.target.value)
                }
                min={1}
                required
              />
            </Field>
          </div>

          {formError && (
            <p className="text-sm text-red-600">{formError}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSaving}>
              {isSaving
                ? "Saving..."
                : editingPolicy
                  ? "Update Policy"
                  : "Create Policy"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
