import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const faqsSchema = z.object({
  question: commonValidations.requiredString("Question"),
  question_ar: commonValidations.requiredString("Question (Arabic)"),
  answer: commonValidations.requiredString("Answer"),
  answer_ar: commonValidations.requiredString("Answer (Arabic)"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export type FaqsFormData = z.infer<typeof faqsSchema>;
