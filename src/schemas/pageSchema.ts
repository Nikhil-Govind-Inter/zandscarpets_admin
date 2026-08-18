import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const pageSchema = z.object({
  page: commonValidations.requiredString("Page name"),
  page_slug: commonValidations
    .requiredString("Page slug")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase letters, numbers, and hyphens"
    ),
  is_active: commonValidations.booleanStatus,
});

export type PageFormData = z.infer<typeof pageSchema>;
