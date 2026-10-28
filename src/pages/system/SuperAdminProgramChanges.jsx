import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  RefreshCw,
  FileText,
  UserRound,
  GraduationCap,
  CalendarDays,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  X,
  Filter,
  ArrowRightLeft,
  ShieldCheck,
  MessageSquareText,
} from "lucide-react";

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  UNDER_REVIEW: {
    label: "Under review",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
};

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatStatus = (status) =>
  STATUS_CONFIG[status] || {
    label: status || "Unknown",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  };

export default function SuperAdminProgramChanges() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const perPage = 8;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * The listing endpoint has not yet been confirmed.
   * Keep the list empty rather than calling an invented endpoint
   * or displaying fabricated request data.
   */

  const filteredRequests = useMemo(() => {
    const term = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesSearch =
        !term ||
        String(request.studentName || "").toLowerCase().includes(term) ||
        String(request.matricNumber || "").toLowerCase().includes(term) ||
        String(request.requestNumber || "").toLowerCase().includes(term) ||
        String(request.currentProgramme || "").toLowerCase().includes(term) ||
        String(request.requestedProgramme || "").toLowerCase().includes(term) ||
        String(request.email || "").toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "ALL" || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequests.length / perPage)
  );

  const paginatedRequests = filteredRequests.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const counts = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((item) => item.status === "PENDING").length,
      reviewing: requests.filter(
        (item) => item.status === "UNDER_REVIEW"
      ).length,
      completed: requests.filter(
        (item) =>
          item.status === "APPROVED" || item.status === "COMPLETED"
      ).length,
    }),
    [requests]
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const changeSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const changeFilter = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Page heading */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                <ShieldCheck size={16} />
                <span>Super Admin</span>
                <span>/</span>
                <span>Academic Management</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#0B1524] sm:text-3xl">
                Programme Change Requests
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Review students' requests to change their academic
                programmes, examine the reasons provided, and monitor
                the approval process.
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total requests"
              value={counts.total}
              description="All submitted requests"
              icon={<FileText size={20} />}
              iconClass="bg-blue-50 text-blue-700"
            />

            <SummaryCard
              title="Awaiting review"
              value={counts.pending}
              description="Pending initial review"
              icon={<Clock3 size={20} />}
              iconClass="bg-amber-50 text-amber-700"
            />

            <SummaryCard
              title="Under review"
              value={counts.reviewing}
              description="Currently being reviewed"
              icon={<RefreshCw size={20} />}
              iconClass="bg-indigo-50 text-indigo-700"
            />

            <SummaryCard
              title="Completed"
              value={counts.completed}
              description="Approved or completed"
              icon={<CheckCircle2 size={20} />}
              iconClass="bg-emerald-50 text-emerald-700"
            />
          </div>

          {/* Requests table */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#0B1524]">
                    Submitted requests
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Search and inspect programme change requests.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      value={search}
                      onChange={(event) => changeSearch(event.target.value)}
                      placeholder="Search student or programme..."
                      className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-72"
                    />
                  </div>

                  <div className="relative">
                    <Filter
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <select
                      value={statusFilter}
                      onChange={(event) => changeFilter(event.target.value)}
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-44"
                    >
                      <option value="ALL">All statuses</option>
                      <option value="PENDING">Pending</option>
                      <option value="UNDER_REVIEW">Under review</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="m-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">
                    Unable to load programme change requests
                  </p>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center px-6 py-20">
                <RefreshCw
                  size={28}
                  className="animate-spin text-blue-700"
                />
                <p className="mt-4 text-sm text-slate-500">
                  Loading programme change requests...
                </p>
              </div>
            ) : paginatedRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center sm:py-20">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <ArrowRightLeft size={25} />
                </div>

                <h3 className="mt-4 text-base font-semibold text-slate-800">
                  {search || statusFilter !== "ALL"
                    ? "No matching requests"
                    : "No requests available"}
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {search || statusFilter !== "ALL"
                    ? "Try changing your search term or status filter."
                    : "The page is ready, but the backend listing endpoint has not yet been connected. Requests will appear here once the endpoint is confirmed and integrated."}
                </p>

                {(search || statusFilter !== "ALL") && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-4 text-sm font-semibold text-blue-700 hover:text-blue-900"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[950px] text-left">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-4 font-semibold">Student</th>
                        <th className="px-5 py-4 font-semibold">
                          Programme change
                        </th>
                        <th className="px-5 py-4 font-semibold">Submitted</th>
                        <th className="px-5 py-4 font-semibold">Status</th>
                        <th className="px-5 py-4 text-right font-semibold">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {paginatedRequests.map((request) => (
                        <tr
                          key={request.id}
                          className="transition hover:bg-slate-50/70"
                        >
                          <td className="px-5 py-4">
                            <div className="font-semibold text-slate-800">
                              {request.studentName || "Unknown student"}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {request.matricNumber || "No matric number"}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {request.requestNumber || request.id}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <p className="max-w-xs text-sm text-slate-700">
                              {request.currentProgramme || "Not available"}
                            </p>
                            <div className="my-1.5 flex items-center gap-2 text-xs font-medium text-blue-700">
                              <ArrowRight size={14} />
                              Requested programme
                            </div>
                            <p className="max-w-xs text-sm font-semibold text-slate-900">
                              {request.requestedProgramme || "Not available"}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {formatDate(request.submittedAt)}
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge status={request.status} />
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedRequest(request)}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Eye size={15} />
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Showing {(page - 1) * perPage + 1}–
                    {Math.min(page * perPage, filteredRequests.length)} of{" "}
                    {filteredRequests.length} requests
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                      className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Previous page"
                    >
                      <ArrowLeft size={16} />
                    </button>

                    <span className="px-2 text-sm text-slate-600">
                      Page {page} of {totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() =>
                        setPage((current) =>
                          Math.min(totalPages, current + 1)
                        )
                      }
                      className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Next page"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>

          <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50/70 p-4">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-blue-700"
            />
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Backend integration pending
              </p>
              <p className="mt-1 text-sm leading-6 text-blue-800">
                The listing endpoint is not yet confirmed. The override API
                exists in your API file, but its valid stage and decision
                values still need to be confirmed before review actions can
                safely be enabled.
              </p>
            </div>
          </div>
        </div>
      </main>

      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon,
  iconClass,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-[#0B1524]">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-lg ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = formatStatus(status);

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-slate-800">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function RequestDetailsModal({ request, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="programme-change-title"
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Programme change review
            </p>
            <h2
              id="programme-change-title"
              className="mt-1 text-xl font-bold text-[#0B1524]"
            >
              Request details
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {request.requestNumber || request.id}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close request details"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-7 p-5 sm:p-7">
          <section>
            <div className="mb-4 flex items-center gap-2">
              <UserRound size={18} className="text-blue-700" />
              <h3 className="font-semibold text-slate-900">
                Student information
              </h3>
            </div>

            <div className="grid gap-x-6 gap-y-5 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
              <DetailItem label="Full name" value={request.studentName} />
              <DetailItem label="Matric number" value={request.matricNumber} />
              <DetailItem label="Email address" value={request.email} />
              <DetailItem label="Phone number" value={request.phone} />
              <DetailItem label="Faculty" value={request.faculty} />
              <DetailItem label="Department" value={request.department} />
              <DetailItem label="Current level" value={request.level} />
              <DetailItem
                label="Academic session"
                value={request.academicSession}
              />
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2">
              <GraduationCap size={18} className="text-blue-700" />
              <h3 className="font-semibold text-slate-900">
                Programme comparison
              </h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Current programme
                </p>
                <p className="mt-3 font-semibold leading-6 text-slate-800">
                  {request.currentProgramme || "Not available"}
                </p>
              </div>

              <div className="flex items-center justify-center text-blue-700">
                <ArrowRightLeft size={22} />
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Requested programme
                </p>
                <p className="mt-3 font-semibold leading-6 text-slate-900">
                  {request.requestedProgramme || "Not available"}
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquareText size={18} className="text-blue-700" />
              <h3 className="font-semibold text-slate-900">
                Student's reason
              </h3>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
              {request.reason || "No reason was provided."}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Request status
                </p>
                <div className="mt-3">
                  <StatusBadge status={request.status} />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Current approval stage
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {request.approvalStage || "Not available"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <CalendarDays size={15} />
                  <p className="text-xs font-medium uppercase tracking-wide">
                    Date submitted
                  </p>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {formatDate(request.submittedAt)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <FileText size={15} />
                  <p className="text-xs font-medium uppercase tracking-wide">
                    Request ID
                  </p>
                </div>
                <p className="mt-2 break-all text-sm font-semibold text-slate-800">
                  {request.id}
                </p>
              </div>
            </div>

            {request.remarks && (
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-800">
                  Existing remarks
                </p>
                <div className="rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-600">
                  {request.remarks}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0 text-amber-700"
              />
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Review actions not connected
                </p>
                <p className="mt-1 text-sm leading-6 text-amber-800">
                  The override endpoint is available, but its accepted stage
                  and decision values need to be confirmed before enabling
                  request changes.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white opacity-50"
              >
                <CheckCircle2 size={16} />
                Approve
              </button>

              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white opacity-50"
              >
                <XCircle size={16} />
                Reject
              </button>

              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-500 opacity-60"
              >
                <RefreshCw size={16} />
                Override stage
              </button>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}