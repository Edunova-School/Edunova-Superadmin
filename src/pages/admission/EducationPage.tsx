import { updateProfile } from "../../lib/api"
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowRight, ArrowLeft, BookOpen, GraduationCap, Plus, Trash2, CheckCircle2, Lock } from "lucide-react"
import { useApplication } from "./ApplicationContext"
import type { EducationInfo, Subject } from "./ApplicationContext"
import { trackConfigs } from "./trackconfig"
import type { Track } from "./trackconfig"

const inputClass = "border border-black/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1E3A8A] transition-colors"
const gradeOptions = ["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"]
const classOfDegreeOptions = ["First Class", "Second Class Upper", "Second Class Lower", "Third Class", "Pass"]

const subjectCategories: { group: string; subjects: string[] }[] = [
  { group: "Core / General", subjects: ["English Language", "Mathematics", "Civic Education"] },
  { group: "Science", subjects: ["Physics", "Chemistry", "Biology", "Further Mathematics", "Agricultural Science", "Geography", "Computer Studies"] },
  { group: "Arts", subjects: ["Literature in English", "Government", "History", "CRS/IRS", "French", "Fine Art", "Music"] },
  { group: "Commercial", subjects: ["Financial Accounting", "Commerce", "Economics", "Office Practice", "Marketing", "Insurance"] },
]

function Field({ label, children, verified }: { label: string; children: React.ReactNode; verified?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <label className="font-mono text-xs tracking-wide uppercase text-black/50">{label}</label>
        {verified && <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600"><CheckCircle2 size={11} /> Verified</span>}
      </div>
      {children}
    </div>
  )
}

function SubjectSelect({ value, onChange, usedSubjects }: { value: string; onChange: (v: string) => void; usedSubjects: string[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`${inputClass} flex-1`}>
      <option value="">Select subject</option>
      {subjectCategories.map((cat) => (
        <optgroup key={cat.group} label={cat.group}>
          {cat.subjects.map((s) => (
            <option key={s} value={s} disabled={usedSubjects.includes(s) && s !== value}>{s}</option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}

export default function EducationPage() {
  const { track: trackParam } = useParams<{ track: string }>()
  const track = (trackParam ?? "undergraduate") as Track
  const config = trackConfigs[track]
  const navigate = useNavigate()
  const base = `/admission/apply/${track}`

  const { data, setEducation } = useApplication()
  const isDegreeMode = config.educationMode === "degree"
  const isLockedGraduate = data.isEduNovaGraduate

  const [form, setForm] = useState<EducationInfo>(
    !isDegreeMode && data.education.subjects.length === 0
      ? { ...data.education, subjects: [
          { subject: "English Language", grade: "" }, { subject: "Mathematics", grade: "" },
          { subject: "", grade: "" }, { subject: "", grade: "" }, { subject: "", grade: "" },
        ] }
      : data.education
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [e.target.name]: e.target.value })

  const updateSubject = (index: number, field: keyof Subject, value: string) => {
    const next = [...form.subjects]
    next[index] = { ...next[index], [field]: value }
    setForm({ ...form, subjects: next })
  }
  const addSubject = () => setForm({ ...form, subjects: [...form.subjects, { subject: "", grade: "" }] })
  const removeSubject = (i: number) => setForm({ ...form, subjects: form.subjects.filter((_, idx) => idx !== i) })
  const usedSubjects = form.subjects.map((s) => s.subject).filter(Boolean)
  const filledSubjects = form.subjects.filter((s) => s.subject && s.grade)

  const canContinue = isDegreeMode
  ? !!(form.institution && form.degree && form.graduationYear && form.classOfDegree && form.cgpa)
  : !!(form.schoolName && form.examType && form.examNumber && form.examYear && filledSubjects.length >= 5)
  const handleContinue = async () => {
  if (!canContinue) return

  try {
    if (isDegreeMode) {
      await updateProfile({
        secondary_school_attended: form.institution,
        exam_type: form.degree,
        exam_number: form.graduationYear,
        exam_year: form.classOfDegree,
        jamb_score: form.cgpa,
      })
    } else {
      await updateProfile({
        secondary_school_attended: form.schoolName,
        exam_type: form.examType,
        exam_number: form.examNumber,
        exam_year: form.examYear,
        jamb_registration_number: form.jambNumber,
        jamb_score: form.jambScore,
        olevel_results: filledSubjects,
      })
    }

    setEducation(
      isDegreeMode ? form : { ...form, subjects: filledSubjects }
    )

    navigate(`${base}/documents`)
  } catch (err) {
    console.error("EDUCATION SAVE ERROR:", err)
  }
}

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="font-mono text-xs tracking-[0.2em] uppercase text-black/40">
          {isDegreeMode ? "Previous Education" : "Academic Information"}
        </span>
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-black mt-2">
          {isDegreeMode ? "Your Academic Background" : "O'Level & Examination Details"}
        </h1>
        <p className="text-sm text-black/55 mt-2">
          {isDegreeMode
            ? isLockedGraduate
              ? "We've pulled in your EduNova academic record. Review the details below."
              : "Tell us about the degree that qualifies you for this programme."
            : "Enter your exam details and at least five subject grades."}
        </p>
      </div>

      {isDegreeMode && isLockedGraduate && (
        <div className="flex items-start gap-3 bg-[#1E3A8A]/[0.04] border border-[#1E3A8A]/10 rounded-xl p-4">
          <Lock size={16} strokeWidth={1.75} className="text-[#1E3A8A] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-black/60 leading-relaxed">
            Institution, degree, and grade details are locked for accuracy. Contact the Registrar's Office if something looks wrong.
          </p>
        </div>
      )}

      {/* DEGREE MODE — postgraduate / international */}
      {isDegreeMode ? (
        <div className="bg-white rounded-2xl border border-black/5 p-6 flex flex-col gap-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center"><GraduationCap size={16} strokeWidth={1.75} className="text-[#1E3A8A]" /></div>
            <p className="font-mono text-xs tracking-widest uppercase text-[#B8901F]">Degree Details</p>
          </div>

          <Field label="Institution" verified={isLockedGraduate}>
            <input name="institution" value={form.institution} onChange={handleChange} disabled={isLockedGraduate} className={`${inputClass} ${isLockedGraduate ? "bg-black/[0.02] text-black/60 cursor-not-allowed" : ""}`} />
          </Field>
          <Field label="Degree Obtained" verified={isLockedGraduate}>
            <input name="degree" value={form.degree} onChange={handleChange} disabled={isLockedGraduate} className={`${inputClass} ${isLockedGraduate ? "bg-black/[0.02] text-black/60 cursor-not-allowed" : ""}`} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Graduation Year" verified={isLockedGraduate}>
              <input name="graduationYear" value={form.graduationYear} onChange={handleChange} disabled={isLockedGraduate} className={`${inputClass} ${isLockedGraduate ? "bg-black/[0.02] text-black/60 cursor-not-allowed" : ""}`} />
            </Field>
            <Field label="Class of Degree" verified={isLockedGraduate}>
              {isLockedGraduate ? (
                <input value={form.classOfDegree} disabled className={`${inputClass} bg-black/[0.02] text-black/60 cursor-not-allowed`} />
              ) : (
                <select name="classOfDegree" value={form.classOfDegree} onChange={handleChange} className={inputClass}>
                  <option value="">Select...</option>
                  {classOfDegreeOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </Field>
          </div>
          <Field label="CGPA" verified={isLockedGraduate}>
            <input name="cgpa" value={form.cgpa} onChange={handleChange} disabled={isLockedGraduate} placeholder="e.g. 4.32 / 5.00" className={`${inputClass} ${isLockedGraduate ? "bg-black/[0.02] text-black/60 cursor-not-allowed" : ""} max-w-[200px]`} />
          </Field>
        </div>
      ) : (
        /* O'LEVEL MODE — undergraduate / certificate / odl */
        <>
          <div className="bg-white rounded-2xl border border-black/5 p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center"><BookOpen size={16} strokeWidth={1.75} className="text-[#1E3A8A]" /></div>
              <p className="font-mono text-xs tracking-widest uppercase text-[#B8901F]">Examination Details</p>
            </div>
            <Field label="Secondary School Attended"><input name="schoolName" value={form.schoolName} onChange={handleChange} className={inputClass} /></Field>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Field label="Exam Type">
                <select name="examType" value={form.examType} onChange={handleChange} className={inputClass}>
                  <option value="">Select...</option>
                  <option value="WAEC">WAEC</option>
                  <option value="NECO">NECO</option>
                  <option value="NABTEB">NABTEB</option>
                </select>
              </Field>
              <Field label="Exam Number"><input name="examNumber" value={form.examNumber} onChange={handleChange} className={inputClass} /></Field>
              <Field label="Exam Year"><input name="examYear" value={form.examYear} onChange={handleChange} placeholder="2025" className={inputClass} /></Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="JAMB Registration Number"><input name="jambNumber" value={form.jambNumber} onChange={handleChange} className={inputClass} /></Field>
              <Field label="JAMB Score"><input name="jambScore" value={form.jambScore} onChange={handleChange} className={inputClass} /></Field>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-black/5 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="font-mono text-xs tracking-widest uppercase text-[#B8901F]">O'Level Subjects & Grades <span className="text-black/30 normal-case">(min. 5)</span></p>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${filledSubjects.length >= 5 ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                {filledSubjects.length} of {form.subjects.length} filled
              </span>
            </div>
            <p className="text-xs text-black/40 mb-5">Choose from Core, Science, Arts, or Commercial subjects.</p>
            <div className="flex flex-col gap-3">
              {form.subjects.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <SubjectSelect value={s.subject} onChange={(v) => updateSubject(i, "subject", v)} usedSubjects={usedSubjects} />
                  <select value={s.grade} onChange={(e) => updateSubject(i, "grade", e.target.value)} className={`${inputClass} w-24 flex-shrink-0`}>
                    <option value="">Grade</option>
                    {gradeOptions.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <button type="button" onClick={() => removeSubject(i)} disabled={form.subjects.length <= 5} className="p-2 text-black/30 hover:text-red-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors flex-shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addSubject} className="flex items-center gap-1.5 text-sm text-[#1E3A8A] font-medium mt-4 hover:underline">
              <Plus size={15} /> Add another subject
            </button>
          </div>
        </>
      )}

      <div className="flex items-center justify-between">
        <button onClick={() => navigate(`${base}/personal-information`)} className="flex items-center gap-1.5 text-sm text-black/50 hover:text-black transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <button onClick={handleContinue} disabled={!canContinue} className="flex items-center gap-2 bg-gradient-to-r from-[#14263F] to-[#1E3A8A] text-white text-sm font-semibold px-7 py-3.5 rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 disabled:opacity-40 disabled:hover:translate-y-0">
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}