import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const processStepSchema = z.object({
  title: commonValidations.requiredString("Title"),
  description: commonValidations.requiredString("Description"),
  media_path: commonValidations.requiredFile("Process step image"),
  media_alt: commonValidations.requiredString("Alt text"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type ProcessStepFormData = z.infer<typeof processStepSchema>;
