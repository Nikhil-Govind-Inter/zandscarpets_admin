import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const connectionsSchema = z.object({
  title: commonValidations.requiredString("Title"),
  title_ar: commonValidations.requiredString("Title (Arabic)"),
  description: commonValidations.optionalString,
  description_ar: commonValidations.optionalString,
  content: commonValidations.requiredText("Content"),
  content_ar: commonValidations.requiredText("Content (Arabic)"),
  icon_media_path: commonValidations.requiredFile("Icon"),
  icon_media_alt: commonValidations.requiredString("Icon Alt Text"),
  icon_media_alt_ar: commonValidations.requiredString("Icon Alt Text (Arabic)"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type ConnectionsFormData = z.infer<typeof connectionsSchema>;
