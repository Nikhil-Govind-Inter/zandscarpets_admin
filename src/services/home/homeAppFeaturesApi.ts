import { apiFetch } from "@/lib/apiClient";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export interface HomeAppFeature {
  id?: number;
  title: string;
  icon: string | File;
  icon_alt: string;
  status: boolean;
  sort_order: number;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface HomeAppFeatureResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: {
    list: HomeAppFeature[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied: boolean;
    };
  };
}

export interface HomeAppFeatureSingleResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: HomeAppFeature;
}

// Fetch Home App Features with pagination and search
export const fetchHomeAppFeatures = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<HomeAppFeatureResponse> => {
  let url = `${API_BASE_URL}/backend/home/home-app-features?page=${page}&limit=${limit}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  const response = await apiFetch(url, {
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Home App Features");
  }

  return response.json();
};

// Fetch single Home App Feature by ID
export const fetchHomeAppFeatureById = async (
  id: number
): Promise<HomeAppFeatureSingleResponse> => {
  const response = await apiFetch(
    `${API_BASE_URL}/backend/home/home-app-features/${id}`,
    {
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Home App Feature");
  }

  return response.json();
};

// Create or Update Home App Feature
export const saveHomeAppFeature = async (
  data: {
    title: string;
    icon_file?: File;
    icon_alt: string;
    status: boolean;
    sort_order: number;
  },
  id?: number
): Promise<HomeAppFeatureSingleResponse> => {
  const formData = new FormData();

  // Append all fields
  formData.append("title", data.title);
  formData.append("icon_alt", data.icon_alt);
  formData.append("status", data.status ? "1" : "0");
  formData.append("sort_order", data.sort_order.toString());

  // Append file if provided
  if (data.icon_file) {
    formData.append("icon", data.icon_file);
  }

  const url = id 
    ? `${API_BASE_URL}/backend/home/home-app-features/${id}`
    : `${API_BASE_URL}/backend/home/home-app-features`;

  const response = await apiFetch(url, {
    method: id ? "PUT" : "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to save Home App Feature");
  }

  return response.json();
};

// Delete Home App Feature
export const deleteHomeAppFeature = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  const response = await apiFetch(
    `${API_BASE_URL}/backend/home/home-app-features/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete Home App Feature");
  }

  return response.json();
};