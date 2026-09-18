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
import { homeCmsSchema, HomeCmsFormData } from "@/schemas/homeCmsSchema";
import { fetchHomeCms, saveHomeCms } from "@/services/home/homeCmsApi";

const defaultValues: HomeCmsFormData = {
  discover_title: "",
  discover_title_ar: "",
  residential_title: "",
  residential_title_ar: "",
  home_space_title: "",
  home_space_title_ar: "",
  project_title: "",
  project_title_ar: "",
  features_title: "",
  features_title_ar: "",
  features_subtitle: "",
  features_subtitle_ar: "",
  features_description: "",
  features_description_ar: "",
  work_title: "",
  work_title_ar: "",
  testimonial_title: "",
  testimonial_title_ar: "",
  brand_title: "",
  brand_title_ar: "",
  cta_title: "",
  cta_title_ar: "",
  cta_description: "",
  cta_description_ar: "",
  faq_title: "",
  faq_title_ar: "",
  premium_title: "",
  premium_title_ar: "",
  premium_description: "",
  premium_description_ar: "",
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
          discover_title_ar: data.discover_title_ar || "",
          residential_title: data.residential_title || "",
          residential_title_ar: data.residential_title_ar || "",
          home_space_title: data.home_space_title || "",
          home_space_title_ar: data.home_space_title_ar || "",
          project_title: data.project_title || "",
          project_title_ar: data.project_title_ar || "",
          features_title: data.features_title || "",
          features_title_ar: data.features_title_ar || "",
          features_subtitle: data.features_subtitle || "",
          features_subtitle_ar: data.features_subtitle_ar || "",
          features_description: data.features_description || "",
          features_description_ar: data.features_description_ar || "",
          work_title: data.work_title || "",
          work_title_ar: data.work_title_ar || "",
          testimonial_title: data.testimonial_title || "",
          testimonial_title_ar: data.testimonial_title_ar || "",
          brand_title: data.brand_title || "",
          brand_title_ar: data.brand_title_ar || "",
          cta_title: data.cta_title || "",
          cta_title_ar: data.cta_title_ar || "",
          cta_description: data.cta_description || "",
          cta_description_ar: data.cta_description_ar || "",
          faq_title: data.faq_title || "",
          faq_title_ar: data.faq_title_ar || "",
          premium_title: data.premium_title || "",
          premium_title_ar: data.premium_title_ar || "",
          premium_description: data.premium_description || "",
          premium_description_ar: data.premium_description_ar || "",
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
        discover_title_ar: data.discover_title_ar,
        residential_title: data.residential_title,
        residential_title_ar: data.residential_title_ar,
        home_space_title: data.home_space_title,
        home_space_title_ar: data.home_space_title_ar,
        project_title: data.project_title,
        project_title_ar: data.project_title_ar,
        features_title: data.features_title,
        features_title_ar: data.features_title_ar,
        features_subtitle: data.features_subtitle,
        features_subtitle_ar: data.features_subtitle_ar,
        features_description: data.features_description,
        features_description_ar: data.features_description_ar,
        work_title: data.work_title,
        work_title_ar: data.work_title_ar,
        testimonial_title: data.testimonial_title,
        testimonial_title_ar: data.testimonial_title_ar,
        brand_title: data.brand_title,
        brand_title_ar: data.brand_title_ar,
        cta_title: data.cta_title,
        cta_title_ar: data.cta_title_ar,
        cta_description: data.cta_description,
        cta_description_ar: data.cta_description_ar,
        faq_title: data.faq_title,
        faq_title_ar: data.faq_title_ar,
        premium_title: data.premium_title,
        premium_title_ar: data.premium_title_ar,
        premium_description: data.premium_description,
        premium_description_ar: data.premium_description_ar,
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
    return <PageLoader />;
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="discover_title"
                  label="Discover Title"
                  placeholder="Enter discover title"
                />
                <FormTextField
                  form={form}
                  name="discover_title_ar"
                  label="Discover Title (Arabic)"
                  placeholder="أدخل عنوان الاكتشاف"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Residential Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="residential_title"
                  label="Residential Title"
                  placeholder="Enter residential title"
                />
                <FormTextField
                  form={form}
                  name="residential_title_ar"
                  label="Residential Title (Arabic)"
                  placeholder="أدخل عنوان السكنية"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Home Space Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="home_space_title"
                  label="Home Space Title"
                  placeholder="Enter home space title"
                />
                <FormTextField
                  form={form}
                  name="home_space_title_ar"
                  label="Home Space Title (Arabic)"
                  placeholder="أدخل عنوان مساحة المنزل"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Projects Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="project_title"
                  label="Project Title"
                  placeholder="Enter project title"
                />
                <FormTextField
                  form={form}
                  name="project_title_ar"
                  label="Project Title (Arabic)"
                  placeholder="أدخل عنوان المشروع"
                />
              </div>
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
                  name="features_title_ar"
                  label="Features Title (Arabic)"
                  placeholder="أدخل عنوان المميزات"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="features_subtitle"
                  label="Features Subtitle"
                  placeholder="Enter features subtitle"
                />
                <FormTextField
                  form={form}
                  name="features_subtitle_ar"
                  label="Features Subtitle (Arabic)"
                  placeholder="أدخل العنوان الفرعي للمميزات"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormTextareaField form={form} name="features_description" label="Features Description" placeholder="Enter features description" />
                <FormTextareaField form={form} name="features_description_ar" label="Features Description (Arabic)" placeholder="أدخل وصف المميزات" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Work Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="work_title"
                  label="Work Title"
                  placeholder="Enter work title"
                />
                <FormTextField
                  form={form}
                  name="work_title_ar"
                  label="Work Title (Arabic)"
                  placeholder="أدخل عنوان العمل"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Testimonials Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="testimonial_title"
                  label="Testimonial Title"
                  placeholder="Enter testimonial title"
                />
                <FormTextField
                  form={form}
                  name="testimonial_title_ar"
                  label="Testimonial Title (Arabic)"
                  placeholder="أدخل عنوان الشهادات"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Brand Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="brand_title"
                  label="Brand Title"
                  placeholder="Enter brand title"
                />
                <FormTextField
                  form={form}
                  name="brand_title_ar"
                  label="Brand Title (Arabic)"
                  placeholder="أدخل عنوان العلامة التجارية"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CTA Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="cta_title"
                  label="CTA Title"
                  placeholder="Enter CTA title"
                />
                <FormTextField
                  form={form}
                  name="cta_title_ar"
                  label="CTA Title (Arabic)"
                  placeholder="أدخل عنوان CTA"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormTextareaField form={form} name="cta_description" label="CTA Description" placeholder="Enter CTA description" />
                <FormTextareaField form={form} name="cta_description_ar" label="CTA Description (Arabic)" placeholder="أدخل وصف CTA" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>FAQ Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="faq_title"
                  label="FAQ Title"
                  placeholder="Enter FAQ title"
                />
                <FormTextField
                  form={form}
                  name="faq_title_ar"
                  label="FAQ Title (Arabic)"
                  placeholder="أدخل عنوان الأسئلة الشائعة"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Premium Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="premium_title"
                  label="Premium Title"
                  placeholder="Enter premium title"
                />
                <FormTextField
                  form={form}
                  name="premium_title_ar"
                  label="Premium Title (Arabic)"
                  placeholder="أدخل عنوان البريميوم"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormTextareaField form={form} name="premium_description" label="Premium Description" placeholder="Enter premium description" />
                <FormTextareaField form={form} name="premium_description_ar" label="Premium Description (Arabic)" placeholder="أدخل وصف البريميوم" />
              </div>
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
