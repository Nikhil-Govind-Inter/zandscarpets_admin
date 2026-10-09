import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const productTagSchema = z.object({
  title: commonValidations.requiredString("Title"),
  title_ar: commonValidations.requiredString("Title (Arabic)"),
  is_global: z.boolean(),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type ProductTagFormData = z.infer<typeof productTagSchema>;
