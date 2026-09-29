import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const colorSchema = z.object({
  title: commonValidations.requiredString("Title"),
  title_ar: commonValidations.requiredString("Title (Arabic)"),
  slug: commonValidations.requiredString("Slug"),
  media_path: z.custom<File | string>().optional().nullable(),
  media_alt: commonValidations.optionalString,
  media_alt_ar: commonValidations.optionalString,
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type ColorFormData = z.infer<typeof colorSchema>;
