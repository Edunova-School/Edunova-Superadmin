import React, { useMemo, useState } from "react";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";
import { PageHeader, Button, Badge } from "../components/ui.jsx";
import DataTable from "../components/DataTable.jsx";
import { useQuery } from "@tanstack/react-query";
import { getAdminApplicants } from "../lib/api";

export default function Applicants() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [facultyFilter, setFacultyFilter] = useState("ALL");
  const [programmeFilter, setProgrammeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("updated");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: applicants = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-applicants"],
    queryFn: async () => {
      const firstResponse = await getAdminApplicants({
        page: 1,
        per_page: 100,
      });

      const firstPage =
        firstResponse?.data?.items ??
        firstResponse?.data ??
        [];

      const totalPages =
        firstResponse?.data?.pagination?.pages ??
        1;

      let allApplicants = [...firstPage];

      if (totalPages > 1) {
        const remainingPages = await Promise.all(
          Array.from(
            { length: totalPages - 1 },
            (_, index) =>
              getAdminApplicants({
                page: index + 2,
                per_page: 100,
              })
          )
        );

        remainingPages.forEach((response) => {
          const items =
            response?.data?.items ??
            response?.data ??
            [];

          allApplicants = [
            ...allApplicants,
            ...items,
          ];
        });
      }

      return allApplicants
        .filter(
          (item) =>
            String(item.application_status ?? "").toUpperCase() !==
            "DRAFT"
        )
        .map((item) => ({
          id: item.application_number ?? "-",

          name:
            `${item.first_name ?? ""} ${
              item.last_name ?? ""
            }`.trim() || "-",

          email: item.email ?? "-",

          programme: item.programme ?? "-",

          faculty: item.faculty ?? "-",

          stage: item.application_status ?? "-",

          updated: item.updated_at ?? null,

          raw: item,
        }));
    },

    staleTime: 1000 * 60 * 5,
  });
  const faculties = useMemo(() => {
    return [
      ...new Set(
        applicants
          .map((item) => item.faculty)
          .filter(
            (value) =>
              value &&
              value !== "-"
          )
      ),
    ].sort();
  }, [applicants]);

  const programmes = useMemo(() => {
    return [
      ...new Set(
        applicants
          .map((item) => item.programme)
          .filter(
            (value) =>
              value &&
              value !== "-"
          )
      ),
    ].sort();
  }, [applicants]);

  /*
   * Filter + search + sort.
   */
  const filteredApplicants = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    const filtered = applicants.filter((applicant) => {
      const matchesSearch =
        !searchTerm ||
        applicant.id
          .toLowerCase()
          .includes(searchTerm) ||
        applicant.name
          .toLowerCase()
          .includes(searchTerm) ||
        applicant.email
          .toLowerCase()
          .includes(searchTerm) ||
        applicant.programme
          .toLowerCase()
          .includes(searchTerm);

      const matchesStatus =
        statusFilter === "ALL" ||
        applicant.stage === statusFilter;

      const matchesFaculty =
        facultyFilter === "ALL" ||
        applicant.faculty === facultyFilter;

      const matchesProgramme =
        programmeFilter === "ALL" ||
        applicant.programme === programmeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesFaculty &&
        matchesProgramme
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "applicant") {
        return a.id.localeCompare(b.id);
      }

      if (sortBy === "updated") {
        const dateA = a.updated
          ? new Date(a.updated).getTime()
          : 0;

        const dateB = b.updated
          ? new Date(b.updated).getTime()
          : 0;

        return dateB - dateA;
      }

      return 0;
    });
  }, [
    applicants,
    search,
    statusFilter,
    facultyFilter,
    programmeFilter,
    sortBy,
  ]);

  /*
   * Pagination.
   */
  const perPage = 10;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredApplicants.length / perPage)
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedApplicants = filteredApplicants.slice(
    (safeCurrentPage - 1) * perPage,
    safeCurrentPage * perPage
  );

  /*
   * Reset pagination when filters change.
   */
  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    statusFilter,
    facultyFilter,
    programmeFilter,
    sortBy,
  ]);

  /*
   * CSV export.
   */
  function exportCSV() {
    if (!filteredApplicants.length) return;

    const headers = [
      "Applicant No.",
      "Name",
      "Email",
      "Programme",
      "Faculty",
      "Stage",
      "Updated",
    ];

    const rows = filteredApplicants.map((item) => [
      item.id,
      item.name,
      item.email,
      item.programme,
      item.faculty,
      item.stage,
      item.updated
        ? new Date(item.updated).toLocaleDateString()
        : "-",
    ]);

    const escapeCSV = (value) => {
      const stringValue = String(value ?? "");

      return `"${stringValue.replace(/"/g, '""')}"`;
    };

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) =>
        row.map(escapeCSV).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "edunova-applicants.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  const columns = [
    {
      key: "id",
      label: "Applicant No.",
      render: (r) => (
        <span className="font-mono text-xs text-black/50">
          {r.id}
        </span>
      ),
    },

    {
      key: "name",
      label: "Name",
      render: (r) => (
        <span className="font-medium text-black">
          {r.name}
        </span>
      ),
    },

    {
      key: "email",
      label: "Email",
      render: (r) => (
        <span className="text-black/55">
          {r.email}
        </span>
      ),
    },

    {
      key: "programme",
      label: "Programme",
    },

    {
      key: "stage",
      label: "Stage",
      render: (r) => (
        <Badge>{r.stage}</Badge>
      ),
    },

    {
      key: "updated",
      label: "Updated",
      align: "right",
      render: (r) => (
        <span className="text-black/50 text-sm">
          {r.updated
            ? new Date(
                r.updated
              ).toLocaleDateString()
            : "—"}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div>
        <PageHeader
          eyebrow="Admissions pipeline"
          title="Applicants"
          description="Everyone who has submitted an application on the EduNova platform."
        />

        <div className="bg-white border border-black/[0.06] rounded-2xl p-8 text-center">
          <p className="text-sm text-black/50">
            Loading applicants...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader
          eyebrow="Admissions pipeline"
          title="Applicants"
          description="Everyone who has submitted an application on the EduNova platform."
        />

        <div className="bg-white border border-black/[0.06] rounded-2xl p-8 text-center">
          <p className="text-sm text-red-600">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Admissions pipeline"
        title="Applicants"
        description="Everyone who has submitted an application on the EduNova platform."
        action={
          <Button
            variant="outline"
            onClick={exportCSV}
            disabled={!filteredApplicants.length}
          >
            <Download size={14} />
            Export CSV
          </Button>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm mb-4">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30"
        />

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search by name, email, or applicant number..."
          className="w-full bg-white border border-black/10 rounded-full pl-9 pr-4 py-2.5 text-sm placeholder:text-black/30 focus:border-navy-800 focus:outline-none transition-colors"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="bg-white border border-black/10 rounded-xl px-3 py-2 text-sm text-black/70 focus:outline-none"
        >
          <option value="ALL">
            All stages
          </option>

          <option value="SUBMITTED">
            Submitted
          </option>

          <option value="UNDER_REVIEW">
            Under review
          </option>

          <option value="OFFERED">
            Offered
          </option>

          <option value="REJECTED">
            Rejected
          </option>
        </select>

        <select
          value={facultyFilter}
          onChange={(e) =>
            setFacultyFilter(e.target.value)
          }
          className="bg-white border border-black/10 rounded-xl px-3 py-2 text-sm text-black/70 focus:outline-none max-w-xs"
        >
          <option value="ALL">
            All faculties
          </option>

          {faculties.map((faculty) => (
            <option
              key={faculty}
              value={faculty}
            >
              {faculty}
            </option>
          ))}
        </select>

        <select
          value={programmeFilter}
          onChange={(e) =>
            setProgrammeFilter(e.target.value)
          }
          className="bg-white border border-black/10 rounded-xl px-3 py-2 text-sm text-black/70 focus:outline-none max-w-xs"
        >
          <option value="ALL">
            All programmes
          </option>

          {programmes.map((programme) => (
            <option
              key={programme}
              value={programme}
            >
              {programme}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() =>
            setSortBy(
              sortBy === "updated"
                ? "name"
                : sortBy === "name"
                ? "applicant"
                : "updated"
            )
          }
          className="inline-flex items-center gap-2 bg-white border border-black/10 rounded-xl px-3 py-2 text-sm text-black/65 hover:bg-black/[0.03] transition-colors"
        >
          <ArrowUpDown size={14} />

          {sortBy === "updated"
            ? "Recently updated"
            : sortBy === "name"
            ? "Name"
            : "Applicant number"}
        </button>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-black/40">
          {filteredApplicants.length === 0
            ? "No applicants found"
            : `Showing ${
                (safeCurrentPage - 1) *
                  perPage +
                1
              }–${Math.min(
                safeCurrentPage * perPage,
                filteredApplicants.length
              )} of ${
                filteredApplicants.length
              } applicants`}
        </p>

        {(search ||
          statusFilter !== "ALL" ||
          facultyFilter !== "ALL" ||
          programmeFilter !== "ALL") && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
              setFacultyFilter("ALL");
              setProgrammeFilter("ALL");
            }}
            className="text-xs text-black/45 hover:text-black transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      {paginatedApplicants.length > 0 ? (
        <DataTable
          columns={columns}
          rows={paginatedApplicants}
        />
      ) : (
        <div className="bg-white border border-black/[0.06] rounded-2xl p-10 text-center">
          <p className="text-sm font-medium text-black">
            No applicants found
          </p>

          <p className="text-xs text-black/40 mt-1">
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-xs text-black/40">
            Page {safeCurrentPage} of{" "}
            {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safeCurrentPage === 1}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.max(1, page - 1)
                )
              }
              className="w-9 h-9 rounded-lg border border-black/10 flex items-center justify-center text-black/50 hover:bg-black/[0.03] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1">
              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() =>
                    setCurrentPage(page)
                  }
                  className={`w-9 h-9 rounded-lg text-sm transition-colors ${
                    page === safeCurrentPage
                      ? "bg-[#14263F] text-white"
                      : "text-black/50 hover:bg-black/[0.04]"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={
                safeCurrentPage === totalPages
              }
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(
                    totalPages,
                    page + 1
                  )
                )
              }
              className="w-9 h-9 rounded-lg border border-black/10 flex items-center justify-center text-black/50 hover:bg-black/[0.03] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}