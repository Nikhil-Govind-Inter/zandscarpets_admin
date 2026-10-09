import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const floatingIconSchema = z.object({
  media_path: commonValidations.requiredFile("Icon"),
  media_alt: commonValidations.requiredString("Alt text"),
  media_alt_ar: commonValidations.requiredString("Alt text (Arabic)"),
  link: commonValidations.requiredString("Link"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type FloatingIconFormData = z.infer<typeof floatingIconSchema>;
