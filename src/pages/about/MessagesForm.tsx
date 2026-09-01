import { useState, useEffect, useCallback } from "react";
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
  FormRichTextField,
  FormTextareaField,
} from "@/components/forms/FormFieldComponents";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchMessagesById,
  createMessages,
  updateMessages,
  ApiError,
} from "@/services/about/messagesApi";
import { messagesSchema, MessagesFormData } from "@/schemas/messagesSchema";

export default function MessagesForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const form = useForm<MessagesFormData>({
    resolver: zodResolver(messagesSchema),
    defaultValues: {
      media_path: "",
      media_alt: "",
      quotes: "",
      name: "",
      designation: "",
      Organization: "",
      sort_order: "1",
      is_active: true,
    },
  });

  const loadData = useCallback(
    async (itemId: number) => {
      try {
        setInitialLoading(true);
        const res = await fetchMessagesById(itemId);
        const data = res.data;
        form.reset({
          media_path: data.media_path || "",
          media_alt: data.media_alt || "",
          quotes: data.quotes || "",
          name: data.name || "",
          designation: data.designation || "",
          Organization: data.Organization || "",
          sort_order: (data.sort_order ?? 1).toString(),
          is_active: data.is_active ?? true,
        });
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof ApiError ? error.message : "Failed to load message data",
          variant: "destructive",
        });
      } finally {
        setInitialLoading(false);
      }
    },
    [form, toast],
  );

  useEffect(() => {
    if (isEditing && id) loadData(parseInt(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditing]);

  const onSubmit = async (data: MessagesFormData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("media_alt", data.media_alt ?? "");
      formData.append("quotes", data.quotes);
      formData.append("name", data.name);
      formData.append("designation", data.designation);
      formData.append("Organization", data.Organization);
      formData.append("sort_order", (data.sort_order || "1").toString());
      formData.append("is_active", (data.is_active ?? true).toString());

      if (data.media_path instanceof File) {
        formData.append("media_path", data.media_path);
      } else if (typeof data.media_path === "string" && data.media_path) {
        formData.append("media_path", data.media_path);
      }

      if (isEditing && id) {
        await updateMessages(parseInt(id), formData);
        toast({ title: "Success", description: "Message updated successfully" });
      } else {
        await createMessages(formData);
        toast({ title: "Success", description: "Message created successfully" });
      }

      navigate("/about-messages");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError
            ? error.message
            : `Failed to ${isEditing ? "update" : "create"} message`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/about-messages")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? "Edit" : "Add"} Message</h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update" : "Create a new"} message
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation</FormLabel>
                      <FormControl>
                        <Input placeholder="Designation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="Organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <FormControl>
                      <Input placeholder="Organization" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormFileUploadField
                form={form}
                name="media_path"
                label="Profile"
                placeholder="Upload profile"
                accept="image/*"
              />

              <FormField
                control={form.control}
                name="media_alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Alt Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Profile Alt Text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormRichTextField
                form={form}
                name="quotes"
                label="Quote"
                placeholder="Short quote"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sort_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} placeholder="1" {...field} />
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
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/about-messages")}>
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
