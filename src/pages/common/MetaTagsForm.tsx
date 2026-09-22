import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  FormTextField,
  FormTextareaField,
  FormKeywordsField,
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

interface MetaTagsFormProps {
  metaTag: MetaTag | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const MetaTagsForm: React.FC<MetaTagsFormProps> = ({
  metaTag,
  onClose,
  onSuccess,
}) => {
  // Keep the last non-null meta tag around while the dialog is closing so
  // its exit transition doesn't flash empty content.
  const [displayMetaTag, setDisplayMetaTag] = useState(metaTag);

  useEffect(() => {
    if (metaTag) setDisplayMetaTag(metaTag);
  }, [metaTag]);

  const form = useForm<MetaTagFormData>({
    resolver: zodResolver(metaTagSchema),
    defaultValues: {
      meta_title: displayMetaTag?.meta_title || "",
      meta_title_ar:  displayMetaTag?.meta_title_ar || "",
      meta_description: displayMetaTag?.meta_description || "",
      meta_description_ar: displayMetaTag?.meta_description_ar || "",
      meta_keywords: displayMetaTag?.meta_keywords || "",
      meta_keywords_ar: displayMetaTag?.meta_keywords_ar || "",
    },
  });

  useEffect(() => {
    if (metaTag) {
      form.reset({
        meta_title: metaTag.meta_title || "",
        meta_title_ar: metaTag.meta_title_ar || "",
        meta_description: metaTag.meta_description || "",
        meta_description_ar: metaTag.meta_description_ar || "",
        meta_keywords: metaTag.meta_keywords || "",
        meta_keywords_ar: metaTag.meta_keywords_ar || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaTag]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateMetaTagRequest) =>
      updateMetaTag(displayMetaTag!.id, data),
    onSuccess: () => {
      toast.success("Meta tag updated successfully");
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update meta tag: ${error.message}`);
    },
  });

  const onSubmit = (data: MetaTagFormData) => {
    if (!displayMetaTag) return;

    const updateData: UpdateMetaTagRequest = {
      meta_title: data.meta_title,
      meta_title_ar: data.meta_title_ar,
      meta_description: data.meta_description,
      meta_description_ar: data.meta_description_ar,
      meta_keywords: data.meta_keywords,
      meta_keywords_ar: data.meta_keywords_ar,
    };

    updateMutation.mutate(updateData);
  };

  return (
    <Dialog
      open={!!metaTag}
      onOpenChange={(open) => {
        if (!open && !updateMutation.isPending) onClose();
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Meta Tags</DialogTitle>
          <DialogDescription>
            Page:{" "}
            <span className="font-medium">{displayMetaTag?.page?.page}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:col-span-2">
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
                placeholder="Enter meta title (recommended: 50-60 characters)"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:col-span-2">
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
                placeholder="Enter meta description (recommended: 150-160 characters)"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:col-span-2">
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
                placeholder="Type a keyword and press Enter"
              />
            </div>
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
      </DialogContent>
    </Dialog>
  );
};
