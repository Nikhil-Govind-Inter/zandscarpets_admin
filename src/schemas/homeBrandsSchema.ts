import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const homeBrandsSchema = z.object({
  industry_id: z.string().optional(),
  media_path: commonValidations.requiredFile("Brand Image"),
  media_alt: commonValidations.requiredString("Alt text"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type HomeBrandsFormData = z.infer<typeof homeBrandsSchema>;
