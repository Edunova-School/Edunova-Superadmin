import React, { useEffect, useState } from "react";
import {
  PageHeader,
  SectionCard,
  Field,
  TextInput,
  Toggle,
  Button,
} from "../../components/ui.jsx";

import {
  getAcademicSessions,
  getApplicationWindow,
  updateApplicationWindow,
} from "../../lib/api";

const REQUIRED_DOCS = [
  { key: "passport", label: "Passport photograph" },
  { key: "olevel", label: "O'Level result" },
  { key: "jamb", label: "JAMB result" },
  { key: "birth", label: "Birth certificate" },
  { key: "medical", label: "Medical certificate" },
];

function formatDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function ApplicationSettings() {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");

  const [applicationStart, setApplicationStart] = useState("");
  const [applicationEnd, setApplicationEnd] = useState("");

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingWindow, setLoadingWindow] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [windowMessage, setWindowMessage] = useState("");

  const [fee] = useState(15000);
  const [maxSubjects] = useState(9);

  const [docs, setDocs] = useState({
    passport: true,
    olevel: true,
    jamb: true,
    birth: true,
    medical: false,
  });

  const [submissionEnabled, setSubmissionEnabled] =
    useState(true);

  // Load academic sessions
  useEffect(() => {
    async function loadSessions() {
      try {
        setLoadingSessions(true);
        setError("");

        const response = await getAcademicSessions();

        const data = response?.data ?? response ?? [];

        const sessionList = Array.isArray(data)
          ? data
          : [];

        setSessions(sessionList);

        const currentSession = sessionList.find(
          (session) => session.is_current
        );

        if (currentSession) {
          setSelectedSessionId(currentSession.id);
        } else if (sessionList.length > 0) {
          setSelectedSessionId(sessionList[0].id);
        }
      } catch (error) {
        console.error(
          "Failed to load academic sessions:",
          error
        );

        setError(
          error.message ||
            "Failed to load academic sessions."
        );
      } finally {
        setLoadingSessions(false);
      }
    }

    loadSessions();
  }, []);

  // Load application window whenever the selected session changes
  useEffect(() => {
    if (!selectedSessionId) {
      setApplicationStart("");
      setApplicationEnd("");
      return;
    }

    async function loadApplicationWindow() {
      try {
        setLoadingWindow(true);
        setWindowMessage("");
        setError("");

        const response = await getApplicationWindow(
          selectedSessionId
        );

        const data = response?.data ?? response ?? {};

        setApplicationStart(
          formatDateTimeLocal(
            data?.application_start_date
          )
        );

        setApplicationEnd(
          formatDateTimeLocal(
            data?.application_end_date
          )
        );
      } catch (error) {
        console.error(
          "Failed to load application window:",
          error
        );

        setApplicationStart("");
        setApplicationEnd("");

        setWindowMessage(
          "No application window has been configured for this session yet."
        );
      } finally {
        setLoadingWindow(false);
      }
    }

    loadApplicationWindow();
  }, [selectedSessionId]);

  async function handleSave() {
    if (
      !selectedSessionId ||
      !applicationStart ||
      !applicationEnd
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setWindowMessage("");

      const startDate = new Date(applicationStart);
      const endDate = new Date(applicationEnd);

      if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime())
      ) {
        throw new Error(
          "Please enter valid application dates."
        );
      }

      if (endDate <= startDate) {
        throw new Error(
          "Application deadline must be after the opening date."
        );
      }

      await updateApplicationWindow(
        selectedSessionId,
        startDate.toISOString(),
        endDate.toISOString()
      );

      setWindowMessage(
        "Application window updated successfully."
      );
    } catch (error) {
      console.error(
        "Failed to update application window:",
        error
      );

      setError(
        error.message ||
          "Failed to update application window."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="System · Configuration"
        title="Application Settings"
        description="Configure the application window for each academic session."
      />

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {windowMessage && (
        <div className="mb-6 rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm text-black/60">
          {windowMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Application rules"
          description="Core parameters that control when applications can be submitted."
        >
          <div className="flex flex-col gap-4 mb-6">
            <Field label="Academic session">
              <select
                value={selectedSessionId}
                onChange={(e) =>
                  setSelectedSessionId(e.target.value)
                }
                disabled={
                  loadingSessions || sessions.length === 0
                }
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-gold disabled:cursor-not-allowed disabled:bg-black/[0.03]"
              >
                <option value="">
                  {loadingSessions
                    ? "Loading sessions..."
                    : "Select a session"}
                </option>

                {sessions.map((session) => (
                  <option
                    key={session.id}
                    value={session.id}
                  >
                    {session.name}
                    {session.is_current
                      ? " — Current"
                      : ""}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Application opens">
              <TextInput
                type="datetime-local"
                value={applicationStart}
                onChange={(e) =>
                  setApplicationStart(e.target.value)
                }
                disabled={
                  loadingWindow || !selectedSessionId
                }
              />
            </Field>

            <Field label="Application deadline">
              <TextInput
                type="datetime-local"
                value={applicationEnd}
                onChange={(e) =>
                  setApplicationEnd(e.target.value)
                }
                disabled={
                  loadingWindow || !selectedSessionId
                }
              />
            </Field>

            {loadingWindow && (
              <p className="text-xs text-black/40">
                Loading application window...
              </p>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Required documents"
          description="Applicants must upload every document toggled on here before they can submit."
        >
          <ul className="flex flex-col gap-4">
            {REQUIRED_DOCS.map((doc) => (
              <li
                key={doc.key}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-black">
                  {doc.label}
                </span>

                <Toggle
                  checked={docs[doc.key]}
                  onChange={(value) =>
                    setDocs((prev) => ({
                      ...prev,
                      [doc.key]: value,
                    }))
                  }
                  label={doc.label}
                />
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title="Application submission"
          description="Turning this off immediately closes new submissions across the platform, even during an open session — use it for emergencies."
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-black">
              {submissionEnabled
                ? "Enabled"
                : "Disabled"}
            </span>

            <Toggle
              checked={submissionEnabled}
              onChange={setSubmissionEnabled}
              label="Application submission"
            />
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <Button
          variant="primary"
          disabled={
            saving ||
            loadingWindow ||
            !selectedSessionId ||
            !applicationStart ||
            !applicationEnd
          }
          onClick={handleSave}
        >
          {saving ? "Saving..." : "Save settings"}
        </Button>
      </div>
    </div>
  );
}