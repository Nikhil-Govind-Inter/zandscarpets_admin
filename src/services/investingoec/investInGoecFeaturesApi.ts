const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export interface InvestInGoecFeaturesItem {
  id?: number;
  icon_path: string | File;
  icon_alt: string;
  description: string;
  status: boolean;
  sort_order: number;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvestInGoecFeaturesResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: {
    list: InvestInGoecFeaturesItem[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied: boolean;
    };
  };
}

export interface InvestInGoecFeaturesSingleResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: InvestInGoecFeaturesItem;
}

// Fetch Invest in GO EC Features items with pagination and search
export const fetchInvestInGoecFeatures = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<InvestInGoecFeaturesResponse> => {
  let url = `${API_BASE_URL}/backend/investingoec/invest-in-goec-features?page=${page}&limit=${limit}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Invest in GO EC Features items");
  }

  return response.json();
};

// Fetch single Invest in GO EC Features item by ID
export const fetchInvestInGoecFeaturesById = async (
  id: number
): Promise<InvestInGoecFeaturesSingleResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/backend/investingoec/invest-in-goec-features/${id}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Invest in GO EC Features item");
  }

  return response.json();
};

// Create or Update Invest in GO EC Features item
export const saveInvestInGoecFeaturesItem = async (
  data: {
    icon_file?: File;
    icon_alt: string;
    description: string;
    status: boolean;
    sort_order: number;
  },
  id?: number
): Promise<InvestInGoecFeaturesSingleResponse> => {
  const formData = new FormData();

  // Append all fields
  formData.append("icon_alt", data.icon_alt);
  formData.append("description", data.description);
  formData.append("status", data.status ? "1" : "0");
  formData.append("sort_order", data.sort_order.toString());

  // Append file if provided
  if (data.icon_file) {
    formData.append("icon_path", data.icon_file);
  }

  const url = id 
    ? `${API_BASE_URL}/backend/investingoec/invest-in-goec-features/${id}`
    : `${API_BASE_URL}/backend/investingoec/invest-in-goec-features`;

  const response = await fetch(url, {
    method: id ? "PUT" : "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to save Invest in GO EC Features item");
  }

  return response.json();
};

// Delete Invest in GO EC Features item
export const deleteInvestInGoecFeaturesItem = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(
    `${API_BASE_URL}/backend/investingoec/invest-in-goec-features/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete Invest in GO EC Features item");
  }

  return response.json();
};