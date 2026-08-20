import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FormTextField, FormTextareaField } from "@/components/forms/FormFieldComponents";
import { homeCmsSchema, HomeCmsFormData } from "@/schemas/homeCmsSchema";
import { fetchHomeCms, saveHomeCms } from "@/services/home/homeCmsApi";

const defaultValues: HomeCmsFormData = {
  discover_title: "",
  residential_title: "",
  home_space_title: "",
  project_title: "",
  features_title: "",
  features_subtitle: "",
  features_description: "",
  work_title: "",
  testimonial_title: "",
  brand_title: "",
  cta_title: "",
  cta_description: "",
  faq_title: "",
  premium_title: "",
  premium_description: "",
};

export default function HomeCmsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [recordId, setRecordId] = useState<number | undefined>(undefined);

  const form = useForm<HomeCmsFormData>({
    resolver: zodResolver(homeCmsSchema),
    defaultValues,
  });

  useEffect(() => {
    loadHomeCmsData();
  }, []);

  const loadHomeCmsData = async () => {
    try {
      setInitialLoading(true);
      const response = await fetchHomeCms();
      const data = response.data;

      if (data) {
        setRecordId(data.id);
        form.reset({
          discover_title: data.discover_title || "",
          residential_title: data.residential_title || "",
          home_space_title: data.home_space_title || "",
          project_title: data.project_title || "",
          features_title: data.features_title || "",
          features_subtitle: data.features_subtitle || "",
          features_description: data.features_description || "",
          work_title: data.work_title || "",
          testimonial_title: data.testimonial_title || "",
          brand_title: data.brand_title || "",
          cta_title: data.cta_title || "",
          cta_description: data.cta_description || "",
          faq_title: data.faq_title || "",
          premium_title: data.premium_title || "",
          premium_description: data.premium_description || "",
        });
      }
    } catch (error) {
      console.log("No existing data found, starting with empty form");
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: HomeCmsFormData) => {
    try {
      setLoading(true);
      const payload = {
        discover_title: data.discover_title,
        residential_title: data.residential_title,
        home_space_title: data.home_space_title,
        project_title: data.project_title,
        features_title: data.features_title,
        features_subtitle: data.features_subtitle,
        features_description: data.features_description,
        work_title: data.work_title,
        testimonial_title: data.testimonial_title,
        brand_title: data.brand_title,
        cta_title: data.cta_title,
        cta_description: data.cta_description,
        faq_title: data.faq_title,
        premium_title: data.premium_title,
        premium_description: data.premium_description,
      }
      const response = await saveHomeCms(payload, recordId ?? 1);
      if (response.data?.id) {
        setRecordId(response.data.id);
      }
      toast({
        title: "Success",
        description: "Home CMS data saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save Home CMS data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading Home CMS data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Home Page CMS</h1>
        <p className="text-muted-foreground">Manage content for the Home page</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Discover Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormTextField
                form={form}
                name="discover_title"
                label="Discover Title"
                placeholder="Enter discover title"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Residential Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormTextField
                form={form}
                name="residential_title"
                label="Residential Title"
                placeholder="Enter residential title"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Home Space Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormTextField
                form={form}
                name="home_space_title"
                label="Home Space Title"
                placeholder="Enter home space title"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Projects Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormTextField
                form={form}
                name="project_title"
                label="Project Title"
                placeholder="Enter project title"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="features_title"
                  label="Features Title"
                  placeholder="Enter features title"
                />
                <FormTextField
                  form={form}
                  name="features_subtitle"
                  label="Features Subtitle"
                  placeholder="Enter features subtitle"
                />
              </div>
              <FormTextareaField
                form={form}
                name="features_description"
                label="Features Description"
                placeholder="Enter features description"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Work Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormTextField
                form={form}
                name="work_title"
                label="Work Title"
                placeholder="Enter work title"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Testimonials Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormTextField
                form={form}
                name="testimonial_title"
                label="Testimonial Title"
                placeholder="Enter testimonial title"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Brand Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormTextField
                form={form}
                name="brand_title"
                label="Brand Title"
                placeholder="Enter brand title"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CTA Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormTextField
                form={form}
                name="cta_title"
                label="CTA Title"
                placeholder="Enter CTA title"
              />
              <FormTextareaField
                form={form}
                name="cta_description"
                label="CTA Description"
                placeholder="Enter CTA description"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>FAQ Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormTextField
                form={form}
                name="faq_title"
                label="FAQ Title"
                placeholder="Enter FAQ title"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Premium Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormTextField
                form={form}
                name="premium_title"
                label="Premium Title"
                placeholder="Enter premium title"
              />
              <FormTextareaField
                form={form}
                name="premium_description"
                label="Premium Description"
                placeholder="Enter premium description"
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
