import { apiFetch } from "@/lib/apiClient";

// Contact Enquiries — backed by `/api/backend/enquiries/contact-enquiry`
// (authMiddleware-gated). Read-only from this dashboard: submissions come
// from the public site, so there's no create/update here, only list/get/delete.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CONTACT_ENQUIRY_URL = `${API_BASE_URL}/enquiries/contact-enquiry`;

export interface ContactEnquiryRecord {
  id: number;
  name: string;
  email: string;
  phone: string;
  requirements: string;
  file: string | null;
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

export interface ContactEnquiryListResponse {
  data: {
    data: ContactEnquiryRecord[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

export const fetchContactEnquiryList = async (
  page: number,
  limit: number,
  search?: string,
): Promise<ContactEnquiryListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) params.append("search", search);

  const response = await apiFetch(`${CONTACT_ENQUIRY_URL}?${params}`);
  return parseEnvelope<ContactEnquiryListResponse["data"]>(response);
};

export const fetchContactEnquiryById = async (
  id: number,
): Promise<{ data: ContactEnquiryRecord }> => {
  const response = await apiFetch(`${CONTACT_ENQUIRY_URL}/${id}`);
  return parseEnvelope<ContactEnquiryRecord>(response);
};

export const deleteContactEnquiry = async (
  id: number,
): Promise<{ data: { id: number } }> => {
  const response = await apiFetch(`${CONTACT_ENQUIRY_URL}/${id}`, {
    method: "DELETE",
  });
  return parseEnvelope<{ id: number }>(response);
};
