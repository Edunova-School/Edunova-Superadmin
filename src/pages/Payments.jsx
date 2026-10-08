import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  PageHeader,
  Badge,
  StatCard,
} from "../components/ui.jsx";
import DataTable from "../components/DataTable.jsx";
import { getSuperAdminPayments } from "../lib/api";
import {
  Wallet,
  RotateCcw,
  Clock3,
  Search,
} from "lucide-react";

function getPaymentStatus(payment) {
  return (
    payment.status ??
    payment.payment_status ??
    payment.transaction_status ??
    "UNKNOWN"
  );
}

function getPaymentApplicant(payment) {
  if (payment.applicant) {
    if (typeof payment.applicant === "string") {
      return payment.applicant;
    }

    return [
      payment.applicant.first_name,
      payment.applicant.middle_name,
      payment.applicant.last_name,
    ]
      .filter(Boolean)
      .join(" ");
  }

  return (
    payment.applicant_name ??
    payment.name ??
    payment.email ??
    "—"
  );
}

function getPaymentAmount(payment) {
  const amount =
    payment.amount ??
    payment.payment_amount ??
    payment.total_amount ??
    0;

  return Number(amount) || 0;
}

function formatAmount(payment) {
  const amount = getPaymentAmount(payment);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: payment.currency ?? "NGN",
    maximumFractionDigits: 2,
  }).format(amount);
}

function getPaymentMethod(payment) {
  return (
    payment.payment_method ??
    payment.method ??
    payment.channel ??
    "—"
  );
}

function getPaymentDate(payment) {
  return (
    payment.created_at ??
    payment.paid_at ??
    payment.payment_date ??
    payment.date ??
    null
  );
}

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString();
}

function normalizePayment(payment) {
  return {
    ...payment,

    paymentId:
      payment.id ??
      payment.payment_id ??
      payment.payment_reference ??
      payment.reference ??
      "—",

    applicantName: getPaymentApplicant(payment),

    applicationNumber:
      payment.application_number ??
      payment.application?.application_number ??
      "—",

    amountValue: getPaymentAmount(payment),

    amountDisplay: formatAmount(payment),

    paymentMethod: getPaymentMethod(payment),

    paymentStatus: getPaymentStatus(payment),

    paymentDate: getPaymentDate(payment),
  };
}

function isCurrentMonth(date) {
  if (!date) return false;

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  const now = new Date();

  return (
    parsed.getMonth() === now.getMonth() &&
    parsed.getFullYear() === now.getFullYear()
  );
}

export default function Payments() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");

  const {
    data: payments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "admin-payments",
      {
        search,
        status: statusFilter,
        payment_method: methodFilter,
      },
    ],
    queryFn: async () => {
      const response = await getSuperAdminPayments({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        payment_method: methodFilter || undefined,
      });

      const list = response?.data ?? response ?? [];

      if (!Array.isArray(list)) {
        return [];
      }

      return list.map(normalizePayment);
    },
    staleTime: 0,
  });

  const summary = useMemo(() => {
    const successful = payments
      .filter(
        (payment) =>
          isCurrentMonth(payment.paymentDate) &&
          ["SUCCESSFUL", "SUCCESS", "PAID", "COMPLETED"].includes(
            payment.paymentStatus?.toUpperCase()
          )
      )
      .reduce(
        (total, payment) => total + payment.amountValue,
        0
      );

    const refunded = payments
      .filter(
        (payment) =>
          isCurrentMonth(payment.paymentDate) &&
          ["REFUNDED", "REFUND"].includes(
            payment.paymentStatus?.toUpperCase()
          )
      )
      .reduce(
        (total, payment) => total + payment.amountValue,
        0
      );

    const pending = payments
      .filter((payment) =>
        ["PENDING", "PROCESSING", "AWAITING_PAYMENT"].includes(
          payment.paymentStatus?.toUpperCase()
        )
      )
      .reduce(
        (total, payment) => total + payment.amountValue,
        0
      );

    return {
      successful,
      refunded,
      pending,
    };
  }, [payments]);

  const columns = [
    {
      key: "paymentId",
      label: "Payment ID",
      render: (r) => (
        <span className="font-mono text-xs text-black/50">
          {r.paymentId}
        </span>
      ),
    },

    {
      key: "applicantName",
      label: "Applicant",
      render: (r) => (
        <span className="font-medium text-black">
          {r.applicantName}
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
      key: "amountDisplay",
      label: "Amount",
      render: (r) => (
        <span className="font-medium text-black">
          {r.amountDisplay}
        </span>
      ),
    },

    {
      key: "paymentMethod",
      label: "Method",
      render: (r) => r.paymentMethod,
    },

    {
      key: "paymentStatus",
      label: "Status",
      render: (r) => (
        <Badge>{r.paymentStatus}</Badge>
      ),
    },

    {
      key: "paymentDate",
      label: "Date",
      align: "right",
      render: (r) => formatDate(r.paymentDate),
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Finance"
        title="Payments"
        description="Application fee transactions across every payment channel connected to EduNova."
      />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Successful this month"
          value={new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0,
          }).format(summary.successful)}
          icon={Wallet}
        />

        <StatCard
          label="Refunded this month"
          value={new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0,
          }).format(summary.refunded)}
          icon={RotateCcw}
        />

        <StatCard
          label="Pending settlement"
          value={new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0,
          }).format(summary.pending)}
          icon={Clock3}
        />
      </div>

      {/* Filters */}
      <div className="bg-white border border-black/[0.06] rounded-2xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_180px] gap-3">
          {/* Search */}
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search applicant or payment ID..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-black/[0.08] bg-white text-sm outline-none focus:border-[#14263F] transition-colors"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-3 rounded-xl border border-black/[0.08] bg-white text-sm outline-none focus:border-[#14263F]"
          >
            <option value="">All statuses</option>
            <option value="SUCCESSFUL">Successful</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          {/* Method */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="h-11 px-3 rounded-xl border border-black/[0.08] bg-white text-sm outline-none focus:border-[#14263F]"
          >
            <option value="">All methods</option>
            <option value="CARD">Card</option>
            <option value="BANK_TRANSFER">Bank transfer</option>
            <option value="USSD">USSD</option>
            <option value="CASH">Cash</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <p className="text-sm text-black/50">
          Loading payments...
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600">
          {error.message}
        </p>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <DataTable
          columns={columns}
          rows={payments}
          emptyLabel="No payments found"
          onRowClick={(payment) => {
            if (payment.id) {
              navigate(`/payments/${payment.id}`);
            }
          }}
        />
      )}
    </div>
  );
}