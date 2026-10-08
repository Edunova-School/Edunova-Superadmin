import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  FileText,
  X,
} from "lucide-react";

import { PageHeader, Card, Badge } from "../components/ui.jsx";
import {
  getAdminApplicationDetails,
  reviewAdminApplication,
  reviewAdminDocument,
} from "../lib/api";

export default function ApplicationDetails() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [reviewRemarks, setReviewRemarks] = useState("");
  const [rejectingDocumentId, setRejectingDocumentId] = useState(null);
  const [documentRejectReason, setDocumentRejectReason] = useState("");
  const [decisionToConfirm, setDecisionToConfirm] = useState(null);
  const {
    data: application,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-application-details", applicationId],
    queryFn: async () => {
      const response = await getAdminApplicationDetails(applicationId);
      return response?.data ?? response ?? null;
    },
    enabled: !!applicationId,
    staleTime: 0,
  });

  /* ---------------------------------------------------------------------- */
  /* DOCUMENT REVIEW                                                        */
  /* ---------------------------------------------------------------------- */

  const documentReviewMutation = useMutation({
    mutationFn: ({ documentId, status, reviewNote }) =>
      reviewAdminDocument(documentId, status, reviewNote),

    onSuccess: async (_, variables) => {
      queryClient.setQueryData(
        ["admin-application-details", applicationId],
        (current) => {
          if (!current) return current;

          return {
            ...current,
            documents: (current.documents ?? []).map((document) =>
              document.id === variables.documentId
                ? {
                    ...document,
                    review_status: variables.status,
                    review_note:
                      variables.reviewNote ?? document.review_note,
                    replacement_requested:
                      variables.status === "REJECTED"
                        ? true
                        : document.replacement_requested,
                  }
                : document
            ),
          };
        }
      );

      setRejectingDocumentId(null);
      setDocumentRejectReason("");

      await queryClient.invalidateQueries({
        queryKey: ["admin-application-details", applicationId],
      });
    },
  });

  /* ---------------------------------------------------------------------- */
  /* APPLICATION DECISION                                                  */
  /* ---------------------------------------------------------------------- */

  const applicationReviewMutation = useMutation({
    mutationFn: ({ status, remarks }) =>
      reviewAdminApplication(applicationId, status, remarks),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-applications", "submitted-pipeline"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["admin-application-details", applicationId],
      });

      navigate("/applications");
    },
  });

  /* ---------------------------------------------------------------------- */
  /* DATA HELPERS                                                           */
  /* ---------------------------------------------------------------------- */

  const documents = application?.documents ?? [];

  const reviewSummary = useMemo(() => {
    return {
      accepted: documents.filter(
        (document) => document.review_status === "ACCEPTED"
      ).length,

      rejected: documents.filter(
        (document) => document.review_status === "REJECTED"
      ).length,

      notReviewed: documents.filter(
        (document) => document.review_status === "NOT_REVIEWED"
      ).length,

      replacementRequested: documents.filter(
        (document) => document.replacement_requested
      ).length,
    };
  }, [documents]);

  const getDocument = (type) =>
    documents.find((document) => document.document_type === type);

  const birthCertificate = getDocument("birth_certificate");
  const olevelResult = getDocument("olevel_result");
  const jambResult = getDocument("jamb_result");
  const passport = getDocument("passport");

  /* ---------------------------------------------------------------------- */
  /* DOCUMENT ACTIONS                                                       */
  /* ---------------------------------------------------------------------- */

  function handleAcceptDocument(document) {
    if (!document) return;

    documentReviewMutation.mutate({
      documentId: document.id,
      status: "ACCEPTED",
    });
  }

  function handleStartReject(document) {
    setRejectingDocumentId(document.id);
    setDocumentRejectReason("");
  }

  function handleCancelReject() {
    setRejectingDocumentId(null);
    setDocumentRejectReason("");
  }

  function handleConfirmReject(document) {
    const reason = documentRejectReason.trim();

    if (!reason) return;

    documentReviewMutation.mutate({
      documentId: document.id,
      status: "REJECTED",
      reviewNote: reason,
    });
  }

  /* ---------------------------------------------------------------------- */
  /* APPLICATION ACTIONS                                                    */
  /* ---------------------------------------------------------------------- */

  function handleApplicationDecision(status) {
    const remarks = reviewRemarks.trim();

    if (status === "REJECTED" && !remarks) {
      return;
    }

    applicationReviewMutation.mutate({
      status,
      remarks: remarks || undefined,
    });
  }

  /* ---------------------------------------------------------------------- */
  /* STATES                                                                  */
  /* ---------------------------------------------------------------------- */

  if (isLoading) {
    return (
      <p className="text-sm text-black/50">
        Loading application...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600">
        {error.message}
      </p>
    );
  }

  if (!application) {
    return (
      <p className="text-sm text-black/50">
        Application not found.
      </p>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* BACK BUTTON */}

      <button
        type="button"
        onClick={() => navigate("/applications")}
        className="inline-flex items-center gap-2 text-sm text-black/50 hover:text-black transition-colors"
      >
        <ArrowLeft size={16} />
        Back to applications
      </button>

      {/* HEADER */}

      <PageHeader
        eyebrow="Application review"
        title={application.application_number}
        description="Review the applicant's information and supporting documents before making an admission decision."
      />

      {/* APPLICATION SUMMARY */}

      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div>
            <p className="text-xl font-semibold text-black">
              {application.applicant?.first_name}{" "}
              {application.applicant?.middle_name
                ? `${application.applicant.middle_name} `
                : ""}
              {application.applicant?.last_name}
            </p>

            <p className="mt-1 text-sm text-black/50">
              {application.applicant?.phone_number ?? "No phone number"}
            </p>
          </div>

          <Badge>{application.status}</Badge>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-8 pt-6 border-t border-black/[0.06]">
          <InfoItem
            label="Programme"
            value={application.programme?.name}
          />

          <InfoItem
            label="Faculty"
            value={application.faculty}
          />

          <InfoItem
            label="Academic session"
            value={application.academic_session?.name}
          />

          <InfoItem
            label="Application number"
            value={application.application_number}
            mono
          />
        </div>
      </Card>

      {/* REVIEW SUMMARY */}

      <section>
        <SectionHeading
          title="Review summary"
          description="Current review state of the submitted documents."
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Accepted"
            value={reviewSummary.accepted}
            tone="green"
          />

          <SummaryCard
            label="Rejected"
            value={reviewSummary.rejected}
            tone="red"
          />

          <SummaryCard
            label="Not reviewed"
            value={reviewSummary.notReviewed}
          />

          <SummaryCard
            label="Replacement requested"
            value={reviewSummary.replacementRequested}
            tone="gold"
          />
        </div>
      </section>

      {/* PERSONAL INFORMATION */}

      <ReviewSection
        title="Personal information"
        description="Compare the applicant's submitted personal information with the birth certificate."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <SectionTitle title="Submitted information" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoItem
                label="First name"
                value={application.applicant?.first_name}
              />

              <InfoItem
                label="Middle name"
                value={application.applicant?.middle_name}
              />

              <InfoItem
                label="Last name"
                value={application.applicant?.last_name}
              />

              <InfoItem
                label="Date of birth"
                value={formatDate(application.applicant?.date_of_birth)}
              />

              <InfoItem
                label="Gender"
                value={application.applicant?.gender}
              />

              <InfoItem
                label="Nationality"
                value={application.applicant?.nationality}
              />

              <InfoItem
                label="State of origin"
                value={application.applicant?.state_of_origin}
              />

              <InfoItem
                label="LGA of origin"
                value={application.applicant?.lga_of_origin}
              />

              <InfoItem
                label="Phone number"
                value={application.applicant?.phone_number}
              />

              <InfoItem
                label="Alternate phone"
                value={application.applicant?.alternate_phone_number}
              />

              <InfoItem
                label="Address"
                value={application.applicant?.address}
                fullWidth
              />
            </div>
          </Card>

          <DocumentReviewCard
            title="Birth certificate"
            document={birthCertificate}
            onAccept={handleAcceptDocument}
            onReject={handleStartReject}
            rejectingDocumentId={rejectingDocumentId}
            rejectReason={documentRejectReason}
            setRejectReason={setDocumentRejectReason}
            onConfirmReject={handleConfirmReject}
            onCancelReject={handleCancelReject}
            isReviewing={documentReviewMutation.isPending}
          />
        </div>
      </ReviewSection>

      {/* O LEVEL */}

      <ReviewSection
        title="O'Level results"
        description="Compare the subjects and grades entered by the applicant with the submitted result."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <SectionTitle title="Submitted O'Level data" />

            <div className="overflow-hidden rounded-xl border border-black/[0.06]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-black/[0.02] border-b border-black/[0.06]">
                    <th className="text-left px-4 py-3 text-xs font-medium text-black/40">
                      Subject
                    </th>

                    <th className="text-right px-4 py-3 text-xs font-medium text-black/40">
                      Grade
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {(application.applicant?.olevel_results ?? []).map(
                    (result, index) => (
                      <tr
                        key={`${result.subject}-${index}`}
                        className="border-b border-black/[0.04] last:border-0"
                      >
                        <td className="px-4 py-3 text-black/75">
                          {result.subject}
                        </td>

                        <td className="px-4 py-3 text-right font-medium text-black">
                          {result.grade}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-5">
              <InfoItem
                label="Exam type"
                value={application.applicant?.exam_type}
              />

              <InfoItem
                label="Exam year"
                value={application.applicant?.exam_year}
              />

              <InfoItem
                label="Exam number"
                value={application.applicant?.exam_number}
                mono
              />

              <InfoItem
                label="Secondary school"
                value={application.applicant?.secondary_school_attended}
              />
            </div>
          </Card>

          <DocumentReviewCard
            title="O'Level result"
            document={olevelResult}
            onAccept={handleAcceptDocument}
            onReject={handleStartReject}
            rejectingDocumentId={rejectingDocumentId}
            rejectReason={documentRejectReason}
            setRejectReason={setDocumentRejectReason}
            onConfirmReject={handleConfirmReject}
            onCancelReject={handleCancelReject}
            isReviewing={documentReviewMutation.isPending}
          />
        </div>
      </ReviewSection>

      {/* JAMB */}

      <ReviewSection
        title="JAMB information"
        description="Compare the submitted JAMB information with the JAMB result document."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <SectionTitle title="Submitted JAMB data" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InfoItem
                label="Registration number"
                value={application.applicant?.jamb_registration_number}
                mono
              />

              <InfoItem
                label="JAMB score"
                value={application.applicant?.jamb_score}
              />
            </div>
          </Card>

          <DocumentReviewCard
            title="JAMB result"
            document={jambResult}
            onAccept={handleAcceptDocument}
            onReject={handleStartReject}
            rejectingDocumentId={rejectingDocumentId}
            rejectReason={documentRejectReason}
            setRejectReason={setDocumentRejectReason}
            onConfirmReject={handleConfirmReject}
            onCancelReject={handleCancelReject}
            isReviewing={documentReviewMutation.isPending}
          />
        </div>
      </ReviewSection>

      {/* PASSPORT */}

      <ReviewSection
        title="Applicant identity"
        description="Review the applicant's passport photograph separately."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <SectionTitle title="Applicant" />

            <div className="space-y-5">
              <InfoItem
                label="Full name"
                value={`${application.applicant?.first_name ?? ""} ${
                  application.applicant?.middle_name
                    ? `${application.applicant.middle_name} `
                    : ""
                }${application.applicant?.last_name ?? ""}`}
              />

              <InfoItem
                label="Date of birth"
                value={formatDate(application.applicant?.date_of_birth)}
              />

              <InfoItem
                label="Gender"
                value={application.applicant?.gender}
              />
            </div>
          </Card>

          <DocumentReviewCard
            title="Passport photograph"
            document={passport}
            onAccept={handleAcceptDocument}
            onReject={handleStartReject}
            rejectingDocumentId={rejectingDocumentId}
            rejectReason={documentRejectReason}
            setRejectReason={setDocumentRejectReason}
            onConfirmReject={handleConfirmReject}
            onCancelReject={handleCancelReject}
            isReviewing={documentReviewMutation.isPending}
          />
        </div>
      </ReviewSection>

      {/* FINAL APPLICATION DECISION */}

      <section>
        <SectionHeading
          title="Application decision"
          description="Document review and the admission decision are separate."
        />

        <Card className="p-6">
          <label
            htmlFor="review-remarks"
            className="block text-sm font-medium text-black mb-2"
          >
            Review remarks
          </label>

          <textarea
            id="review-remarks"
            value={reviewRemarks}
            onChange={(event) =>
              setReviewRemarks(event.target.value)
            }
            rows={4}
            placeholder="Add remarks about this application..."
            className="w-full rounded-xl border border-black/[0.08] px-4 py-3 text-sm outline-none focus:border-[#14263f] resize-none"
          />

          {applicationReviewMutation.isError && (
            <p className="mt-4 text-sm text-red-600">
              {applicationReviewMutation.error.message}
            </p>
          )}

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              type="button"
              disabled={applicationReviewMutation.isPending}
              onClick={() =>
                handleApplicationDecision("UNDER_REVIEW")
              }
              className="inline-flex items-center justify-center rounded-xl border border-black/[0.08] px-5 py-3 text-sm font-medium text-black hover:bg-black/[0.03] disabled:opacity-50"
            >
              Keep under review
            </button>

            <button
              type="button"
              disabled={applicationReviewMutation.isPending}
              onClick={() =>
                handleApplicationDecision("REJECTED")
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              <X size={16} />
              Reject application
            </button>

            <button
              type="button"
              disabled={applicationReviewMutation.isPending}
              onClick={() =>
                handleApplicationDecision("OFFERED")
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#14263f] px-5 py-3 text-sm font-medium text-white hover:bg-[#0d1b2c] disabled:opacity-50"
            >
              <Check size={16} />

              {applicationReviewMutation.isPending
                ? "Processing..."
                : "Offer admission"}
            </button>
          </div>

          <p className="mt-4 text-xs text-black/40">
            Rejecting an application requires review remarks.
          </p>
        </Card>
      </section>
    </div>
  );
}


/* -------------------------------------------------------------------------- */
/* UI HELPERS                                                                 */
/* -------------------------------------------------------------------------- */

function ReviewSection({ title, description, children }) {
  return (
    <section>
      <SectionHeading
        title={title}
        description={description}
      />

      {children}
    </section>
  );
}

function SectionHeading({ title, description }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-black">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-sm text-black/45">
          {description}
        </p>
      )}
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <h3 className="mb-6 text-sm font-semibold text-black">
      {title}
    </h3>
  );
}

function InfoItem({
  label,
  value,
  mono = false,
  fullWidth = false,
}) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
      <p className="text-xs font-medium text-black/35">
        {label}
      </p>

      <p
        className={`mt-1 text-sm text-black/75 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function SummaryCard({ label, value, tone }) {
  const toneClasses = {
    green: "text-emerald-700",
    red: "text-red-600",
    gold: "text-[#B8901F]",
  };

  return (
    <Card className="p-5">
      <p className="text-xs text-black/40">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-semibold ${
          toneClasses[tone] ?? "text-black"
        }`}
      >
        {value}
      </p>
    </Card>
  );
}

function ReviewStatus({ status }) {
  const styles = {
    NOT_REVIEWED: "bg-black/[0.04] text-black/50",
    ACCEPTED: "bg-emerald-50 text-emerald-700",
    REJECTED: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] ?? styles.NOT_REVIEWED
      }`}
    >
      {status?.replaceAll("_", " ") ?? "NOT REVIEWED"}
    </span>
  );
}

function DocumentReviewCard({
  title,
  document,
  onAccept,
  onReject,
  rejectingDocumentId,
  rejectReason,
  setRejectReason,
  onConfirmReject,
  onCancelReject,
  isReviewing,
}) {
  if (!document) {
    return (
      <Card className="p-6">
        <SectionTitle title={title} />

        <div className="rounded-xl bg-black/[0.025] p-4">
          <p className="text-sm text-black/45">
            No document was submitted for this requirement.
          </p>
        </div>
      </Card>
    );
  }

  const isRejecting = rejectingDocumentId === document.id;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <SectionTitle title={title} />

        <ReviewStatus status={document.review_status} />
      </div>

      {document.review_note && (
        <div className="mb-5 rounded-xl bg-red-50 p-4">
          <p className="text-xs font-medium text-red-700">
            Review note
          </p>

          <p className="mt-1 text-sm text-red-700/80">
            {document.review_note}
          </p>
        </div>
      )}

      <DocumentPreview document={document} />

      {isRejecting ? (
        <div className="mt-5 space-y-3">
          <textarea
            value={rejectReason}
            onChange={(event) =>
              setRejectReason(event.target.value)
            }
            rows={3}
            placeholder="Why is this document being rejected?"
            className="w-full rounded-xl border border-red-200 px-4 py-3 text-sm outline-none focus:border-red-400 resize-none"
          />

          <div className="flex gap-2">
            <button
              type="button"
              disabled={isReviewing || !rejectReason.trim()}
              onClick={() => onConfirmReject(document)}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              Confirm rejection
            </button>

            <button
              type="button"
              disabled={isReviewing}
              onClick={onCancelReject}
              className="rounded-xl border border-black/[0.08] px-4 py-2.5 text-sm font-medium text-black/70"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={document.file_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-black/[0.08] px-4 py-2.5 text-sm font-medium text-black/70 hover:bg-black/[0.03]"
          >
            <ExternalLink size={15} />
            View document
          </a>

          <button
            type="button"
            disabled={isReviewing}
            onClick={() => onAccept(document)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            <Check size={15} />
            Accept
          </button>

          <button
            type="button"
            disabled={isReviewing}
            onClick={() => onReject(document)}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            <X size={15} />
            Reject
          </button>
        </div>
      )}
    </Card>
  );
}

function DocumentPreview({ document }) {
  const fileUrl = document?.file_url;

  if (!fileUrl) return null;

  const isImage =
    /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(fileUrl);

  if (isImage) {
    return (
      <div className="overflow-hidden rounded-xl border border-black/[0.06] bg-black/[0.02]">
        <img
          src={fileUrl}
          alt={document.document_type}
          className="w-full max-h-[420px] object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-black/[0.02] p-4">
      <FileText size={22} className="text-black/40" />

      <div>
        <p className="text-sm font-medium text-black">
          Document file
        </p>

        <p className="text-xs text-black/40">
          Use "View document" to open the submitted file.
        </p>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}