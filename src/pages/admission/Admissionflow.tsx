import { register, login,  updateProfile, verifyEmail  } from "../../lib/api"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
    ChevronLeft, ChevronRight, Building2, GraduationCap, Clock, Layers, Award,
    CheckCircle2, FileText, Eye, EyeOff, Sparkles, Copy, Check, KeyRound,
    UserPlus, LogIn, UserCheck, UserPlus2, ClipboardCheck, FileCheck2, ArrowRight, UserRound, Bell, Clock3, CircleCheck, CircleDot, LockKeyhole,
} from "lucide-react"
import logo from "../../assets/edunova-logo.webp"
import { useApplication } from "./ApplicationContext"
import { trackConfigs } from "./trackconfig"
import type { Track } from "./trackconfig"

type Step =
    | "entry" | "login" | "faculty" | "department" | "programme" | "requirements"
    | "applicantType" | "eduNovaLookup" | "account" | "verify" | "created" | "dashboard"

const flowOrder: Step[] = ["entry", "faculty", "department", "programme", "requirements", "applicantType", "account", "created"]
function BackButton({ onClick, label = "Back" }: { onClick: () => void; label?: string }) {
    return (
        <button onClick={onClick} className="flex items-center gap-1.5 text-sm text-black/50 hover:text-[#1E3A8A] transition-colors w-fit">
            <ChevronLeft size={16} /> {label}
        </button>
    )
}

function Breadcrumb({ items }: { items: string[] }) {
    return (
        <p className="text-xs text-black/40">
            {items.map((item, i) => (
                <span key={i}>
                    {i > 0 && <span className="mx-1.5">/</span>}
                    <span className={i === items.length - 1 ? "text-[#1E3A8A] font-medium" : ""}>{item}</span>
                </span>
            ))}
        </p>
    )
}

export default function AdmissionFlow() {
    const { track: trackParam } = useParams<{ track: string }>()
    const track = (trackParam ?? "undergraduate") as Track
    const config = trackConfigs[track]

    const navigate = useNavigate()
    const {
    data,
    setTrack,
    setSelection,
    setApplicantType,
    prefillFromEduNovaRecord,
    setAccountCreated,
    progressPercent,
    isPersonalComplete,
    isEducationComplete,
    refreshProfile,
} = useApplication()

    const [step, setStep] = useState<Step>("entry")
    const [faculty, setFaculty] = useState("")
    const [department, setDepartment] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [studentIdInput, setStudentIdInput] = useState("")
    const [lookupError, setLookupError] = useState("")

    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "" })
    const [loginForm, setLoginForm] = useState({ LogEmail: "", password: "" })
    const [loginError, setLoginError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [accountError, setAccountError] = useState("")
    const [otp, setOtp] = useState("")
const [verifyError, setVerifyError] = useState("")
    const programme = department ? config.programmesByDept[department] ?? null : null
    console.log("TRACK:", track)
console.log("DEPARTMENT:", department)
console.log("CONFIG PROGRAMME:", config.programmesByDept[department])

    useEffect(() => {
    if (data.track !== track) setTrack(track)
    }, [track, data.track, setTrack])

    const goBack = () => {
        const idx = flowOrder.indexOf(step)
        if (idx > 0) {
            let prevStep = flowOrder[idx - 1]
            if (prevStep === "requirements" && !config.hasApplicantTypeStep) {
            }
            setStep(prevStep)
        } else {
            setStep("entry")
        }
    }
    const canCreateAccount = form.firstName && form.lastName && form.email && form.phone && form.password.length >= 6 && form.password === form.confirmPassword
    const afterProgrammeContinue = () => {
        setSelection(faculty, department, programme?.title ?? "")
        setStep(config.hasApplicantTypeStep ? "applicantType" : "requirements")
    }

    const handleEduNovaLookup = () => {
        if (!studentIdInput.trim()) { setLookupError("Enter your EduNova Student ID to continue."); return }
        setLookupError("")
        prefillFromEduNovaRecord(studentIdInput.trim())
        setStep("created")
    }

    const handleLogin = async () => {
    if (!loginForm.LogEmail.trim() || !loginForm.password.trim()) {
        setLoginError("Enter your application number/email and password to continue.")
        return
    }
    setLoginError("")
    setIsSubmitting(true)
   try {
    await login(loginForm.LogEmail, loginForm.password)
    await refreshProfile()
    setStep("dashboard")
    } catch (err) {
        setLoginError(err instanceof Error ? err.message : "Invalid credentials. Please try again.")
    } finally {
        setIsSubmitting(false)
    }
    }

const handleCreateAccount = async () => {
  console.log("CREATE ACCOUNT CLICKED")

  setAccountError("")
  setIsSubmitting(true)

  try {
    console.log("BEFORE REGISTER")
console.log("PROGRAMME OBJECT:", programme)
console.log("PROGRAMME TITLE BEING SENT:", programme?.title)
    await register({
  first_name: form.firstName,
  last_name: form.lastName,
  phone_number: form.phone,
  email: form.email,
  password: form.password,
  programme_name: programme?.title ?? "",
})

    console.log("REGISTER SUCCESS")

    await login(form.email, form.password)

    console.log("LOGIN SUCCESS")
    console.log("SELECTED PROGRAMME:", programme)
    console.log("PROGRAMME NAME:", programme?.title)

    setSelection(faculty, department, programme?.title ?? "")
    setAccountCreated(
      `${form.firstName} ${form.lastName}`.trim(),
      form.email
    )
    setStep("verify")
  } catch (err) {
    console.error("CREATE ACCOUNT ERROR:", err)

    setAccountError(
      err instanceof Error
        ? err.message
        : "Something went wrong. Please try again."
    )
  } finally {
    setIsSubmitting(false)
  }
}
const handleVerifyContinue = async () => {
  setVerifyError("")
  setIsSubmitting(true)

  try {
    await verifyEmail(form.email, otp)

    setStep("created")
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err)
    setVerifyError(
      err instanceof Error
        ? err.message
        : "Invalid or expired OTP. Please try again."
    )
  } finally {
    setIsSubmitting(false)
  }
}
const getNextApplicationStep = () => {
    if (!isPersonalComplete) {
        return "personal-information"
    }

    if (!isEducationComplete(config.educationMode)) {
        return "education"
    }

    if (!data.documents.primaryResult || !data.documents.passportPhoto || !data.documents.idDocument) {
        return "documents"
    }

    return "review"
}
    return (
        <div className="min-h-screen bg-[#F6F6F2]">
            {step !== "dashboard" && (
                <div className="relative bg-gradient-to-br from-[#0B1524] via-[#14263F] to-[#1E3A8A] overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#B8901F]/20 rounded-full blur-3xl" />
                    <div className="relative px-4 md:px-8 py-10 max-w-2xl mx-auto text-center flex flex-col items-center">
                        <img src={logo} alt="EduNova" className="h-9 w-auto mb-5 opacity-90" />
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs tracking-[0.2em] uppercase text-[#B8901F] mb-3">
                            <Sparkles size={13} /> {config.heroLabel}
                        </span>
                        <div className="font-serif text-white text-2xl md:text-3xl font-semibold leading-snug">
                            {step === "entry" && "Let's get started"}
                            {step === "login" && "Welcome back"}
                            {step === "faculty" && "Select the faculty offering your intended programme."}
                            {step === "department" && "Select your department."}
                            {step === "programme" && `Available ${config.label} Programmes`}
                            {step === "requirements" && programme?.title}
                            {step === "applicantType" && "Tell us about your background"}
                            {step === "eduNovaLookup" && "Welcome back, EduNova graduate"}
                            {step === "verify" && (
    <div className="bg-white rounded-3xl border border-black/5 p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center mx-auto mb-5">
            <KeyRound size={26} strokeWidth={1.75} className="text-[#1E3A8A]" />
        </div>

        <h2 className="font-serif text-2xl font-semibold text-black mb-2">
            Verify Your Email
        </h2>

        <p className="text-sm text-black/55 mb-6 max-w-sm mx-auto">
            We've sent a verification code to{" "}
            <span className="font-medium text-black">{form.email}</span>.
            Enter the OTP below to verify your account.
        </p>

        <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter 6-digit OTP"
            className="w-full border border-black/15 rounded-xl px-4 py-3 text-center text-lg text-black placeholder:text-black/30 tracking-[0.4em] focus:outline-none focus:border-[#1E3A8A] mb-4"
        />

        {verifyError && (
            <p className="text-xs text-red-500 mb-3">
                {verifyError}
            </p>
        )}

        <button
            onClick={handleVerifyContinue}
            disabled={otp.length !== 6 || isSubmitting}
            className="w-full bg-[#14263F] text-white text-sm font-semibold px-8 py-3.5 rounded-xl hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 disabled:opacity-40"
        >
            {isSubmitting ? "Verifying..." : "Verify Email"}
        </button>
    </div>
)}
                            {(step === "account" || step === "created") && "Create Your Application Account"}
                        </div>
                    </div>
                </div>
            )}
            <div className="px-4 md:px-8 py-8 max-w-2xl mx-auto flex flex-col gap-5">

                {/* Entry */}
                {step === "entry" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        <button onClick={() => setStep("faculty")} className="group flex flex-col items-start gap-3 bg-white rounded-2xl border border-black/5 p-6 text-left hover:border-[#1E3A8A]/30 hover:shadow-md transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl bg-[#1E3A8A]/8 flex items-center justify-center">
                                <UserPlus size={22} strokeWidth={1.5} className="text-[#1E3A8A]" />
                            </div>
                            <div>
                                <p className="font-serif font-semibold text-black">Start New Application</p>
                                <p className="text-xs text-black/50 mt-1">Choose your programme and create an application account.</p>
                            </div>
                        </button>
                        <button onClick={() => setStep("login")} className="group flex flex-col items-start gap-3 bg-white rounded-2xl border border-black/5 p-6 text-left hover:border-[#B8901F]/40 hover:shadow-md transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl bg-[#B8901F]/10 flex items-center justify-center">
                                <LogIn size={22} strokeWidth={1.5} className="text-[#B8901F]" />
                            </div>
                            <div>
                                <p className="font-serif font-semibold text-black">Continue Application</p>
                                <p className="text-xs text-black/50 mt-1">Log in to pick up where you left off.</p>
                            </div>
                        </button>
                    </div>
                )}

                {/* Login */}
                {step === "login" && (
                    <>
                        <BackButton onClick={() => setStep("entry")} />
                        <div className="bg-white rounded-2xl border border-black/5 p-7 flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="font-mono text-xs tracking-wide uppercase text-black/50">Email</label>
                                <input value={loginForm.LogEmail} onChange={(e) => setLoginForm({ ...loginForm, LogEmail: e.target.value })} className="border border-black/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1E3A8A] transition-colors" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-mono text-xs tracking-wide uppercase text-black/50">Password</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full border border-black/15 rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none focus:border-[#1E3A8A] transition-colors" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            {loginError && <p className="text-xs text-red-500">{loginError}</p>}
                            <button onClick={handleLogin} disabled={isSubmitting} className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#14263F] to-[#1E3A8A] text-white text-sm font-semibold py-3.5 rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 mt-1">
                                <KeyRound size={16} /> {isSubmitting ? "Logging in..." : "Continue Application"}
                            </button>
                        </div>
                    </>
                )}

                {/* Faculty */}
                {step === "faculty" && (
                    <>
                        <BackButton onClick={goBack} label="Back to start" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {config.faculties.map((f, i) => (
                                <button key={i} onClick={() => { setFaculty(f); setStep("department") }} className="group flex items-center gap-4 bg-white rounded-2xl border border-black/5 p-5 text-left hover:border-[#1E3A8A]/30 hover:shadow-md transition-all duration-300">
                                    <div className="w-11 h-11 rounded-full bg-[#1E3A8A]/8 flex items-center justify-center flex-shrink-0">
                                        <Building2 size={20} strokeWidth={1.5} className="text-[#1E3A8A]" />
                                    </div>
                                    <span className="text-sm font-medium text-black/80 group-hover:text-[#1E3A8A] transition-colors">{f}</span>
                                    <ChevronRight size={16} className="ml-auto text-black/20 group-hover:text-[#1E3A8A] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* Department */}
                {step === "department" && (
                    <>
                        <BackButton onClick={goBack} />
                        <Breadcrumb items={[config.label, faculty]} />
                        <div className="flex flex-col gap-3">
                            {(config.departmentsByFaculty[faculty] ?? []).map((d, i) => (
                                <button key={i} onClick={() => { setDepartment(d); setStep("programme") }} className="group flex items-center justify-between bg-white rounded-xl border border-black/5 px-5 py-4 text-left hover:border-[#1E3A8A]/30 hover:shadow-sm transition-all duration-300">
                                    <span className="text-sm font-medium text-black/80 group-hover:text-[#1E3A8A] transition-colors">{d}</span>
                                    <ChevronRight size={16} className="text-black/20 group-hover:text-[#1E3A8A] group-hover:translate-x-0.5 transition-all" />
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* Programme */}
                {step === "programme" && programme && (
                    <>
                        <BackButton onClick={goBack} />
                        <Breadcrumb items={[config.label, faculty, department]} />
                        <div className="bg-white rounded-2xl border border-black/5 p-7">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-[#1E3A8A]/8 flex items-center justify-center flex-shrink-0">
                                    <GraduationCap size={26} strokeWidth={1.5} className="text-[#1E3A8A]" />
                                </div>
                                <h3 className="font-serif text-xl font-semibold text-black">{programme.title}</h3>
                            </div>
                            <div className="grid grid-cols-3 gap-4 pt-5 border-t border-black/5">
                                <div>
                                    <Clock size={16} strokeWidth={1.75} className="text-black/30 mb-1.5" />
                                    <p className="font-mono text-[10px] tracking-wide uppercase text-black/40">Duration</p>
                                    <p className="text-sm font-medium text-black mt-0.5">{programme.duration}</p>
                                </div>
                                <div>
                                    <Layers size={16} strokeWidth={1.75} className="text-black/30 mb-1.5" />
                                    <p className="font-mono text-[10px] tracking-wide uppercase text-black/40">Mode</p>
                                    <p className="text-sm font-medium text-black mt-0.5">{programme.mode}</p>
                                </div>
                                <div>
                                    <Award size={16} strokeWidth={1.75} className="text-black/30 mb-1.5" />
                                    <p className="font-mono text-[10px] tracking-wide uppercase text-black/40">Qualification</p>
                                    <p className="text-sm font-medium text-black mt-0.5">{programme.qualification}</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={afterProgrammeContinue} className="self-end bg-[#14263F] text-white text-sm font-semibold px-7 py-3 rounded-xl hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                            Continue
                        </button>
                    </>
                )}
                {step === "requirements" && programme && (
                    <>
                        <BackButton onClick={goBack} />
                        <Breadcrumb items={[config.label, faculty, department, "Requirements"]} />
                        <div className="bg-white rounded-2xl border border-black/5 p-7 flex flex-col gap-6">
                            <div>
                                <p className="font-mono text-xs tracking-widest uppercase text-[#B8901F] mb-3">General Requirements</p>
                                <div className="flex flex-col gap-2.5">
                                    {config.generalRequirements.map((r, i) => (
                                        <div key={i} className="flex items-start gap-2.5">
                                            <CheckCircle2 size={16} strokeWidth={2} className="text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-black/70">{r}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-5 border-t border-black/5">
                                <p className="font-mono text-xs tracking-widest uppercase text-[#B8901F] mb-3">Application Requirements</p>
                                <div className="flex flex-col gap-2.5">
                                    {config.applicationRequirements.map((r, i) => (
                                        <div key={i} className="flex items-start gap-2.5">
                                            <FileText size={16} strokeWidth={1.75} className="text-[#1E3A8A] mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-black/70">{r}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-[#14263F] to-[#1E3A8A] rounded-2xl p-7 text-center">
                            <p className="font-serif text-white text-lg font-semibold mb-4">Ready to begin your application?</p>
                            <button onClick={() => setStep("account")} className="bg-[#B8901F] text-[#14263F] text-sm font-semibold px-7 py-3.5 rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
                                Create Application Account
                            </button>
                        </div>
                    </>
                )}
                {step === "applicantType" && (
                    <>
                        <BackButton onClick={goBack} />
                        <p className="text-sm text-black/55 -mt-2">Did you complete your undergraduate degree at EduNova University?</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button onClick={() => { setApplicantType("eduNovaGraduate"); setStep("eduNovaLookup") }} className="group flex flex-col items-start gap-3 bg-white rounded-2xl border border-black/5 p-6 text-left hover:border-[#1E3A8A]/30 hover:shadow-md transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-[#1E3A8A]/8 flex items-center justify-center">
                                    <UserCheck size={22} strokeWidth={1.5} className="text-[#1E3A8A]" />
                                </div>
                                <div>
                                    <p className="font-serif font-semibold text-black">Yes, I'm an EduNova Graduate</p>
                                    <p className="text-xs text-black/50 mt-1">We'll pull up your academic record to save you time.</p>
                                </div>
                            </button>
                            <button onClick={() => { setApplicantType("external"); setStep("account") }} className="group flex flex-col items-start gap-3 bg-white rounded-2xl border border-black/5 p-6 text-left hover:border-[#B8901F]/40 hover:shadow-md transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-[#B8901F]/10 flex items-center justify-center">
                                    <UserPlus2 size={22} strokeWidth={1.5} className="text-[#B8901F]" />
                                </div>
                                <div>
                                    <p className="font-serif font-semibold text-black">No, From Another Institution</p>
                                    <p className="text-xs text-black/50 mt-1">Create a new applicant account to continue.</p>
                                </div>
                            </button>
                        </div>
                    </>
                )}
                {step === "eduNovaLookup" && (
                    <>
                        <BackButton onClick={() => setStep("applicantType")} />
                        <div className="bg-white rounded-2xl border border-black/5 p-7 flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="font-mono text-xs tracking-wide uppercase text-black/50">EduNova Student ID</label>
                                <input value={studentIdInput} onChange={(e) => setStudentIdInput(e.target.value)} placeholder="EDU/2026/UG/001245" className="border border-black/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1E3A8A] transition-colors" />
                            </div>
                            {lookupError && <p className="text-xs text-red-500">{lookupError}</p>}
                            <button onClick={handleEduNovaLookup} className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#14263F] to-[#1E3A8A] text-white text-sm font-semibold py-3.5 rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
                                <KeyRound size={16} /> Find My Record
                            </button>
                        </div>
                    </>
                )}
                {step === "account" && (
                    <>
                        <BackButton onClick={goBack} />
                        <div className="bg-white rounded-2xl border border-black/5 p-7">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <input placeholder="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="border border-black/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1E3A8A]" />
                                <input placeholder="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="border border-black/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1E3A8A]" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <input placeholder="Email Address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border border-black/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1E3A8A]" />
                                <input placeholder="Phone Number" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border border-black/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1E3A8A]" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <div className="relative">
                                    <input placeholder="Password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border border-black/15 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-[#1E3A8A]" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <input placeholder="Confirm Password" type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="border border-black/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1E3A8A]" />
                            </div>
                            {accountError && <p className="text-xs text-red-500 mb-3">{accountError}</p>}
                            <button onClick={handleCreateAccount} disabled={!canCreateAccount || isSubmitting} className="w-full bg-gradient-to-r from-[#14263F] to-[#1E3A8A] text-white text-sm font-semibold py-3.5 rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 disabled:opacity-40">
                                {isSubmitting ? "Creating account..." : "Create Account"}
                            </button>
                        </div>
                    </>
                )}
                {step === "created" && (
                    <div className="bg-white rounded-3xl border border-black/5 p-10 text-center">
                        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
                            <CheckCircle2 size={30} strokeWidth={1.75} className="text-green-600" />
                        </div>
                        {data.isEduNovaGraduate ? (
                            <>
                                <h2 className="font-serif text-2xl font-semibold text-black mb-2">Record Found</h2>
                                <p className="text-sm text-black/55 mb-6 max-w-sm mx-auto">
                                    We've found your EduNova academic record. Some information has been filled in for you — review it before continuing.
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="font-serif text-2xl font-semibold text-black mb-2">Account Created</h2>
                                <p className="text-sm text-black/55 mb-6">Your application number has been generated. Keep it safe.</p>
                            </>
                        )}
                        <button onClick={() => setStep("dashboard")} className="bg-[#14263F] text-white text-sm font-semibold px-8 py-3.5 rounded-xl hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                            Go to Applicant Dashboard
                        </button>
                    </div>
                )}
                {step === "dashboard" && (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pt-4 pb-10">

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#B8901F] mb-2">
                    Applicant Portal
                </p>

                <h1 className="font-serif text-2xl md:text-3xl font-semibold text-black">
                    Welcome, {data.applicantName || "Applicant"}
                </h1>

                <p className="text-sm text-black/50 mt-1">
                    Here's the current status of your application.
                </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-black/45">
                <LockKeyhole size={14} />
                Your application information is read-only
            </div>
        </div>

        {/* Application Overview */}
        <div className="bg-gradient-to-br from-[#0B1524] via-[#14263F] to-[#1E3A8A] rounded-3xl p-6 md:p-8 text-white overflow-hidden relative">

            <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#B8901F]/15 rounded-full blur-3xl" />

            <div className="relative">

                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                            <GraduationCap
                                size={23}
                                strokeWidth={1.5}
                                className="text-[#B8901F]"
                            />
                        </div>

                        <div>
                            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/45 mb-1">
                                {config.label} Application
                            </p>

                            <h2 className="font-serif text-xl md:text-2xl font-semibold">
                                {data.programmeTitle || "Programme not selected"}
                            </h2>

                            <p className="text-sm text-white/55 mt-1">
                                {data.department || "Department"} · 2026/2027
                            </p>
                        </div>
                    </div>

                    <div className="self-start inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B8901F]" />

                        <span className="font-mono text-[10px] tracking-wide uppercase text-white/70">
                            {data.submitted ? "Submitted" : "In Progress"}
                        </span>
                    </div>

                </div>

                {/* Application Number */}
                <div className="mt-7 pt-5 border-t border-white/10">
                    <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-white/40">
                        Application Number
                    </p>

                    <p className="font-mono text-sm text-white mt-1">
                        {data.applicationNumber || "—"}
                    </p>
                </div>

                {/* Progress */}
                <div className="mt-7">

                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-white/75">
                            Application Progress
                        </p>

                        <p className="text-sm font-semibold text-[#B8901F]">
                            {progressPercent(config.educationMode)}%
                        </p>
                    </div>

                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                            className="h-full bg-[#B8901F] rounded-full transition-all duration-500"
                            style={{
                                width: `${progressPercent(config.educationMode)}%`
                            }}
                        />
                    </div>

                </div>

                {/* Continue */}
                {!data.submitted && (
                    <button
                        onClick={() =>
                            navigate(
                                `/admission/apply/${track}/${getNextApplicationStep()}`
                            )
                        }
                        className="mt-6 w-full md:w-auto inline-flex items-center justify-center gap-2 bg-[#B8901F] text-[#14263F] text-sm font-semibold px-6 py-3 rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
                    >
                        Continue Application
                        <ArrowRight size={16} />
                    </button>
                )}

            </div>
        </div>


        {/* Quick Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Application */}
            <button
                onClick={() =>
                    navigate(`/admission/apply/${track}/review`)
                }
                className="group bg-white rounded-2xl border border-black/5 p-5 text-left hover:border-[#1E3A8A]/20 hover:shadow-md transition-all duration-300"
            >
                <div className="flex items-start justify-between">

                    <div className="w-10 h-10 rounded-xl bg-[#1E3A8A]/8 flex items-center justify-center">
                        <ClipboardCheck
                            size={19}
                            strokeWidth={1.6}
                            className="text-[#1E3A8A]"
                        />
                    </div>

                    <ChevronRight
                        size={17}
                        className="text-black/20 group-hover:text-[#1E3A8A] group-hover:translate-x-0.5 transition-all"
                    />

                </div>

                <p className="font-serif font-semibold text-black mt-5">
                    Application
                </p>

                <p className="text-xs text-black/45 mt-1">
                    View your submitted application details.
                </p>
            </button>


            {/* Documents */}
            <button
                onClick={() =>
                    navigate(`/admission/apply/${track}/documents`)
                }
                className="group bg-white rounded-2xl border border-black/5 p-5 text-left hover:border-[#1E3A8A]/20 hover:shadow-md transition-all duration-300"
            >
                <div className="flex items-start justify-between">

                    <div className="w-10 h-10 rounded-xl bg-[#1E3A8A]/8 flex items-center justify-center">
                        <FileCheck2
                            size={19}
                            strokeWidth={1.6}
                            className="text-[#1E3A8A]"
                        />
                    </div>

                    <ChevronRight
                        size={17}
                        className="text-black/20 group-hover:text-[#1E3A8A] group-hover:translate-x-0.5 transition-all"
                    />

                </div>

                <p className="font-serif font-semibold text-black mt-5">
                    Documents
                </p>

                <p className="text-xs text-black/45 mt-1">
                    View documents submitted with your application.
                </p>
            </button>


            {/* Profile */}
            <button
                onClick={() =>
                    navigate(`/admission/apply/${track}/personal-information`)
                }
                className="group bg-white rounded-2xl border border-black/5 p-5 text-left hover:border-[#1E3A8A]/20 hover:shadow-md transition-all duration-300"
            >
                <div className="flex items-start justify-between">

                    <div className="w-10 h-10 rounded-xl bg-[#1E3A8A]/8 flex items-center justify-center">
                        <UserRound
                            size={19}
                            strokeWidth={1.6}
                            className="text-[#1E3A8A]"
                        />
                    </div>

                    <ChevronRight
                        size={17}
                        className="text-black/20 group-hover:text-[#1E3A8A] group-hover:translate-x-0.5 transition-all"
                    />

                </div>

                <p className="font-serif font-semibold text-black mt-5">
                    Personal Information
                </p>

                <p className="text-xs text-black/45 mt-1">
                    View the information attached to your application.
                </p>
            </button>

        </div>


        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr] gap-6">

            {/* Application Timeline */}
            <div className="bg-white rounded-2xl border border-black/5 p-6 md:p-7">

                <div className="flex items-center justify-between mb-6">

                    <div>
                        <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#B8901F]">
                            Application Journey
                        </p>

                        <h2 className="font-serif text-xl font-semibold text-black mt-1">
                            Application Timeline
                        </h2>
                    </div>

                    <Clock3
                        size={20}
                        strokeWidth={1.6}
                        className="text-black/20"
                    />

                </div>


                <div className="flex flex-col">

                    {/* Account */}
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                                <CircleCheck
                                    size={17}
                                    className="text-green-600"
                                />
                            </div>

                            <div className="w-px flex-1 bg-black/10 my-1" />
                        </div>

                        <div className="pb-6">
                            <p className="text-sm font-medium text-black">
                                Application account created
                            </p>

                            <p className="text-xs text-black/45 mt-1">
                                Your EduNova applicant account is active.
                            </p>
                        </div>
                    </div>


                    {/* Personal */}
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isPersonalComplete
                                    ? "bg-green-50"
                                    : "bg-black/5"
                            }`}>
                                {isPersonalComplete ? (
                                    <CircleCheck
                                        size={17}
                                        className="text-green-600"
                                    />
                                ) : (
                                    <CircleDot
                                        size={17}
                                        className="text-black/25"
                                    />
                                )}
                            </div>

                            <div className="w-px flex-1 bg-black/10 my-1" />
                        </div>

                        <div className="pb-6">
                            <p className="text-sm font-medium text-black">
                                Personal information
                            </p>

                            <p className="text-xs text-black/45 mt-1">
                                {isPersonalComplete
                                    ? "Information completed."
                                    : "Information is not yet complete."}
                            </p>
                        </div>
                    </div>


                    {/* Education */}
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isEducationComplete(config.educationMode)
                                    ? "bg-green-50"
                                    : "bg-black/5"
                            }`}>
                                {isEducationComplete(config.educationMode) ? (
                                    <CircleCheck
                                        size={17}
                                        className="text-green-600"
                                    />
                                ) : (
                                    <CircleDot
                                        size={17}
                                        className="text-black/25"
                                    />
                                )}
                            </div>

                            <div className="w-px flex-1 bg-black/10 my-1" />
                        </div>

                        <div className="pb-6">
                            <p className="text-sm font-medium text-black">
                                Academic information
                            </p>

                            <p className="text-xs text-black/45 mt-1">
                                {isEducationComplete(config.educationMode)
                                    ? "Academic information completed."
                                    : "Academic information is not yet complete."}
                            </p>
                        </div>
                    </div>


                    {/* Documents */}
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                data.documents.primaryResult &&
                                data.documents.passportPhoto &&
                                data.documents.idDocument
                                    ? "bg-green-50"
                                    : "bg-black/5"
                            }`}>
                                {data.documents.primaryResult &&
                                data.documents.passportPhoto &&
                                data.documents.idDocument ? (
                                    <CircleCheck
                                        size={17}
                                        className="text-green-600"
                                    />
                                ) : (
                                    <CircleDot
                                        size={17}
                                        className="text-black/25"
                                    />
                                )}
                            </div>

                            <div className="w-px flex-1 bg-black/10 my-1" />
                        </div>

                        <div className="pb-6">
                            <p className="text-sm font-medium text-black">
                                Documents
                            </p>

                            <p className="text-xs text-black/45 mt-1">
                                {data.documents.primaryResult &&
                                data.documents.passportPhoto &&
                                data.documents.idDocument
                                    ? "Required documents uploaded."
                                    : "Some required documents are missing."}
                            </p>
                        </div>
                    </div>


                    {/* Submission */}
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                data.submitted
                                    ? "bg-green-50"
                                    : "bg-black/5"
                            }`}>
                                {data.submitted ? (
                                    <CircleCheck
                                        size={17}
                                        className="text-green-600"
                                    />
                                ) : (
                                    <CircleDot
                                        size={17}
                                        className="text-black/25"
                                    />
                                )}
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-black">
                                Application submitted
                            </p>

                            <p className="text-xs text-black/45 mt-1">
                                {data.submitted
                                    ? "Your application has been submitted successfully."
                                    : "Your application is ready for submission."}
                            </p>
                        </div>
                    </div>

                </div>
            </div>


            {/* Right Side */}
            <div className="flex flex-col gap-6">

                {/* Admission Status */}
                <div className="bg-white rounded-2xl border border-black/5 p-6">

                    <div className="flex items-start justify-between">

                        <div>
                            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#B8901F]">
                                Admission Status
                            </p>

                            <h2 className="font-serif text-xl font-semibold text-black mt-1">
                                {data.submitted
                                    ? "Under Review"
                                    : "Application in Progress"}
                            </h2>
                        </div>

                        <div className="w-10 h-10 rounded-xl bg-[#B8901F]/10 flex items-center justify-center">
                            <Clock3
                                size={19}
                                strokeWidth={1.6}
                                className="text-[#B8901F]"
                            />
                        </div>

                    </div>

                    <p className="text-sm text-black/50 leading-relaxed mt-4">
                        {data.submitted
                            ? "Your application has been received and is currently awaiting an admission decision."
                            : "Complete and submit your application to begin the admission review process."}
                    </p>

                </div>


                {/* Application Information */}
                <div className="bg-white rounded-2xl border border-black/5 p-6">

                    <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#B8901F]">
                        Application Information
                    </p>

                    <div className="flex flex-col mt-5">

                        <div className="flex items-center justify-between py-3 border-b border-black/5">
                            <span className="text-xs text-black/45">
                                Faculty
                            </span>

                            <span className="text-sm font-medium text-black text-right">
                                {data.faculty || "—"}
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-black/5">
                            <span className="text-xs text-black/45">
                                Department
                            </span>

                            <span className="text-sm font-medium text-black text-right">
                                {data.department || "—"}
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-3">
                            <span className="text-xs text-black/45">
                                Programme
                            </span>

                            <span className="text-sm font-medium text-black text-right">
                                {data.programmeTitle || "—"}
                            </span>
                        </div>

                    </div>

                </div>


                {/* Notifications */}
                <div className="bg-[#14263F] rounded-2xl p-6 text-white">

                    <div className="flex items-center gap-3 mb-4">

                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                            <Bell
                                size={18}
                                strokeWidth={1.6}
                                className="text-[#B8901F]"
                            />
                        </div>

                        <div>
                            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/40">
                                Notifications
                            </p>

                            <p className="font-serif font-semibold text-white mt-0.5">
                                Stay updated
                            </p>
                        </div>

                    </div>

                    <p className="text-sm text-white/55 leading-relaxed">
                        Important updates about your application and admission
                        decision will appear here.
                    </p>

                </div>

            </div>

        </div>


        {/* Read-only notice */}
        <div className="flex items-center justify-center gap-2 text-xs text-black/35 pt-1">
            <LockKeyhole size={13} />
            Application information cannot be changed after submission.
        </div>
        <button
            onClick={() => setStep("entry")}
            className="self-center text-sm text-black/40 hover:text-black transition-colors"
        >
            Log out
        </button>

    </div>
)}
            </div>
        </div>
    )
}