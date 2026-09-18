import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { verifyEmail, initProfile } from "../../lib/api"


export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMsg, setErrorMsg] = useState("")

 useEffect(() => {
    if (!token) {
      setStatus("error")
      setErrorMsg("No verification token found.")
      return
    }
    verifyEmail(token)
      .then(() => initProfile())
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error")
        setErrorMsg(err instanceof Error ? err.message : "Verification failed.")
      })
}, [token])

  return (
    <div className="min-h-screen bg-[#F6F6F2] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl border border-black/5 p-10 text-center max-w-sm w-full">
        {status === "loading" && (
          <>
            <Loader2 size={30} className="animate-spin text-[#1E3A8A] mx-auto mb-4" />
            <p className="text-sm text-black/60">Verifying your email...</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 size={30} className="text-green-600 mx-auto mb-4" />
            <h2 className="font-serif text-xl font-semibold text-black mb-2">Email Verified</h2>
            <p className="text-sm text-black/55 mb-6">Your account is now verified. You can continue your application.</p>
            <button onClick={() => navigate("/admission")} className="bg-[#14263F] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:-translate-y-0.5 transition-all">
              Continue
            </button>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle size={30} className="text-red-500 mx-auto mb-4" />
            <h2 className="font-serif text-xl font-semibold text-black mb-2">Verification Failed</h2>
            <p className="text-sm text-black/55">{errorMsg}</p>
          </>
        )}
      </div>
    </div>
  )
}