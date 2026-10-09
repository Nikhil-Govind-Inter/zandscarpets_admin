import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const productMediaSchema = z.object({
  media_type: z.enum(["image", "video"]),
  media_path: z
    .custom<File | string | null>()
    .refine(
      (v) => v instanceof File || (typeof v === "string" && v.trim().length > 0),
      "File is required",
    ),
  thumbnail: z.custom<File | string | null>().optional().nullable(),
  media_alt: commonValidations.optionalString,
  media_alt_ar: commonValidations.optionalString,
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type ProductMediaFormData = z.infer<typeof productMediaSchema>;
