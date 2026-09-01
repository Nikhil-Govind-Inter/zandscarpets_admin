import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const coreValuesSchema = z.object({
  media_path: commonValidations.requiredFile("Core value image"),
  media_alt: commonValidations.requiredString("Alt text"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type CoreValuesFormData = z.infer<typeof coreValuesSchema>;
