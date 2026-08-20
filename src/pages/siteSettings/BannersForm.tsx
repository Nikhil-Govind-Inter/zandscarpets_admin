import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
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
  fetchBannerById,
  fetchBannersList,
  createBanner,
  updateBanner,
  ApiError,
} from "@/services/siteSettings/bannerApi";
import { fetchActivePages, PageRecord } from "@/services/masters/pagesApi";
import { bannerSchema, BannerFormData } from "@/schemas/bannerSchema";

export default function BannersForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);

  const form = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      page_id: "",
      title: "",
      sub_title: "",
      media_alt: "",
      desktop_media_path: "",
      mobile_media_path: "",
    },
  });

  // Pages already assigned to another banner are excluded from the picker
  // (one banner per page, enforced here as well as by the server's unique
  // `page_id` FK) — the currently-edited banner's own page stays selectable
  // since its own row is excluded from the "used" set.
  useEffect(() => {
    loadPageOptions();
  }, [id]);

  const loadPageOptions = async () => {
    try {
      const [activePages, bannersRes] = await Promise.all([
        fetchActivePages(),
        fetchBannersList(1, 100, undefined, ["page_id"]),
      ]);

      const currentId = isEditing && id ? parseInt(id) : null;
      const usedPageIds = new Set(
        bannersRes.data.data
          .filter((banner) => banner.id !== currentId)
          .map((banner) => banner.page_id),
      );

      setPages(activePages.filter((page) => !usedPageIds.has(page.id)));
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error?.message : "Failed to load pages",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isEditing && id) {
      loadBannerData(parseInt(id));
    }
  }, [id, isEditing]);

  const loadBannerData = async (itemId: number) => {
    try {
      setInitialLoading(true);
      const response = await fetchBannerById(itemId);
      const data = response.data;

      setCurrentPageId(data.page_id ? String(data.page_id) : null);
      form.reset({
        page_id: data.page_id ? String(data.page_id) : "",
        title: data.title || "",
        sub_title: data.sub_title || "",
        media_alt: data.media_alt || "",
        desktop_media_path: data.desktop_media_path || "",
        mobile_media_path: data.mobile_media_path || "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to load banner data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  // Only offer active pages, except the page already assigned to this banner
  // (in edit mode) so an existing, since-deactivated assignment still shows.
  const pageOptions: ComboboxOption[] = pages
    .filter((p) => p.is_active || String(p.id) === currentPageId)
    .map((p) => ({ value: String(p.id), label: p.page }));

  const onSubmit = async (data: BannerFormData) => {
    try {
      setLoading(true);

      const payload = {
        page_id: Number(data.page_id),
        title: data.title,
        sub_title: data.sub_title,
        media_alt: data.media_alt,
        desktop_media_path: data.desktop_media_path,
        mobile_media_path: data.mobile_media_path,
      };

      if (isEditing && id) {
        await updateBanner(parseInt(id), payload);
        toast({ title: "Success", description: "Banner updated successfully" });
      } else {
        await createBanner(payload);
        toast({ title: "Success", description: "Banner created successfully" });
      }

      navigate("/banners");
    } catch (error) {
      toast({
        title: "Error",
        description: error ? error.message : `Failed to ${isEditing ? "update" : "create"} banner`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading banner data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/banners")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? "Edit" : "Add"} Banner</h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update" : "Create a new"} banner
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Banner Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="page_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page</FormLabel>
                    <FormControl>
                      <Combobox
                        options={pageOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select a page"
                        searchPlaceholder="Search pages..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Banner title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sub_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sub Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Banner sub title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="media_alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Media Alt Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Describe the banner image" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFileUploadField
                  form={form}
                  name="desktop_media_path"
                  label="Desktop Media"
                  placeholder="Upload desktop banner image"
                  accept="image/*"
                />

                <FormFileUploadField
                  form={form}
                  name="mobile_media_path"
                  label="Mobile Media"
                  placeholder="Upload mobile banner image"
                  accept="image/*"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/banners")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
