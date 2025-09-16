import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { X, Save } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  FormTextField,
  FormTextareaField,
} from "@/components/forms/FormFieldComponents";
import {
  updateMetaTag,
  MetaTag,
  UpdateMetaTagRequest,
} from "@/services/common/metaTagsApi";
import { toast } from "sonner";

const metaTagSchema = z.object({
  meta_title: z
    .string()
    .min(1, "Meta title is required")
    .max(60, "Meta title should be under 60 characters"),
  meta_description: z
    .string()
    .min(1, "Meta description is required")
    .max(160, "Meta description should be under 160 characters"),
  meta_keywords: z
    .string()
    .max(255, "Meta keywords should be under 255 characters"),
  targeted_keywords: z
    .string()
    .max(255, "Targeted keywords should be under 255 characters")
    .optional(),
  other_meta_tags: z.string().optional(),
  canonical_url: z
    .string()
    .url("Please enter a valid URL")
    .or(z.literal(""))
    .optional(),
});

type MetaTagFormData = z.infer<typeof metaTagSchema>;

interface MetaTagsFormProps {
  metaTag: MetaTag;
  onClose: () => void;
  onSuccess: () => void;
}

export const MetaTagsForm: React.FC<MetaTagsFormProps> = ({
  metaTag,
  onClose,
  onSuccess,
}) => {
  const form = useForm<MetaTagFormData>({
    resolver: zodResolver(metaTagSchema),
    defaultValues: {
      meta_title: metaTag.meta_title || "",
      meta_description: metaTag.meta_description || "",
      meta_keywords: metaTag.meta_keywords || "",
      targeted_keywords: metaTag.targeted_keywords || "",
      other_meta_tags: metaTag.other_meta_tags || "",
      canonical_url: metaTag.canonical_url || "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateMetaTagRequest) => updateMetaTag(metaTag.id, data),
    onSuccess: () => {
      toast.success("Meta tag updated successfully");
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update meta tag: ${error.message}`);
    },
  });

  const onSubmit = (data: MetaTagFormData) => {
    const updateData: UpdateMetaTagRequest = {
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      meta_keywords: data.meta_keywords,
      targeted_keywords: data.targeted_keywords || "",
      other_meta_tags: data.other_meta_tags || "",
      canonical_url: data.canonical_url || "",
    };

    updateMutation.mutate(updateData);
  };

  return (
    <Card className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <h2 className="text-lg font-semibold">Edit Meta Tags</h2>
            <p className="text-sm text-muted-foreground">
              Page: <span className="font-medium">{metaTag.page}</span>
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={updateMutation.isPending}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormTextField
                form={form}
                name="meta_title"
                label="Meta Title"
                placeholder="Enter meta title (recommended: 50-60 characters)"
              />

              <FormTextareaField
                form={form}
                name="meta_description"
                label="Meta Description"
                placeholder="Enter meta description (recommended: 150-160 characters)"
                rows={3}
              />

              <FormTextField
                form={form}
                name="meta_keywords"
                label="Meta Keywords"
                placeholder="Enter keywords separated by commas"
              />

              <FormTextField
                form={form}
                name="targeted_keywords"
                label="Targeted Keywords"
                placeholder="Enter targeted keywords separated by commas"
              />

              <FormTextField
                form={form}
                name="canonical_url"
                label="Canonical URL"
                placeholder="https://example.com/page"
                type="url"
              />

              <FormTextareaField
                form={form}
                name="other_meta_tags"
                label="Other Meta Tags"
                placeholder="Additional meta tags in HTML format"
                rows={4}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    "Updating..."
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Update Meta Tags
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </div>
    </Card>
  );
};
