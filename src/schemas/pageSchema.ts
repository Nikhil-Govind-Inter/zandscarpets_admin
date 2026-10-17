import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const pageSchema = z.object({
  page: commonValidations.requiredString("Page name"),
  page_slug: commonValidations
    .requiredString("Page slug")
    // requiredString returns a ZodEffects (it uses .refine), which has no .regex
    .refine(
      (val) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val),
      "Slug must be lowercase letters, numbers, and hyphens"
    ),
  page_ar: commonValidations.optionalString,
  link: commonValidations.optionalString,
  show_in_nav: z.boolean(),
  show_in_footer: z.boolean(),
  sort_order: z.coerce.number().int().min(0, "Sort order must be 0 or more"),
  is_active: commonValidations.booleanStatus,
});

export type PageFormData = z.infer<typeof pageSchema>;
