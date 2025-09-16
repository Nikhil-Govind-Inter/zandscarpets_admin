const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export interface HomeMap {
  id?: number;
  year: number;
  title: string;
  media_path: string | File;
  media_alt: string;
  status: boolean;
  sort_order: number;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface HomeMapResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: {
    list: HomeMap[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied: boolean;
    };
  };
}

export interface HomeMapSingleResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: HomeMap;
}

// Fetch Home Maps with pagination and search
export const fetchHomeMaps = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<HomeMapResponse> => {
  let url = `${API_BASE_URL}/backend/home/home-map?page=${page}&limit=${limit}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Home Maps");
  }

  return response.json();
};

// Fetch single Home Map by ID
export const fetchHomeMapById = async (
  id: number
): Promise<HomeMapSingleResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/backend/home/home-map/${id}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Home Map");
  }

  return response.json();
};

// Create or Update Home Map
export const saveHomeMap = async (
  data: {
    year: number;
    title: string;
    media_file?: File;
    media_alt: string;
    status: boolean;
    sort_order: number;
  },
  id?: number
): Promise<HomeMapSingleResponse> => {
  const formData = new FormData();

  // Append all fields
  formData.append("year", data.year.toString());
  formData.append("title", data.title);
  formData.append("media_alt", data.media_alt);
  formData.append("status", data.status ? "1" : "0");
  formData.append("sort_order", data.sort_order.toString());

  // Append file if provided
  if (data.media_file) {
    formData.append("media_path", data.media_file);
  }

  const url = id 
    ? `${API_BASE_URL}/backend/home/home-map/${id}`
    : `${API_BASE_URL}/backend/home/home-map`;

  const response = await fetch(url, {
    method: id ? "PUT" : "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to save Home Map");
  }

  return response.json();
};

// Delete Home Map
export const deleteHomeMap = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(
    `${API_BASE_URL}/backend/home/home-map/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete Home Map");
  }

  return response.json();
};