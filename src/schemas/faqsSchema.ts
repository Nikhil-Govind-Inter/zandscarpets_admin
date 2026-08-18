import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const faqsSchema = z.object({
  question: commonValidations.requiredString("Question"),
  answer: commonValidations.requiredString("Answer"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type FaqsFormData = z.infer<typeof faqsSchema>;
