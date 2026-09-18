import { getProfile } from "../../lib/api"
import { createContext, useContext, useState, useEffect } from "react"
import type {ReactNode } from "react"
import type { Track } from "./trackconfig"

export interface PersonalInfo {
  date_of_birth: string
  gender: string
  nationality: string
  state_of_origin: string
  lga_of_origin: string
  address: string
  phone_number: string
  alternate_phone_number: string
}

export interface Subject { subject: string; grade: string }

// One flexible shape covering both O'Level-style and degree-style education,
// so a single EducationPage can render the right subset per track.
export interface EducationInfo {
  // O'Level mode (undergraduate / certificate / odl)
  schoolName: string
  examType: string
  examNumber: string
  examYear: string
  subjects: Subject[]
  jambNumber: string
  jambScore: string
  // Degree mode (postgraduate / international)
  institution: string
  degree: string
  graduationYear: string
  classOfDegree: string
  cgpa: string
  certificate: string
  transcript: string
}

export interface Documents {
  primaryResult: string   // O'Level result OR degree certificate, depending on track
  passportPhoto: string
  idDocument: string       // birth certificate / valid ID, depending on track
  supporting: string       // JAMB slip / referee letter / visa doc, depending on track
}

export type ApplicantType = "eduNovaGraduate" | "external" | ""

interface ApplicationState {
  track: Track | null
  applicantId: string
  applicationNumber: string
  faculty: string
  department: string
  programmeTitle: string
  applicantType: ApplicantType
  isEduNovaGraduate: boolean
  applicantName: string
  applicantEmail: string
  accountCreated: boolean
  personal: PersonalInfo
  education: EducationInfo
  documents: Documents
  feePaid: boolean
  submitted: boolean
}

interface ApplicationContextValue {
  data: ApplicationState
  isProfileLoading: boolean
  refreshProfile: () => Promise<void>
  setTrack: (track: Track) => void
  setSelection: (faculty: string, department: string, programmeTitle: string) => void
  setApplicantType: (type: ApplicantType) => void
  prefillFromEduNovaRecord: (studentId: string) => void
  setAccountCreated: (name: string, email: string) => void
  setPersonal: (info: PersonalInfo) => void
  setEducation: (info: EducationInfo) => void
  setDocuments: (docs: Documents) => void
  setFeePaid: (paid: boolean) => void
  setSubmitted: (val: boolean) => void
  isPersonalComplete: boolean
  isEducationComplete: (mode: "olevel" | "degree") => boolean
  isDocumentsComplete: boolean
  progressPercent: (mode: "olevel" | "degree") => number
}

const emptyEducation: EducationInfo = {
  schoolName: "", examType: "", examNumber: "", examYear: "", subjects: [], jambNumber: "", jambScore: "",
  institution: "", degree: "", graduationYear: "", classOfDegree: "", cgpa: "", certificate: "", transcript: "",
}

const defaultState: ApplicationState = {
  track: null,
  applicantId: "",
  applicationNumber: "",
  faculty: "",
  department: "",
  programmeTitle: "",
  applicantType: "",
  isEduNovaGraduate: false,
  applicantName: "",
  applicantEmail: "",
  accountCreated: false,
  personal: {
  date_of_birth: "",
  gender: "",
  nationality: "",
  state_of_origin: "",
  lga_of_origin: "",
  address: "",
  phone_number: "",
  alternate_phone_number: ""
},
  education: emptyEducation,
  documents: { primaryResult: "", passportPhoto: "", idDocument: "", supporting: "" },
  feePaid: false,
  submitted: false,
}

const mockEduNovaRecord = {
  fullName: "Edwin Adeyi-Samuel",
  email: "edwin@example.com",
  previousProgramme: "B.Eng. Mechanical Engineering",
  graduationYear: "2026",
  classOfDegree: "Second Class Upper",
  cgpa: "4.32",
}



const ApplicationContext = createContext<ApplicationContextValue | undefined>(undefined)


export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ApplicationState>(defaultState)
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const loadProfile = async () => {
  try {
    const response = await getProfile()

    const profile = response.data.profile
    const application = response.data.application

    console.log("PROFILE DATA:", profile)
    console.log("APPLICATION DATA:", application)

    setData((prev) => ({
      ...prev,

      applicantId: profile.id ?? "",
      applicantName: `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim(),
      applicantEmail: "",
      accountCreated: true,

      faculty: application?.faculty ?? prev.faculty,
      department: application?.department ?? prev.department,
      programmeTitle: application?.programme ?? prev.programmeTitle,
      applicationNumber: application?.application_number ?? "",

      personal: {
        ...prev.personal,
        date_of_birth: profile.date_of_birth ?? "",
        gender: profile.gender ?? "",
        nationality: profile.nationality ?? "",
        state_of_origin: profile.state_of_origin ?? "",
        lga_of_origin: profile.lga_of_origin ?? "",
        address: profile.address ?? "",
        phone_number: profile.phone_number ?? "",
        alternate_phone_number: profile.alternate_phone_number ?? "",
      },

      education: {
        ...prev.education,
        schoolName: profile.secondary_school_attended ?? "",
        examType: profile.exam_type ?? "",
        examNumber: profile.exam_number ?? "",
        examYear: profile.exam_year?.toString() ?? "",
        jambNumber: profile.jamb_registration_number ?? "",
        jambScore: profile.jamb_score?.toString() ?? "",
        subjects: Array.isArray(profile.olevel_results)
          ? profile.olevel_results
          : [],
      },

      documents: {
        ...prev.documents,
        primaryResult: profile.olevel_result_url ?? "",
        passportPhoto: profile.passport_url ?? "",
        idDocument: profile.birth_certificate_url ?? "",
        supporting: profile.jamb_result_url ?? "",
      },
    }))
  } catch (error) {
    console.error("Failed to load profile:", error)
  } finally {
    setIsProfileLoading(false)
  }
}
useEffect(() => {
  const savedSelection = localStorage.getItem("edunova_selection")

  if (savedSelection) {
    const selection = JSON.parse(savedSelection)

    setData((prev) => ({
      ...prev,
      faculty: selection.faculty ?? "",
      department: selection.department ?? "",
      programmeTitle: selection.programmeTitle ?? "",
    }))
  }

  loadProfile()
}, [])
  
  const setTrack = (track: Track) =>
    setData((prev) => ({ ...prev, track }))

  const setSelection = (faculty: string, department: string, programmeTitle: string) => {
  setData((prev) => ({ ...prev, faculty, department, programmeTitle }))

  localStorage.setItem(
    "edunova_selection",
    JSON.stringify({
      faculty,
      department,
      programmeTitle,
    })
  )
}
  const setApplicantType = (type: ApplicantType) =>
    setData((prev) => ({ ...prev, applicantType: type, isEduNovaGraduate: type === "eduNovaGraduate" }))

  const prefillFromEduNovaRecord = (_studentId: string) =>
    setData((prev) => ({
      ...prev,
      applicantName: mockEduNovaRecord.fullName,
      applicantEmail: mockEduNovaRecord.email,
      accountCreated: true,
      education: {
        ...prev.education,
        institution: "EduNova University",
        degree: mockEduNovaRecord.previousProgramme,
        graduationYear: mockEduNovaRecord.graduationYear,
        classOfDegree: mockEduNovaRecord.classOfDegree,
        cgpa: mockEduNovaRecord.cgpa,
      },
    }))

  const setAccountCreated = (name: string, email: string) =>
    setData((prev) => ({ ...prev, accountCreated: true, applicantName: name, applicantEmail: email }))

  const setPersonal = (info: PersonalInfo) => setData((prev) => ({ ...prev, personal: info }))
  const setEducation = (info: EducationInfo) => setData((prev) => ({ ...prev, education: info }))
  const setDocuments = (docs: Documents) => setData((prev) => ({ ...prev, documents: docs }))
  const setFeePaid = (paid: boolean) => setData((prev) => ({ ...prev, feePaid: paid }))
  const setSubmitted = (val: boolean) => setData((prev) => ({ ...prev, submitted: val }))

  const isPersonalComplete = !!(
  data.personal.date_of_birth &&
  data.personal.gender &&
  data.personal.state_of_origin &&
  data.personal.lga_of_origin &&
  data.personal.address &&
  data.personal.phone_number
)

  const isEducationComplete = (mode: "olevel" | "degree") =>
    mode === "olevel"
      ? !!(data.education.schoolName && data.education.examNumber && data.education.subjects.length >= 5)
      : !!(data.education.institution && data.education.degree && data.education.graduationYear && data.education.cgpa && data.education.transcript)

  const isDocumentsComplete = !!(
  data.documents.primaryResult &&
  data.documents.passportPhoto &&
  data.documents.idDocument &&
  data.documents.supporting
)

const progressPercent = (mode: "olevel" | "degree") => {
  const flags = [
    !!data.programmeTitle,
    isPersonalComplete,
    isEducationComplete(mode),
    isDocumentsComplete,
    data.feePaid,
    data.submitted,
  ]

  return Math.round((flags.filter(Boolean).length / flags.length) * 100)
}

  return (
    <ApplicationContext.Provider
  value={{
    data,
    isProfileLoading,
  refreshProfile: loadProfile,
    setTrack,
    setSelection,
    setApplicantType,
    prefillFromEduNovaRecord,
    setAccountCreated,
    setPersonal,
    setEducation,
    setDocuments,
    setFeePaid,
    setSubmitted,
    isPersonalComplete,
    isEducationComplete,
    isDocumentsComplete,
    progressPercent,
  }}
>
      {children}
    </ApplicationContext.Provider>
  )
}

export function useApplication() {
  const ctx = useContext(ApplicationContext)
  if (!ctx) throw new Error("useApplication must be used within an ApplicationProvider")
  return ctx
}