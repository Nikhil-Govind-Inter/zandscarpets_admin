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
  FormTextareaField,
} from "@/components/forms/FormFieldComponents";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchConnectionsById,
  createConnections,
  updateConnections,
  ApiError,
} from "@/services/contact/connectionsApi";
import {
  connectionsSchema,
  ConnectionsFormData,
} from "@/schemas/connectionsSchema";

export default function ConnectionsForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const form = useForm<ConnectionsFormData>({
    resolver: zodResolver(connectionsSchema),
    defaultValues: {
      title: "",
      title_ar: "",
      description: "",
      description_ar: "",
      content: "",
      content_ar: "",
      icon_media_path: "",
      icon_media_alt: "",
      icon_media_alt_ar: "",
      sort_order: "1",
      is_active: true,
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      loadConnectionsData(parseInt(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditing]);

  const loadConnectionsData = async (itemId: number) => {
    try {
      setInitialLoading(true);
      const response = await fetchConnectionsById(itemId);
      const data = response.data;

      if (data) {
        form.reset({
          title: data.title || "",
          title_ar: data.title_ar || "",
          description: data.description || "",
          description_ar: data.description_ar || "",
          content: data.content || "",
          content_ar: data.content_ar || "",
          icon_media_path: data.icon_media_path || "",
          icon_media_alt: data.icon_media_alt || "",
          icon_media_alt_ar: data.icon_media_alt_ar || "",
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
            : "Failed to load connection data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: ConnectionsFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("title_ar", data.title_ar);
      formData.append("description", data.description);
      formData.append("description_ar", data.description_ar);
      formData.append("content", data.content);
      formData.append("content_ar", data.content_ar);
      formData.append("icon_media_alt", data.icon_media_alt || "");
      formData.append("icon_media_alt_ar", data.icon_media_alt_ar || "");
      formData.append("sort_order", (data.sort_order || "1").toString());
      formData.append("is_active", (data.is_active ?? true).toString());

      if (data.icon_media_path instanceof File) {
        formData.append("icon_media_path", data.icon_media_path);
      } else if (
        typeof data.icon_media_path === "string" &&
        data.icon_media_path
      ) {
        formData.append("icon_media_path", data.icon_media_path);
      }

      if (isEditing && id) {
        await updateConnections(parseInt(id), formData);
        toast({
          title: "Success",
          description: "Connection updated successfully",
        });
      } else {
        await createConnections(formData);
        toast({
          title: "Success",
          description: "Connection created successfully",
        });
      }

      navigate("/contact-connections");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError
            ? error.message
            : `Failed to ${isEditing ? "update" : "create"} connection`,
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
          onClick={() => navigate("/contact-connections")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit" : "Add"} Connection
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update" : "Create a new"} connection
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connection Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
                <FormTextField
                  form={form}
                  name="title"
                  label="Title"
                  placeholder="Enter connection title"
                />

                <FormTextField
                  form={form}
                  name="title_ar"
                  label="Title (Arabic)"
                  placeholder="أدخل عنوان جهة الاتصال"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
                <FormTextField
                  form={form}
                  name="content"
                  label="Content"
                  placeholder="Enter connection content"
                />
                <FormTextField
                  form={form}
                  name="content_ar"
                  label="Content (Arabic)"
                  placeholder="أدخل محتوى جهة الاتصال"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
                <FormTextareaField
                  form={form}
                  name="description"
                  label="Description"
                  placeholder="Enter connection description"
                />
                <FormTextareaField
                  form={form}
                  name="description_ar"
                  label="Description (Arabic)"
                  placeholder="أدخل وصف جهة الاتصال"
                />
              </div>

              <FormFileUploadField
                form={form}
                name="icon_media_path"
                label="Icon"
                placeholder="Upload connection icon"
                accept="image/*"
              />

              <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
                <FormTextField
                  form={form}
                  name="icon_media_alt"
                  label="Icon Alt Text"
                  placeholder="Describe the connection icon"
                />

                <FormTextField
                  form={form}
                  name="icon_media_alt_ar"
                  label="Icon Alt Text (Arabic)"
                  placeholder="صف أيقونة جهة الاتصال"
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
              onClick={() => navigate("/contact-connections")}
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
