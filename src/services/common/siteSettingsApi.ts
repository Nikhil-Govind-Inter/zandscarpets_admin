const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/backend";

export interface SiteSettings {
  id?: number;
  address: string;
  email: string;
  phone: string;
  logo: string | null;
  logo_alt: string;
  favicon: string | null;
  footer_download_image_one: string | null;
  footer_download_image_one_alt: string;
  footer_download_image_one_link: string;
  footer_download_image_two: string | null;
  footer_download_image_two_alt: string;
  footer_download_image_two_link: string;
  footer_logo: string | null;
  footer_logo_alt: string;
  footer_description: string;
  social_media_title: string;
  subscribe_title: string;
  status?: boolean;
  deletedAt?: string | null;
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

export interface CreateSiteSettingsData {
  address: string;
  email: string;
  phone: string;
  logo?: File | string;
  logo_alt: string;
  favicon?: File | string;
  footer_download_image_one?: File | string;
  footer_download_image_one_alt: string;
  footer_download_image_one_link: string;
  footer_download_image_two?: File | string;
  footer_download_image_two_alt: string;
  footer_download_image_two_link: string;
  footer_logo?: File | string;
  footer_logo_alt: string;
  footer_description: string;
  social_media_title: string;
  subscribe_title: string;
}

// Fetch Site Settings data
export const fetchSiteSettings = async (): Promise<SiteSettingsResponse> => {
  const response = await fetch(`${API_BASE_URL}/site-settings`);

  if (!response.ok) {
    throw new Error("Failed to fetch Site Settings data");
  }

  return response.json();
};

// Create or Update Site Settings data
export const saveSiteSettings = async (
  formData: FormData
): Promise<SiteSettings> => {
  const response = await fetch(`${API_BASE_URL}/site-settings`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to save Site Settings data");
  }

  return response.json();
};