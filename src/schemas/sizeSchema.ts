import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const sizeSchema = z.object({
  title: commonValidations.requiredString("Title"),
  title_ar: commonValidations.requiredString("Title (Arabic)"),
  slug: commonValidations.requiredString("Slug"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type SizeFormData = z.infer<typeof sizeSchema>;
