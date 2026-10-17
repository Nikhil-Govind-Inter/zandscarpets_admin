import { useState, useEffect, useRef } from "react";
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
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateSlug } from "@/utils/formUtils";
import {
  fetchPageById,
  createPage,
  updatePage,
  ApiError,
} from "@/services/masters/pagesApi";
import { pageSchema, PageFormData } from "@/schemas/pageSchema";

export default function PagesForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  // When true, the next page-driven slug sync is skipped. Used once after
  // loading existing data so the fetched slug isn't clobbered on mount.
  const skipNextSlugSync = useRef(false);

  const form = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      page: "",
      page_slug: "",
      page_ar: "",
      link: "",
      show_in_nav: false,
      show_in_footer: false,
      sort_order: 0,
      is_active: true,
    },
  });

  const pageName = form.watch("page");

  useEffect(() => {
    if (isEditing && id) {
      loadPageData(parseInt(id));
    }
  }, [id, isEditing]);

  useEffect(() => {
    // Slugs are referenced elsewhere (banners, meta tags), so never
    // regenerate them from the name when editing an existing page.
    if (isEditing) return;
    if (skipNextSlugSync.current) {
      skipNextSlugSync.current = false;
      return;
    }
    form.setValue("page_slug", pageName ? generateSlug(pageName) : "", {
      shouldValidate: form.formState.isSubmitted,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageName]);

  const loadPageData = async (itemId: number) => {
    try {
      setInitialLoading(true);
      const response = await fetchPageById(itemId);
      const data = response.data;

      form.reset({
        page: data.page || "",
        page_slug: data.page_slug || "",
        page_ar: data.page_ar || "",
        link: data.link || "",
        show_in_nav: data.show_in_nav ?? false,
        show_in_footer: data.show_in_footer ?? false,
        sort_order: data.sort_order ?? 0,
        is_active: data.is_active ?? true,
      });
      skipNextSlugSync.current = true;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to load page data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: PageFormData) => {
    try {
      setLoading(true);

      const payload = {
        page: data.page,
        page_slug: data.page_slug,
        page_ar: data.page_ar || null,
        link: data.link || null,
        show_in_nav: data.show_in_nav,
        show_in_footer: data.show_in_footer,
        sort_order: data.sort_order,
        is_active: data.is_active,
      };

      if (isEditing && id) {
        await updatePage(parseInt(id), payload);
        toast({ title: "Success", description: "Page updated successfully" });
      } else {
        await createPage(payload);
        toast({ title: "Success", description: "Page created successfully" });
      }

      navigate("/pages");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError
            ? error.message
            : `Failed to ${isEditing ? "update" : "create"} page`,
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
        <Button variant="outline" size="icon" onClick={() => navigate("/pages")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? "Edit" : "Add"} Page</h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update" : "Create a new"} page
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="page"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Home, About, Products"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="page_slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Slug</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., home, about, products"
                        readOnly={isEditing}
                        className={isEditing ? "bg-muted cursor-not-allowed" : undefined}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="page_ar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Name (Arabic)</FormLabel>
                    <FormControl>
                      <Input
                        dir="rtl"
                        placeholder="اسم الصفحة"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., /about or https://example.com"
                        readOnly={isEditing}
                        className={isEditing ? "bg-muted cursor-not-allowed" : undefined}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="show_in_nav"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Show in Nav</FormLabel>
                      <p className="text-sm text-muted-foreground">Display this page in the website navigation.</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="show_in_footer"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Show in Footer</FormLabel>
                      <p className="text-sm text-muted-foreground">Display this page in the website footer.</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
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
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/pages")}>
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
