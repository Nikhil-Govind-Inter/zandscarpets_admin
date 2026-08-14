import { apiFetch } from "@/lib/apiClient";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export interface AboutOurValue {
  id?: number;
  title: string;
  description: string;
  status: boolean;
  sort_order: number;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AboutOurValuesResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: {
    list: AboutOurValue[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied: boolean;
    };
  };
}

export interface AboutOurValueSingleResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: AboutOurValue;
}

// Fetch About Our Values with pagination and search
export const fetchAboutOurValues = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<AboutOurValuesResponse> => {
  let url = `${API_BASE_URL}/backend/about/about-our-values?page=${page}&limit=${limit}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  const response = await apiFetch(url, {
  });

  if (!response.ok) {
    throw new Error("Failed to fetch About Our Values");
  }

  return response.json();
};

// Fetch single About Our Value by ID
export const fetchAboutOurValueById = async (
  id: number
): Promise<AboutOurValueSingleResponse> => {
  const response = await apiFetch(
    `${API_BASE_URL}/backend/about/about-our-values/${id}`,
    {
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch About Our Value");
  }

  return response.json();
};

// Create or Update About Our Value
export const saveAboutOurValue = async (
  data: {
    title: string;
    description: string;
    status: boolean;
    sort_order: number;
  },
  id?: number
): Promise<AboutOurValueSingleResponse> => {
  const formData = new FormData();

  // Append all fields
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("status", data.status ? "1" : "0");
  formData.append("sort_order", data.sort_order.toString());

  const url = id 
    ? `${API_BASE_URL}/backend/about/about-our-values/${id}`
    : `${API_BASE_URL}/backend/about/about-our-values`;

  const response = await apiFetch(url, {
    method: id ? "PUT" : "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to save About Our Value");
  }

  return response.json();
};

// Delete About Our Value
export const deleteAboutOurValue = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  const response = await apiFetch(
    `${API_BASE_URL}/backend/about/about-our-values/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete About Our Value");
  }

  return response.json();
};