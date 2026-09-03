import { useState, useEffect } from "react";
import PageLoader from "@/components/layout/PageLoader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FormTextField, FormTextareaField } from "@/components/forms/FormFieldComponents";
import { contactCmsSchema, ContactCmsFormData } from "@/schemas/contactCmsSchema";
import { fetchContactCms, saveContactCms } from "@/services/contact/contactCmsApi";

const defaultValues: ContactCmsFormData = {
  title: "",
  description: "",
  form_title: "",
  social_media_title: "",
  map_url: "",
};

export default function ContactCmsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [recordId, setRecordId] = useState<number | undefined>(undefined);

  const form = useForm<ContactCmsFormData>({
    resolver: zodResolver(contactCmsSchema),
    defaultValues,
  });

  useEffect(() => {
    loadContactCmsData();
  }, []);

  const loadContactCmsData = async () => {
    try {
      setInitialLoading(true);
      const response = await fetchContactCms();
      const data = response.data;

      if (data) {
        setRecordId(data.id);
        form.reset({
          title: data.title || "",
          description: data.description || "",
          form_title: data.form_title || "",
          social_media_title: data.social_media_title || "",
          map_url: data.map_url || "",
        });
      }
    } catch (error) {
      console.log("No existing data found, starting with empty form");
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: ContactCmsFormData) => {
    try {
      setLoading(true);
      const payload = {
        title: data.title,
        description: data.description,
        form_title: data.form_title,
        social_media_title: data.social_media_title,
        map_url: data.map_url,
      };
      const response = await saveContactCms(payload, recordId ?? 1);
      if (response.data?.id) {
        setRecordId(response.data.id);
      }
      toast({
        title: "Success",
        description: "Contact CMS data saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save Contact CMS data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contact Page CMS</h1>
        <p className="text-muted-foreground">Manage content for the Contact page</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormTextField
                form={form}
                name="title"
                label="Title"
                placeholder="Enter contact title"
              />
              <FormTextareaField
                form={form}
                name="description"
                label="Description"
                placeholder="Enter contact description"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormTextField
                form={form}
                name="form_title"
                label="Form Title"
                placeholder="Enter form title"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Media Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormTextField
                form={form}
                name="social_media_title"
                label="Social Media Title"
                placeholder="Enter social media title"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Map Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormTextareaField
                form={form}
                name="map_url"
                label="Map URL"
                placeholder="Enter map embed URL"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
