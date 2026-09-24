import { useState, useEffect } from "react";
import PageLoader from "@/components/layout/PageLoader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
import { Label } from "@/components/ui/label";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import {
  MultiSelect,
  Option as MultiSelectOption,
} from "@/components/ui/multi-select";
import {
  FormTextField,
  FormTextareaField,
  FormFileUploadField,
} from "@/components/forms/FormFieldComponents";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchProductCategoryById,
  createProductCategory,
  updateProductCategory,
  fetchActiveProductCategories,
  ProductCategoryOption,
  ApiError,
} from "@/services/products/productCategoryApi";
import { fetchActiveProductHighlights } from "@/services/products/productHighlightApi";
import { fetchActiveIndustries } from "@/services/masters/industryApi";
import {
  productCategorySchema,
  ProductCategoryFormData,
} from "@/schemas/productCategorySchema";

const NO_PARENT = "0";

// Turns the flat active-category list into select options ordered as a tree,
// each labelled with its full path ("Carpets › Wool › Hand-knotted"), so
// sub-categories can be nested under other sub-categories to any depth.
const buildParentOptions = (rows: ProductCategoryOption[]): ComboboxOption[] => {
  const byParent = new Map<number | null, ProductCategoryOption[]>();
  const ids = new Set(rows.map((r) => r.id));
  rows.forEach((row) => {
    // A row whose parent isn't in the list (inactive/excluded) is shown as a root.
    const key = row.parent_id && ids.has(row.parent_id) ? row.parent_id : null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(row);
  });

  const options: ComboboxOption[] = [];
  const walk = (parent: number | null, path: string[]) => {
    (byParent.get(parent) || []).forEach((row) => {
      const nextPath = [...path, row.title];
      options.push({ value: row.id.toString(), label: nextPath.join(" › ") });
      walk(row.id, nextPath);
    });
  };
  walk(null, []);
  return options;
};

export default function ProductCategoryForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = Boolean(id);
  const presetParent = searchParams.get("parent") || "";

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [industryOptions, setIndustryOptions] = useState<ComboboxOption[]>([]);
  const [parentRows, setParentRows] = useState<ProductCategoryOption[]>([]);
  const [highlightOptions, setHighlightOptions] = useState<
    MultiSelectOption[]
  >([]);
  const [highlightIds, setHighlightIds] = useState<(number | string)[]>([]);

  const form = useForm<ProductCategoryFormData>({
    resolver: zodResolver(productCategorySchema),
    defaultValues: {
      industry_id: "",
      parent_id: presetParent,
      title: "",
      title_ar: "",
      description: "",
      description_ar: "",
      material_type: "",
      material_type_ar: "",
      media_path: "",
      sort_order: "1",
      is_active: true,
    },
  });

  const errorToast = (error: unknown, fallback: string) =>
    toast({
      title: "Error",
      description: error instanceof ApiError ? error.message : fallback,
      variant: "destructive",
    });

  useEffect(() => {
    fetchActiveIndustries()
      .then((res) =>
        setIndustryOptions(
          res.data.map((i) => ({ value: i.id.toString(), label: i.title })),
        ),
      )
      .catch((e) => errorToast(e, "Failed to load industries"));

    fetchActiveProductHighlights()
      .then((res) =>
        setHighlightOptions(
          res.data.map((h) => ({ id: h.id, name: h.title })),
        ),
      )
      .catch((e) => errorToast(e, "Failed to load highlights"));

    fetchActiveProductCategories(id ? parseInt(id) : undefined)
      .then((res) => setParentRows(res.data))
      .catch((e) => errorToast(e, "Failed to load categories"));
  }, [id]);

  // New sub-category from the list's "Add sub-category" action: inherit the
  // parent's industry once the category list has loaded.
  useEffect(() => {
    if (isEditing || !presetParent) return;
    const parent = parentRows.find((r) => r.id.toString() === presetParent);
    if (parent && !form.getValues("industry_id")) {
      form.setValue("industry_id", parent.industry_id.toString());
    }
  }, [parentRows, presetParent, isEditing]);

  useEffect(() => {
    if (isEditing && id) loadCategoryData(parseInt(id));
  }, [id, isEditing]);

  const loadCategoryData = async (itemId: number) => {
    try {
      setInitialLoading(true);
      const { data } = await fetchProductCategoryById(itemId);

      form.reset({
        industry_id: data.industry_id.toString(),
        parent_id: data.parent_id ? data.parent_id.toString() : "",
        title: data.title || "",
        title_ar: data.title_ar || "",
        description: data.description || "",
        description_ar: data.description_ar || "",
        material_type: data.material_type || "",
        material_type_ar: data.material_type_ar || "",
        media_path: data.media_path || "",
        sort_order: (data.sort_order ?? 1).toString(),
        is_active: data.is_active ?? true,
      });

      setHighlightIds((data.highlights || []).map((h) => h.id));
    } catch (error) {
      errorToast(error, "Failed to load category data");
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: ProductCategoryFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("industry_id", data.industry_id);
      formData.append("parent_id", data.parent_id || "");
      formData.append("title", data.title);
      formData.append("title_ar", data.title_ar);
      formData.append("description", data.description || "");
      formData.append("description_ar", data.description_ar || "");
      formData.append("material_type", data.material_type || "");
      formData.append("material_type_ar", data.material_type_ar || "");
      formData.append("sort_order", (data.sort_order || "1").toString());
      formData.append("is_active", (data.is_active ?? true).toString());

      if (data.media_path instanceof File) {
        formData.append("media_path", data.media_path);
      } else if (typeof data.media_path === "string" && data.media_path) {
        formData.append("media_path", data.media_path);
      }

      formData.append("highlight_ids", JSON.stringify(highlightIds));

      if (isEditing && id) {
        await updateProductCategory(parseInt(id), formData);
        toast({ title: "Success", description: "Category updated successfully" });
      } else {
        await createProductCategory(formData);
        toast({ title: "Success", description: "Category created successfully" });
      }

      navigate("/product-categories");
    } catch (error) {
      errorToast(
        error,
        `Failed to ${isEditing ? "update" : "create"} category`,
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <PageLoader />;
  }

  const parentOptions: ComboboxOption[] = [
    { value: NO_PARENT, label: "— None (top-level category) —" },
    ...buildParentOptions(parentRows),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/product-categories")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit" : "Add"} Category
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update" : "Create a new"} product category or
            sub-category
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="industry_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <Combobox
                          options={industryOptions}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select industry"
                          searchPlaceholder="Search industry..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parent_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Category</FormLabel>
                      <FormControl>
                        <Combobox
                          options={parentOptions}
                          value={field.value || NO_PARENT}
                          onChange={(v) =>
                            field.onChange(v === NO_PARENT ? "" : v)
                          }
                          placeholder="Select parent category"
                          searchPlaceholder="Search categories..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="title"
                  label="Title"
                  placeholder="e.g., Wool Carpets"
                />
                <FormTextField
                  form={form}
                  name="title_ar"
                  label="Title (Arabic)"
                  placeholder="مثال: سجاد صوف"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextareaField
                  form={form}
                  name="description"
                  label="Description"
                  placeholder="Category description"
                />
                <FormTextareaField
                  form={form}
                  name="description_ar"
                  label="Description (Arabic)"
                  placeholder="وصف الفئة"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="material_type"
                  label="Material Type"
                  placeholder="e.g., Wool"
                />
                <FormTextField
                  form={form}
                  name="material_type_ar"
                  label="Material Type (Arabic)"
                  placeholder="نوع المادة"
                />
              </div>

                <FormFileUploadField
                  form={form}
                  name="media_path"
                  label="Image"
                  placeholder="Upload category image"
                  accept="image/*"
                />

              <div className="space-y-2">
                <Label>Highlights</Label>
                <MultiSelect
                  options={highlightOptions}
                  selected={highlightIds}
                  onChange={setHighlightIds}
                  placeholder="Select highlights"
                />
                <p className="text-xs text-muted-foreground">
                  Only active highlights are listed.
                </p>
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
                          Enable or disable this category.
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
              onClick={() => navigate("/product-categories")}
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
