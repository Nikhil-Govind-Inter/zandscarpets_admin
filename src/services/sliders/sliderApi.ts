// Slider API service - Multiple entries management
export interface SliderData {
  id?: number;
  left_title: string;
  left_highlight_title: string;
  left_icon_one_alt: string;
  left_icon_one_link: string;
  left_icon_two_alt: string;
  left_icon_two_link: string;
  left_media_type: string;
  left_media_alt: string;
  left_media_link: string;
  right_title: string;
  right_highlight_title: string;
  right_icon_one_alt: string;
  right_icon_one_link: string;
  right_icon_two_alt: string;
  right_icon_two_link: string;
  right_media_type: string;
  right_media_alt: string;
  right_media_link: string;
  left_icon_one?: File | string;
  left_icon_two?: File | string;
  left_media_path?: File | string;
  right_icon_one?: File | string;
  right_icon_two?: File | string;
  right_media_path?: File | string;
  status?: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

// Get all sliders
export const getSliders = async (): Promise<SliderData[]> => {
  const response = await fetch(`${API_BASE_URL}/healthcare/sliders`);
  if (!response.ok) {
    throw new Error("Failed to fetch sliders");
  }
  return response.json();
};

// Get slider by ID
export const getSlider = async (id: number): Promise<SliderData> => {
  const response = await fetch(`${API_BASE_URL}/healthcare/sliders/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch slider");
  }
  return response.json();
};

// Create new slider
export const createSlider = async (data: SliderData): Promise<SliderData> => {
  const formData = new FormData();

  // Add text fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && !(value instanceof File)) {
      formData.append(key, value as string);
    }
  });

  // Add file fields
  if (data.left_icon_one) formData.append("left_icon_one", data.left_icon_one);
  if (data.left_icon_two) formData.append("left_icon_two", data.left_icon_two);
  if (data.left_media_path)
    formData.append("left_media_path", data.left_media_path);
  if (data.right_icon_one)
    formData.append("right_icon_one", data.right_icon_one);
  if (data.right_icon_two)
    formData.append("right_icon_two", data.right_icon_two);
  if (data.right_media_path)
    formData.append("right_media_path", data.right_media_path);

  const response = await fetch(`${API_BASE_URL}/healthcare/sliders`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to create slider");
  }

  return response.json();
};

// Update slider
export const updateSlider = async (
  id: number,
  data: SliderData
): Promise<SliderData> => {
  const formData = new FormData();

  // Add text fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && !(value instanceof File)) {
      formData.append(key, value as string);
    }
  });

  // Add file fields
  if (data.left_icon_one) formData.append("left_icon_one", data.left_icon_one);
  if (data.left_icon_two) formData.append("left_icon_two", data.left_icon_two);
  if (data.left_media_path)
    formData.append("left_media_path", data.left_media_path);
  if (data.right_icon_one)
    formData.append("right_icon_one", data.right_icon_one);
  if (data.right_icon_two)
    formData.append("right_icon_two", data.right_icon_two);
  if (data.right_media_path)
    formData.append("right_media_path", data.right_media_path);

  const response = await fetch(`${API_BASE_URL}/healthcare/sliders/${id}`, {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to update slider");
  }

  return response.json();
};

// Delete slider
export const deleteSlider = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/healthcare/sliders/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete slider");
  }
};

// Toggle slider status
export const toggleSliderStatus = async (id: number): Promise<SliderData> => {
  const response = await fetch(
    `${API_BASE_URL}/healthcare/sliders/${id}/toggle-status`,
    {
      method: "PATCH",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to toggle slider status");
  }

  return response.json();
};
