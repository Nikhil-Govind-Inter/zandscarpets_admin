import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PageLoader from "@/components/layout/PageLoader";
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
  FormTextField,
  FormSelectField,
  FormFileUploadField,
} from "@/components/forms/FormFieldComponents";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchProductMediaById,
  createProductMedia,
  updateProductMedia,
  ApiError,
} from "@/services/products/productMediaApi";
import { productMediaSchema, ProductMediaFormData } from "@/schemas/productMediaSchema";
import { useParentProduct } from "./useParentProduct";

const MEDIA_TYPE_OPTIONS = [
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
];

export default function ProductMediaForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { productId, productTitle, loading: productLoading } = useParentProduct();
  const listPath = `/products/${productId}/media`;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  // The list passes the next free sort order when opening "Add Media".
  const nextSortOrder = (location.state as { nextSortOrder?: number } | null)?.nextSortOrder;

  const form = useForm<ProductMediaFormData>({
    resolver: zodResolver(productMediaSchema),
    defaultValues: {
      media_type: "image",
      media_path: "",
      thumbnail: "",
      media_alt: "",
      media_alt_ar: "",
      sort_order: String(nextSortOrder ?? 1),
      is_active: true,
    },
  });

  const mediaType = form.watch("media_type");

  useEffect(() => {
    if (isEditing && id) loadMediaData(parseInt(id));
  }, [id, isEditing]);

  const loadMediaData = async (itemId: number) => {
    try {
      setInitialLoading(true);
      const { data } = await fetchProductMediaById(itemId);
      form.reset({
        media_type: data.media_type,
        media_path: data.media_path || "",
        thumbnail: data.thumbnail || "",
        media_alt: data.media_alt || "",
        media_alt_ar: data.media_alt_ar || "",
        sort_order: (data.sort_order ?? 1).toString(),
        is_active: data.is_active ?? true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to load media data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: ProductMediaFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("product_id", productId.toString());
      formData.append("media_type", data.media_type);
      formData.append("media_alt", data.media_alt || "");
      formData.append("media_alt_ar", data.media_alt_ar || "");
      formData.append("sort_order", (data.sort_order || "1").toString());
      formData.append("is_active", (data.is_active ?? true).toString());
      if (data.media_path instanceof File || (typeof data.media_path === "string" && data.media_path)) {
        formData.append("media_path", data.media_path);
      }
      if (
        data.media_type === "video" &&
        (data.thumbnail instanceof File || (typeof data.thumbnail === "string" && data.thumbnail))
      ) {
        formData.append("thumbnail", data.thumbnail);
      }

      if (isEditing && id) {
        await updateProductMedia(parseInt(id), formData);
        toast({ title: "Success", description: "Media updated successfully" });
      } else {
        await createProductMedia(formData);
        toast({ title: "Success", description: "Media created successfully" });
      }

      navigate(listPath);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError
            ? error.message
            : `Failed to ${isEditing ? "update" : "create"} media`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading || productLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(listPath)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? "Edit" : "Add"} Media</h1>
          <p className="text-muted-foreground">For product: {productTitle}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormSelectField
                form={form}
                name="media_type"
                label="Media Type"
                options={MEDIA_TYPE_OPTIONS}
              />
              <FormFileUploadField
                key={mediaType}
                form={form}
                name="media_path"
                label={mediaType === "video" ? "Video" : "Image"}
                placeholder={`Upload ${mediaType}`}
                accept={mediaType === "video" ? "video/*" : "image/*"}
              />
              {mediaType === "video" && (
                <FormFileUploadField
                  form={form}
                  name="thumbnail"
                  label="Thumbnail"
                  placeholder="Upload thumbnail"
                  accept="image/*"
                />
              )}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormTextField form={form} name="media_alt" label="Alt Text" />
                <FormTextField form={form} name="media_alt_ar" label="Alt Text (Arabic)" />
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
                        <p className="text-sm text-muted-foreground">Enable or disable this item.</p>
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
            <Button type="button" variant="outline" onClick={() => navigate(listPath)}>
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
