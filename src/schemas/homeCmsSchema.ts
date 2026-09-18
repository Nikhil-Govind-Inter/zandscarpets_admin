import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const homeCmsSchema = z.object({
  discover_title: commonValidations.requiredText("Discover title"),
  discover_title_ar: commonValidations.requiredText("Discover title (Arabic)"),
  residential_title: commonValidations.requiredText("Residential title"),
  residential_title_ar: commonValidations.requiredText("Residential title (Arabic)"),
  home_space_title: commonValidations.requiredText("Home space title"),
  home_space_title_ar: commonValidations.requiredText("Home space title (Arabic)"),
  project_title: commonValidations.requiredText("Project title"),
  project_title_ar: commonValidations.requiredText("Project title (Arabic)"),
  features_title: commonValidations.requiredText("Features title"),
  features_title_ar: commonValidations.requiredText("Features title (Arabic)"),
  features_subtitle: commonValidations.requiredText("Features subtitle"),
  features_subtitle_ar: commonValidations.requiredText("Features subtitle (Arabic)"),
  features_description: commonValidations.requiredText("Features description"),
  features_description_ar: commonValidations.requiredText("Features description (Arabic)"),
  work_title: commonValidations.requiredText("Work title"),
  work_title_ar: commonValidations.requiredText("Work title (Arabic)"),
  testimonial_title: commonValidations.requiredText("Testimonial title"),
  testimonial_title_ar: commonValidations.requiredText("Testimonial title (Arabic)"),
  brand_title: commonValidations.requiredText("Brand title"),
  brand_title_ar: commonValidations.requiredText("Brand title (Arabic)"),
  cta_title: commonValidations.requiredText("CTA title"),
  cta_title_ar: commonValidations.requiredText("CTA title (Arabic)"),
  cta_description: commonValidations.requiredText("CTA description"),
  cta_description_ar: commonValidations.requiredText("CTA description (Arabic)"),
  faq_title: commonValidations.requiredText("FAQ title"),
  faq_title_ar: commonValidations.requiredText("FAQ title (Arabic)"),
  premium_title: commonValidations.requiredText("Premium title"),
  premium_title_ar: commonValidations.requiredText("Premium title (Arabic)"),
  premium_description: commonValidations.requiredText("Premium description"),
  premium_description_ar: commonValidations.requiredText("Premium description (Arabic)"),
});

export type HomeCmsFormData = z.infer<typeof homeCmsSchema>;
