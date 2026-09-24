import { useState, useEffect } from "react";
import PageLoader from "@/components/layout/PageLoader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormFileUploadField,
  FormTextField,
  FormRichTextField,
} from "@/components/forms/FormFieldComponents";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchProcessStepById,
  createProcessStep,
  updateProcessStep,
  ApiError,
} from "@/services/services/processStepApi";
import {
  processStepSchema,
  ProcessStepFormData,
} from "@/schemas/processStepSchema";

export default function ProcessStepForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const form = useForm<ProcessStepFormData>({
    resolver: zodResolver(processStepSchema),
    defaultValues: {
      title: "",
      title_ar: "",
      description: "",
      description_ar: "",
      media_path: "",
      media_alt: "",
      media_alt_ar: "",
      sort_order: "1",
      is_active: true,
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      loadProcessStepData(parseInt(id));
    }
  }, [id, isEditing]);

  const loadProcessStepData = async (itemId: number) => {
    try {
      setInitialLoading(true);
      const response = await fetchProcessStepById(itemId);
      const data = response.data;

      if (data) {
        form.reset({
          title: data.title || "",
          title_ar: data.title_ar || "",
          description: data.description || "",
          description_ar: data.description_ar || "",
          media_path: data.media_path || "",
          media_alt: data.media_alt || "",
          media_alt_ar: data.media_alt_ar || "",
          sort_order: (data.sort_order ?? 1).toString(),
          is_active: data.is_active ?? true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError
            ? error.message
            : "Failed to load process step data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: ProcessStepFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("title_ar", data.title_ar);
      formData.append("description", data.description);
      formData.append("description_ar", data.description_ar);
      formData.append("media_alt", data.media_alt || "");
      formData.append("media_alt_ar", data.media_alt_ar || "");
      formData.append("sort_order", (data.sort_order || "1").toString());
      formData.append("is_active", (data.is_active ?? true).toString());

      if (data.media_path instanceof File) {
        formData.append("media_path", data.media_path);
      } else if (typeof data.media_path === "string" && data.media_path) {
        formData.append("media_path", data.media_path);
      }

      if (isEditing && id) {
        await updateProcessStep(parseInt(id), formData);
        toast({
          title: "Success",
          description: "Process step updated successfully",
        });
      } else {
        await createProcessStep(formData);
        toast({
          title: "Success",
          description: "Process step created successfully",
        });
      }

      navigate("/process-steps");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError
            ? error.message
            : `Failed to ${isEditing ? "update" : "create"} process step`,
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
          onClick={() => navigate("/process-steps")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit" : "Add"} Process Step
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update" : "Create a new"} process step
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Process Step Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:col-span-2">
                <FormTextField
                  form={form}
                  name="title"
                  label="Title"
                  placeholder="Process step title"
                />

                <FormTextField
                  form={form}
                  name="title_ar"
                  label="Title (Arabic)"
                  placeholder="عنوان خطوة العملية"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:col-span-2">
                <FormRichTextField
                  form={form}
                  name="description"
                  label="Description"
                  placeholder="Describe this process step"
                />

                <FormRichTextField
                  form={form}
                  name="description_ar"
                  label="Description (Arabic)"
                  placeholder="صف خطوة العملية هذه"
                />
              </div>
              <FormFileUploadField
                form={form}
                name="media_path"
                label="Image"
                placeholder="Upload process step image"
                accept="image/*"
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:col-span-2">
                <FormTextField
                  form={form}
                  name="media_alt"
                  label="Image Alt Text"
                  placeholder="Describe the process step media"
                />

                <FormTextField
                  form={form}
                  name="media_alt_ar"
                  label="Image Alt Text (Arabic)"
                  placeholder="صف وسائط خطوة العملية"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publishing Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sort_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Status</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Enable or disable this item.
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/process-steps")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
