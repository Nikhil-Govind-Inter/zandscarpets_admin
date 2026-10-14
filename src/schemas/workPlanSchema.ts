import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const workPlanSchema = z.object({
  title: commonValidations.requiredString("Title"),
  title_ar: commonValidations.requiredString("Title (Arabic)"),
  short_description: commonValidations.richText("Short Description"),
  short_description_ar: commonValidations.richText(
    "Short Description (Arabic)",
  ),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type WorkPlanFormData = z.infer<typeof workPlanSchema>;
