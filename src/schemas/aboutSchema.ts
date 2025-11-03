import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const aboutCmsSchema = z.object({
  // Banner section
  banner_title: commonValidations.requiredString("Banner Title"),
  banner_media_alt: commonValidations.requiredString("Banner Media Alt Text"),
  
  // About section
  about_description: commonValidations.requiredText("About Description"),
  about_media_type: z.enum(["image", "video"]),
  about_media_alt: commonValidations.requiredString("About Media Alt Text"),
  
  // Learn more section
  learn_more_title: commonValidations.requiredString("Learn More Title"),
  learn_more_description: commonValidations.requiredText("Learn More Description"),
  learn_more_media_alt: commonValidations.requiredString("Learn More Media Alt Text"),
  
  // Mission and Vision
  our_mission_title: commonValidations.requiredString("Mission Title"),
  our_mission_description: commonValidations.requiredText("Mission Description"),
  our_vision_title: commonValidations.requiredString("Vision Title"),
  our_vision_description: commonValidations.requiredText("Vision Description"),
  
  // Leading game section
  leading_game_title: commonValidations.requiredString("Leading Game Title"),
  charging_station_count: z
    .string()
    .min(1, "Charging station count is required")
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 0;
    }, "Charging station count must be a valid number"),
  charging_station_subtitle: commonValidations.requiredString("Charging Station Subtitle"),
  
  // Our values section
  our_values_title: commonValidations.requiredString("Our Values Title"),
  our_values_description: commonValidations.requiredText("Our Values Description"),
  
  // Our journey section
  our_journey_title: commonValidations.requiredString("Our Journey Title"),
  our_journey_description: commonValidations.requiredText("Our Journey Description"),
  
  // Meet team section
  meet_team_title: commonValidations.requiredString("Meet Team Title"),
  meet_team_description: commonValidations.requiredText("Meet Team Description"),
  meet_team_media_alt: commonValidations.requiredString("Meet Team Media Alt Text"),
  
  // Our associate section
  our_associate_title: commonValidations.requiredString("Our Associate Title"),
  our_associate_description: commonValidations.requiredText("Our Associate Description"),
  
  // Media section
  media_title: commonValidations.requiredString("Media Title"),
  media_description: commonValidations.requiredText("Media Description"),
  
  // Contact us section
  contact_us_super_title: commonValidations.requiredString("Contact Us Super Title"),
  contact_us_title: commonValidations.requiredString("Contact Us Title"),
  
  // File uploads are handled separately in the component
  banner_media_desktop_file: commonValidations.fileUpload,
  banner_media_mobile_file: commonValidations.fileUpload,
  about_media_desktop_file: commonValidations.fileUpload,
  about_media_mobile_file: commonValidations.fileUpload,
  learn_more_media_file: commonValidations.fileUpload,
  meet_team_media_file: commonValidations.fileUpload,
});

export type AboutCmsFormData = z.infer<typeof aboutCmsSchema>;