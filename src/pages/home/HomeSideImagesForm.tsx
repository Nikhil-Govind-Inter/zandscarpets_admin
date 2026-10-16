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
import { FormFileUploadField } from "@/components/forms/FormFieldComponents";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchHomeSideImagesById,
  createHomeSideImages,
  updateHomeSideImages,
  ApiError,
} from "@/services/home/homeSideImagesApi";
import {
  homeSideImagesSchema,
  HomeSideImagesFormData,
} from "@/schemas/homeSideImagesSchema";

export default function HomeSideImagesForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const form = useForm<HomeSideImagesFormData>({
    resolver: zodResolver(homeSideImagesSchema),
    defaultValues: {
      before_media_path: "",
      after_media_path: "",
      before_media_alt: "",
      before_media_alt_ar: "",
      after_media_alt: "",
      after_media_alt_ar: "",
      sort_order: "1",
      is_active: true,
    },
  });

  const loadData = useCallback(
    async (itemId: number) => {
      try {
        setInitialLoading(true);
        const res = await fetchHomeSideImagesById(itemId);
        const data = res.data;
        form.reset({
          before_media_path: data.before_media_path || "",
          after_media_path: data.after_media_path || "",
          before_media_alt: data.before_media_alt || "",
          before_media_alt_ar: data.before_media_alt_ar || "",
          after_media_alt: data.after_media_alt || "",
          after_media_alt_ar: data.after_media_alt_ar || "",
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

  const onSubmit = async (data: HomeSideImagesFormData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("before_media_alt", data.before_media_alt);
      formData.append("before_media_alt_ar", data.before_media_alt_ar);
      formData.append("after_media_alt", data.after_media_alt);
      formData.append("after_media_alt_ar", data.after_media_alt_ar);
      formData.append("sort_order", (data.sort_order || "1").toString());
      formData.append("is_active", (data.is_active ?? true).toString());

      if (data.before_media_path instanceof File) {
        formData.append("before_media_path", data.before_media_path);
      } else if (typeof data.before_media_path === "string" && data.before_media_path) {
        formData.append("before_media_path", data.before_media_path);
      }

      if (data.after_media_path instanceof File) {
        formData.append("after_media_path", data.after_media_path);
      } else if (typeof data.after_media_path === "string" && data.after_media_path) {
        formData.append("after_media_path", data.after_media_path);
      }

      if (isEditing && id) {
        await updateHomeSideImages(parseInt(id), formData);
        toast({
          title: "Success",
          description: "Side image updated successfully",
        });
      } else {
        await createHomeSideImages(formData);
        toast({
          title: "Success",
          description: "Side image created successfully",
        });
      }

      navigate("/home-side-images");
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
          onClick={() => navigate("/home-side-images")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit" : "Add"} Side Image
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update" : "Create a new"} before / after slider
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Side Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormFileUploadField
                  form={form}
                  name="before_media_path"
                  label="Before Image"
                  placeholder="Upload before image"
                  accept="image/*"
                  required
                />
                <FormFileUploadField
                  form={form}
                  name="after_media_path"
                  label="After Image"
                  placeholder="Upload after image"
                  accept="image/*"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="before_media_alt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Before Image Alt Text</FormLabel>
                      <FormControl>
                        <Input placeholder="Describe the before image" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="before_media_alt_ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Before Image Alt Text (Arabic)</FormLabel>
                      <FormControl>
                        <Input dir="rtl" className="text-right" placeholder="وصف صورة قبل" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="after_media_alt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>After Image Alt Text</FormLabel>
                      <FormControl>
                        <Input placeholder="Describe the after image" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="after_media_alt_ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>After Image Alt Text (Arabic)</FormLabel>
                      <FormControl>
                        <Input dir="rtl" className="text-right" placeholder="وصف صورة بعد" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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
                        <p className="text-sm text-muted-foreground">Enable or disable this item.</p>
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
              onClick={() => navigate("/home-side-images")}
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
