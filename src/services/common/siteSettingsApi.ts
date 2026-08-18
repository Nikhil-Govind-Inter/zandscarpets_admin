import { apiFetch } from "@/lib/apiClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/backend";

export interface SiteSettings {
  header_logo_media_path: string;
  footer_logo_media_path: string;
  address: string;
  email: string;
  phone_number: string;
  whatsapp_number: string;
  admin_email: string;
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
  admin_email: string;
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
  formData: FormData,
  id: number
): Promise<SiteSettings> => {
  const response = await apiFetch(`${fetchUrl}/1`, {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to save Site Settings data");
  }

  return response.json();
};
