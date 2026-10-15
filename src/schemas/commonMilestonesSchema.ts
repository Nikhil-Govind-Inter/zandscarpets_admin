import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const commonMilestoneSchema = z.object({
  value: commonValidations.requiredString("Value"),
  value_ar: commonValidations.requiredString("Value (Arabic)"),
  label: commonValidations.requiredString("Label"),
  label_ar: commonValidations.requiredString("Label (Arabic)"),
  media_path: commonValidations.optionalFile,
  media_alt: commonValidations.optionalString,
  media_alt_ar: commonValidations.optionalString,
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
  show_in_home: commonValidations.booleanStatus,
});

export type CommonMilestoneFormData = z.infer<typeof commonMilestoneSchema>;
