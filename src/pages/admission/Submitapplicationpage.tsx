import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { CheckCircle2, ArrowLeft, Clock, Sparkles } from "lucide-react"
import { useApplication } from "./ApplicationContext"
import { trackConfigs } from "./trackconfig"
import type { Track } from "./trackconfig"

export default function SubmitApplicationPage() {
  const { track: trackParam } = useParams<{ track: string }>()
  const track = (trackParam ?? "undergraduate") as Track
  const config = trackConfigs[track]
  const base = `/admission/apply/${track}`

  const navigate = useNavigate()
  const { data, setSubmitted } = useApplication()
  const [confirmed, setConfirmed] = useState(false)

  const handleSubmit = () => {
    if (!confirmed) return
    setSubmitted(true)
  }

  if (data.submitted) {
    return (
      <div className="flex flex-col items-center text-center gap-6 py-8">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 size={30} strokeWidth={1.75} className="text-green-600" />
        </div>
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-black mb-2">Application Submitted</h1>
          <p className="text-sm text-black/55 max-w-sm leading-relaxed">
            Thank you, {data.applicantName}. Your {config.label.toLowerCase()} application for {data.programmeTitle} has been received and is now under review.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-6 w-full max-w-sm">
          <div className="flex items-center gap-3 justify-center mb-3">
            <Clock size={18} strokeWidth={1.75} className="text-amber-500" />
            <span className="text-sm font-medium text-black">Status: Under Review</span>
          </div>
          <p className="text-xs text-black/45">Application Number: <span className="font-mono">{data.applicationNumber}</span></p>
          <p className="text-xs text-black/45 mt-1">You'll be notified by email once a decision has been made.</p>
        </div>

        <button onClick={() => navigate(base)} className="text-sm text-[#1E3A8A] font-medium hover:underline">
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="font-mono text-xs tracking-[0.2em] uppercase text-black/40">Submit</span>
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-black mt-2">Submit Application</h1>
        <p className="text-sm text-black/55 mt-2">This is the final step. Once submitted, your application cannot be edited.</p>
      </div>

      <div className="bg-gradient-to-br from-[#14263F] to-[#1E3A8A] rounded-2xl p-7 text-center">
        <Sparkles size={22} className="text-[#B8901F] mx-auto mb-3" />
        <p className="font-serif text-white text-lg font-semibold mb-1">Everything looks ready</p>
        <p className="text-white/60 text-sm">Personal information, education, documents, and application fee are all complete.</p>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={confirmed} onChange={() => setConfirmed(!confirmed)} className="w-4 h-4 mt-0.5 rounded border-black/20 accent-[#1E3A8A]" />
          <span className="text-sm text-black/70">I confirm that all information provided in this application is accurate and complete to the best of my knowledge.</span>
        </label>
        <button onClick={handleSubmit} disabled={!confirmed} className="w-full mt-6 bg-gradient-to-r from-[#14263F] to-[#1E3A8A] text-white text-sm font-semibold py-4 rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 disabled:opacity-40 disabled:hover:translate-y-0">
          Submit Application
        </button>
      </div>

      <button onClick={() => navigate(`${base}/fee`)} className="flex items-center gap-1.5 text-sm text-black/50 hover:text-black transition-colors w-fit">
        <ArrowLeft size={16} /> Back
      </button>
    </div>
  )
}