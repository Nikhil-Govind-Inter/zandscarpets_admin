import { apiFetch } from "@/lib/apiClient";

// Home > CMS — backed by `/api/backend/home/home-cms` (authMiddleware-gated). Singleton resource,
// mirrors siteSettingsApi.ts's findOne/update-in-place shape but uses the ApiError + envelope-parsing
// convention from usersApi.ts/pagesApi.ts since there are no file fields to send as FormData.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const HOME_CMS_URL = `${API_BASE_URL}/home/home-cms`;

export interface HomeCms {
  id?: number;
  discover_title: string;
  residential_title: string;
  home_space_title: string;
  project_title: string;
  features_title: string;
  features_subtitle: string;
  features_description: string;
  work_title: string;
  testimonial_title: string;
  brand_title: string;
  cta_title: string;
  cta_description: string;
  faq_title: string;
  premium_title: string;
  premium_description: string;
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

// Fetch Home CMS data
export const fetchHomeCms = async (): Promise<ApiEnvelope<HomeCms | null>> => {
  const response = await apiFetch(HOME_CMS_URL);
  return parseEnvelope<HomeCms | null>(response);
};

// Create or update the Home CMS singleton row. `id` defaults to 1, mirroring
// siteSettingsApi.ts's `PUT .../1` — the backend ignores the id and does a findOne().
export const saveHomeCms = async (
  data: Omit<HomeCms, "id" | "createdAt" | "updatedAt">,
  id: number = 1,
): Promise<ApiEnvelope<HomeCms>> => {
  const response = await apiFetch(`${HOME_CMS_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseEnvelope<HomeCms>(response);
};
