import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const homeCmsSchema = z.object({
  discover_title: commonValidations.requiredText("Discover title"),
  discover_title_ar: commonValidations.requiredText("Discover title (Arabic)"),
  residential_title: commonValidations.requiredText("Residential title"),
  residential_title_ar: commonValidations.requiredText("Residential title (Arabic)"),
  project_title: commonValidations.requiredText("Project title"),
  project_title_ar: commonValidations.requiredText("Project title (Arabic)"),
  testimonial_title: commonValidations.requiredText("Testimonial title"),
  testimonial_title_ar: commonValidations.requiredText("Testimonial title (Arabic)"),
  brand_title: commonValidations.requiredText("Brand title"),
  brand_title_ar: commonValidations.requiredText("Brand title (Arabic)"),
  cta_title: commonValidations.requiredText("CTA title"),
  cta_title_ar: commonValidations.requiredText("CTA title (Arabic)"),
  cta_media_path: commonValidations.requiredFile("CTA image"),
  cta_description: commonValidations.richText("CTA description"),
  cta_description_ar: commonValidations.richText("CTA description (Arabic)"),
  faq_title: commonValidations.requiredText("FAQ title"),
  faq_title_ar: commonValidations.requiredText("FAQ title (Arabic)"),
  premium_title: commonValidations.requiredText("Premium title"),
  premium_title_ar: commonValidations.requiredText("Premium title (Arabic)"),
  premium_description: commonValidations.richText("Premium description"),
  premium_description_ar: commonValidations.richText("Premium description (Arabic)"),
});

export type HomeCmsFormData = z.infer<typeof homeCmsSchema>;
