import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const aboutOurValueSchema = z.object({
  title: commonValidations.requiredString("Title"),
  description: commonValidations.requiredText("Description"),
  status: commonValidations.booleanStatus,
  sort_order: commonValidations.sortOrder,
});

export type AboutOurValueFormData = z.infer<typeof aboutOurValueSchema>;