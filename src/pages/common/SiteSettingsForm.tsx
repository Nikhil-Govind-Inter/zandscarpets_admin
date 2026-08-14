import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { FormFileUploadField } from "@/components/forms/FormFieldComponents";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchSiteSettings,
  saveSiteSettings,
} from "@/services/common/siteSettingsApi";
import { siteSettingsSchema, SiteSettingsFormData } from "@/schemas/commonSchemas";

export default function SiteSettingsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [siteSettingsId, setSiteSettingsId] = useState<number | null>(null);

  const form = useForm<SiteSettingsFormData>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      address: "",
      email: "",
      phone_number: "",
      whatsapp_number: "",
      header_logo_media_path: "",
      footer_logo_media_path: "",
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
        setSiteSettingsId(data.id ?? null);

        // Set existing file paths for preview if they exist — FileUpload itself
        // resolves relative paths against VITE_IMAGE_URL, so pass the raw path.
        form.reset({
          address: data.address || "",
          email: data.email || "",
          phone_number: data.phone_number || "",
          whatsapp_number: data.whatsapp_number || "",
          header_logo_media_path: data.header_logo_media_path || "",
          footer_logo_media_path: data.footer_logo_media_path || "",
        });
      }
    } catch (error) {
      console.log("No existing data found, starting with empty form");
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: SiteSettingsFormData) => {
    if (!siteSettingsId) {
      toast({
        title: "Error",
        description: "Site settings record not found",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("address", data.address);
      formData.append("email", data.email);
      formData.append("phone_number", data.phone_number);
      formData.append("whatsapp_number", data.whatsapp_number);

      // Add files if new ones were chosen, otherwise fall back to the existing path string
      formData.append("header_logo_media_path", data.header_logo_media_path);
      formData.append("footer_logo_media_path", data.footer_logo_media_path);

      await saveSiteSettings(siteSettingsId, formData);
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
          {/* Contact Information */}
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
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="whatsapp_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Whatsapp Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter whatsapp number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Site Branding */}
          <Card>
            <CardHeader>
              <CardTitle>Site Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFileUploadField
                  form={form}
                  name="header_logo_media_path"
                  label="Header Logo"
                  placeholder="Upload header logo"
                  accept="image/*"
                />

                <FormFileUploadField
                  form={form}
                  name="footer_logo_media_path"
                  label="Footer Logo"
                  placeholder="Upload footer logo"
                  accept="image/*"
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
