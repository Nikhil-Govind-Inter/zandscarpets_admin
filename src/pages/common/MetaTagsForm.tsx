import { useState, useEffect } from "react";
import PageLoader from "@/components/layout/PageLoader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormTextField,
  FormTextareaField,
  FormKeywordsField,
} from "@/components/forms/FormFieldComponents";
import { useToast } from "@/hooks/use-toast";
import {
  fetchMetaTagById,
  updateMetaTag,
  MetaTag,
} from "@/services/common/metaTagsApi";

const metaTagSchema = z.object({
  meta_title: z
    .string()
    .min(1, "Meta title is required")
    .max(60, "Meta title should be under 60 characters"),

  meta_title_ar: z
    .string()
    .min(1, "Arabic meta title is required")
    .max(60, "Arabic meta title should be under 60 characters"),

  meta_description: z
    .string()
    .min(1, "Meta description is required")
    .max(160, "Meta description should be under 160 characters"),

  meta_description_ar: z
    .string()
    .min(1, "Arabic meta description is required")
    .max(160, "Arabic meta description should be under 160 characters"),

  meta_keywords: z
    .string()
    .min(1, "Meta keywords is required")
    .max(255, "Meta keywords should be under 255 characters"),

  meta_keywords_ar: z
    .string()
    .min(1, "Arabic meta keywords is required")
    .max(255, "Arabic meta keywords should be under 255 characters"),
});

type MetaTagFormData = z.infer<typeof metaTagSchema>;

export default function MetaTagsForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [metaTag, setMetaTag] = useState<MetaTag | null>(null);

  const form = useForm<MetaTagFormData>({
    resolver: zodResolver(metaTagSchema),
    defaultValues: {
      meta_title: "",
      meta_title_ar: "",
      meta_description: "",
      meta_description_ar: "",
      meta_keywords: "",
      meta_keywords_ar: "",
    },
  });

  useEffect(() => {
    if (id) loadMetaTag(parseInt(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadMetaTag = async (itemId: number) => {
    try {
      setInitialLoading(true);
      const response = await fetchMetaTagById(itemId);
      const data = response.data;

      if (data) {
        setMetaTag(data);
        form.reset({
          meta_title: data.meta_title || "",
          meta_title_ar: data.meta_title_ar || "",
          meta_description: data.meta_description || "",
          meta_description_ar: data.meta_description_ar || "",
          meta_keywords: data.meta_keywords || "",
          meta_keywords_ar: data.meta_keywords_ar || "",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load meta tag data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: MetaTagFormData) => {
    if (!id) return;

    try {
      setLoading(true);
      await updateMetaTag(parseInt(id), {
        meta_title: data.meta_title,
        meta_title_ar: data.meta_title_ar,
        meta_description: data.meta_description,
        meta_description_ar: data.meta_description_ar,
        meta_keywords: data.meta_keywords,
        meta_keywords_ar: data.meta_keywords_ar,
      });
      toast({
        title: "Success",
        description: "Meta tag updated successfully",
      });
      navigate("/meta-tags");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update meta tag",
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
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/meta-tags")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Meta Tags</h1>
          <p className="text-muted-foreground">
            Page:{" "}
            <span className="font-medium capitalize">
              {metaTag?.page?.page}
            </span>
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meta Title</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="meta_title"
                  label="Meta Title"
                  placeholder="Enter meta title (recommended: 50-60 characters)"
                />

                <FormTextField
                  form={form}
                  name="meta_title_ar"
                  label="Meta Title (Arabic)"
                  placeholder="أدخل عنوان الميتا (يفضل 50-60 حرفًا)"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meta Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextareaField
                  form={form}
                  name="meta_description"
                  label="Meta Description"
                  placeholder="Enter meta description (recommended: 150-160 characters)"
                  rows={3}
                />

                <FormTextareaField
                  form={form}
                  name="meta_description_ar"
                  label="Meta Description (Arabic)"
                  placeholder="أدخل وصف الميتا (يفضل 150-160 حرفًا)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meta Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormKeywordsField
                  form={form}
                  name="meta_keywords"
                  label="Meta Keywords"
                  placeholder="Type a keyword and press Enter"
                />

                <FormKeywordsField
                  form={form}
                  name="meta_keywords_ar"
                  label="Meta Keywords (Arabic)"
                  placeholder="اكتب كلمة مفتاحية واضغط"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/meta-tags")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Update"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
