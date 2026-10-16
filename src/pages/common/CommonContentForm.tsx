import { useState, useEffect } from "react";
import PageLoader from "@/components/layout/PageLoader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Loader2 } from "lucide-react";
import { captureVideoThumbnail } from "@/utils/videoThumbnail";
import { useToast } from "@/hooks/use-toast";
import { FormTextField, FormTextareaField, FormFileUploadField } from "@/components/forms/FormFieldComponents";
import { commonContentSchema, CommonContentFormData } from "@/schemas/commonContentSchema";
import { fetchCommonContent, saveCommonContent } from "@/services/common/commonContentApi";

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
  how_section_bg_title: "",
  how_section_bg_title_ar: "",
  how_section_media_type: "image",
  how_section_media_path: "",
  how_section_thumbnail: "",
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

  const [generatingThumbnail, setGeneratingThumbnail] = useState(false);
  const mediaType = form.watch("how_section_media_type");
  const mediaValue = form.watch("how_section_media_path");

  // Auto-generate a thumbnail whenever a new video file is picked; the user
  // can still replace it through the thumbnail upload.
  useEffect(() => {
    if (mediaType !== "video" || !(mediaValue instanceof File)) return;
    let cancelled = false;
    setGeneratingThumbnail(true);
    captureVideoThumbnail(mediaValue)
      .then((thumb) => {
        if (!cancelled) form.setValue("how_section_thumbnail", thumb, { shouldValidate: true });
      })
      .catch(() => {
        toast({
          title: "Thumbnail",
          description: "Couldn't auto-generate a thumbnail. Please upload one.",
          variant: "destructive",
        });
      })
      .finally(() => {
        if (!cancelled) setGeneratingThumbnail(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mediaType, mediaValue, form, toast]);

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
            how_section_bg_title: data.how_section_bg_title || "",
            how_section_bg_title_ar: data.how_section_bg_title_ar || "",
            how_section_media_type: data.how_section_media_type || "image",
            how_section_media_path: data.how_section_media_path || "",
            how_section_thumbnail: data.how_section_thumbnail || "",
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
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "how_section_media_path" || key === "how_section_thumbnail") return;
        formData.append(key, value as string);
      });
      if (data.how_section_media_path instanceof File) {
        formData.append("how_section_media_path", data.how_section_media_path);
      } else if (data.how_section_media_path) {
        formData.append("how_section_media_path", data.how_section_media_path);
      }
      if (data.how_section_media_type === "video") {
        if (data.how_section_thumbnail instanceof File) {
          formData.append("how_section_thumbnail", data.how_section_thumbnail);
        } else if (data.how_section_thumbnail) {
          formData.append("how_section_thumbnail", data.how_section_thumbnail);
        }
      }
      const response = await saveCommonContent(formData, recordId ?? 1);
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormTextField form={form} name="how_section_bg_title" label="How Section Background Title" placeholder="e.g. OUR PROCESS (faint text behind the heading)" />
                <FormTextField form={form} name="how_section_bg_title_ar" label="How Section Background Title (Arabic)" placeholder="مثال: عمليتنا" />
              </div>

              <FormField
                control={form.control}
                name="how_section_media_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Media Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Existing file belongs to the previous type; force a re-upload.
                        form.setValue("how_section_media_path", "");
                        form.setValue("how_section_thumbnail", "");
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select media type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {mediaType === "video" ? (
                <>
                  <FormFileUploadField
                    key="video"
                    form={form}
                    name="how_section_media_path"
                    label="Video"
                    placeholder="Upload video"
                    accept="video/mp4,video/quicktime,video/webm"
                    maxVideoSize={10 * 1024 * 1024}
                  />
                  <div className="space-y-2">
                    {generatingThumbnail && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Generating thumbnail...
                      </p>
                    )}
                    <FormFileUploadField
                      key="thumbnail"
                      form={form}
                      name="how_section_thumbnail"
                      label="Thumbnail"
                      placeholder="Auto-generated from the video — upload to replace"
                      accept="image/*"
                    />
                  </div>
                </>
              ) : (
                <FormFileUploadField
                  key="image"
                  form={form}
                  name="how_section_media_path"
                  label="Image"
                  placeholder="Upload image"
                  accept="image/*"
                />
              )}
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
