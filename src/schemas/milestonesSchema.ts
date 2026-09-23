import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const milestonesSchema = z.object({
  label: commonValidations.requiredString("Label"),
  label_ar: commonValidations.requiredString("Label (Arabic)"),
  value: commonValidations.requiredString("Value"),
  value_ar: commonValidations.requiredString("Value (Arabic)"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type MilestonesFormData = z.infer<typeof milestonesSchema>;
