import { getAdminDocuments, reviewAdminDocument } from "../lib/api";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader, Badge } from "../components/ui.jsx";
import DataTable from "../components/DataTable.jsx";
// import { getAdminDocuments, reviewAdminDocument } from "../lib/api";

function formatDocumentType(type) {
  const labels = {
    jamb_result: "JAMB Result",
    birth_certificate: "Birth Certificate",
    passport: "Passport Photograph",
    olevel_result: "O'Level Result",
  };

  return labels[type] ?? type.replaceAll("_", " ");
}
function formatDocumentStatus(status) {
  const labels = {
    NOT_REVIEWED: "Not reviewed",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
  };

  return labels[status] ?? status;
}
export default function Documents() {
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [reviewAction, setReviewAction] = useState(null);
  const [reviewNote, setReviewNote] = useState("");
  async function handleDocumentReview(documentId, status, reviewNote) {
  try {
    await reviewAdminDocument(documentId, status, reviewNote);

    setSelectedApplication((current) => {
      if (!current) return current;

      return {
        ...current,
        documents: current.documents.map((document) =>
          document.id === documentId
            ? {
                ...document,
                status,
                reviewNote: reviewNote ?? document.reviewNote,
              }
            : document
        ),
      };
    });
  } catch (error) {
    console.error("Failed to review document:", error);
  }
}
const {
  data: documents = [],
  isLoading,
  error,
} = useQuery({
  queryKey: ["admin-documents"],
  queryFn: async () => {
    const response = await getAdminDocuments();

    const documentData =
      response?.data?.items ??
      response?.data ??
      response ??
      [];

    const grouped = {};

    documentData.forEach((item) => {
      const key = item.application_number;

      if (!grouped[key]) {
        grouped[key] = {
          applicationNumber: item.application_number,
          applicant: item.applicant_name ?? "-",
          documents: [],
        };
      }

      grouped[key].documents.push({
        id: item.id,
        type: item.document_type ?? "-",
        status:
          item.review_status ??
          item.system_status ??
          "-",
        uploaded: item.created_at
          ? new Date(item.created_at).toLocaleDateString()
          : "-",
        fileUrl: item.file_url ?? null,
      });
    });

    return Object.values(grouped);
  },
});
  const columns = [
  {
    key: "applicant",
    label: "Applicant",
    render: (r) => (
      <span className="font-medium text-black">
        {r.applicant}
      </span>
    ),
  },
  {
    key: "applicationNumber",
    label: "Application",
    render: (r) => (
      <span className="font-mono text-xs text-black/50">
        {r.applicationNumber}
      </span>
    ),
  },
  {
    key: "documents",
    label: "Documents",
    render: (r) => (
      <span className="font-medium text-black">
        {r.documents.length}
      </span>
    ),
  },
  {
    key: "review",
    label: "Review",
    render: (r) => {
      const reviewed = r.documents.filter(
        (doc) => doc.status !== "NOT_REVIEWED"
      ).length;

      return (
        <span className="text-black/60">
          {reviewed}/{r.documents.length} reviewed
        </span>
      );
    },
  },
  {
    key: "action",
    label: "",
    align: "right",
    render: () => (
      <span className="text-sm font-medium text-black">
        View →
      </span>
    ),
  },
];
  return (
  <div>
    <PageHeader
      eyebrow="Admissions pipeline"
      title="Documents"
      description="Supporting documents uploaded by applicants — results, identification, and photographs awaiting or under verification."
    />

    {selectedApplication ? (
      <div>
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setSelectedApplication(null)}
            className="text-sm font-medium text-black/50 hover:text-black transition-colors"
          >
            ← Back to applications
          </button>

          <div className="mt-4">
            <h2 className="text-xl font-semibold text-black">
              {selectedApplication.applicant}
            </h2>

            <p className="mt-1 font-mono text-sm text-black/45">
              {selectedApplication.applicationNumber}
            </p>
          </div>
        </div>

        <DataTable
          columns={[
            {
              key: "type",
              label: "Document",
              render: (r) => (
                <span className="font-medium text-black">
                  {formatDocumentType(r.type)}
                </span>
              ),
            },
            {
  key: "status",
  label: "Status",
  render: (r) => {
    const statusStyles = {
      NOT_REVIEWED: "bg-black/[0.04] text-black/50",
      ACCEPTED: "bg-emerald-50 text-emerald-700",
      REJECTED: "bg-red-50 text-red-700",
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
          statusStyles[r.status] ?? "bg-black/[0.04] text-black/50"
        }`}
      >
        {formatDocumentStatus(r.status)}
      </span>
    );
  },
},
            {
              key: "uploaded",
              label: "Uploaded",
            },
            {
  key: "action",
  label: "",
  align: "right",
  render: (r) => (
    <div className="flex items-center justify-end gap-3">
      {r.fileUrl && (
        <a
          href={r.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-black hover:underline"
          onClick={(event) => event.stopPropagation()}
        >
          View
        </a>
      )}

      {r.status === "NOT_REVIEWED" && (
  <>
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        setReviewAction({
          documentId: r.id,
          status: "ACCEPTED",
        });
      }}
      className="px-3 py-1.5 text-xs font-medium rounded-md bg-black text-white hover:bg-black/80 transition-colors"
    >
      Accept
    </button>

    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        setReviewAction({
          documentId: r.id,
          status: "REJECTED",
        });
        setReviewNote("");
      }}
      className="px-3 py-1.5 text-xs font-medium rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
    >
      Reject
    </button>
  </>
)}
    </div>
  ),
},
          ]}
          rows={selectedApplication.documents}
          rowKey="id"
        />
      </div>
          ) : (
        <DataTable
          columns={columns}
          rows={documents}
          rowKey="applicationNumber"
          onRowClick={(row) => setSelectedApplication(row)}
        />
      )}

      {reviewAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
          onClick={() => setReviewAction(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            {reviewAction.status === "ACCEPTED" ? (
              <>
                <h3 className="text-lg font-semibold text-black">
                  Accept document?
                </h3>

                <p className="mt-2 text-sm text-black/55">
                  This will mark the document as accepted and complete its review.
                </p>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewAction(null)}
                    className="px-4 py-2 text-sm font-medium text-black/60 hover:text-black transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await handleDocumentReview(
                        reviewAction.documentId,
                        "ACCEPTED"
                      );
                      setReviewAction(null);
                    }}
                    className="px-4 py-2 text-sm font-medium rounded-md bg-black text-white hover:bg-black/80 transition-colors"
                  >
                    Confirm acceptance
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-black">
                  Reject document?
                </h3>

                <p className="mt-2 text-sm text-black/55">
                  Please provide a reason for rejecting this document.
                </p>

                <textarea
                  value={reviewNote}
                  onChange={(event) => setReviewNote(event.target.value)}
                  placeholder="Enter rejection reason..."
                  rows={4}
                  className="mt-4 w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30 resize-none"
                />

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewAction(null)}
                    className="px-4 py-2 text-sm font-medium text-black/60 hover:text-black transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={!reviewNote.trim()}
                    onClick={async () => {
                      await handleDocumentReview(
                        reviewAction.documentId,
                        "REJECTED",
                        reviewNote.trim()
                      );
                      setReviewAction(null);
                      setReviewNote("");
                    }}
                    className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Reject document
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
);
}
