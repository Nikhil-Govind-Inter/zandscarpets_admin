import { apiFetch } from "@/lib/apiClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/backend";

export interface SiteSettings {
  id?: number;
  header_logo_media_path: string;
  footer_logo_media_path: string;
  address: string;
  email: string;
  phone_number: string;
  whatsapp_number: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteSettingsResponse {
  success: boolean;
  message: string;
  timestamp: string;
  statusCode: number;
  data: SiteSettings;
}

export interface SaveSiteSettingsData {
  header_logo_media_path?: File | string;
  footer_logo_media_path?: File | string;
  address: string;
  email: string;
  phone_number: string;
  whatsapp_number: string;
}

const fetchUrl = `${API_BASE_URL}/site-settings/site-settings`;

// Fetch Site Settings data
export const fetchSiteSettings = async (): Promise<SiteSettingsResponse> => {
  const response = await apiFetch(fetchUrl);

  if (!response.ok) {
    throw new Error("Failed to fetch Site Settings data");
  }

  return response.json();
};

// Update Site Settings data (only a PUT /:id endpoint exists on the backend)
export const saveSiteSettings = async (
  id: number,
  formData: FormData
): Promise<SiteSettings> => {
  const response = await apiFetch(`${fetchUrl}/${id}`, {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to save Site Settings data");
  }

  return response.json();
};
