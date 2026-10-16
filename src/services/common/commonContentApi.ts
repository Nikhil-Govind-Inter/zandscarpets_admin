import { apiFetch } from "@/lib/apiClient";

// Common Items > Content — backed by `/api/backend/common/content`. Singleton resource (findOne/update-in-place), JSON body.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const COMMON_CONTENT_URL = `${API_BASE_URL}/common/content`;

export interface CommonContent {
  id?: number;
  why_choose_title: string;
  why_choose_title_ar: string;
  side_section_title: string;
  side_section_title_ar: string;
  side_section_description: string;
  side_section_description_ar: string;
  button_text: string;
  button_text_ar: string;
  button_link: string;
  how_section_title: string;
  how_section_title_ar: string;
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

// Fetch Common content data
export const fetchCommonContent = async (): Promise<ApiEnvelope<CommonContent | null>> => {
  const response = await apiFetch(COMMON_CONTENT_URL);
  return parseEnvelope<CommonContent | null>(response);
};

// Create or update the Common content singleton row. `id` defaults to 1, mirroring
// siteSettingsApi.ts's `PUT .../1` — the backend ignores the id and does a findOne().
export const saveCommonContent = async (
  data: Omit<CommonContent, "id" | "createdAt" | "updatedAt">,
  id: number = 1,
): Promise<ApiEnvelope<CommonContent>> => {
  const response = await apiFetch(`${COMMON_CONTENT_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseEnvelope<CommonContent>(response);
};
