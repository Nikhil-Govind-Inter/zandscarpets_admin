import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const connectionsSchema = z.object({
  title: commonValidations.requiredString("Title"),
  description: commonValidations.requiredText("Description"),
  content: commonValidations.requiredText("Content"),
  icon_media_path: commonValidations.fileUpload,
  icon_media_alt: commonValidations.optionalString,
});

export type ConnectionsFormData = z.infer<typeof connectionsSchema>;
