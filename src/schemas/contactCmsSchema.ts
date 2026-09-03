import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const contactCmsSchema = z.object({
  title: commonValidations.requiredText("Title"),
  description: commonValidations.requiredText("Description"),
  form_title: commonValidations.requiredText("Form title"),
  social_media_title: commonValidations.requiredText("Social media title"),
  map_url: commonValidations.requiredText("Map URL"),
});

export type ContactCmsFormData = z.infer<typeof contactCmsSchema>;
