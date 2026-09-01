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
} from "@/components/forms/FormFieldComponents";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchHomeTestimonialsById,
  createHomeTestimonials,
  updateHomeTestimonials,
  ApiError,
} from "@/services/home/homeTestimonialsApi";
import {
  homeTestimonialsSchema,
  HomeTestimonialsFormData,
} from "@/schemas/homeTestimonialsSchema";

export default function HomeTestimonialsForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const form = useForm<HomeTestimonialsFormData>({
    resolver: zodResolver(homeTestimonialsSchema),
    defaultValues: {
      profile_media_path: "",
      name: "",
      designation: "",
      message: "",
      sort_order: "1",
      is_active: true,
    },
  });

  const loadData = useCallback(
    async (itemId: number) => {
      try {
        setInitialLoading(true);
        const res = await fetchHomeTestimonialsById(itemId);
        const data = res.data;
        form.reset({
          profile_media_path: data.profile_media_path || "",
          name: data.name || "",
          designation: data.designation || "",
          message: data.message || "",
          sort_order: (data.sort_order ?? 1).toString(),
          is_active: data.is_active ?? true,
        });
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof ApiError ? error.message : "Failed to load data",
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
  }, [id, isEditing]);

  const onSubmit = async (data: HomeTestimonialsFormData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("designation", data.designation ?? "");
      formData.append("message", data.message);
      formData.append("sort_order", (data.sort_order || "1").toString());
      formData.append("is_active", (data.is_active ?? true).toString());

      if (data.profile_media_path instanceof File) {
        formData.append("profile_media_path", data.profile_media_path);
      } else if (
        typeof data.profile_media_path === "string" &&
        data.profile_media_path
      ) {
        formData.append("profile_media_path", data.profile_media_path);
      }

      if (isEditing && id) {
        await updateHomeTestimonials(parseInt(id), formData);
        toast({
          title: "Success",
          description: "Testimonial updated successfully",
        });
      } else {
        await createHomeTestimonials(formData);
        toast({
          title: "Success",
          description: "Testimonial created successfully",
        });
      }

      navigate("/home-testimonials");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError
            ? error.message
            : `Failed to ${isEditing ? "update" : "create"}`,
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
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/home-testimonials")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit" : "Add"} Testimonial
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update" : "Create a new"} testimonial
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Testimonial</CardTitle>
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

              <FormFileUploadField
                form={form}
                name="profile_media_path"
                label="Profile Image"
                placeholder="Upload profile image"
                accept="image/*"
              />

              <FormRichTextField
                form={form}
                name="message"
                label="Message"
                placeholder="Testimonial message"
                height="300px"
              />

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
              onClick={() => navigate("/home-testimonials")}
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
