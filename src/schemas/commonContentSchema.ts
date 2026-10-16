import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const commonContentSchema = z.object({
  why_choose_title: commonValidations.requiredText("Why choose title"),
  why_choose_title_ar: commonValidations.requiredText("Why choose title (Arabic)"),
  side_section_title: commonValidations.requiredText("Side section title"),
  side_section_title_ar: commonValidations.requiredText("Side section title (Arabic)"),
  side_section_description: commonValidations.requiredText("Side section description"),
  side_section_description_ar: commonValidations.requiredText("Side section description (Arabic)"),
  button_text: commonValidations.requiredText("Button text"),
  button_text_ar: commonValidations.requiredText("Button text (Arabic)"),
  button_link: commonValidations.requiredText("Button link"),
  how_section_title: commonValidations.requiredText("How section title"),
  how_section_title_ar: commonValidations.requiredText("How section title (Arabic)"),
});

export type CommonContentFormData = z.infer<typeof commonContentSchema>;
