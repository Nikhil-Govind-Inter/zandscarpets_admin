import { apiFetch } from "@/lib/apiClient";

// Policies > Privacy Policy — backed by `/api/backend/policies/privacy-policy` (authMiddleware-gated). Singleton
// resource, no media fields, mirrors homeCmsApi.ts's ApiError + envelope-parsing convention.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PRIVACY_POLICY_URL = `${API_BASE_URL}/policies/privacy-policy`;

export interface PrivacyPolicy {
  id?: number;
  title: string;
  title_ar: string;
  content: string;
  content_ar: string;
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

// Fetch Privacy Policy data
export const fetchPrivacyPolicy = async (): Promise<ApiEnvelope<PrivacyPolicy | null>> => {
  const response = await apiFetch(PRIVACY_POLICY_URL);
  return parseEnvelope<PrivacyPolicy | null>(response);
};

// Create or update the Privacy Policy singleton row. `id` defaults to 1, mirroring
// homeCmsApi.ts's `PUT .../1` — the backend ignores the id and does a findOne().
export const savePrivacyPolicy = async (
  data: Omit<PrivacyPolicy, "id" | "createdAt" | "updatedAt">,
  id: number = 1,
): Promise<ApiEnvelope<PrivacyPolicy>> => {
  const response = await apiFetch(`${PRIVACY_POLICY_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseEnvelope<PrivacyPolicy>(response);
};
