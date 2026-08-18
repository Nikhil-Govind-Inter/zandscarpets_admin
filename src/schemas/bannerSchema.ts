import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const bannerSchema = z.object({
  // Combobox value is a string; coerced to a number before hitting the API.
  page_id: z.string().min(1, "Page is required"),
  title: commonValidations.requiredString("Title"),
  sub_title: commonValidations.requiredString("Sub title"),
  media_alt: commonValidations.requiredString("Media alt text"),
  desktop_media_path: commonValidations.requiredFile("Desktop media"),
  mobile_media_path: commonValidations.requiredFile("Mobile media"),
});

export type BannerFormData = z.infer<typeof bannerSchema>;
