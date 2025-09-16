import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const investInGoecCmsSchema = z.object({
  // Banner section
  banner_title: commonValidations.requiredString("Banner title"),
  invest_media_file: commonValidations.fileUpload,
  invest_media_alt: commonValidations.optionalString,
  invest_description: commonValidations.requiredText("Investment description"),
  
  // Future transportation section
  future_transportation_title: commonValidations.requiredString("Future transportation title"),
  future_transportation_description: commonValidations.requiredText("Future transportation description"),
  future_transportation_media_file: commonValidations.fileUpload,
  future_transportation_media_alt: commonValidations.optionalString,
  
  // Business model section
  business_model_title: commonValidations.requiredString("Business model title"),
  
  // Why invest section
  why_invest_title: commonValidations.requiredString("Why invest title"),
  why_invest_description: commonValidations.requiredText("Why invest description"),
  why_invest_media_file: commonValidations.fileUpload,
  why_invest_media_alt: commonValidations.optionalString,
  
  // Partners section
  partners_title: commonValidations.requiredString("Partners title"),
  
  // Final CTA section
  invest_in_goec_title: commonValidations.requiredString("Invest in GO EC title"),
  invest_in_goec_media_file: commonValidations.fileUpload,
  invest_in_goec_media_alt: commonValidations.optionalString,
});

export type InvestInGoecCmsFormData = z.infer<typeof investInGoecCmsSchema>;