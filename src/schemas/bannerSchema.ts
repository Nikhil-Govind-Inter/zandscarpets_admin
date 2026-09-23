import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const bannerSchema = z.object({
  // Combobox value is a string; coerced to a number before hitting the API.
  page_id: z.string().min(1, "Page is required"),
  title: commonValidations.requiredString("Title"),
  title_ar: commonValidations.requiredString("Title (Arabic)"),
  sub_title: commonValidations.requiredString("Sub title"),
  sub_title_ar: commonValidations.requiredString("Sub title (Arabic)"),
  media_alt: commonValidations.requiredString("Media alt text"),
  media_alt_ar: commonValidations.requiredString("Media alt text (Arabic)"),
  desktop_media_path: commonValidations.requiredFile("Desktop media"),
  mobile_media_path: commonValidations.requiredFile("Mobile media"),
});

export type BannerFormData = z.infer<typeof bannerSchema>;
