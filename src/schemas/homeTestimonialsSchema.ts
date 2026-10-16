import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const homeTestimonialsSchema = z.object({
  profile_media_path: commonValidations.fileUpload,
  name: commonValidations.requiredString("Name"),
  name_ar: commonValidations.requiredString("Name (Arabic)"),
  designation: commonValidations.optionalString,
  designation_ar: commonValidations.optionalString,
  message: commonValidations.requiredString("Message"),
  message_ar: commonValidations.requiredString("Message (Arabic)"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type HomeTestimonialsFormData = z.infer<typeof homeTestimonialsSchema>;
