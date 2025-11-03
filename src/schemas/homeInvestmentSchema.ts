import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const homeInvestmentSchema = z.object({
  title: commonValidations.requiredString("Title"),
  subtitle: commonValidations.requiredString("Subtitle"),
  description: commonValidations.requiredText("Description"),
  button_text: commonValidations.requiredString("Button Text"),
  button_text_link: z.string().url("Please enter a valid URL"),
  status: commonValidations.booleanStatus,
  sort_order: commonValidations.sortOrder,
});

export type HomeInvestmentFormData = z.infer<typeof homeInvestmentSchema>;