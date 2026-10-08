import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  PageHeader,
  Badge,
  Card,
} from "../components/ui.jsx";
import { getSuperAdminPaymentDetails   } from "../lib/api";
import {
  ArrowLeft,
  CreditCard,
  User,
  FileText,
  CalendarDays,
  Hash,
} from "lucide-react";

function getApplicantName(payment) {
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

function getAmount(payment) {
  const amount =
    payment.amount ??
    payment.payment_amount ??
    payment.total_amount ??
    0;

  return Number(amount) || 0;
}

function formatAmount(payment) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: payment.currency ?? "NGN",
    maximumFractionDigits: 2,
  }).format(getAmount(payment));
}

function formatDate(date, includeTime = false) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString(undefined, {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" } : {}),
  });
}

function getStatus(payment) {
  return (
    payment.status ??
    payment.payment_status ??
    payment.transaction_status ??
    "UNKNOWN"
  );
}

function getMethod(payment) {
  return (
    payment.payment_method ??
    payment.method ??
    payment.channel ??
    "—"
  );
}

export default function PaymentDetails() {
  const { paymentId } = useParams();
  const navigate = useNavigate();

  const {
    data: payment,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-payment-details", paymentId],
    queryFn: async () => {
      const response = await getAdminPaymentDetails(paymentId);

      return response?.data ?? response ?? {};
    },
    enabled: Boolean(paymentId),
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div>
        <p className="text-sm text-black/50">
          Loading payment...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <button
          onClick={() => navigate("/payments")}
          className="inline-flex items-center gap-2 text-sm text-black/50 hover:text-black mb-5"
        >
          <ArrowLeft size={16} />
          Back to payments
        </button>

        <p className="text-sm text-red-600">
          {error.message}
        </p>
      </div>
    );
  }

  if (!payment) {
    return (
      <div>
        <p className="text-sm text-black/50">
          Payment not found.
        </p>
      </div>
    );
  }

  const status = getStatus(payment);

  const paymentReference =
    payment.reference ??
    payment.payment_reference ??
    payment.transaction_reference ??
    payment.transaction_id ??
    payment.id ??
    "—";

  const applicationNumber =
    payment.application_number ??
    payment.application?.application_number ??
    "—";

  const createdAt =
    payment.created_at ??
    payment.payment_date ??
    payment.date;

  const paidAt =
    payment.paid_at ??
    payment.completed_at ??
    payment.successful_at;

  return (
    <div>
      <button
        onClick={() => navigate("/payments")}
        className="inline-flex items-center gap-2 text-sm text-black/50 hover:text-black mb-5 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to payments
      </button>

      <PageHeader
        eyebrow="Payment details"
        title={paymentReference}
        description="Transaction information associated with this application payment."
      />

      {/* Main summary */}
      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-black/35 mb-2">
              Amount
            </p>

            <p className="text-3xl font-semibold text-[#14263F]">
              {formatAmount(payment)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge>{status}</Badge>
          </div>
        </div>
      </Card>

      {/* Transaction information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-black/[0.04] flex items-center justify-center">
              <CreditCard size={18} className="text-black/60" />
            </div>

            <div>
              <h2 className="font-semibold text-black">
                Transaction
              </h2>

              <p className="text-xs text-black/40">
                Payment information
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <DetailRow
              icon={Hash}
              label="Payment reference"
              value={paymentReference}
            />

            <DetailRow
              icon={CreditCard}
              label="Payment method"
              value={getMethod(payment)}
            />

            <DetailRow
              icon={CalendarDays}
              label="Created"
              value={formatDate(createdAt, true)}
            />

            <DetailRow
              icon={CalendarDays}
              label="Paid"
              value={formatDate(paidAt, true)}
            />
          </div>
        </Card>

        {/* Applicant */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-black/[0.04] flex items-center justify-center">
              <User size={18} className="text-black/60" />
            </div>

            <div>
              <h2 className="font-semibold text-black">
                Applicant
              </h2>

              <p className="text-xs text-black/40">
                Person associated with the transaction
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <DetailRow
              icon={User}
              label="Name"
              value={getApplicantName(payment)}
            />

            <DetailRow
              icon={FileText}
              label="Application"
              value={applicationNumber}
            />

            <DetailRow
              icon={Hash}
              label="Application ID"
              value={
                payment.application_id ??
                payment.application?.id ??
                "—"
              }
            />

            <DetailRow
              icon={User}
              label="Email"
              value={
                payment.email ??
                payment.applicant?.email ??
                "—"
              }
            />
          </div>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-black/[0.04] flex items-center justify-center">
            <CalendarDays
              size={18}
              className="text-black/60"
            />
          </div>

          <div>
            <h2 className="font-semibold text-black">
              Payment timeline
            </h2>

            <p className="text-xs text-black/40">
              Recorded transaction events
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <TimelineItem
            title="Payment created"
            date={createdAt}
          />

          {paidAt && (
            <TimelineItem
              title="Payment completed"
              date={paidAt}
            />
          )}

          {payment.refunded_at && (
            <TimelineItem
              title="Payment refunded"
              date={payment.refunded_at}
            />
          )}
        </div>
      </Card>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon
        size={15}
        className="text-black/30 mt-0.5 shrink-0"
      />

      <div className="min-w-0">
        <p className="text-xs text-black/40 mb-1">
          {label}
        </p>

        <p className="text-sm text-black break-words">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function TimelineItem({ title, date }) {
  return (
    <div className="flex gap-4">
      <div className="relative flex flex-col items-center">
        <div className="w-2.5 h-2.5 rounded-full bg-[#14263F] mt-1.5" />
        <div className="w-px h-full bg-black/[0.08] mt-2" />
      </div>

      <div className="pb-4">
        <p className="text-sm font-medium text-black">
          {title}
        </p>

        <p className="text-xs text-black/40 mt-1">
          {formatDate(date, true)}
        </p>
      </div>
    </div>
  );
}