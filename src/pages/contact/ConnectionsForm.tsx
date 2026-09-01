import { useState, useEffect } from "react";
import PageLoader from "@/components/layout/PageLoader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
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
import { connectionsSchema, ConnectionsFormData } from "@/schemas/connectionsSchema";

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
      description: "",
      content: "",
      icon_media_path: "",
      icon_media_alt: "",
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
          description: data.description || "",
          content: data.content || "",
          icon_media_path: data.icon_media_path || "",
          icon_media_alt: data.icon_media_alt || "",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to load connection data",
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
      formData.append("description", data.description);
      formData.append("content", data.content);
      formData.append("icon_media_alt", data.icon_media_alt || "");

      if (data.icon_media_path instanceof File) {
        formData.append("icon_media_path", data.icon_media_path);
      } else if (typeof data.icon_media_path === "string" && data.icon_media_path) {
        formData.append("icon_media_path", data.icon_media_path);
      }

      if (isEditing && id) {
        await updateConnections(parseInt(id), formData);
        toast({ title: "Success", description: "Connection updated successfully" });
      } else {
        await createConnections(formData);
        toast({ title: "Success", description: "Connection created successfully" });
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
        <Button variant="outline" size="icon" onClick={() => navigate("/contact-connections")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? "Edit" : "Add"} Connection</h1>
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
              <FormTextField
                form={form}
                name="title"
                label="Title"
                placeholder="Enter connection title"
              />
              <FormTextareaField
                form={form}
                name="description"
                label="Description"
                placeholder="Enter connection description"
              />
              <FormTextareaField
                form={form}
                name="content"
                label="Content"
                placeholder="Enter connection content"
              />
              <FormFileUploadField
                form={form}
                name="icon_media_path"
                label="Icon"
                placeholder="Upload connection icon"
                accept="image/*"
              />
              <FormTextField
                form={form}
                name="icon_media_alt"
                label="Icon Alt Text"
                placeholder="Describe the connection icon"
              />
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
