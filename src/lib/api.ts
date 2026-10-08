const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||"https://edunova-backend-stn1.onrender.com/api/v1";
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
export const getAcademicSessions = () =>
  apiFetch("/superadmin/academic-sessions", {
    method: "GET",
  })
  export const createAcademicSession = (name: string) =>
  apiFetch("/superadmin/academic-sessions", {
    method: "POST",
    body: JSON.stringify({ name }),
  })
  export const updateApplicationWindow = (
  sessionId: string,
  applicationStartDate: string,
  applicationEndDate: string
) =>
  apiFetch(
    `/superadmin/academic-sessions/${sessionId}/application-window`,
    {
      method: "PATCH",
      body: JSON.stringify({
        application_start_date: applicationStartDate,
        application_end_date: applicationEndDate,
      }),
    }
  )
  export const getApplicationWindow = (sessionId: string) =>
  apiFetch(
    `/superadmin/academic-sessions/${sessionId}/application-window`,
    {
      method: "GET",
    }
  )
  export const setCurrentAcademicSession = (sessionId: string) =>
  apiFetch(
    `/superadmin/academic-sessions/${sessionId}/current`,
    {
      method: "PATCH",
    }
  )
  export const getAdminDashboardSummary = () =>
  apiFetch("/admin/dashboard/summary", {
    method: "GET",
  })
  export const getAdminApplications = (status?: string) =>
  apiFetch(
    status
      ? `/admin/applications/?status=${encodeURIComponent(status)}`
      : "/admin/applications/",
    {
      method: "GET",
    }
  )
  export const getAdminApplicationDetails = (applicationId: string) =>
  apiFetch(`/superadmin/${applicationId}`, {
    method: "GET",
  })
 export const reviewAdminApplication = (
  applicationId: string,
  status: "UNDER_REVIEW" | "OFFERED" | "REJECTED",
  remarks?: string
) =>
  apiFetch(`/superadmin/${applicationId}/review`, {
    method: "POST",
    body: JSON.stringify({
      status,
      ...(remarks ? { remarks } : {}),
    }),
  });
  export const getApplicationReviews = (applicationId: string) =>
  apiFetch(`/superadmin/${applicationId}/reviews`, {
    method: "GET",
  });
  export const getAdminApplicants = (params?: {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
}) => {
  const query = new URLSearchParams();

  if (params?.page) query.set("page", String(params.page));
  if (params?.per_page) query.set("per_page", String(params.per_page));
  if (params?.search) query.set("search", params.search);
  if (params?.status) query.set("status", params.status);

  const queryString = query.toString();

  return apiFetch(
    `/admin/applicants/${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
    }
  );
};
export const getAdminAdmissionsSummary = (academicSessionId?: string) =>
  apiFetch(
    academicSessionId
      ? `/admin/admissions/summary?academic_session_id=${encodeURIComponent(
          academicSessionId
        )}`
      : "/admin/admissions/summary",
    {
      method: "GET",
    }
  );
  export const getAdminDocuments = (params?: {
  page?: number;
  per_page?: number;
  review_status?: string;
  system_status?: string;
  search?: string;
}) => {
  const query = new URLSearchParams();

  if (params?.page) query.set("page", String(params.page));
  if (params?.per_page) query.set("per_page", String(params.per_page));
  if (params?.review_status) query.set("review_status", params.review_status);
  if (params?.system_status) query.set("system_status", params.system_status);
  if (params?.search) query.set("search", params.search);

  const queryString = query.toString();

  return apiFetch(
    `/admin/documents/${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
    }
  );
};
export const reviewAdminDocument = (
  documentId: string,
  status: "ACCEPTED" | "REJECTED",
  reviewNote?: string
) =>
  apiFetch(`/admin/documents/${documentId}/review`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
      ...(reviewNote ? { review_note: reviewNote } : {}),
    }),
  });
export const getSuperAdminPayments = (params?: {
  status?: string;
  payment_method?: string;
  search?: string;
}) => {
  const query = new URLSearchParams();

  if (params?.status) {
    query.set("status", params.status);
  }

  if (params?.payment_method) {
    query.set("payment_method", params.payment_method);
  }

  if (params?.search) {
    query.set("search", params.search);
  }

  const queryString = query.toString();

  return apiFetch(
    `/superadmin/payments${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
    }
  );
};

export const getSuperAdminPaymentDetails = (paymentId: string) =>
  apiFetch(`/superadmin/payments/${paymentId}`, {
    method: "GET",
  });
 export const getAdminFaculties = () =>
  apiFetch("/superadmin/faculties", {
    method: "GET",
  });

export const createAdminFaculty = (name: string) =>
  apiFetch("/superadmin/faculties", {
    method: "POST",
    body: JSON.stringify({
      name,
    }),
  });

export const updateAdminFaculty = (
  facultyId: string,
  data: {
    name?: string;
    is_active?: boolean;
  }
) =>
  apiFetch(`/superadmin/faculties/${facultyId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const getAdminDepartments = () =>
  apiFetch("/superadmin/departments", {
    method: "GET",
  });

export const createAdminDepartment = (
  name: string,
  facultyId: string
) =>
  apiFetch("/superadmin/departments", {
    method: "POST",
    body: JSON.stringify({
      name,
      faculty_id: facultyId,
    }),
  });

export const updateAdminDepartment = (
  departmentId: string,
  data: {
    name?: string;
    faculty_id?: string;
    is_active?: boolean;
  }
) =>
  apiFetch(`/superadmin/departments/${departmentId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const getAdminProgrammes = () =>
  apiFetch("/superadmin/programmes", {
    method: "GET",
  });

export const createAdminProgramme = (data: {
  name: string;
  department_id: string;
  duration_years: number;
  capacity: number;
  requirements: string;
}) =>
  apiFetch("/superadmin/programmes", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateAdminProgramme = (
  programmeId: string,
  data: {
    name?: string;
    department_id?: string;
    duration_years?: number;
    capacity?: number;
    requirements?: string;
    is_active?: boolean;
  }
) =>
  apiFetch(`/superadmin/programmes/${programmeId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
export const getProgrammeCapacities = (
  academicSessionId: string
) =>
  apiFetch(
    `/superadmin/academic-sessions/${academicSessionId}/programme-capacities`,
    {
      method: "GET",
    }
  );

export const createProgrammeCapacity = (data: {
  academic_session_id: string;
  programme_id: string;
  capacity: number;
}) =>
  apiFetch("/superadmin/programme-capacities", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateProgrammeCapacity = (
  capacityId: string,
  capacity: number
) =>
  apiFetch(`/superadmin/programme-capacities/${capacityId}`, {
    method: "PATCH",
    body: JSON.stringify({
      capacity,
    }),
  });
  export const getSemesters = () =>
  apiFetch("/superadmin/semesters/", {
    method: "GET",
  });

export const createSemester = (name: string, order: number) =>
  apiFetch("/superadmin/semesters/", {
    method: "POST",
    body: JSON.stringify({
      name,
      order,
    }),
  });

export const getSemester = (semesterId: string) =>
  apiFetch(`/superadmin/semesters/${semesterId}`, {
    method: "GET",
  });

export const activateSemester = (semesterId: string) =>
  apiFetch(`/superadmin/semesters/${semesterId}/activate`, {
    method: "PATCH",
  });