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
  meta_description: z
    .string()
    .min(1, "Meta description is required")
    .max(160, "Meta description should be under 160 characters"),
  meta_keywords: z
    .string()
    .min(1, "Meta keywords is required")
    .max(255, "Meta keywords should be under 255 characters"),
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
      meta_description: displayMetaTag?.meta_description || "",
      meta_keywords: displayMetaTag?.meta_keywords || "",
    },
  });

  useEffect(() => {
    if (metaTag) {
      form.reset({
        meta_title: metaTag.meta_title || "",
        meta_description: metaTag.meta_description || "",
        meta_keywords: metaTag.meta_keywords || "",
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
      meta_description: data.meta_description,
      meta_keywords: data.meta_keywords,
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
            Page: <span className="font-medium">{displayMetaTag?.page?.page}</span>
          </DialogDescription>
        </DialogHeader>

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

            <FormKeywordsField
              form={form}
              name="meta_keywords"
              label="Meta Keywords"
              placeholder="Type a keyword and press Enter"
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
      </DialogContent>
    </Dialog>
  );
};
