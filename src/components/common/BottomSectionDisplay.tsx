import { useQuery } from "@tanstack/react-query";
import { getBottomSection } from "@/services/bottom/bottomSectionApi";

interface BottomSectionDisplayProps {
  className?: string;
}

export function BottomSectionDisplay({ className = "" }: BottomSectionDisplayProps) {
  const { data: bottomSectionData, isLoading } = useQuery({
    queryKey: ["bottomSection"],
    queryFn: getBottomSection,
  });

  if (isLoading) {
    return <div className={`p-6 ${className}`}>Loading bottom section...</div>;
  }

  if (!bottomSectionData) {
    return null;
  }

  const getButtonLabel = (
    sectionSpecific: string | null | undefined,
    general: string | null | undefined,
    fallback: string
  ): string => {
    if (sectionSpecific) return sectionSpecific;
    if (general) return general;
    return fallback;
  };

  const backgroundImageDesktop = bottomSectionData.background_image_path
    ? `${import.meta.env.VITE_URL}/${bottomSectionData.background_image_path}`
    : null;

  const backgroundImageMobile = bottomSectionData.background_image_mobile_path
    ? `${import.meta.env.VITE_URL}/${bottomSectionData.background_image_mobile_path}`
    : null;

  return (
    <section 
      className={`relative bg-cover bg-center bg-no-repeat ${className}`}
      style={{
        backgroundImage: `url(${backgroundImageDesktop || backgroundImageMobile || ''})`,
      }}
    >
      {/* Mobile background overlay for responsive design */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden"
        style={{
          backgroundImage: backgroundImageMobile ? `url(${backgroundImageMobile})` : undefined,
        }}
      />
      
      {/* Background overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50" />
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Section */}
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-2">
              {bottomSectionData.left_title}
              {bottomSectionData.left_highlight_title && (
                <span className="text-primary ml-2">
                  {bottomSectionData.left_highlight_title}
                </span>
              )}
            </h2>
            
            {/* Left Section Icons/Buttons */}
            <div className="flex gap-4 mt-6">
              {bottomSectionData.left_icon_one && (
                <a
                  href={bottomSectionData.left_icon_one_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <img
                    src={`${import.meta.env.VITE_URL}/${bottomSectionData.left_icon_one}`}
                    alt={bottomSectionData.left_icon_one_alt}
                    className="h-12 w-auto hover:opacity-80 transition-opacity"
                  />
                  <span className="sr-only">
                    {getButtonLabel(
                      bottomSectionData.left_app_store_label,
                      bottomSectionData.app_store_button_label,
                      "Download from App Store"
                    )}
                  </span>
                </a>
              )}
              
              {bottomSectionData.left_icon_two && (
                <a
                  href={bottomSectionData.left_icon_two_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <img
                    src={`${import.meta.env.VITE_URL}/${bottomSectionData.left_icon_two}`}
                    alt={bottomSectionData.left_icon_two_alt}
                    className="h-12 w-auto hover:opacity-80 transition-opacity"
                  />
                  <span className="sr-only">
                    {getButtonLabel(
                      bottomSectionData.left_play_store_label,
                      bottomSectionData.play_store_button_label,
                      "Download from Play Store"
                    )}
                  </span>
                </a>
              )}
            </div>

            {/* Left Media */}
            {bottomSectionData.left_media_path && (
              <div className="mt-6">
                {bottomSectionData.left_media_type === "video" ? (
                  <video
                    src={`${import.meta.env.VITE_URL}/${bottomSectionData.left_media_path}`}
                    controls
                    className="max-w-full h-auto rounded-lg"
                    aria-label={bottomSectionData.left_media_alt}
                  />
                ) : (
                  <a
                    href={bottomSectionData.left_media_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={`${import.meta.env.VITE_URL}/${bottomSectionData.left_media_path}`}
                      alt={bottomSectionData.left_media_alt}
                      className="max-w-full h-auto rounded-lg hover:opacity-80 transition-opacity"
                    />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-2">
              {bottomSectionData.right_title}
              {bottomSectionData.right_highlight_title && (
                <span className="text-primary ml-2">
                  {bottomSectionData.right_highlight_title}
                </span>
              )}
            </h2>
            
            {/* Right Section Icons/Buttons */}
            <div className="flex gap-4 mt-6">
              {bottomSectionData.right_icon_one && (
                <a
                  href={bottomSectionData.right_icon_one_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <img
                    src={`${import.meta.env.VITE_URL}/${bottomSectionData.right_icon_one}`}
                    alt={bottomSectionData.right_icon_one_alt}
                    className="h-12 w-auto hover:opacity-80 transition-opacity"
                  />
                  <span className="sr-only">
                    {getButtonLabel(
                      bottomSectionData.right_app_store_label,
                      bottomSectionData.app_store_button_label,
                      "Download from App Store"
                    )}
                  </span>
                </a>
              )}
              
              {bottomSectionData.right_icon_two && (
                <a
                  href={bottomSectionData.right_icon_two_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <img
                    src={`${import.meta.env.VITE_URL}/${bottomSectionData.right_icon_two}`}
                    alt={bottomSectionData.right_icon_two_alt}
                    className="h-12 w-auto hover:opacity-80 transition-opacity"
                  />
                  <span className="sr-only">
                    {getButtonLabel(
                      bottomSectionData.right_play_store_label,
                      bottomSectionData.play_store_button_label,
                      "Download from Play Store"
                    )}
                  </span>
                </a>
              )}
            </div>

            {/* Right Media */}
            {bottomSectionData.right_media_path && (
              <div className="mt-6">
                {bottomSectionData.right_media_type === "video" ? (
                  <video
                    src={`${import.meta.env.VITE_URL}/${bottomSectionData.right_media_path}`}
                    controls
                    className="max-w-full h-auto rounded-lg"
                    aria-label={bottomSectionData.right_media_alt}
                  />
                ) : (
                  <a
                    href={bottomSectionData.right_media_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={`${import.meta.env.VITE_URL}/${bottomSectionData.right_media_path}`}
                      alt={bottomSectionData.right_media_alt}
                      className="max-w-full h-auto rounded-lg hover:opacity-80 transition-opacity"
                    />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default BottomSectionDisplay;