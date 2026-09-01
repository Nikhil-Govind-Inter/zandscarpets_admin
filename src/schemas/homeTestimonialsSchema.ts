import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const homeTestimonialsSchema = z.object({
  profile_media_path: commonValidations.fileUpload,
  name: commonValidations.requiredString("Name"),
  designation: commonValidations.optionalString,
  message: commonValidations.requiredString("Message"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type HomeTestimonialsFormData = z.infer<typeof homeTestimonialsSchema>;
