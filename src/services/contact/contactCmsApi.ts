import { apiFetch } from "@/lib/apiClient";

// Contact > CMS — backed by `/api/backend/contact/contact-cms` (authMiddleware-gated). Singleton
// resource, no media fields, mirrors homeCmsApi.ts's ApiError + envelope-parsing convention.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CONTACT_CMS_URL = `${API_BASE_URL}/contact/contact-cms`;

export interface ContactCms {
  id?: number;
  title: string;
  description: string;
  form_title: string;
  social_media_title: string;
  map_url: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  statusCode?: number;
  timestamp?: string;
  data: T;
}

interface ApiErrorEnvelope {
  success: false;
  error?: {
    message?: string;
    code?: string;
    statusCode?: number;
    details?: unknown;
  };
  message?: string;
}

export class ApiError extends Error {
  code?: string;
  details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

const parseEnvelope = async <T>(
  response: Response,
): Promise<ApiEnvelope<T>> => {
  const body = await response
    .json()
    .catch(() => ({}) as ApiEnvelope<T> & ApiErrorEnvelope);
  if (!response.ok || !body.success) {
    const errorBody = body as ApiErrorEnvelope;
    const message =
      errorBody.error?.message ||
      errorBody.message ||
      `Request failed with status ${response.status}`;
    throw new ApiError(
      message,
      errorBody.error?.code,
      errorBody.error?.details,
    );
  }
  return body;
};

// Fetch Contact CMS data
export const fetchContactCms = async (): Promise<ApiEnvelope<ContactCms | null>> => {
  const response = await apiFetch(CONTACT_CMS_URL);
  return parseEnvelope<ContactCms | null>(response);
};

// Create or update the Contact CMS singleton row. `id` defaults to 1, mirroring
// homeCmsApi.ts's `PUT .../1` — the backend ignores the id and does a findOne().
export const saveContactCms = async (
  data: Omit<ContactCms, "id" | "createdAt" | "updatedAt">,
  id: number = 1,
): Promise<ApiEnvelope<ContactCms>> => {
  const response = await apiFetch(`${CONTACT_CMS_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseEnvelope<ContactCms>(response);
};
