import { apiFetch } from "@/lib/apiClient";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export interface AboutCms {
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
  learn_more_title: string;
  learn_more_description: string;
  learn_more_media_path: string | File;
  learn_more_media_alt: string;
  our_mission_title: string;
  our_mission_description: string;
  our_vision_title: string;
  our_vision_description: string;
  leading_game_title: string;
  charging_station_count: number;
  charging_station_subtitle: string;
  our_values_title: string;
  our_values_description: string;
  our_journey_title: string;
  our_journey_description: string;
  meet_team_title: string;
  meet_team_description: string;
  meet_team_media_path: string | File;
  meet_team_media_alt: string;
  our_associate_title: string;
  our_associate_description: string;
  media_title: string;
  media_description: string;
  contact_us_super_title: string;
  contact_us_title: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AboutCmsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: AboutCms;
}

// Fetch About CMS data (single entry)
export const fetchAboutCms = async (): Promise<AboutCmsResponse> => {
  const response = await apiFetch(`${API_BASE_URL}/backend/about/about-cms`, {
  });

  if (!response.ok) {
    throw new Error("Failed to fetch About CMS data");
  }

  return response.json();
};

// Create or Update About CMS data
export const saveAboutCms = async (data: {
  banner_title: string;
  banner_media_desktop_file?: File;
  banner_media_mobile_file?: File;
  banner_media_alt: string;
  about_description: string;
  about_media_type: string;
  about_media_desktop_file?: File;
  about_media_mobile_file?: File;
  about_media_alt: string;
  learn_more_title: string;
  learn_more_description: string;
  learn_more_media_file?: File;
  learn_more_media_alt: string;
  our_mission_title: string;
  our_mission_description: string;
  our_vision_title: string;
  our_vision_description: string;
  leading_game_title: string;
  charging_station_count: number;
  charging_station_subtitle: string;
  our_values_title: string;
  our_values_description: string;
  our_journey_title: string;
  our_journey_description: string;
  meet_team_title: string;
  meet_team_description: string;
  meet_team_media_file?: File;
  meet_team_media_alt: string;
  our_associate_title: string;
  our_associate_description: string;
  media_title: string;
  media_description: string;
  contact_us_super_title: string;
  contact_us_title: string;
}): Promise<AboutCmsResponse> => {
  const formData = new FormData();

  // Append text fields
  formData.append("banner_title", data.banner_title);
  formData.append("banner_media_alt", data.banner_media_alt);
  formData.append("about_description", data.about_description);
  formData.append("about_media_type", data.about_media_type);
  formData.append("about_media_alt", data.about_media_alt);
  formData.append("learn_more_title", data.learn_more_title);
  formData.append("learn_more_description", data.learn_more_description);
  formData.append("learn_more_media_alt", data.learn_more_media_alt);
  formData.append("our_mission_title", data.our_mission_title);
  formData.append("our_mission_description", data.our_mission_description);
  formData.append("our_vision_title", data.our_vision_title);
  formData.append("our_vision_description", data.our_vision_description);
  formData.append("leading_game_title", data.leading_game_title);
  formData.append("charging_station_count", data.charging_station_count.toString());
  formData.append("charging_station_subtitle", data.charging_station_subtitle);
  formData.append("our_values_title", data.our_values_title);
  formData.append("our_values_description", data.our_values_description);
  formData.append("our_journey_title", data.our_journey_title);
  formData.append("our_journey_description", data.our_journey_description);
  formData.append("meet_team_title", data.meet_team_title);
  formData.append("meet_team_description", data.meet_team_description);
  formData.append("meet_team_media_alt", data.meet_team_media_alt);
  formData.append("our_associate_title", data.our_associate_title);
  formData.append("our_associate_description", data.our_associate_description);
  formData.append("media_title", data.media_title);
  formData.append("media_description", data.media_description);
  formData.append("contact_us_super_title", data.contact_us_super_title);
  formData.append("contact_us_title", data.contact_us_title);

  // Append file fields
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
  if (data.learn_more_media_file) {
    formData.append("learn_more_media_path", data.learn_more_media_file);
  }
  if (data.meet_team_media_file) {
    formData.append("meet_team_media_path", data.meet_team_media_file);
  }

  const response = await apiFetch(`${API_BASE_URL}/backend/about/about-cms`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to save About CMS data");
  }

  return response.json();
};