import { z } from "zod";
import { commonValidations } from "@/utils/formUtils";


export const socialMediaSchema = z.object({
  media_path: commonValidations.requiredFile("Icon"),
  media_alt: commonValidations.requiredString("Alt text"),
  link: commonValidations.requiredString("Link"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export const footerMediaSchema = z.object({
  media_path: commonValidations.requiredFile("Media"),
  media_alt: commonValidations.requiredString("Alt text"),
  sort_order: commonValidations.sortOrder,
  is_active: commonValidations.booleanStatus,
});

export const siteSettingsSchema = z.object({
  address: commonValidations.requiredText("Address"),
  email: commonValidations.requiredEmail,
  admin_email: commonValidations.requiredEmail,
  phone_number: commonValidations.requiredString("Phone Number"),
  whatsapp_number: commonValidations.requiredString("Whatsapp Number"),
  header_logo_media_path: commonValidations.requiredFile("Header logo"),
  footer_logo_media_path: commonValidations.requiredFile("Footer logo"),
});

// Base schemas for common form
export type SocialMediaFormData = z.infer<typeof socialMediaSchema>

export type FooterMediaFormData = z.infer<typeof footerMediaSchema>

export type SiteSettingsFormData = z.infer<typeof siteSettingsSchema>