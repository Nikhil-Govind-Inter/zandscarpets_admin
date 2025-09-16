import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/common/FileUpload";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchSiteSettings,
  saveSiteSettings,
  SiteSettings,
} from "@/services/common/siteSettingsApi";

const formSchema = z.object({
  address: z.string().min(1, "Address is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
  logo_alt: z.string().min(1, "Logo alt text is required"),
  footer_download_image_one_alt: z.string().min(1, "Footer download image one alt text is required"),
  footer_download_image_one_link: z.string().min(1, "Footer download image one link is required"),
  footer_download_image_two_alt: z.string().min(1, "Footer download image two alt text is required"),
  footer_download_image_two_link: z.string().min(1, "Footer download image two link is required"),
  footer_logo_alt: z.string().min(1, "Footer logo alt text is required"),
  footer_description: z.string().min(1, "Footer description is required"),
  social_media_title: z.string().min(1, "Social media title is required"),
  subscribe_title: z.string().min(1, "Subscribe title is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function SiteSettingsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // File states
  const [logoFile, setLogoFile] = useState<File | string | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | string | null>(null);
  const [footerDownloadImageOne, setFooterDownloadImageOne] = useState<File | string | null>(null);
  const [footerDownloadImageTwo, setFooterDownloadImageTwo] = useState<File | string | null>(null);
  const [footerLogoFile, setFooterLogoFile] = useState<File | string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
      email: "",
      phone: "",
      logo_alt: "",
      footer_download_image_one_alt: "",
      footer_download_image_one_link: "",
      footer_download_image_two_alt: "",
      footer_download_image_two_link: "",
      footer_logo_alt: "",
      footer_description: "",
      social_media_title: "",
      subscribe_title: "",
    },
  });

  useEffect(() => {
    loadSiteSettingsData();
  }, []);

  const loadSiteSettingsData = async () => {
    try {
      setInitialLoading(true);
      const response = await fetchSiteSettings();
      const data = response.data;
      
      if (data) {
        form.reset({
          address: data.address || "",
          email: data.email || "",
          phone: data.phone || "",
          logo_alt: data.logo_alt || "",
          footer_download_image_one_alt: data.footer_download_image_one_alt || "",
          footer_download_image_one_link: data.footer_download_image_one_link || "",
          footer_download_image_two_alt: data.footer_download_image_two_alt || "",
          footer_download_image_two_link: data.footer_download_image_two_link || "",
          footer_logo_alt: data.footer_logo_alt || "",
          footer_description: data.footer_description || "",
          social_media_title: data.social_media_title || "",
          subscribe_title: data.subscribe_title || "",
        });

        // Set existing file URLs for preview if they exist
        if (data.logo) {
          setLogoFile(`${import.meta.env.VITE_URL}/${data.logo}`);
        }
        if (data.favicon) {
          setFaviconFile(`${import.meta.env.VITE_URL}/${data.favicon}`);
        }
        if (data.footer_download_image_one) {
          setFooterDownloadImageOne(`${import.meta.env.VITE_URL}/${data.footer_download_image_one}`);
        }
        if (data.footer_download_image_two) {
          setFooterDownloadImageTwo(`${import.meta.env.VITE_URL}/${data.footer_download_image_two}`);
        }
        if (data.footer_logo) {
          setFooterLogoFile(`${import.meta.env.VITE_URL}/${data.footer_logo}`);
        }
      }
    } catch (error) {
      console.log("No existing data found, starting with empty form");
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append("address", data.address);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("logo_alt", data.logo_alt);
      formData.append("footer_download_image_one_alt", data.footer_download_image_one_alt);
      formData.append("footer_download_image_one_link", data.footer_download_image_one_link);
      formData.append("footer_download_image_two_alt", data.footer_download_image_two_alt);
      formData.append("footer_download_image_two_link", data.footer_download_image_two_link);
      formData.append("footer_logo_alt", data.footer_logo_alt);
      formData.append("footer_description", data.footer_description);
      formData.append("social_media_title", data.social_media_title);
      formData.append("subscribe_title", data.subscribe_title);

      // Add files if they exist
      if (logoFile instanceof File) {
        formData.append("logo", logoFile);
      }
      if (faviconFile instanceof File) {
        formData.append("favicon", faviconFile);
      }
      if (footerDownloadImageOne instanceof File) {
        formData.append("footer_download_image_one", footerDownloadImageOne);
      }
      if (footerDownloadImageTwo instanceof File) {
        formData.append("footer_download_image_two", footerDownloadImageTwo);
      }
      if (footerLogoFile instanceof File) {
        formData.append("footer_logo", footerLogoFile);
      }

      await saveSiteSettings(formData);
      toast({
        title: "Success",
        description: "Site settings saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save site settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading site settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground">
          Manage global site settings, logos, and contact information
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Site Branding */}
          <Card>
            <CardHeader>
              <CardTitle>Site Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Logo</label>
                  <FileUpload
                    value={logoFile}
                    onChange={setLogoFile}
                    accept="image/*"
                    placeholder="Upload site logo"
                    preview={true}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Favicon</label>
                  <FileUpload
                    value={faviconFile}
                    onChange={setFaviconFile}
                    accept="image/*"
                    placeholder="Upload favicon"
                    preview={true}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="logo_alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo Alt Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter alt text for logo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Footer Download Images */}
          <Card>
            <CardHeader>
              <CardTitle>Footer Download Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Footer Download Image One */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Download Image One</h4>
                  <div>
                    <label className="text-sm font-medium">Image</label>
                    <FileUpload
                      value={footerDownloadImageOne}
                      onChange={setFooterDownloadImageOne}
                      accept="image/*"
                      placeholder="Upload footer download image one"
                      preview={true}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="footer_download_image_one_alt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alt Text</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter alt text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="footer_download_image_one_link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter download link" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Footer Download Image Two */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Download Image Two</h4>
                  <div>
                    <label className="text-sm font-medium">Image</label>
                    <FileUpload
                      value={footerDownloadImageTwo}
                      onChange={setFooterDownloadImageTwo}
                      accept="image/*"
                      placeholder="Upload footer download image two"
                      preview={true}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="footer_download_image_two_alt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alt Text</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter alt text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="footer_download_image_two_link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter download link" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Footer Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Footer Logo</label>
                <FileUpload
                  value={footerLogoFile}
                  onChange={setFooterLogoFile}
                  accept="image/*"
                  placeholder="Upload footer logo"
                  preview={true}
                />
              </div>

              <FormField
                control={form.control}
                name="footer_logo_alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Footer Logo Alt Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter alt text for footer logo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="footer_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Footer Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter footer description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="social_media_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Social Media Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter social media section title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subscribe_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subscribe Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter subscribe section title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}