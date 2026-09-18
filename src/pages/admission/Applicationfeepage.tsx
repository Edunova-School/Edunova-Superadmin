import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, CreditCard, Building2, Smartphone, CheckCircle2, ArrowRight } from "lucide-react"
import { useApplication } from "./ApplicationContext"
import type { Track } from "./trackconfig"

const applicationFeeAmount = 15000
const naira = (n: number) => `₦${n.toLocaleString()}`
const paymentMethods = [
  { label: "Card", icon: CreditCard },
  { label: "Bank Transfer", icon: Building2 },
  { label: "USSD", icon: Smartphone },
]

export default function ApplicationFeePage() {
  const { track: trackParam } = useParams<{ track: string }>()
  const track = (trackParam ?? "undergraduate") as Track
  const base = `/admission/apply/${track}`

  const navigate = useNavigate()
  const { data, setFeePaid } = useApplication()
  const [method, setMethod] = useState("Card")
  const [processing, setProcessing] = useState(false)

  const handlePay = () => {
    setProcessing(true)
    setTimeout(() => { setProcessing(false); setFeePaid(true) }, 1400)
  }

  if (data.feePaid) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-black/40">Application Fee</span>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-black mt-2">Fee Paid</h1>
        </div>
        <div className="bg-white rounded-2xl border border-black/5 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={26} strokeWidth={1.75} className="text-green-600" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-black mb-1">Payment Received</h3>
          <p className="text-sm text-black/55">Your application fee of {naira(applicationFeeAmount)} has been received.</p>
        </div>
        <button onClick={() => navigate(`${base}/submit`)} className="self-end flex items-center gap-2 bg-gradient-to-r from-[#14263F] to-[#1E3A8A] text-white text-sm font-semibold px-7 py-3.5 rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
          Continue <ArrowRight size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="font-mono text-xs tracking-[0.2em] uppercase text-black/40">Application Fee</span>
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-black mt-2">Pay Your Application Fee</h1>
        <p className="text-sm text-black/55 mt-2">A non-refundable application fee is required to submit your application.</p>
      </div>

      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#0B1524] to-[#1E3A8A] p-7">
        <p className="font-mono text-xs tracking-widest uppercase text-[#B8901F] mb-1">Amount Due</p>
        <p className="font-serif text-white text-4xl font-semibold">{naira(applicationFeeAmount)}</p>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-6">
        <p className="font-mono text-xs tracking-widest uppercase text-[#B8901F] mb-3">Payment Method</p>
        <div className="flex flex-col gap-2 mb-6">
          {paymentMethods.map((m, i) => {
            const Icon = m.icon
            const active = method === m.label
            return (
              <button key={i} onClick={() => setMethod(m.label)} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${active ? "border-[#1E3A8A] bg-[#1E3A8A]/5 text-[#1E3A8A]" : "border-black/10 text-black/60 hover:border-black/20"}`}>
                <Icon size={18} strokeWidth={1.75} />
                {m.label}
                {active && <CheckCircle2 size={16} className="ml-auto text-[#1E3A8A]" />}
              </button>
            )
          })}
        </div>
        <button onClick={handlePay} disabled={processing} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#14263F] to-[#1E3A8A] text-white text-sm font-semibold py-3.5 rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 disabled:opacity-60">
          {processing ? "Processing..." : `Pay ${naira(applicationFeeAmount)}`}
        </button>
      </div>

      <button onClick={() => navigate(`${base}/review`)} className="flex items-center gap-1.5 text-sm text-black/50 hover:text-black transition-colors w-fit">
        <ArrowLeft size={16} /> Back
      </button>
    </div>
  )
}