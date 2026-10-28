import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  UserPlus,
} from "lucide-react";

import {
  getSuperAdminUsers,
  assignSuperAdminUserRole,
  removeSuperAdminUserRole,
   deactivateSuperAdminUser,
  activateSuperAdminUser,
} from "../../lib/api";

const PAGE_SIZE = 8;

const AVAILABLE_ROLES = [
  {
    id: "e9581a2e-a1b7-490c-8313-875e6ccbba6c",
    name: "Applicant",
  },
  {
    id: "21e2a750-2c6f-41c7-bd1a-7e1d72e81f97",
    name: "Student",
  },
  {
    id: "e07f31f8-4cab-4748-893d-5674994c5af9",
    name: "Lecturer",
  },
  {
    id: "7b11ec21-f81e-41d1-ae0d-3e06a40d0846",
    name: "HOD",
  },
  {
    id: "aaaa6464-2ed8-4dfa-a3bb-c4fb93b4f017",
    name: "Dean",
  },
  {
    id: "99695a98-7d5f-481b-accf-e8936e2d3a18",
    name: "Registrar",
  },
  {
    id: "21d2a83a-26ab-4d28-9eed-965e89f04079",
    name: "Admin",
  },
];

const getAccountsFromResponse = (response) => {
  const candidates = [
    response?.data?.users,
    response?.data?.data,
    response?.data,
    response?.users,
    response,
  ];

  return candidates.find(Array.isArray) || [];
};

const getAccountId = (account) =>
  account?.id ?? account?.user_id ?? account?.uuid ?? "";

const getAccountName = (account) => {
  const name =
    account?.full_name ||
    account?.name ||
    [account?.first_name, account?.last_name].filter(Boolean).join(" ");

  return name || "Unnamed account";
};

const getAccountEmail = (account) =>
  account?.email || account?.email_address || "—";

const getAccountRoles = (account) => {
  const rawRoles = account?.roles ?? account?.user_roles ?? account?.role;

  if (Array.isArray(rawRoles)) {
    return rawRoles
      .map((role) => {
        if (typeof role === "string") return role;

        return (
          role?.role_name ||
          role?.name ||
          role?.role?.role_name ||
          role?.role?.name ||
          ""
        );
      })
      .filter(Boolean);
  }

  if (typeof rawRoles === "string") return [rawRoles];

  if (rawRoles && typeof rawRoles === "object") {
    const name =
      rawRoles?.role_name ||
      rawRoles?.name ||
      rawRoles?.role?.role_name ||
      rawRoles?.role?.name;

    return name ? [name] : [];
  }

  return [];
};

const getIsActive = (account) => {
  if (typeof account?.is_active === "boolean") return account.is_active;
  if (typeof account?.active === "boolean") return account.active;
  return null;
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

function StatusBadge({ active }) {
  if (active === null || active === undefined) {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
        Unknown
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-rose-50 text-rose-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-rose-500"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function SummaryCard({ title, value, description, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-[#0B1524]">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>

        <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}


function AccountDetailsModal({
  account,
  assigning,
  onClose,
  onAssignRole,
  onRemoveRole,
}) {
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [error, setError] = useState("");

  if (!account) return null;

  const accountId = getAccountId(account);
  const accountRoles = getAccountRoles(account);
  const active = getIsActive(account);

  const assignedRoleIds = AVAILABLE_ROLES.filter((role) =>
    accountRoles.some(
      (assigned) =>
        (
          typeof assigned === "string"
            ? assigned
            : assigned?.role_name || assigned?.name || ""
        ).toLowerCase() === role.name.toLowerCase()
    )
  ).map((role) => role.id);

  const availableRoles = AVAILABLE_ROLES.filter(
    (role) => !assignedRoleIds.includes(role.id)
  );

  const handleAssign = async () => {
    setError("");

    if (!accountId) {
      setError("The account does not contain a usable user ID.");
      return;
    }

    if (!selectedRoleId) {
      setError("Please select a role.");
      return;
    }

    const selectedRole = AVAILABLE_ROLES.find(
      (role) => role.id === selectedRoleId
    );

    if (!selectedRole) {
      setError("Please select a valid role.");
      return;
    }

    try {
      await onAssignRole(accountId, selectedRole.name);
      setSelectedRoleId("");
    } catch (err) {
      setError(err?.message || "Unable to assign this role.");
    }
  };

  const handleRemove = async (roleName) => {
    setError("");

    if (!accountId) {
      setError("The account does not contain a usable user ID.");
      return;
    }

    const role = AVAILABLE_ROLES.find(
      (item) => item.name.toLowerCase() === roleName.toLowerCase()
    );

    if (!role) {
      setError(`Could not find the role ID for ${roleName}.`);
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to remove the ${roleName} role from this account?`
      )
    ) {
      return;
    }

    try {
      await onRemoveRole(accountId, role.id);
    } catch (err) {
      setError(err?.message || "Unable to remove this role.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-modal-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-200 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Account management
            </p>

            <h2
              id="account-modal-title"
              className="mt-1 text-xl font-bold text-[#0B1524]"
            >
              {getAccountName(account)}
            </h2>

            <p className="mt-1 break-all text-sm text-slate-500">
              {getAccountEmail(account)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close account details"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">User ID</p>
              <p className="mt-2 break-all text-sm font-medium text-slate-800">
                {accountId || "Not provided"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">
                Account status
              </p>
              <div className="mt-2">
                <StatusBadge active={active} />
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">Created</p>
              <p className="mt-2 text-sm font-medium text-slate-800">
                {formatDate(account?.created_at || account?.date_created)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">Updated</p>
              <p className="mt-2 text-sm font-medium text-slate-800">
                {formatDate(account?.updated_at || account?.date_updated)}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-[#0B1524]">
              Assigned roles
            </h3>

            {accountRoles.length > 0 ? (
              <div className="mt-3 space-y-2">
                {accountRoles.map((assigned) => {
                  const roleName =
                    typeof assigned === "string"
                      ? assigned
                      : assigned?.role_name || assigned?.name || "";

                  return (
                    <div
                      key={roleName}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2"
                    >
                      <span className="text-sm font-medium text-slate-700">
                        {roleName}
                      </span>

                      <button
                        type="button"
                        disabled={assigning}
                        onClick={() => handleRemove(roleName)}
                        className="shrink-0 rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                No assigned roles were returned for this account.
              </p>
            )}
          </div>

          <div className="border-t border-slate-200 pt-5">
            <h3 className="font-semibold text-[#0B1524]">Assign a role</h3>

            <p className="mt-1 text-sm text-slate-500">
              Select a role to add to this account.
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <select
                value={selectedRoleId}
                onChange={(event) => {
                  setSelectedRoleId(event.target.value);
                  setError("");
                }}
                className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select a role</option>

                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAssign}
                disabled={!selectedRoleId || assigning}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B1524] px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {assigning ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <UserPlus size={17} />
                )}

                {assigning ? "Processing..." : "Assign role"}
              </button>
            </div>

            {availableRoles.length === 0 && (
              <p className="mt-3 text-sm text-slate-500">
                No additional roles are available to assign.
              </p>
            )}

            {error && (
              <p className="mt-3 flex items-start gap-2 text-sm text-rose-600">
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 p-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}


export default function AccountManagement() {
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

const handleRemoveRole = async (userId, roleId) => {
  setAssigning(true);
  setError("");
  setSuccess("");

  try {
    await removeSuperAdminUserRole(userId, roleId);

    const updatedAccounts = await loadAccounts({ quiet: true });

    const updatedAccount = updatedAccounts.find(
      (account) =>
        String(getAccountId(account)) === String(userId)
    );

    if (updatedAccount) {
      setSelectedAccount(updatedAccount);
    }

    setSuccess("Role removed successfully.");
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Failed to remove role."
    );
  } finally {
    setAssigning(false);
  }
};
const handleToggleAccountStatus = async (account) => {
  const userId = getAccountId(account);

  if (!userId) {
    setError("Unable to identify this account.");
    return;
  }

  const isActive = getIsActive(account);
  const action = isActive ? "deactivate" : "activate";

  const confirmed = window.confirm(
    `Are you sure you want to ${action} this account?`
  );

  if (!confirmed) return;

  setAssigning(true);
  setError("");
  setSuccess("");

  try {
    if (isActive) {
      await deactivateSuperAdminUser(userId);
    } else {
      await activateSuperAdminUser(userId);
    }

    await loadAccounts({ quiet: true });

    setSuccess(
      `Account ${action === "activate" ? "activated" : "deactivated"} successfully.`
    );

    setSelectedAccount(null);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : `Failed to ${action} account.`
    );
  } finally {
    setAssigning(false);
  }
};
  const loadAccounts = useCallback(
    async ({ quiet = false } = {}) => {
      if (quiet) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const params = {};

        if (roleFilter) {
          params.role = roleFilter;
        }

        if (statusFilter !== "") {
          params.is_active = statusFilter === "true";
        }

        const response = await getSuperAdminUsers(params);
        const fetchedAccounts = getAccountsFromResponse(response);

        setAccounts(fetchedAccounts);

        return fetchedAccounts;
      } catch (err) {
        setError(err?.message || "Failed to load accounts.");
        throw err;
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [roleFilter, statusFilter]
  );

  useEffect(() => {
    loadAccounts().catch(() => {});
  }, [loadAccounts]);

  const filteredAccounts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return accounts.filter((account) => {
      const name = getAccountName(account).toLowerCase();
      const email = getAccountEmail(account).toLowerCase();
      const id = String(getAccountId(account)).toLowerCase();
      const accountRoles = getAccountRoles(account);
      const active = getIsActive(account);

      const matchesSearch =
        !term ||
        name.includes(term) ||
        email.includes(term) ||
        id.includes(term) ||
        accountRoles.some((role) =>
          role.toLowerCase().includes(term)
        );

      const matchesRole =
        !roleFilter ||
        accountRoles.some(
          (role) => role.toLowerCase() === roleFilter.toLowerCase()
        );

      const matchesStatus =
        statusFilter === "" ||
        (statusFilter === "true" && active === true) ||
        (statusFilter === "false" && active === false);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [accounts, search, roleFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAccounts.length / PAGE_SIZE)
  );

  const paginatedAccounts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;

    return filteredAccounts.slice(start, start + PAGE_SIZE);
  }, [filteredAccounts, page]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const activeCount = accounts.filter(
    (account) => getIsActive(account) === true
  ).length;

  const inactiveCount = accounts.filter(
    (account) => getIsActive(account) === false
  ).length;

  const handleAssignRole = async (userId, roleId) => {
    setAssigning(true);
    setError("");
    setSuccess("");

    try {
      await assignSuperAdminUserRole(userId, roleId);

      const updatedAccounts = await loadAccounts({ quiet: true });

      const updatedAccount = updatedAccounts.find(
        (account) =>
          String(getAccountId(account)) === String(userId)
      );

      if (updatedAccount) {
        setSelectedAccount(updatedAccount);
      }

      setSuccess("Role assigned successfully.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-2 text-sm text-slate-500">
          Super Admin <span className="mx-2">/</span> Account Management
        </div>

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0B1524] sm:text-3xl">
              Account Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              View accounts, filter by role and status, and assign roles to
              existing users.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadAccounts({ quiet: true }).catch(() => {})}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {success && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />

            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Dismiss success message"
              className="ml-auto"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />

            <div className="flex-1">
              <p className="font-semibold">Unable to complete the request</p>
              <p className="mt-1 break-words">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => loadAccounts().catch(() => {})}
              className="shrink-0 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total accounts"
            value={accounts.length}
            description="Accounts returned by the API"
            icon={Users}
          />

          <SummaryCard
            title="Active accounts"
            value={activeCount}
            description="Accounts marked active"
            icon={UserCheck}
          />

          <SummaryCard
            title="Inactive accounts"
            value={inactiveCount}
            description="Accounts marked inactive"
            icon={UserX}
          />

          <SummaryCard
            title="Available roles"
            value={AVAILABLE_ROLES.length}
            description="Configured system roles"
            icon={ShieldCheck}
          />
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-bold text-[#0B1524]">
                  All accounts
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredAccounts.length} matching account
                  {filteredAccounts.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:flex">
                <div className="relative min-w-0 lg:w-64">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name, email, ID..."
                    aria-label="Search accounts"
                    className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value)}
                  aria-label="Filter accounts by role"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">All roles</option>

                  {AVAILABLE_ROLES.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter accounts by status"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">All statuses</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-slate-500">
              <LoaderCircle
                size={30}
                className="animate-spin text-slate-700"
              />
              <p className="text-sm">Loading accounts...</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <Users size={34} className="text-slate-300" />

              <h3 className="mt-4 font-semibold text-slate-800">
                No accounts returned
              </h3>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                No account records were returned by the API.
              </p>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <Search size={32} className="text-slate-300" />

              <h3 className="mt-4 font-semibold text-slate-800">
                No matching accounts
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or filters.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("");
                  setStatusFilter("");
                }}
                className="mt-4 text-sm font-semibold text-blue-700 hover:text-blue-900"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Account</th>
                      <th className="px-6 py-4 font-semibold">Roles</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Created</th>
                      <th className="px-6 py-4 text-right font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {paginatedAccounts.map((account, index) => {
                      const id = getAccountId(account);
                      const roles = getAccountRoles(account);

                      return (
                        <tr
                          key={
                            id ||
                            `${getAccountEmail(account)}-${index}`
                          }
                          className="transition-colors hover:bg-slate-50"
                        >
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-800">
                              {getAccountName(account)}
                            </p>

                            <p className="mt-1 text-slate-500">
                              {getAccountEmail(account)}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            {roles.length > 0 ? (
                              <div className="flex max-w-xs flex-wrap gap-1.5">
                                {roles.slice(0, 3).map((role) => (
                                  <span
                                    key={role}
                                    className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700"
                                  >
                                    {role}
                                  </span>
                                ))}

                                {roles.length > 3 && (
                                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                                    +{roles.length - 3}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">
                                No roles
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <StatusBadge active={getIsActive(account)} />
                          </td>

                          <td className="px-6 py-4 text-slate-600">
                            {formatDate(
                              account?.created_at ||
                                account?.date_created
                            )}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedAccount(account)}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-400 hover:bg-white"
                            >
                              <Eye size={15} />
                              Manage
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <button
                                type="button"
                                disabled={assigning}
                                onClick={() => handleToggleAccountStatus(account)}
                                className={`rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-50 ${
                                getIsActive(account)
                                    ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                                    : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                }`}
                            >
                                {getIsActive(account) ? "Deactivate account" : "Activate account"}
                            </button>
                            </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col justify-between gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center">
                <p className="text-sm text-slate-500">
                  Showing {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(
                    page * PAGE_SIZE,
                    filteredAccounts.length
                  )}{" "}
                  of {filteredAccounts.length}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((current) => current - 1)
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  <span className="px-2 text-sm text-slate-600">
                    {page} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((current) => current + 1)
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {selectedAccount && (
        <AccountDetailsModal
          account={selectedAccount}
          assigning={assigning}
          onClose={() => setSelectedAccount(null)}
          onAssignRole={handleAssignRole}
          onRemoveRole={handleRemoveRole}
        />
      )}
    </main>
  );
}