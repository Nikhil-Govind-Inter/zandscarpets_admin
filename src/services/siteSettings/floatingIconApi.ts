import { updateCmsStatus, updateCmsSortOrder } from "@/services/common/cmsOrderStatusApi";
import { apiFetch } from "@/lib/apiClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const baseUrl = `${API_BASE_URL}/site-settings/floating-icon`;

export interface FloatingIcon {
  id?: number;
  media_path: string | null;
  media_alt: string;
  media_alt_ar?: string;
  link: string;
  sort_order?: number;
  is_active?: boolean;
  deleted_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface FloatingIconResponse {
  success: boolean;
  message: string;
  timestamp: string;
  statusCode: number;
  data: {
    data: FloatingIcon[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied: boolean;
    };
  };
}

export interface FloatingIconItemResponse {
  success: boolean;
  message: string;
  timestamp: string;
  statusCode: number;
  data: FloatingIcon;
}

export interface CreateFloatingIconData {
  media_path?: File | string;
  media_alt: string;
  link: string;
  sort_order?: number;
  is_active?: boolean;
}

// Fetch all floating icon items
export const fetchFloatingIconList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<FloatingIconResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await apiFetch(`${baseUrl}?${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch floating icon data");
  }

  return response.json();
};

// Fetch single floating icon item
export const fetchFloatingIconById = async (
  id: number,
): Promise<FloatingIconItemResponse> => {
  const response = await apiFetch(`${baseUrl}/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch floating icon item");
  }

  return response.json();
};

// Create floating icon item
export const createFloatingIcon = async (
  formData: FormData,
): Promise<FloatingIconItemResponse> => {
  const response = await apiFetch(`${baseUrl}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to create floating icon item");
  }

  return response.json();
};

// Update floating icon item
export const updateFloatingIcon = async (
  id: number,
  formData: FormData,
): Promise<FloatingIconItemResponse> => {
  const response = await apiFetch(`${baseUrl}/${id}`, {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to update floating icon item");
  }

  return response.json();
};

// Delete floating icon item
export const deleteFloatingIcon = async (id: number): Promise<void> => {
  const response = await apiFetch(`${baseUrl}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete floating icon item");
  }
};

// Quick status toggle / sort-order change via the shared single-field CMS endpoints.
export const toggleFloatingIconStatus = (item: { id?: number | string }, isActive: boolean) =>
  updateCmsStatus("floating-icons", item.id!, isActive);

export const updateFloatingIconSortOrder = (item: { id?: number | string }, sortOrder: number) =>
  updateCmsSortOrder("floating-icons", item.id!, sortOrder);
