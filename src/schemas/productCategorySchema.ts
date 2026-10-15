import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

// Highlights are managed outside react-hook-form (MultiSelect state in the form).
export const productCategorySchema = z.object({
  parent_id: z.string().optional(),
  title: commonValidations.requiredString("Title"),
  title_ar: commonValidations.requiredString("Title (Arabic)"),
  description: commonValidations.optionalString,
  description_ar: commonValidations.optionalString,
  material_type: commonValidations.optionalString,
  material_type_ar: commonValidations.optionalString,
  media_path: commonValidations.requiredFile("Image"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
  show_in_navbar: commonValidations.booleanStatus,
  show_in_home: commonValidations.booleanStatus,
});

export type ProductCategoryFormData = z.infer<typeof productCategorySchema>;
