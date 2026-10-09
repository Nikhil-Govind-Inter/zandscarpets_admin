import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const contactCmsSchema = z.object({
  title: commonValidations.requiredText("Title"),
  title_ar: commonValidations.requiredText("Title (Arabic)"),
  description: commonValidations.requiredText("Description"),
  description_ar: commonValidations.requiredText("Description (Arabic)"),
  form_title: commonValidations.requiredText("Form title"),
  form_title_ar: commonValidations.requiredText("Form title (Arabic)"),
  social_media_title: commonValidations.requiredText("Social media title"),
  social_media_title_ar: commonValidations.requiredText("Social media title (Arabic)"),
  map_url: commonValidations.requiredText("Map URL"),
});

export type ContactCmsFormData = z.infer<typeof contactCmsSchema>;
