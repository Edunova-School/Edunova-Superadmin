const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api/v1"
const TOKEN_KEY = "edunova_token"

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

interface ApiOptions extends RequestInit {
  auth?: boolean // attach Bearer token — default true
}

async function apiFetch(path: string, options: ApiOptions = {}) {
  const { auth = true, headers, ...rest } = options
  const finalHeaders: Record<string, string> = { ...(headers as Record<string, string>) }

  if (rest.body && !(rest.body instanceof FormData)) {
    finalHeaders["Content-Type"] = "application/json"
  }
  if (auth) {
    const token = getToken()
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...rest, headers: finalHeaders })

  let data: any = null
  try { data = await res.json() } catch { }

  if (!res.ok) {
  console.error("API ERROR RESPONSE:", data)
  throw new Error(
    data?.message ||
    data?.error ||
    JSON.stringify(data) ||
    `Request failed (${res.status})`
  )
}
  return data
}

export function register(payload: {
  first_name: string
  last_name: string
  phone_number: string
  email: string
  password: string
  programme_name: string
}) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false
  })
}

export async function login(email: string, password: string) {
  const data = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }), auth: false })
  if (data?.data?.access_token) setToken(data.data.access_token)
  return data
}

export function logout() {
  return apiFetch("/auth/logout", { method: "POST" }).finally(clearToken)
}

export function verifyEmail(email: string, otp: string) {
  return apiFetch("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({
      email,
      otp,
    }),
    auth: false,
  })
}

// ---- Applicant profile ----
export const initProfile = () => apiFetch("/admission/profile", { method: "POST", body: JSON.stringify({}) })
export const getProfile = () => apiFetch("/admission/profile", { method: "GET" })
export const updateProfile = (payload: Record<string, any>) => apiFetch("/admission/profile", { method: "PATCH", body: JSON.stringify(payload) })

// ---- Documents ----
export async function uploadDocument(file: File, documentType: string) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("document_type", documentType)
  return apiFetch("/admission/upload", { method: "POST", body: formData })
}

// ---- Applications ----
export const createApplication = (programmeName: string) =>
  apiFetch("/admission/applications", {
    method: "POST",
    body: JSON.stringify({
      programme_name: programmeName,
    }),
  })
export const getApplications = () => apiFetch("/admission/applications", { method: "GET" })
export const submitApplication = (applicationId: string) => apiFetch(`/admission/applications/${applicationId}/submit`, { method: "POST" })
export const acceptAdmission = (applicationId: string) => apiFetch(`/admission/applications/${applicationId}/accept`, { method: "POST" })