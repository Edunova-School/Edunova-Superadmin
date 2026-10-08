import React, { useEffect, useState } from "react";
import { Plus, Power } from "lucide-react";

import {
  PageHeader,
  Card,
  Badge,
  Button,
  Modal,
  Field,
  TextInput,
} from "../../components/ui.jsx";

import {
  getAcademicSessions,
  createAcademicSession,
  getApplicationWindow,
  setCurrentAcademicSession,
  getSemesters,
  createSemester,
  activateSemester,
} from "../../lib/api";

export default function AcademicSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [applicationWindows, setApplicationWindows] = useState({});

  const [semesters, setSemesters] = useState([]);
  const [semesterLoading, setSemesterLoading] = useState(true);
  const [semesterError, setSemesterError] = useState("");
  const [semesterOpen, setSemesterOpen] = useState(false);
  const [semesterSaving, setSemesterSaving] = useState(false);

  // --------------------------------------------------
  // Load academic sessions, application windows,
  // and semesters
  // --------------------------------------------------

  useEffect(() => {
    async function loadData() {
      try {
        const [sessionsResponse, semestersResponse] =
          await Promise.all([
            getAcademicSessions(),
            getSemesters(),
          ]);

        const sessionData =
          sessionsResponse?.data ?? sessionsResponse ?? [];

        const semesterData =
          semestersResponse?.data ?? semestersResponse ?? [];

        setSessions(
          Array.isArray(sessionData) ? sessionData : []
        );

        setSemesters(
          Array.isArray(semesterData)
            ? [...semesterData].sort(
                (a, b) =>
                  Number(a.order) - Number(b.order)
              )
            : []
        );

        // Load application windows for each session
        const windows = await Promise.all(
          sessionData.map(async (session) => {
            try {
              const windowResponse =
                await getApplicationWindow(session.id);

              return [
                session.id,
                windowResponse?.data ??
                  windowResponse ??
                  null,
              ];
            } catch (error) {
              console.error(
                `Failed to load application window for ${session.name}:`,
                error
              );

              return [session.id, null];
            }
          })
        );

        setApplicationWindows(
          Object.fromEntries(windows)
        );
      } catch (error) {
        console.error(
          "Failed to load academic data:",
          error
        );

        setError(
          error.message ||
            "Failed to load academic data."
        );
      } finally {
        setLoading(false);
        setSemesterLoading(false);
      }
    }

    loadData();
  }, []);

  // --------------------------------------------------
  // Create academic session
  // --------------------------------------------------

  async function handleAdd(e) {
    e.preventDefault();

    const form = new FormData(e.target);
    const name = form.get("name")?.toString().trim();

    if (!name) return;

    try {
      await createAcademicSession(name);

      const response = await getAcademicSessions();

      const sessionData =
        response?.data ?? response ?? [];

      setSessions(
        Array.isArray(sessionData)
          ? sessionData
          : []
      );

      setOpen(false);
      e.target.reset();
    } catch (error) {
      console.error(
        "Failed to create academic session:",
        error
      );

      setError(
        error.message ||
          "Failed to create academic session."
      );
    }
  }

  // --------------------------------------------------
  // Activate academic session
  // --------------------------------------------------

async function toggleActivation(id) {
  try {
    setError("");

    // Update the backend
    await setCurrentAcademicSession(id);

    // Immediately update the UI
    setSessions((prevSessions) =>
      prevSessions.map((session) => ({
        ...session,
        is_current: session.id === id,
      }))
    );

    // Refresh from backend to keep state fully in sync
    const response = await getAcademicSessions();

    const sessionData =
      response?.data ?? response ?? [];

    if (Array.isArray(sessionData)) {
      setSessions(sessionData);
    }
  } catch (error) {
    console.error(
      "Failed to set current academic session:",
      error
    );

    setError(
      error.message ||
        "Failed to set current academic session."
    );
  }
}
  // --------------------------------------------------
  // Create semester
  // --------------------------------------------------

  async function handleAddSemester(e) {
    e.preventDefault();

    const form = new FormData(e.target);

    const name = form
      .get("name")
      ?.toString()
      .trim();

    const order = Number(form.get("order"));

    if (!name || !order) return;

    try {
      setSemesterSaving(true);
      setSemesterError("");

      await createSemester(name, order);

      const response = await getSemesters();

      const semesterData =
        response?.data ?? response ?? [];

      setSemesters(
        Array.isArray(semesterData)
          ? [...semesterData].sort(
              (a, b) =>
                Number(a.order) -
                Number(b.order)
            )
          : []
      );

      setSemesterOpen(false);
      e.target.reset();
    } catch (error) {
      console.error(
        "Failed to create semester:",
        error
      );

      setSemesterError(
        error.message ||
          "Failed to create semester."
      );
    } finally {
      setSemesterSaving(false);
    }
  }

  // --------------------------------------------------
  // Activate semester
  // --------------------------------------------------

  async function handleActivateSemester(id) {
    try {
      setSemesterError("");

      await activateSemester(id);

      const response = await getSemesters();

      const semesterData =
        response?.data ?? response ?? [];

      setSemesters(
        Array.isArray(semesterData)
          ? [...semesterData].sort(
              (a, b) =>
                Number(a.order) -
                Number(b.order)
            )
          : []
      );
    } catch (error) {
      console.error(
        "Failed to activate semester:",
        error
      );

      setSemesterError(
        error.message ||
          "Failed to activate semester."
      );
    }
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div>
      {/* ==========================================
          ACADEMIC SESSIONS
      ========================================== */}

      <PageHeader
        eyebrow="System · Admission cycle"
        title="Academic Sessions"
        description="Only one session should be active at a time. Activating a session opens it to applicants once its start date arrives."
        action={
          <Button
            variant="gold"
            onClick={() => setOpen(true)}
          >
            <Plus size={15} />
            Create Session
          </Button>
        }
      />

      {loading && (
        <p className="text-sm text-black/50">
          Loading academic sessions...
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      {!loading &&
        !error &&
        sessions.length === 0 && (
          <Card className="p-6">
            <p className="text-sm text-black/50">
              No academic sessions have been
              created yet.
            </p>
          </Card>
        )}

      {!loading &&
        !error &&
        sessions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sessions.map((s) => (
              <Card
                key={s.id}
                className={`p-6 ${
                  s.is_current
                    ? "ring-1 ring-gold/40"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif font-semibold text-xl text-black">
                      {s.name}
                    </h3>

                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        tone={
                          s.is_current
                            ? "good"
                            : "neutral"
                        }
                      >
                        {s.is_current
                          ? "Active"
                          : "Draft"}
                      </Badge>

                      <Badge>
                        {applicationWindows[s.id]
                          ?.is_open
                          ? "OPEN"
                          : applicationWindows[s.id]
                          ? "CLOSED"
                          : "NOT CONFIGURED"}
                      </Badge>
                    </div>
                  </div>

                  <button
                   type="button"
                     onClick={() => {
    console.log("BUTTON CLICKED:", s.id);
    toggleActivation(s.id);}}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                      s.is_current
                        ? "bg-signal-good/10 text-signal-good"
                        : "bg-black/5 text-black/35 hover:bg-black/10"
                    }`}
                    title={
                      s.is_current
                        ? "Current session"
                        : "Set as current"
                    }
                  >
                    <Power size={15} />
                  </button>
                </div>

                <dl className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-black/[0.06]">
                  <div>
                    <dt className="text-[11px] text-black/35">
                      Application opens
                    </dt>

                    <dd className="text-sm text-black mt-1">
                      {applicationWindows[s.id]
                        ?.application_start_date
                        ? new Date(
                            applicationWindows[
                              s.id
                            ].application_start_date
                          ).toLocaleString()
                        : "Not configured"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-[11px] text-black/35">
                      Application deadline
                    </dt>

                    <dd className="text-sm text-black mt-1">
                      {applicationWindows[s.id]
                        ?.application_end_date
                        ? new Date(
                            applicationWindows[
                              s.id
                            ].application_end_date
                          ).toLocaleString()
                        : "Not configured"}
                    </dd>
                  </div>
                </dl>
              </Card>
            ))}
          </div>
        )}

      {/* ==========================================
          SEMESTERS
      ========================================== */}

      <div className="mt-10">
        <PageHeader
          eyebrow="System · Academic structure"
          title="Semesters"
          description="Manage the semesters available across academic sessions."
          action={
            <Button
              variant="gold"
              onClick={() =>
                setSemesterOpen(true)
              }
            >
              <Plus size={15} />
              Create Semester
            </Button>
          }
        />

        {semesterLoading && (
          <p className="text-sm text-black/50">
            Loading semesters...
          </p>
        )}

        {semesterError && (
          <p className="text-sm text-red-600">
            {semesterError}
          </p>
        )}

        {!semesterLoading &&
          !semesterError &&
          semesters.length === 0 && (
            <Card className="p-6">
              <p className="text-sm text-black/50">
                No semesters have been created
                yet.
              </p>
            </Card>
          )}

        {!semesterLoading &&
          !semesterError &&
          semesters.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {semesters.map((semester) => (
                <Card
                  key={semester.id}
                  className={`p-6 ${
                    semester.is_active
                      ? "ring-1 ring-gold/40"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif font-semibold text-xl text-black">
                        {semester.name}
                      </h3>

                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          tone={
                            semester.is_active
                              ? "good"
                              : "neutral"
                          }
                        >
                          {semester.is_active
                            ? "Active"
                            : "Inactive"}
                        </Badge>

                        <Badge>
                          Order {semester.order}
                        </Badge>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        !semester.is_active &&
                        handleActivateSemester(
                          semester.id
                        )
                      }
                      disabled={
                        semester.is_active
                      }
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        semester.is_active
                          ? "bg-signal-good/10 text-signal-good"
                          : "bg-black/5 text-black/35 hover:bg-black/10"
                      }`}
                      title={
                        semester.is_active
                          ? "Current semester"
                          : "Set as current"
                      }
                    >
                      <Power size={15} />
                    </button>
                  </div>

                  <div className="mt-6 pt-5 border-t border-black/[0.06]">
                    <p className="text-xs text-black/40">
                      Semester order
                    </p>

                    <p className="text-sm text-black mt-1">
                      {semester.order === 1
                        ? "First semester"
                        : semester.order === 2
                        ? "Second semester"
                        : `Semester ${semester.order}`}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
      </div>

      {/* ==========================================
          CREATE ACADEMIC SESSION MODAL
      ========================================== */}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create academic session"
        description="Create a new academic session. Application dates can be configured separately."
      >
        <form
          id="add-session"
          onSubmit={handleAdd}
          className="flex flex-col gap-4"
        >
          <Field label="Session name">
            <TextInput
              name="name"
              placeholder="e.g. 2028/2029"
              required
            />
          </Field>
        </form>

        <div className="flex items-center justify-end gap-3 pt-6">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            type="button"
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            type="submit"
            form="add-session"
          >
            Create as draft
          </Button>
        </div>
      </Modal>

      {/* ==========================================
          CREATE SEMESTER MODAL
      ========================================== */}

      <Modal
        open={semesterOpen}
        onClose={() => setSemesterOpen(false)}
        title="Create semester"
        description="Create a semester that can be activated for the current academic cycle."
      >
        <form
          id="add-semester"
          onSubmit={handleAddSemester}
          className="flex flex-col gap-4"
        >
          <Field label="Semester name">
            <TextInput
              name="name"
              placeholder="e.g. First Semester"
              required
            />
          </Field>

          <Field label="Order">
            <TextInput
              name="order"
              type="number"
              min="1"
              placeholder="e.g. 1"
              required
            />
          </Field>
        </form>

        <div className="flex items-center justify-end gap-3 pt-6">
          <Button
            variant="ghost"
            onClick={() =>
              setSemesterOpen(false)
            }
            type="button"
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            type="submit"
            form="add-semester"
            disabled={semesterSaving}
          >
            {semesterSaving
              ? "Creating..."
              : "Create Semester"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}