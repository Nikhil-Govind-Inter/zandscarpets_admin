import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const attributeSchema = z.object({
  title: commonValidations.requiredString("Title"),
  title_ar: commonValidations.requiredString("Title (Arabic)"),
  slug: commonValidations.requiredString("Slug"),
  type: z.enum(["text", "icon", "color"]),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type AttributeFormData = z.infer<typeof attributeSchema>;