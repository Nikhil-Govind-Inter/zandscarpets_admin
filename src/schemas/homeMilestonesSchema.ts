import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const homeMilestoneSchema = z.object({
  value: commonValidations.requiredString("Value"),
  value_ar: commonValidations.requiredString("Value (Arabic)"),
  label: commonValidations.requiredString("Label"),
  label_ar: commonValidations.requiredString("Label (Arabic)"),
  media_path: commonValidations.requiredFile("Milestone image"),
  media_alt: commonValidations.requiredString("Alt text"),
  media_alt_ar: commonValidations.requiredString("Alt text (Arabic)"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type HomeMilestoneFormData = z.infer<typeof homeMilestoneSchema>;
