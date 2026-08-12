const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export interface InvestInGoecCmsData {
  id?: number;
  banner_title: string;
  banner_media_desktop_path: string | File;
  banner_media_mobile_path: string | File;
  banner_media_alt: string;
  about_description: string;
  about_media_type: string;
  about_media_desktop_path: string | File;
  about_media_mobile_path: string | File;
  about_media_alt: string;
  growth_title: string;
  growth_description: string;
  growth_media_desktop_path: string | File;
  growth_media_mobile_path: string | File;
  growth_media_alt: string;
  explore_title: string;
  why_invest_title: string;
  why_invest_description: string;
  why_invest_media_desktop_path: string | File;
  why_invest_media_mobile_path: string | File;
  why_invest_media_alt: string;
  partners_title: string;
  invest_in_goec_title: string;
  invest_in_goec_media_path: string | File;
  invest_in_goec_media_alt: string;
  invest_media_path: string | File;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvestInGoecCmsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: InvestInGoecCmsData;
}

// Fetch Invest in GO EC CMS data
export const fetchInvestInGoecCms = async (): Promise<InvestInGoecCmsResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/backend/investingoec/invest-in-zandcarpets-cms`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Invest in GO EC CMS data");
  }

  return response.json();
};

// Update Invest in GO EC CMS data
export const updateInvestInGoecCms = async (
  data: {
    banner_title: string;
    banner_media_desktop_file?: File;
    banner_media_mobile_file?: File;
    banner_media_alt: string;
    about_description: string;
    about_media_type: string;
    about_media_desktop_file?: File;
    about_media_mobile_file?: File;
    about_media_alt: string;
    growth_title: string;
    growth_description: string;
    growth_media_desktop_file?: File;
    growth_media_mobile_file?: File;
    growth_media_alt: string;
    explore_title: string;
    why_invest_title: string;
    why_invest_description: string;
    why_invest_media_desktop_file?: File;
    why_invest_media_mobile_file?: File;
    why_invest_media_alt: string;
    partners_title: string;
    invest_in_goec_title: string;
    invest_in_goec_media_file?: File;
    invest_in_goec_media_alt: string;
    invest_media_file?: File;
  }
): Promise<InvestInGoecCmsResponse> => {
  const formData = new FormData();

  // Append text fields
  formData.append("banner_title", data.banner_title);
  formData.append("banner_media_alt", data.banner_media_alt);
  formData.append("about_description", data.about_description);
  formData.append("about_media_type", data.about_media_type);
  formData.append("about_media_alt", data.about_media_alt);
  formData.append("growth_title", data.growth_title);
  formData.append("growth_description", data.growth_description);
  formData.append("growth_media_alt", data.growth_media_alt);
  formData.append("explore_title", data.explore_title);
  formData.append("why_invest_title", data.why_invest_title);
  formData.append("why_invest_description", data.why_invest_description);
  formData.append("why_invest_media_alt", data.why_invest_media_alt);
  formData.append("partners_title", data.partners_title);
  formData.append("invest_in_goec_title", data.invest_in_goec_title);
  formData.append("invest_in_goec_media_alt", data.invest_in_goec_media_alt);

  // Append files if provided
  if (data.banner_media_desktop_file) {
    formData.append("banner_media_desktop_path", data.banner_media_desktop_file);
  }
  if (data.banner_media_mobile_file) {
    formData.append("banner_media_mobile_path", data.banner_media_mobile_file);
  }
  if (data.about_media_desktop_file) {
    formData.append("about_media_desktop_path", data.about_media_desktop_file);
  }
  if (data.about_media_mobile_file) {
    formData.append("about_media_mobile_path", data.about_media_mobile_file);
  }
  if (data.growth_media_desktop_file) {
    formData.append("growth_media_desktop_path", data.growth_media_desktop_file);
  }
  if (data.growth_media_mobile_file) {
    formData.append("growth_media_mobile_path", data.growth_media_mobile_file);
  }
  if (data.why_invest_media_desktop_file) {
    formData.append("why_invest_media_desktop_path", data.why_invest_media_desktop_file);
  }
  if (data.why_invest_media_mobile_file) {
    formData.append("why_invest_media_mobile_path", data.why_invest_media_mobile_file);
  }
  if (data.invest_in_goec_media_file) {
    formData.append("invest_in_goec_media_path", data.invest_in_goec_media_file);
  }
  if (data.invest_media_file) {
    formData.append("invest_media_path", data.invest_media_file);
  }

  const response = await fetch(
    `${API_BASE_URL}/backend/investingoec/invest-in-zandcarpets-cms`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update Invest in GO EC CMS data");
  }

  return response.json();
};