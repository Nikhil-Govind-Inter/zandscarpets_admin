import { apiFetch } from "@/lib/apiClient";

// Services > CMS — backed by `/api/backend/services/service-cms` (authMiddleware-gated).
// Singleton resource, mirrors homeCmsApi.ts's fetch/save-in-place shape using the
// ApiError + envelope-parsing convention from pagesApi.ts.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SERVICE_CMS_URL = `${API_BASE_URL}/services/service-cms`;

export interface ServiceCms {
  id?: number;
  title: string;
  description: string;
  service_title: string;
  process_steps_title: string;
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

// Fetch Service CMS data
export const fetchServiceCms = async (): Promise<
  ApiEnvelope<ServiceCms | null>
> => {
  const response = await apiFetch(SERVICE_CMS_URL);
  return parseEnvelope<ServiceCms | null>(response);
};

// Create or update the Service CMS singleton row. `id` defaults to 1,
// mirroring homeCmsApi.ts's `saveHomeCms` — the backend ignores the id and
// does a findOne()/find-or-create.
export const saveServiceCms = async (
  data: Omit<ServiceCms, "id" | "createdAt" | "updatedAt">,
  id: number = 1,
): Promise<ApiEnvelope<ServiceCms>> => {
  const response = await apiFetch(`${SERVICE_CMS_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseEnvelope<ServiceCms>(response);
};
