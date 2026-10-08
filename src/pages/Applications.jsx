import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageHeader, Badge } from "../components/ui.jsx";
import DataTable from "../components/DataTable.jsx";
import { getAdminApplications,  getAdminApplicationDetails, } from "../lib/api";

export default function Applications() {
  const navigate = useNavigate();

const {
  data: applications = [],
  isLoading,
  error,
} = useQuery({
  queryKey: ["admin-applications", "submitted-pipeline"],
  queryFn: async () => {
    const response = await getAdminApplications();

    const applicationList = response?.data ?? [];
    const submittedApplications = applicationList.filter(
  (application) => application.status !== "DRAFT"
);

    const enrichedApplications = await Promise.all(
      submittedApplications.map(async (application) => {
        try {
          const detailsResponse = await getAdminApplicationDetails(
            application.id
          );

          const details =
            detailsResponse?.data ?? detailsResponse ?? {};

          return {
            ...application,
            ...details,
          };
        } catch (error) {
          console.error(
            `Failed to load application ${application.id}:`,
            error
          );

          return application;
        }
      })
    );

    return enrichedApplications;
  },
  staleTime: 0,
});

  const columns = [
    {
      key: "application_number",
      label: "Application ID",
      render: (r) => (
        <span className="font-mono text-xs text-black/50">
          {r.application_number}
        </span>
      ),
    },
    {
      key: "applicant",
      label: "Applicant",
      render: (r) => (
        <span className="font-medium text-black">
          {r.applicant?.first_name} {r.applicant?.last_name}
        </span>
      ),
    },
    {
      key: "programme",
      label: "Programme",
      render: (r) => r.programme?.name ?? "—",
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <Badge>{r.status}</Badge>,
    },
    {
      key: "submitted_at",
      label: "Submitted",
      align: "right",
      render: (r) =>
        r.submitted_at
          ? new Date(r.submitted_at).toLocaleDateString()
          : "—",
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Admissions pipeline"
        title="Applications"
        description="Full applications submitted for review, with their current status across the pipeline."
      />

      {isLoading && (
        <p className="text-sm text-black/50">
          Loading applications...
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600">
          {error.message}
        </p>
      )}

      {!isLoading && !error && (
        <DataTable
          columns={columns}
          rows={applications}
          onRowClick={(application) => {
            navigate(`/applications/${application.id}`);
          }}
        />
      )}
    </div>
  );
}