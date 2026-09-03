import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const serviceSchema = z.object({
  title: commonValidations.requiredString("Title"),
  description: commonValidations.requiredString("Description"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
