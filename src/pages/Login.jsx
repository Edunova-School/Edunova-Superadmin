import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, ArrowRight, TriangleAlert } from "lucide-react";
import { login } from "../lib/api";
import { Field, TextInput, Button } from "../components/ui.jsx";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Enter both an email address and a password to continue.");
      return;
    }

    setSubmitting(true);

try {
  await login(email.trim(), password);
  navigate(from, { replace: true });
} catch (error) {
  console.error("Login failed:", error);
  setError(error.message || "Unable to sign in. Please check your credentials.");
} finally {
  setSubmitting(false);
}
  }

  return (
    <div className="min-h-screen w-full flex bg-canvas">
      {/* Left: brand panel */}
      <div className="hidden lg:flex lg:w-[46%] relative bg-gradient-to-br from-navy-950 via-navy-800 to-navy-700 overflow-hidden">
        <svg className="absolute -right-16 -top-16 opacity-[0.12]" width="320" height="320" viewBox="0 0 320 320" fill="none">
          <circle cx="160" cy="160" r="158" stroke="#B8901F" strokeWidth="1" />
          <circle cx="160" cy="160" r="128" stroke="#B8901F" strokeWidth="1" />
          <circle cx="160" cy="160" r="98" stroke="#B8901F" strokeWidth="1" />
        </svg>

        <div className="relative flex flex-col justify-between p-12 xl:p-16 text-white w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center">
              <span className="font-serif font-semibold text-gold text-sm">E</span>
            </div>
            <span className="font-serif font-semibold text-lg">EduNova</span>
          </div>

          <div>
            <p className="font-mono text-[11px] tracking-[0.14em] text-gold uppercase mb-3">
              Superadmin Portal
            </p>
            <h1 className="font-serif font-semibold text-[2.2rem] xl:text-[2.6rem] leading-[1.1] max-w-md">
              Platform control, in one place.
            </h1>
            <p className="text-sm text-white/50 mt-4 max-w-sm leading-relaxed">
              Manage admins, roles, academic structure, and platform security
              across the entire EduNova admissions system.
            </p>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-white/40">
            <ShieldCheck size={15} strokeWidth={1.6} />
            Access is logged and audited for every session.
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-lg bg-navy-900/10 border border-navy-900/15 flex items-center justify-center">
              <span className="font-serif font-semibold text-navy-900 text-sm">E</span>
            </div>
            <span className="font-serif font-semibold text-lg text-black">EduNova</span>
          </div>

          <p className="font-mono text-[11px] tracking-[0.14em] text-gold uppercase">
            Superadmin
          </p>
          <h2 className="font-serif font-semibold text-black text-[1.7rem] mt-2 leading-tight">
            Sign in to your account
          </h2>
          <p className="text-sm text-black/45 mt-2 leading-relaxed">
           Sign in with your EduNova account.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
            <Field label="Email address">
              <TextInput
                type="email"
                placeholder="superadmin@edunova.edu.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </Field>

            <Field label="Password">
              <TextInput
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </Field>

            <div className="flex items-center justify-between -mt-1">
              <label className="flex items-center gap-2 text-xs text-black/45">
                <input type="checkbox" className="rounded border-black/20 accent-navy-900" defaultChecked />
                Keep me signed in
              </label>
              <button type="button" className="text-xs text-black/45 hover:text-black transition-colors">
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-lg bg-signal-bad/[0.06] text-signal-bad text-xs">
                <TriangleAlert size={14} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full mt-2" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
              {!submitting && <ArrowRight size={15} />}
            </Button>
          </form>

          <p className="text-xs text-black/35 mt-8 text-center">
            Trouble signing in? Contact your platform administrator.
          </p>
        </div>
      </div>
    </div>
  );
}