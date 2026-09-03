import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const connectionsSchema = z.object({
  title: commonValidations.requiredString("Title"),
  description: commonValidations.requiredText("Description"),
  content: commonValidations.requiredText("Content"),
  icon_media_path: commonValidations.requiredFile("Icon"),
  icon_media_alt: commonValidations.requiredString("Icon Alt Text"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type ConnectionsFormData = z.infer<typeof connectionsSchema>;
