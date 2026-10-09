import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const materialsSchema = z.object({
  title: commonValidations.requiredString("Title"),
  title_ar: commonValidations.requiredString("Title (Arabic)"),
  slug: commonValidations
    .requiredString("Slug")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase letters, numbers, and hyphens",
    ),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type MaterialsFormData = z.infer<typeof materialsSchema>;
