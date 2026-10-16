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
import { commonContentSchema, CommonContentFormData } from "@/schemas/commonContentSchema";
import { fetchCommonContent, saveCommonContent, CommonContent } from "@/services/common/commonContentApi";

const defaultValues: CommonContentFormData = {
  why_choose_title: "",
  why_choose_title_ar: "",
  side_section_title: "",
  side_section_title_ar: "",
  side_section_description: "",
  side_section_description_ar: "",
  button_text: "",
  button_text_ar: "",
  button_link: "",
  how_section_title: "",
  how_section_title_ar: "",
};

export default function CommonContentForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [recordId, setRecordId] = useState<number | undefined>(undefined);

  const form = useForm<CommonContentFormData>({
    resolver: zodResolver(commonContentSchema),
    defaultValues,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchCommonContent();
        const data = response.data;
        if (data) {
          setRecordId(data.id);
          form.reset({
            why_choose_title: data.why_choose_title || "",
            why_choose_title_ar: data.why_choose_title_ar || "",
            side_section_title: data.side_section_title || "",
            side_section_title_ar: data.side_section_title_ar || "",
            side_section_description: data.side_section_description || "",
            side_section_description_ar: data.side_section_description_ar || "",
            button_text: data.button_text || "",
            button_text_ar: data.button_text_ar || "",
            button_link: data.button_link || "",
            how_section_title: data.how_section_title || "",
            how_section_title_ar: data.how_section_title_ar || "",
          });
        }
      } catch {
        // No existing row yet — start with an empty form.
      } finally {
        setInitialLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: CommonContentFormData) => {
    try {
      setLoading(true);
      const response = await saveCommonContent(data as Omit<CommonContent, "id" | "createdAt" | "updatedAt">, recordId ?? 1);
      if (response.data?.id) setRecordId(response.data.id);
      toast({ title: "Success", description: "Content saved successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Common Content</h1>
        <p className="text-muted-foreground">Manage the shared Why Choose Us / How It Works content</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Why Choose Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="why_choose_title" label="Why Choose Title" placeholder="Enter why choose title" />
                <FormTextField form={form} name="why_choose_title_ar" label="Why Choose Title (Arabic)" placeholder="أدخل عنوان لماذا تختارنا" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Side Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="side_section_title" label="Side Section Title" placeholder="Enter side section title" />
                <FormTextField form={form} name="side_section_title_ar" label="Side Section Title (Arabic)" placeholder="أدخل عنوان القسم الجانبي" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextareaField form={form} name="side_section_description" label="Side Section Description" placeholder="Enter side section description" />
                <FormTextareaField form={form} name="side_section_description_ar" label="Side Section Description (Arabic)" placeholder="أدخل وصف القسم الجانبي" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="button_text" label="Button Text" placeholder="Enter button text" />
                <FormTextField form={form} name="button_text_ar" label="Button Text (Arabic)" placeholder="أدخل نص الزر" />
              </div>
              <FormTextField form={form} name="button_link" label="Button Link" placeholder="/contact" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How It Works Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="how_section_title" label="How Section Title" placeholder="Enter how section title" />
                <FormTextField form={form} name="how_section_title_ar" label="How Section Title (Arabic)" placeholder="أدخل عنوان قسم كيف يعمل" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
