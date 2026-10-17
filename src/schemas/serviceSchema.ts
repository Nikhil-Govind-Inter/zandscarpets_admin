import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const serviceSchema = z.object({
  title: commonValidations.requiredString("Title"),
  title_ar: commonValidations.requiredString("Title (Arabic)"),
  description: commonValidations.richText("Description"),
  description_ar: commonValidations.richText("Description (Arabic)"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
  show_in_footer: z.boolean(),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
