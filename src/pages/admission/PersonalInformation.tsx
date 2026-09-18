import { updateProfile } from "../../lib/api"
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowRight, User } from "lucide-react"
import { useApplication } from "./ApplicationContext"
import type { PersonalInfo } from "./ApplicationContext"

const lgasByState: Record<string, string[]> = {
  Lagos: ["Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", "Badagry", "Epe", "Eti Osa", "Ibeju-Lekki", "Ifako-Ijaiye", "Ikeja", "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland", "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere"],
  Oyo: ["Ibadan North", "Ibadan North-East", "Ibadan North-West", "Ibadan South-East", "Ibadan South-West", "Egbeda", "Akinyele", "Ogbomosho North", "Ogbomosho South", "Oyo East", "Oyo West", "Iseyin"],
  Kano: ["Kano Municipal", "Fagge", "Dala", "Gwale", "Tarauni", "Nasarawa", "Ungogo", "Kumbotso", "Gwarzo", "Bichi"],
  Rivers: ["Port Harcourt", "Obio/Akpor", "Okrika", "Eleme", "Ikwerre", "Etche", "Oyigbo", "Bonny", "Degema", "Ahoada East"],
  "Abuja (FCT)": ["Abaji", "Abuja Municipal", "Bwari", "Gwagwalada", "Kuje", "Kwali"],
  Kaduna: ["Kaduna North", "Kaduna South", "Zaria", "Sabon Gari", "Chikun", "Igabi", "Kachia", "Soba"],
  Enugu: ["Enugu East", "Enugu North", "Enugu South", "Nsukka", "Udi", "Awgu", "Igbo Etiti"],
  Delta: ["Warri South", "Warri North", "Uvwie", "Ughelli North", "Sapele", "Oshimili South", "Isoko North"],
  Anambra: ["Awka North", "Awka South", "Onitsha North", "Onitsha South", "Nnewi North", "Idemili North", "Ihiala"],
  Ogun: ["Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Ijebu Ode", "Sagamu", "Ifo"],
}
const nigerianStates = Object.keys(lgasByState)

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-mono text-xs tracking-wide uppercase text-black/50">{label}</label>
      {children}
    </div>
  )
}

const inputClass = "border border-black/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1E3A8A] transition-colors"

export default function PersonalInformation() {
  const { track } = useParams<{ track: string }>()
  const navigate = useNavigate()
  const { data, setPersonal } = useApplication()
  const [form, setForm] = useState<PersonalInfo>(data.personal)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const availableLgas = form.state_of_origin
  ? lgasByState[form.state_of_origin] ?? []
  : []

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  setForm({
    ...form,
    state_of_origin: e.target.value,
    lga_of_origin: "",
  })
}

  const canContinue =
  form.date_of_birth &&
  form.gender &&
  form.nationality &&
  form.state_of_origin &&
  form.lga_of_origin &&
  form.address

  const handleContinue = async () => {
    if (!canContinue) return
    setSubmitError("")
    setIsSubmitting(true)
    try {
        await updateProfile({
  date_of_birth: form.date_of_birth,
  gender: form.gender,
  nationality: form.nationality,
  state_of_origin: form.state_of_origin,
  lga_of_origin: form.lga_of_origin,
  address: form.address,
  alternate_phone_number: form.alternate_phone_number,
})
        setPersonal(form)
        navigate(`/admission/apply/${track}/education`)
    } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Failed to save. Please try again.")
    } finally {
        setIsSubmitting(false)
    }
}

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="font-mono text-xs tracking-[0.2em] uppercase text-black/40">Personal Information</span>
        <p className="text-sm text-black/55 mt-2">This information should match your official documents.</p>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-6 flex flex-col gap-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center">
            <User size={16} strokeWidth={1.75} className="text-[#1E3A8A]" />
          </div>
          <p className="font-mono text-xs tracking-widest uppercase text-[#B8901F]">Basic Details</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Date of Birth">
  <input
    type="date"
    name="date_of_birth"
    value={form.date_of_birth}
    onChange={handleChange}
    className={inputClass}
  />
</Field>
          <Field label="Gender">
            <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Nationality"><input name="nationality" value={form.nationality} onChange={handleChange} placeholder="Nigerian" className={inputClass} /></Field>
          <Field label="State of Origin">
            <select name="state" value={form.state_of_origin } onChange={handleStateChange} className={inputClass}>
              <option value="">Select...</option>
              {nigerianStates.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Local Government Area">
  <select
    name="lga_of_origin"
    value={form.lga_of_origin}
    onChange={handleChange}
    disabled={!form.state_of_origin}
    className={`${inputClass} disabled:bg-black/[0.02] disabled:text-black/30 disabled:cursor-not-allowed`}
  >
    <option value="">
      {form.state_of_origin ? "Select..." : "Select a state first"}
    </option>

    {availableLgas.map((l) => (
      <option key={l} value={l}>
        {l}
      </option>
    ))}
  </select>
</Field>

        <Field label="Residential Address">
          <textarea name="address" value={form.address} onChange={handleChange as any} rows={3} className={`${inputClass} resize-none`} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Alternate Phone (optional)">
  <input
    name="alternate_phone_number"
    type="tel"
    value={form.alternate_phone_number}
    onChange={handleChange}
    className={inputClass}
  />
</Field>
        </div>
      </div>

      {submitError && <p className="text-xs text-red-500 -mt-2">{submitError}</p>}
<button onClick={handleContinue} disabled={!canContinue || isSubmitting} className="self-end flex items-center gap-2 bg-gradient-to-r from-[#14263F] to-[#1E3A8A] text-white text-sm font-semibold px-7 py-3.5 rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 disabled:opacity-40 disabled:hover:translate-y-0">
    {isSubmitting ? "Saving..." : "Continue"} <ArrowRight size={16} />
</button>
    </div>
  )
}