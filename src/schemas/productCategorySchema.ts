import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

// Highlights are managed outside react-hook-form (MultiSelect state in the form).
export const productCategorySchema = z.object({
  industry_id: z.string().min(1, "Industry is required"),
  parent_id: z.string().optional(),
  title: commonValidations.requiredString("Title"),
  title_ar: commonValidations.requiredString("Title (Arabic)"),
  description: commonValidations.optionalString,
  description_ar: commonValidations.optionalString,
  material_type: commonValidations.optionalString,
  material_type_ar: commonValidations.optionalString,
  media_path: z.custom<File | string>().optional(),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type ProductCategoryFormData = z.infer<typeof productCategorySchema>;
