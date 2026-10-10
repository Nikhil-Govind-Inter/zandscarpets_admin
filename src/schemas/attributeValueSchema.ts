import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

// Client-side shape is intentionally loose: which fields are required is
// decided by the selected attribute's `type` (mirrors the server's checks).
export const attributeValueSchema = z.object({
  attribute_id: z.string().min(1, "Attribute is required"),
  value: commonValidations.optionalString.or(z.literal("")),
  value_ar: commonValidations.optionalString.or(z.literal("")),
  slug: commonValidations.optionalString.or(z.literal("")),
  media_path: z.custom<File | string>().optional().nullable(),
  media_alt: commonValidations.optionalString.or(z.literal("")),
  media_alt_ar: commonValidations.optionalString.or(z.literal("")),
  color_code: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, {
      message: "Color code must be a hex value (e.g. #FF0000)",
    })
    .or(z.literal(""))
    .optional(),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type AttributeValueFormData = z.infer<typeof attributeValueSchema>;