import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { useApplication } from "./ApplicationContext"
import { uploadDocument } from "../../lib/api"
import type { Documents } from "./ApplicationContext"
import { trackConfigs } from "./trackconfig"
import type { Track } from "./trackconfig"

const labelsByMode = {
  olevel: {
    primaryResult: "O'Level Result",
    idDocument: "Birth Certificate / Declaration of Age",
    supporting: "JAMB Result",
    supportingRequired: true,
  },
  degree: {
    primaryResult: "Degree Certificate",
    idDocument: "Valid Identification",
    supporting: "Statement of Purpose / Referee Letter",
    supportingRequired: true,
  },
}

function UploadRow({
  label,
  required,
  fileName,
  fileUrl,
  isUploading,
  onChange,
}: {
  label: string
  required: boolean
  fileName: string
  fileUrl: string
  isUploading: boolean
  onChange: (file: File) => void
}) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onChange(e.target.files[0])
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-black/5 last:border-b-0">
      <div className="flex items-center gap-3 min-w-0">
        {isUploading ? (
          <div className="w-12 h-12 rounded-lg bg-black/5 flex items-center justify-center flex-shrink-0">
            <Loader2
              size={18}
              className="animate-spin text-[#1E3A8A]"
            />
          </div>
        ) : fileUrl ? (
          <img
            src={fileUrl}
            alt={label}
            className="w-12 h-12 rounded-lg object-cover border border-black/10 flex-shrink-0"
          />
        ) : (
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
              fileName ? "bg-green-50" : "bg-black/5"
            }`}
          >
            {fileName ? (
              <CheckCircle2
                size={16}
                className="text-green-600"
              />
            ) : (
              <FileText
                size={16}
                className="text-black/40"
              />
            )}
          </div>
        )}

        <div className="min-w-0">
          <p className="text-sm font-medium text-black">
            {label}{" "}
            {required && (
              <span className="text-red-400">*</span>
            )}
          </p>

          <p className="text-xs text-black/40 truncate max-w-[220px]">
            {isUploading
              ? "Uploading..."
              : fileName || "PDF, JPG or PNG · Max 5MB"}
          </p>
        </div>
      </div>

      <label
        className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-medium border px-3.5 py-2 rounded-lg transition-colors ${
          isUploading
            ? "text-black/30 border-black/10 cursor-not-allowed"
            : "text-[#1E3A8A] border-[#1E3A8A]/20 cursor-pointer hover:bg-[#1E3A8A]/5"
        }`}
      >
        {isUploading ? (
          <>
            <Loader2
              size={13}
              className="animate-spin"
            />
            Uploading...
          </>
        ) : (
          <>
            <Upload size={13} />
            {fileName ? "Replace" : "Upload"}
          </>
        )}

        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFile}
          disabled={isUploading}
          className="hidden"
        />
      </label>
    </div>
  )
}

function getFileNameFromUrl(url: string) {
  if (!url) return ""

  return decodeURIComponent(
    url.split("/").pop()?.split("?")[0] ?? ""
  )
}

export default function DocumentsPage() {
  const { track: trackParam } =
    useParams<{ track: string }>()

  const track = (trackParam ??
    "undergraduate") as Track

  const config = trackConfigs[track]
  const labels =
    labelsByMode[config.educationMode]

  const base = `/admission/apply/${track}`

  const navigate = useNavigate()

  const { data, setDocuments } = useApplication()

  const [docs, setDocs] = useState<Documents>(
    data.documents
  )

  const [documentNames, setDocumentNames] =
    useState({
      primaryResult: getFileNameFromUrl(
        data.documents.primaryResult
      ),
      passportPhoto: getFileNameFromUrl(
        data.documents.passportPhoto
      ),
      idDocument: getFileNameFromUrl(
        data.documents.idDocument
      ),
      supporting: getFileNameFromUrl(
        data.documents.supporting
      ),
    })

  const [uploading, setUploading] =
    useState({
      primaryResult: false,
      passportPhoto: false,
      idDocument: false,
      supporting: false,
    })

  const isAnyUploading =
    Object.values(uploading).some(Boolean)

  const canContinue =
    !!(
      docs.primaryResult &&
      docs.passportPhoto &&
      docs.idDocument &&
      (!labels.supportingRequired ||
        docs.supporting)
    ) && !isAnyUploading

  const handleContinue = () => {
    if (!canContinue) return

    setDocuments(docs)
    navigate(`${base}/review`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="font-mono text-xs tracking-[0.2em] uppercase text-black/40">
          Documents
        </span>

        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-black mt-2">
          Upload Your Documents
        </h1>

        <p className="text-sm text-black/55 mt-2">
          Upload clear, legible copies. Accepted formats:
          PDF, JPG, PNG.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 px-6">

        {/* O'LEVEL RESULT */}
        <UploadRow
          label={labels.primaryResult}
          required
          fileName={documentNames.primaryResult}
          fileUrl={docs.primaryResult}
          isUploading={uploading.primaryResult}
          onChange={async (file) => {
            setUploading((prev) => ({
              ...prev,
              primaryResult: true,
            }))

            try {
              const response =
                await uploadDocument(
                  file,
                  "olevel_result"
                )

              const documentUrl =
                response.data.document_url

              setDocs((prev) => {
                const updated = {
                  ...prev,
                  primaryResult: documentUrl,
                }

                setDocuments(updated)

                return updated
              })

              setDocumentNames((prev) => ({
                ...prev,
                primaryResult: file.name,
              }))
            } catch (error) {
              console.error(
                "UPLOAD ERROR:",
                error
              )
            } finally {
              setUploading((prev) => ({
                ...prev,
                primaryResult: false,
              }))
            }
          }}
        />

        {/* PASSPORT */}
        <UploadRow
          label="Passport Photograph"
          required
          fileName={documentNames.passportPhoto}
          fileUrl={docs.passportPhoto}
          isUploading={uploading.passportPhoto}
          onChange={async (file) => {
            setUploading((prev) => ({
              ...prev,
              passportPhoto: true,
            }))

            try {
              const response =
                await uploadDocument(
                  file,
                  "passport"
                )

              const documentUrl =
                response.data.document_url

              setDocs((prev) => {
                const updated = {
                  ...prev,
                  passportPhoto: documentUrl,
                }

                setDocuments(updated)

                return updated
              })

              setDocumentNames((prev) => ({
                ...prev,
                passportPhoto: file.name,
              }))
            } catch (error) {
              console.error(
                "PASSPORT UPLOAD ERROR:",
                error
              )
            } finally {
              setUploading((prev) => ({
                ...prev,
                passportPhoto: false,
              }))
            }
          }}
        />

        {/* BIRTH CERTIFICATE */}
        <UploadRow
          label={labels.idDocument}
          required
          fileName={documentNames.idDocument}
          fileUrl={docs.idDocument}
          isUploading={uploading.idDocument}
          onChange={async (file) => {
            setUploading((prev) => ({
              ...prev,
              idDocument: true,
            }))

            try {
              const response =
                await uploadDocument(
                  file,
                  "birth_certificate"
                )

              const documentUrl =
                response.data.document_url

              setDocs((prev) => {
                const updated = {
                  ...prev,
                  idDocument: documentUrl,
                }

                setDocuments(updated)

                return updated
              })

              setDocumentNames((prev) => ({
                ...prev,
                idDocument: file.name,
              }))
            } catch (error) {
              console.error(
                "BIRTH CERTIFICATE UPLOAD ERROR:",
                error
              )
            } finally {
              setUploading((prev) => ({
                ...prev,
                idDocument: false,
              }))
            }
          }}
        />

        {/* JAMB */}
        <UploadRow
          label="JAMB Result"
          required
          fileName={documentNames.supporting}
          fileUrl={docs.supporting}
          isUploading={uploading.supporting}
          onChange={async (file) => {
            setUploading((prev) => ({
              ...prev,
              supporting: true,
            }))

            try {
              const response =
                await uploadDocument(
                  file,
                  "jamb_result"
                )

              const documentUrl =
                response.data.document_url

              setDocs((prev) => {
                const updated = {
                  ...prev,
                  supporting: documentUrl,
                }

                setDocuments(updated)

                return updated
              })

              setDocumentNames((prev) => ({
                ...prev,
                supporting: file.name,
              }))
            } catch (error) {
              console.error(
                "JAMB RESULT UPLOAD ERROR:",
                error
              )
            } finally {
              setUploading((prev) => ({
                ...prev,
                supporting: false,
              }))
            }
          }}
        />

      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() =>
            navigate(`${base}/education`)
          }
          className="flex items-center gap-1.5 text-sm text-black/50 hover:text-black transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="flex items-center gap-2 bg-gradient-to-r from-[#14263F] to-[#1E3A8A] text-white text-sm font-semibold px-7 py-3.5 rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          Continue
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}