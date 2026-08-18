import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const industrySchema = z.object({
  title: commonValidations.requiredString("Title"),
  slug: commonValidations
    .requiredString("Slug")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase letters, numbers, and hyphens",
    ),
  description: commonValidations.requiredString("Description"),
  link: commonValidations.optionalString,
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type IndustryFormData = z.infer<typeof industrySchema>;
