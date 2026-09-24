import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const coreValuesSchema = z.object({
  title: commonValidations.requiredString("Title"),
  title_ar: commonValidations.requiredString("Title (Arabic)"),
  media_path: commonValidations.requiredFile("Core value image"),
  media_alt: commonValidations.requiredString("Alt text"),
  media_alt_ar: commonValidations.requiredString("Alt text (Arabic)"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type CoreValuesFormData = z.infer<typeof coreValuesSchema>;
