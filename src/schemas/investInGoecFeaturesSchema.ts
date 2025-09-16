import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const investInGoecFeaturesSchema = z.object({
  icon_file: commonValidations.fileUpload,
  icon_alt: commonValidations.optionalString,
  description: commonValidations.requiredText("Description"),
  status: commonValidations.booleanStatus,
  sort_order: commonValidations.sortOrder,
});

export type InvestInGoecFeaturesFormData = z.infer<typeof investInGoecFeaturesSchema>;