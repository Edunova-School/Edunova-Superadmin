import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, RefreshCw, Pencil } from "lucide-react";
import BulkCourseImport from "../../lib/bulkCourseImport.jsx";
import {
  PageHeader,
  Button,
  Modal,
  Field,
  TextInput,
} from "../../components/ui.jsx";

import {
  getAdminCourses,
  createAdminCourse,
  updateAdminCourse,
  getAdminProgrammes,
} from "../../lib/api";

const emptyCourseForm = {
  code: "",
  title: "",
  credit_units: "3",
  level: "400",
  semester: "1",
  programme_id: "",
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

function getErrorMessage(error) {
  return error?.message || "Something went wrong. Please try again.";
}

export default function CourseCatalogue() {
  const queryClient = useQueryClient();

  const [courseSearch, setCourseSearch] = useState("");
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({ ...emptyCourseForm });
  const [courseFormError, setCourseFormError] = useState("");

  const coursesQuery = useQuery({
    queryKey: ["admin-courses"],
    queryFn: getAdminCourses,
  });

  const programmesQuery = useQuery({
    queryKey: ["admin-programmes"],
    queryFn: getAdminProgrammes,
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

    return courses.filter((course) => {
      const programmeName = programmes.find(
        (programme) => programme.id === course.programme_id
      )?.name;

      return [
        course.code,
        course.title,
        course.level,
        course.semester,
        course.credit_units,
        programmeName,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      );
    });
  }, [courses, courseSearch, programmes]);

  const saveCourseMutation = useMutation({
    mutationFn: ({ courseId, payload }) => {
      if (courseId) {
        return updateAdminCourse(courseId, payload);
      }

      return createAdminCourse(payload);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-courses"],
      });

      closeCourseModal();
    },

    onError: (error) => {
      setCourseFormError(getErrorMessage(error));
    },
  });

  function openCreateCourseModal() {
    setEditingCourse(null);
    setCourseForm({ ...emptyCourseForm });
    setCourseFormError("");
    setIsCourseModalOpen(true);
  }

  function openEditCourseModal(course) {
    setEditingCourse(course);

    setCourseForm({
      code: String(course.code ?? ""),
      title: String(course.title ?? ""),
      credit_units: String(course.credit_units ?? 3),
      level: String(course.level ?? 400),
      semester: String(course.semester ?? 1),
      programme_id: String(course.programme_id ?? ""),
    });

    setCourseFormError("");
    setIsCourseModalOpen(true);
  }

  function closeCourseModal() {
    if (saveCourseMutation.isPending) return;

    setIsCourseModalOpen(false);
    setEditingCourse(null);
    setCourseForm({ ...emptyCourseForm });
    setCourseFormError("");
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
      setCourseFormError(
        "Credit units must be a positive integer."
      );
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

    const payload = {
      code: courseForm.code.trim().toUpperCase(),
      title: courseForm.title.trim(),
      credit_units: creditUnits,
      level,
      semester,
      programme_id: courseForm.programme_id,
    };

    saveCourseMutation.mutate({
      courseId: editingCourse?.id,
      payload,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Catalogue"
        description="Create and manage courses assigned to academic programmes."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <TextInput
            value={courseSearch}
            onChange={(event) => setCourseSearch(event.target.value)}
            placeholder="Search courses..."
          />
        </div>

        <Button onClick={openCreateCourseModal}>
          <Plus size={16} />
          Add Course
        </Button>
      </div>
{/* <BulkCourseImport /> */}
      {programmesQuery.isError && (
        <p className="text-sm text-red-600">
          Could not load programmes:{" "}
          {getErrorMessage(programmesQuery.error)}
        </p>
      )}

      {coursesQuery.isLoading ? (
        <p className="text-sm text-gray-500">Loading courses...</p>
      ) : coursesQuery.isError ? (
        <div className="space-y-3">
          <p className="text-sm text-red-600">
            {getErrorMessage(coursesQuery.error)}
          </p>

          <Button
            variant="outline"
            onClick={() => coursesQuery.refetch()}
          >
            <RefreshCw size={14} />
            Retry
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Course Title</th>
                <th className="px-4 py-3">Units</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Semester</th>
                <th className="px-4 py-3">Programme</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {visibleCourses.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No courses found.
                  </td>
                </tr>
              ) : (
                visibleCourses.map((course) => (
                  <tr key={course.id}>
                    <td className="px-4 py-3 font-medium">
                      {course.code}
                    </td>

                    <td className="px-4 py-3">
                      {course.title}
                    </td>

                    <td className="px-4 py-3">
                      {course.credit_units}
                    </td>

                    <td className="px-4 py-3">
                      {course.level}
                    </td>

                    <td className="px-4 py-3">
                      {course.semester}
                    </td>

                    <td className="px-4 py-3">
                      {programmes.find(
                        (programme) =>
                          programme.id === course.programme_id
                      )?.name || course.programme_id}
                    </td>

                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        onClick={() => openEditCourseModal(course)}
                      >
                        <Pencil size={14} />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={isCourseModalOpen}
        onClose={closeCourseModal}
        title={editingCourse ? "Edit Course" : "Create Course"}
      >
        <form onSubmit={submitCourseForm} className="space-y-4">
          <Field label="Course Code">
            <TextInput
              value={courseForm.code}
              onChange={(event) =>
                setCourseForm((current) => ({
                  ...current,
                  code: event.target.value,
                }))
              }
              placeholder="e.g. CSC401"
              required
            />
          </Field>
          <Field label="Course Title">
            <TextInput
              value={courseForm.title}
              onChange={(event) =>
                setCourseForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="e.g. Software Engineering"
              required
            />
          </Field>

          <Field label="Programme">
            <select
              value={courseForm.programme_id}
              onChange={(event) =>
                setCourseForm((current) => ({
                  ...current,
                  programme_id: event.target.value,
                }))
              }
              required
              disabled={
                programmesQuery.isLoading ||
                programmesQuery.isError
              }
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="">Select programme</option>

              {programmes.map((programme) => (
                <option key={programme.id} value={programme.id}>
                  {programme.name}
                  {programme.code ? ` (${programme.code})` : ""}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Credit Units">
              <TextInput
                inputType="number"
                min={1}
                value={courseForm.credit_units}
                onChange={(event) =>
                  setCourseForm((current) => ({
                    ...current,
                    credit_units: event.target.value,
                  }))
                }
                required
              />
            </Field>

            <Field label="Level">
              <select
                value={courseForm.level}
                onChange={(event) =>
                  setCourseForm((current) => ({
                    ...current,
                    level: event.target.value,
                  }))
                }
                className="w-full rounded-md border px-3 py-2"
              >
                {[100, 200, 300, 400, 500, 600, 700, 800].map(
                  (level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field label="Semester">
              <select
                value={courseForm.semester}
                onChange={(event) =>
                  setCourseForm((current) => ({
                    ...current,
                    semester: event.target.value,
                  }))
                }
                className="w-full rounded-md border px-3 py-2"
              >
                <option value="1">First</option>
                <option value="2">Second</option>
              </select>
            </Field>
          </div>

          {courseFormError && (
            <p className="text-sm text-red-600">
              {courseFormError}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeCourseModal}
              disabled={saveCourseMutation.isPending}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                saveCourseMutation.isPending ||
                programmesQuery.isLoading ||
                programmesQuery.isError
              }
            >
              {saveCourseMutation.isPending
                ? editingCourse
                  ? "Saving Changes..."
                  : "Creating..."
                : editingCourse
                  ? "Save Changes"
                  : "Create Course"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}