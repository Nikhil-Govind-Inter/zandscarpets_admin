import { useState, useEffect } from "react";
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
  // Tracks whether the user has manually edited the slug — once they have,
  // typing in the page name should stop overwriting it.
  const [slugTouched, setSlugTouched] = useState(false);

  const form = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      page: "",
      page_slug: "",
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
    // Auto-generate the slug from the page name while the user hasn't
    // manually overridden it yet.
    if (slugTouched) return;
    form.setValue("page_slug", pageName ? generateSlug(pageName) : "", {
      shouldValidate: form.formState.isSubmitted,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageName, slugTouched]);

  const loadPageData = async (itemId: number) => {
    try {
      setInitialLoading(true);
      const response = await fetchPageById(itemId);
      const data = response.data;

      form.reset({
        page: data.page || "",
        page_slug: data.page_slug || "",
        is_active: data.is_active ?? true,
      });
      // Existing pages already have a slug — don't let editing the page
      // name silently rewrite it.
      setSlugTouched(true);
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

  // const handleGenerateSlug = () => {
  //   const currentPageName = form.getValues("page");
  //   if (currentPageName) {
  //     form.setValue("page_slug", generateSlug(currentPageName), { shouldValidate: true });
  //   }
  //   // Re-enable auto-sync so further edits to the page name keep the slug in step.
  //   setSlugTouched(false);
  // };

  const onSubmit = async (data: PageFormData) => {
    try {
      setLoading(true);

      if (isEditing && id) {
        await updatePage(parseInt(id), data);
        toast({ title: "Success", description: "Page updated successfully" });
      } else {
        await createPage(data);
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading page data...</div>
      </div>
    );
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
                      <Input placeholder="e.g., Home, About, Products" {...field} />
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
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g., home, about, products"
                          {...field}
                          onChange={(e) => {
                            setSlugTouched(true);
                            field.onChange(e);
                          }}
                        />
                        {/* <Button type="button" variant="outline" onClick={handleGenerateSlug}>
                          Generate
                        </Button> */}
                      </div>
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
