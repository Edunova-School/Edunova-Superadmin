import React from "react";
import { X } from "lucide-react";

/* ---------------------------------------------------------------------- */
/* PageHeader — every page opens with this: eyebrow, title, optional CTA  */
/* ---------------------------------------------------------------------- */
export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
      <div>
        {eyebrow && (
          <p className="font-mono text-[11px] tracking-[0.14em] text-gold uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="font-serif font-semibold text-black text-[1.7rem] md:text-[2rem] leading-[1.1] mt-2">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-black/45 mt-2 max-w-xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Badge — status pill. Color derives from a status→tone map.             */
/* ---------------------------------------------------------------------- */
const TONE_MAP = {
  // greens
  active: "good",
  operational: "good",
  verified: "good",
  successful: "good",
  approved: "good",
  admitted: "good",
  recommend: "good",
  open: "good",
  // ambers
  pending: "warn",
  "pending review": "warn",
  degraded: "warn",
  draft: "warn",
  "needs documents": "warn",
  "under review": "warn",
  "not decided": "warn",
  hold: "warn",
  "pending finalization": "warn",
  submitted: "warn",
  // reds
  suspended: "bad",
  disabled: "bad",
  rejected: "bad",
  refunded: "bad",
  failed: "bad",
  down: "bad",
  closed: "bad",
  "not started": "bad",
};

const TONE_STYLES = {
  good: "bg-signal-good/10 text-signal-good",
  warn: "bg-gold/10 text-gold-dark",
  bad: "bg-signal-bad/10 text-signal-bad",
  neutral: "bg-black/5 text-black/50",
};

export function Badge({ children, tone }) {
  const key = String(children).trim().toLowerCase();
  const resolvedTone = tone || TONE_MAP[key] || "neutral";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${TONE_STYLES[resolvedTone]}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          resolvedTone === "good"
            ? "bg-signal-good"
            : resolvedTone === "warn"
            ? "bg-gold"
            : resolvedTone === "bad"
            ? "bg-signal-bad"
            : "bg-black/30"
        }`}
      />
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------------- */
/* Card / SectionCard — the base white surface used across the app        */
/* ---------------------------------------------------------------------- */
export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-black/5 shadow-card ${className}`}>
      {children}
    </div>
  );
}

export function SectionCard({ title, description, action, children, className = "" }) {
  return (
    <Card className={`p-6 ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            {title && <h3 className="font-serif font-semibold text-base text-black">{title}</h3>}
            {description && <p className="text-sm text-black/45 mt-1 leading-relaxed">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </Card>
  );
}

/* ---------------------------------------------------------------------- */
/* StatCard — a compact metric tile for overview-style grids               */
/* ---------------------------------------------------------------------- */
export function StatCard({ label, value, change, icon: Icon }) {
  const positive = typeof change === "string" && change.trim().startsWith("+");
  const negativeGood = typeof change === "string" && change.trim().startsWith("-") && /time|days/i.test(label);
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs text-black/40">{label}</p>
        {Icon && <Icon size={16} strokeWidth={1.6} className="text-black/25" />}
      </div>
      <p className="font-serif font-semibold text-black text-[1.7rem] mt-2 leading-none">{value}</p>
      {change && (
        <p
          className={`text-xs mt-2 font-medium ${
            positive || negativeGood ? "text-signal-good" : "text-black/40"
          }`}
        >
          {change} vs last session
        </p>
      )}
    </Card>
  );
}

/* ---------------------------------------------------------------------- */
/* Toggle — accessible switch used across settings pages                  */
/* ---------------------------------------------------------------------- */
export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full shrink-0 transition-colors duration-200 ${
        checked ? "bg-navy-800" : "bg-black/15"
      }`}
    >
      <span
        className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-[4px]"
        }`}
      />
    </button>
  );
}

/* ---------------------------------------------------------------------- */
/* Check / Cross indicator for permission grids                            */
/* ---------------------------------------------------------------------- */
export function PermissionMark({ granted }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-semibold ${
        granted ? "bg-signal-good/10 text-signal-good" : "bg-black/5 text-black/25"
      }`}
      aria-label={granted ? "Granted" : "Not granted"}
    >
      {granted ? "✓" : "✕"}
    </span>
  );
}

/* ---------------------------------------------------------------------- */
/* EmptyState                                                              */
/* ---------------------------------------------------------------------- */
export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6">
      {Icon && (
        <div className="w-11 h-11 rounded-full bg-black/5 flex items-center justify-center mb-4">
          <Icon size={18} strokeWidth={1.6} className="text-black/35" />
        </div>
      )}
      <p className="font-serif font-semibold text-black text-base">{title}</p>
      {description && <p className="text-sm text-black/40 mt-1.5 max-w-xs">{description}</p>}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Button variants — kept minimal and consistent                          */
/* ---------------------------------------------------------------------- */
export function Button({ children, variant = "primary", size = "md", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = {
    sm: "text-xs px-3.5 py-2",
    md: "text-sm px-5 py-2.5",
  };
  const variants = {
    primary: "bg-navy-900 text-white hover:bg-navy-800",
    gold: "bg-gold text-navy-950 hover:bg-gold-dark hover:text-white",
    ghost: "bg-transparent text-black/55 hover:text-black hover:bg-black/5",
    outline: "border border-black/10 text-black hover:bg-black/[0.03]",
    danger: "bg-signal-bad/10 text-signal-bad hover:bg-signal-bad hover:text-white",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------------- */
/* Field — labeled form control wrapper for settings pages                */
/* ---------------------------------------------------------------------- */
export function Field({ label, hint, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-black/55">{label}</span>
      {children}
      {hint && <span className="text-xs text-black/35">{hint}</span>}
    </label>
  );
}

/* ---------------------------------------------------------------------- */
/* Modal — simple centered dialog for create/confirm flows                 */
/* ---------------------------------------------------------------------- */
export function Modal({ open, onClose, title, description, children, footer, width = "max-w-md" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div className={`relative w-full ${width} bg-white rounded-2xl shadow-xl border border-black/5 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <div>
            <h3 className="font-serif font-semibold text-lg text-black">{title}</h3>
            {description && <p className="text-sm text-black/45 mt-1 leading-relaxed">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-black/40 hover:bg-black/5 shrink-0"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-6 pb-6">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-black/[0.06] flex items-center justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

export function TextInput(props) {
  return (
    <input
      {...props}
      className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-black/30 focus:border-navy-800 transition-colors"
    />
  );
}

export function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm text-black focus:border-navy-800 transition-colors"
    >
      {children}
    </select>
  );
}

/* ---------------------------------------------------------------------- */
/* Menu — small anchored action menu (used for row-level admin actions)   */
/* ---------------------------------------------------------------------- */
export function ActionMenu({ trigger, items }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="w-8 h-8 rounded-full flex items-center justify-center text-black/40 hover:bg-black/5 hover:text-black transition-colors"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {trigger}
      </button>
      {open && (
        <div
          className="absolute right-0 mt-1 w-52 bg-white rounded-xl border border-black/[0.06] shadow-lg py-1.5 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item, i) =>
            item.divider ? (
              <div key={i} className="h-px bg-black/[0.06] my-1.5" />
            ) : (
              <button
                key={i}
                onClick={() => {
                  item.onClick && item.onClick();
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2.5 transition-colors ${
                  item.danger ? "text-signal-bad hover:bg-signal-bad/5" : "text-black/70 hover:bg-black/[0.04]"
                }`}
              >
                {item.icon && <item.icon size={14} strokeWidth={1.8} />}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
