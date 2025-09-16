import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const investInGoecMilestoneSchema = z.object({
  value: z
    .number()
    .min(0, "Value must be 0 or greater")
    .max(999999, "Value cannot exceed 999,999"),
  prefix: commonValidations.optionalString,
  subtitle: commonValidations.requiredString("Subtitle"),
  status: commonValidations.booleanStatus,
  sort_order: commonValidations.sortOrder,
});

export type InvestInGoecMilestoneFormData = z.infer<typeof investInGoecMilestoneSchema>;