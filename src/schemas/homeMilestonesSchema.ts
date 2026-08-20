import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const homeMilestoneSchema = z.object({
  value: commonValidations.requiredString("Value"),
  label: commonValidations.requiredString("Label"),
  media_path: commonValidations.requiredFile("Milestone image"),
  media_alt: commonValidations.requiredString("Alt text"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type HomeMilestoneFormData = z.infer<typeof homeMilestoneSchema>;
