import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const homeAppFeatureSchema = z.object({
  title: commonValidations.requiredString("Title"),
  icon_file: commonValidations.fileUpload,
  icon_alt: commonValidations.requiredString("Icon Alt Text"),
  status: commonValidations.booleanStatus,
  sort_order: commonValidations.sortOrder,
});

export type HomeAppFeatureFormData = z.infer<typeof homeAppFeatureSchema>;