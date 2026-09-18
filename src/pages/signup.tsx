import { useState } from "react"
import { GraduationCap, BookOpen, Award, Laptop, Globe, ArrowRight, Sparkles, KeyRound,} from "lucide-react"
import logo from "../assets/edunova-logo.webp"
const programmeTypes = [
  {
    icon: GraduationCap,
    title: "Undergraduate Programmes",
    tagline: "Begin your undergraduate journey at EduNova.",
    description: "Explore bachelor's degree programmes across Engineering, Computing, Business, Health Sciences, Arts, Sciences, and more.",
    path: "/admission/apply/undergraduate",
  },
  {
    icon: BookOpen,
    title: "Postgraduate Programmes",
    tagline: "Advance your knowledge and expertise.",
    description: "Explore Master's and PhD programmes designed for advanced study, research, and professional development.",
    path: "/admission/apply/postgraduate",
  },
  {
    icon: Award,
    title: "Professional Certificates",
    tagline: "Build skills that move your career forward.",
    description: "Gain industry-relevant knowledge and professional certifications through flexible programmes designed for career development.",
    path: "/admission/apply/certificates",
  },
  {
    icon: Laptop,
    title: "Open & Distance Learning",
    tagline: "Learn on your own terms.",
    description: "Access flexible degree and certificate programmes designed for students and professionals who need adaptable learning options.",
    path: "/admission/apply/odl",
  },
  {
    icon: Globe,
    title: "International Programmes",
    tagline: "Study at EduNova from anywhere in the world.",
    description: "Explore programmes and study opportunities designed for international students and global learners.",
    path: "/admission/apply/international",
  },
]

export default function AdmissionPortal() {
  const [showContinue, setShowContinue] = useState(false)
  const [appNumber, setAppNumber] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="min-h-screen bg-[#F6F6F2]">
      <div className="relative bg-gradient-to-br from-[#0B1524] via-[#14263F] to-[#1E3A8A] overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#B8901F]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="relative px-4 md:px-8 py-14 max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="bg-[#F6F6F2]  mb-8 px-3 rounded-lg">
            <img src={logo} alt="EduNova University" className="h-12 w-auto" />
          </div>
          <span className="inline-flex items-center gap-1.5 font-mono text-xs tracking-[0.2em] uppercase text-[#B8901F] mb-4">
            <Sparkles size={13} />
            Admission Portal
          </span>
          <h1 className="font-serif text-white text-3xl md:text-5xl font-semibold leading-tight">
            Start Your Application
          </h1>
          <p className="font-sans text-white/70 text-base md:text-lg mt-4 max-w-lg leading-relaxed">
            Choose the programme type you would like to apply for at EduNova University.
          </p>
        </div>
      </div>
      <div className="px-4 md:px-8 py-12 max-w-5xl mx-auto -mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {programmeTypes.map((type, index) => {
            const Icon = type.icon
            const isLast = index === programmeTypes.length - 1 && programmeTypes.length % 2 !== 0
            return (
              <a key={index} href={type.path} className={`group relative bg-white rounded-3xl border border-black/5 p-7 overflow-hidden transition-all duration-300 hover:border-transparent hover:shadow-xl ${isLast ? "sm:col-span-2 sm:max-w-md sm:mx-auto sm:w-full" : ""}`}>
                <span className="absolute inset-0 bg-gradient-to-br from-[#14263F] to-[#1E3A8A] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-[#1E3A8A]/8 group-hover:bg-white/10 flex items-center justify-center mb-5 transition-colors duration-300">
                    <Icon size={26} strokeWidth={1.5} className="text-[#1E3A8A] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-black group-hover:text-white transition-colors duration-300 mb-1.5">{type.title}</h3>
                  <p className="text-sm font-medium text-[#B8901F] group-hover:text-[#B8901F] mb-3">{type.tagline}</p>
                  <p className="text-sm text-black/55 group-hover:text-white/70 leading-relaxed mb-6 transition-colors duration-300">{type.description}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1E3A8A] group-hover:text-white transition-all duration-300 group-hover:gap-2.5">
                    Apply Now
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </span>
                </div>
              </a>
            )
          })}
        </div>
        <div className="mt-12 flex flex-col items-center text-center">
          <p className="text-sm text-black/55 mb-3">Already started an application?</p>
          {!showContinue ? (
            <button onClick={() => setShowContinue(true)} className="inline-flex items-center gap-2 text-sm font-semibold text-[#1E3A8A] border border-[#1E3A8A]/20 px-6 py-3 rounded-xl hover:bg-[#1E3A8A]/5 transition-colors duration-200">
              <KeyRound size={16} />
              Continue Application
            </button>
          ) : (
            <div className="bg-white rounded-2xl border border-black/5 p-6 max-w-sm w-full mt-2 shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2 text-left">
                  <label className="font-mono text-xs tracking-wide uppercase text-black/50">
                    Application Number
                  </label>
                  <input type="text" value={appNumber} onChange={(e) => setAppNumber(e.target.value)} placeholder="EDU/APP/2026/00000" className="border border-black/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1E3A8A] transition-colors"/>
                </div>
                <div className="flex flex-col gap-2 text-left">
                  <label className="font-mono text-xs tracking-wide uppercase text-black/50">
                    Password
                  </label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="border border-black/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1E3A8A] transition-colors"/>
                </div>
                <button className="bg-[#14263F] text-white text-sm font-semibold py-3 rounded-xl hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                  Continue Application
                </button>
                <button onClick={() => setShowContinue(false)} className="text-xs text-black/40 hover:text-black/60 transition-colors">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}