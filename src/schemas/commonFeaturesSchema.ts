import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const commonFeatureSchema = z.object({
  title: commonValidations.requiredString("Title"),
  title_ar: commonValidations.requiredString("Title (Arabic)"),
  description: commonValidations.requiredString("Description"),
  description_ar: commonValidations.requiredString("Description (Arabic)"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type CommonFeatureFormData = z.infer<typeof commonFeatureSchema>;
