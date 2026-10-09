import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const tagSchema = z.object({
  title: commonValidations.requiredString("Title"),
  title_ar: commonValidations.requiredString("Title (Arabic)"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type TagFormData = z.infer<typeof tagSchema>;
