// Validation for social media icons: SVG only, small file size.

export const SOCIAL_ICON_ACCEPT = "image/svg+xml";
export const SOCIAL_ICON_MAX_BYTES = 100 * 1024; // 100KB
export const SOCIAL_ICON_RECOMMENDED = "SVG only, max 100KB";

// Returns an error message, or null when the file is acceptable.
export const validateSocialIcon = async (file: File): Promise<string | null> => {
  const isSvg =
    file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
  if (!isSvg) return "Only SVG icons are allowed.";

  if (file.size > SOCIAL_ICON_MAX_BYTES) {
    return `Icon must be under ${SOCIAL_ICON_MAX_BYTES / 1024}KB. Current size: ${(file.size / 1024).toFixed(0)}KB.`;
  }

  const text = await file.text();
  const doc = new DOMParser().parseFromString(text, "image/svg+xml");
  if (
    doc.querySelector("parsererror") ||
    doc.documentElement.tagName.toLowerCase() !== "svg"
  ) {
    return "This is not a valid SVG file.";
  }
  if (doc.querySelector("script") || /\son\w+\s*=/i.test(text)) {
    return "SVG must not contain scripts or event handlers.";
  }
  return null;
};
