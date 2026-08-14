import { apiFetch } from "@/lib/apiClient";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export interface HomeCms {
  id?: number;
  milestone_description?: string;
  make_ride_title?: string;
  make_ride_highlight_title?: string;
  make_ride_description?: string;
  make_ride_media_type?: string;
  make_ride_media_desktop_path?: File | string;
  make_ride_media_mobile_path?: File | string;
  make_ride_media_alt?: string;
  explore_title?: string;
  explore_description?: string;
  app_feature_title?: string;
  app_feature_description?: string;
  app_feature_sub_title?: string;
  app_feature_media_type?: string;
  app_feature_media_desktop_path?: File | string;
  app_feature_media_mobile_path?: File | string;
  app_feature_media_alt?: string;
  investment_title?: string;
  investment_media_type?: string;
  investment_media_desktop_path?: File | string;
  investment_media_mobile_path?: File | string;
  investment_media_alt?: string;
  partners_title?: string;
  news_title?: string;
  blog_title?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HomeCmsResponse {
  success: boolean;
  message: string;
  timestamp?: string;
  statusCode?: number;
  data: HomeCms;
}

// Fetch Home CMS data
export const fetchHomeCms = async (): Promise<HomeCmsResponse> => {
  const response = await apiFetch(`${API_BASE_URL}/backend/home/home-cms`, {
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Home CMS data");
  }

  return response.json();
};

// Create or Update Home CMS data
export const saveHomeCms = async (
  data: Omit<HomeCms, "id" | "createdAt" | "updatedAt">
): Promise<HomeCmsResponse> => {
  const formData = new FormData();

  // Append all fields to FormData as required by the API
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  });

  const response = await apiFetch(`${API_BASE_URL}/backend/home/home-cms`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to save Home CMS data");
  }

  return response.json();
};
