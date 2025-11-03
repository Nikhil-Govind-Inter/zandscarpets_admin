const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export interface AboutOurJourneyItem {
  id?: number;
  year: number;
  title: string;
  description: string;
  media_path: string | File;
  media_alt: string;
  status: boolean;
  sort_order: number;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AboutOurJourneyResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: {
    list: AboutOurJourneyItem[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
      isSearchApplied: boolean;
    };
  };
}

export interface AboutOurJourneySingleResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: AboutOurJourneyItem;
}

// Fetch About Our Journey items with pagination and search
export const fetchAboutOurJourney = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<AboutOurJourneyResponse> => {
  let url = `${API_BASE_URL}/backend/about/about-our-journey?page=${page}&limit=${limit}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch About Our Journey items");
  }

  return response.json();
};

// Fetch single About Our Journey item by ID
export const fetchAboutOurJourneyById = async (
  id: number
): Promise<AboutOurJourneySingleResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/backend/about/about-our-journey/${id}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch About Our Journey item");
  }

  return response.json();
};

// Create or Update About Our Journey item
export const saveAboutOurJourneyItem = async (
  data: {
    year: number;
    title: string;
    description: string;
    media_file?: File;
    media_alt: string;
    status: boolean;
    sort_order: number;
  },
  id?: number
): Promise<AboutOurJourneySingleResponse> => {
  const formData = new FormData();

  // Append all fields
  formData.append("year", data.year.toString());
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("media_alt", data.media_alt);
  formData.append("status", data.status ? "1" : "0");
  formData.append("sort_order", data.sort_order.toString());

  // Append file if provided
  if (data.media_file) {
    formData.append("media_path", data.media_file);
  }

  const url = id 
    ? `${API_BASE_URL}/backend/about/about-our-journey/${id}`
    : `${API_BASE_URL}/backend/about/about-our-journey`;

  const response = await fetch(url, {
    method: id ? "PUT" : "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to save About Our Journey item");
  }

  return response.json();
};

// Delete About Our Journey item
export const deleteAboutOurJourneyItem = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(
    `${API_BASE_URL}/backend/about/about-our-journey/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete About Our Journey item");
  }

  return response.json();
};