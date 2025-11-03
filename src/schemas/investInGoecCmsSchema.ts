import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const investInGoecCmsSchema = z.object({
  // Banner section
  banner_title: commonValidations.requiredString("Banner title"),
  banner_media_desktop_file: commonValidations.fileUpload,
  banner_media_mobile_file: commonValidations.fileUpload,
  banner_media_alt: commonValidations.optionalString,

  // About section
  about_description: commonValidations.requiredText("About description"),
  about_media_type: commonValidations.requiredString("About media type"),
  about_media_desktop_file: commonValidations.fileUpload,
  about_media_mobile_file: commonValidations.fileUpload,
  about_media_alt: commonValidations.optionalString,

  // Growth section
  growth_title: commonValidations.requiredString("Growth title"),
  growth_description: commonValidations.requiredText("Growth description"),
  growth_media_desktop_file: commonValidations.fileUpload,
  growth_media_mobile_file: commonValidations.fileUpload,
  growth_media_alt: commonValidations.optionalString,

  // Explore section
  explore_title: commonValidations.requiredString("Explore title"),

  // Why invest section
  why_invest_title: commonValidations.requiredString("Why invest title"),
  why_invest_description: commonValidations.requiredText("Why invest description"),
  why_invest_media_desktop_file: commonValidations.fileUpload,
  why_invest_media_mobile_file: commonValidations.fileUpload,
  why_invest_media_alt: commonValidations.optionalString,

  // Partners section
  partners_title: commonValidations.requiredString("Partners title"),

  // Final CTA section
  invest_in_goec_title: commonValidations.requiredString("Invest in GO EC title"),
  invest_in_goec_media_file: commonValidations.fileUpload,
  invest_in_goec_media_alt: commonValidations.optionalString,
  invest_media_file: commonValidations.fileUpload,
});

export type InvestInGoecCmsFormData = z.infer<typeof investInGoecCmsSchema>;