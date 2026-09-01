import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const historySchema = z.object({
  year: commonValidations.requiredString("Year"),
  title: commonValidations.requiredString("Title"),
  description: commonValidations.requiredString("Description"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type HistoryFormData = z.infer<typeof historySchema>;
