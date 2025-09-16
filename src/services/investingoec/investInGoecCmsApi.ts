const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export interface InvestInGoecCmsData {
  id?: number;
  banner_title: string;
  invest_media_path: string | File;
  invest_media_alt: string;
  invest_description: string;
  future_transportation_title: string;
  future_transportation_description: string;
  future_transportation_media_path: string | File;
  future_transportation_media_alt: string;
  business_model_title: string;
  why_invest_title: string;
  why_invest_description: string;
  why_invest_media_path: string | File;
  why_invest_media_alt: string;
  partners_title: string;
  invest_in_goec_title: string;
  invest_in_goec_media_path: string | File;
  invest_in_goec_media_alt: string;
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
    `${API_BASE_URL}/backend/investingoec/invest-in-goec-cms`,
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
    invest_media_file?: File;
    invest_media_alt: string;
    invest_description: string;
    future_transportation_title: string;
    future_transportation_description: string;
    future_transportation_media_file?: File;
    future_transportation_media_alt: string;
    business_model_title: string;
    why_invest_title: string;
    why_invest_description: string;
    why_invest_media_file?: File;
    why_invest_media_alt: string;
    partners_title: string;
    invest_in_goec_title: string;
    invest_in_goec_media_file?: File;
    invest_in_goec_media_alt: string;
  }
): Promise<InvestInGoecCmsResponse> => {
  const formData = new FormData();

  // Append text fields
  formData.append("banner_title", data.banner_title);
  formData.append("invest_media_alt", data.invest_media_alt);
  formData.append("invest_description", data.invest_description);
  formData.append("future_transportation_title", data.future_transportation_title);
  formData.append("future_transportation_description", data.future_transportation_description);
  formData.append("future_transportation_media_alt", data.future_transportation_media_alt);
  formData.append("business_model_title", data.business_model_title);
  formData.append("why_invest_title", data.why_invest_title);
  formData.append("why_invest_description", data.why_invest_description);
  formData.append("why_invest_media_alt", data.why_invest_media_alt);
  formData.append("partners_title", data.partners_title);
  formData.append("invest_in_goec_title", data.invest_in_goec_title);
  formData.append("invest_in_goec_media_alt", data.invest_in_goec_media_alt);

  // Append files if provided
  if (data.invest_media_file) {
    formData.append("invest_media_path", data.invest_media_file);
  }
  if (data.future_transportation_media_file) {
    formData.append("future_transportation_media_path", data.future_transportation_media_file);
  }
  if (data.why_invest_media_file) {
    formData.append("why_invest_media_path", data.why_invest_media_file);
  }
  if (data.invest_in_goec_media_file) {
    formData.append("invest_in_goec_media_path", data.invest_in_goec_media_file);
  }

  const response = await fetch(
    `${API_BASE_URL}/backend/investingoec/invest-in-goec-cms`,
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