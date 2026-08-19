import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";

export const homeCmsSchema = z.object({
  discover_title: commonValidations.requiredText("Discover title"),
  residential_title: commonValidations.requiredText("Residential title"),
  home_space_title: commonValidations.requiredText("Home space title"),
  project_title: commonValidations.requiredText("Project title"),
  features_title: commonValidations.requiredText("Features title"),
  features_subtitle: commonValidations.requiredText("Features subtitle"),
  features_description: commonValidations.requiredText("Features description"),
  work_title: commonValidations.requiredText("Work title"),
  testimonial_title: commonValidations.requiredText("Testimonial title"),
  brand_title: commonValidations.requiredText("Brand title"),
  cta_title: commonValidations.requiredText("CTA title"),
  cta_description: commonValidations.requiredText("CTA description"),
  faq_title: commonValidations.requiredText("FAQ title"),
  premium_title: commonValidations.requiredText("Premium title"),
  premium_description: commonValidations.requiredText("Premium description"),
});

export type HomeCmsFormData = z.infer<typeof homeCmsSchema>;
