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
import { Label } from "@/components/ui/label";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import {
  MultiSelect,
  Option as MultiSelectOption,
} from "@/components/ui/multi-select";
import {
  FormTextField,
  FormTextareaField,
  FormRichTextField,
  FormFileUploadField,
} from "@/components/forms/FormFieldComponents";
import { Save, ArrowLeft, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchProductById,
  createProduct,
  updateProduct,
  fetchActiveProducts,
  ApiError,
} from "@/services/products/productsApi";
import { fetchActiveProductCategories } from "@/services/products/productCategoryApi";
import { fetchActiveProductLabels } from "@/services/products/productLabelsApi";
import { fetchActiveAttributes } from "@/services/products/attributesApi";
import { productSchema, ProductFormData } from "@/schemas/productSchema";
import { generateSlug } from "@/utils/formUtils";
import { buildCategoryPathOptions } from "@/utils/productCategoryTree";

const toOptions = (rows: { id: number; title: string }[]): MultiSelectOption[] =>
  rows.map((r) => ({ id: r.id, name: r.title }));

export default function ProductForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const productId = id ? parseInt(id) : undefined;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  // When true, the next title-driven slug sync is skipped. Used once after
  // loading existing data so the fetched slug isn't clobbered on mount.
  const skipNextSlugSync = useRef(false);
  const [categoryOptions, setCategoryOptions] = useState<ComboboxOption[]>([]);
  const [featureOptions, setFeatureOptions] = useState<MultiSelectOption[]>([]);
  const [tagOptions, setTagOptions] = useState<MultiSelectOption[]>([]);
  const [specificationOptions, setSpecificationOptions] = useState<MultiSelectOption[]>([]);
  const [attributeOptions, setAttributeOptions] = useState<MultiSelectOption[]>([]);
  const [relatedOptions, setRelatedOptions] = useState<MultiSelectOption[]>([]);
  const [featureIds, setFeatureIds] = useState<(number | string)[]>([]);
  const [tagIds, setTagIds] = useState<(number | string)[]>([]);
  const [specificationIds, setSpecificationIds] = useState<(number | string)[]>([]);
  const [attributeIds, setAttributeIds] = useState<(number | string)[]>([]);
  const [relatedIds, setRelatedIds] = useState<(number | string)[]>([]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      product_category_id: "",
      title: "",
      title_ar: "",
      slug: "",
      price: "",
      short_description: "",
      short_description_ar: "",
      product_description: "",
      product_description_ar: "",
      main_media_path: "",
      media_alt: "",
      media_alt_ar: "",
      list_media_path: "",
      list_media_alt: "",
      list_media_alt_ar: "",
      sort_order: "1",
      is_active: true,
      list_in_navbar: true,
    },
  });

  const errorToast = (error: unknown, fallback: string) =>
    toast({
      title: "Error",
      description: error instanceof ApiError ? error.message : fallback,
      variant: "destructive",
    });

  useEffect(() => {
    fetchActiveProductCategories()
      .then((res) => setCategoryOptions(buildCategoryPathOptions(res.data)))
      .catch((e) => errorToast(e, "Failed to load categories"));

    fetchActiveProductLabels("feature")
      .then((res) => setFeatureOptions(toOptions(res.data)))
      .catch((e) => errorToast(e, "Failed to load features"));

    fetchActiveProductLabels("tag")
      .then((res) => setTagOptions(toOptions(res.data)))
      .catch((e) => errorToast(e, "Failed to load tags"));

    fetchActiveProductLabels("specification")
      .then((res) => setSpecificationOptions(toOptions(res.data)))
      .catch((e) => errorToast(e, "Failed to load specifications"));

    fetchActiveAttributes()
      .then((res) => setAttributeOptions(toOptions(res.data)))
      .catch((e) => errorToast(e, "Failed to load attributes"));

    fetchActiveProducts(productId)
      .then((res) => setRelatedOptions(toOptions(res.data)))
      .catch((e) => errorToast(e, "Failed to load products"));
  }, [id]);

  useEffect(() => {
    if (isEditing && productId) loadProductData(productId);
  }, [id, isEditing]);

  const title = form.watch("title");

  useEffect(() => {
    if (skipNextSlugSync.current) {
      skipNextSlugSync.current = false;
      return;
    }
    form.setValue("slug", title ? generateSlug(title) : "", {
      shouldValidate: form.formState.isSubmitted,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  const loadProductData = async (itemId: number) => {
    try {
      setInitialLoading(true);
      const { data } = await fetchProductById(itemId);

      form.reset({
        product_category_id: data.product_category_id.toString(),
        title: data.title || "",
        title_ar: data.title_ar || "",
        slug: data.slug || "",
        price: data.price != null ? String(data.price) : "",
        short_description: data.short_description || "",
        short_description_ar: data.short_description_ar || "",
        product_description: data.product_description || "",
        product_description_ar: data.product_description_ar || "",
        main_media_path: data.main_media_path || "",
        media_alt: data.media_alt || "",
        media_alt_ar: data.media_alt_ar || "",
        list_media_path: data.list_media_path || "",
        list_media_alt: data.list_media_alt || "",
        list_media_alt_ar: data.list_media_alt_ar || "",
        sort_order: (data.sort_order ?? 1).toString(),
        is_active: data.is_active ?? true,
        list_in_navbar: data.list_in_navbar ?? true,
      });
      skipNextSlugSync.current = true;

      const labels = data.labels || [];
      setFeatureIds(labels.filter((l) => l.type === "feature").map((l) => l.id));
      setTagIds(labels.filter((l) => l.type === "tag").map((l) => l.id));
      setSpecificationIds(
        labels.filter((l) => l.type === "specification").map((l) => l.id),
      );
      setAttributeIds((data.attributes || []).map((a) => a.id));
      setRelatedIds((data.relatedProducts || []).map((p) => p.id));
    } catch (error) {
      errorToast(error, "Failed to load product data");
    } finally {
      setInitialLoading(false);
    }
  };

  // Put backend field errors (e.g. "Slug is already in use") on their inputs.
  const applyFieldErrors = (error: unknown) => {
    if (!(error instanceof ApiError)) return;
    const fieldNames = Object.keys(form.getValues());
    error.fieldErrors.forEach(({ path, msg }) => {
      if (path && msg && fieldNames.includes(path)) {
        form.setError(path as keyof ProductFormData, { type: "server", message: msg });
      }
    });
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setLoading(true);

      const { main_media_path, list_media_path, price, sort_order, is_active, list_in_navbar, ...text } =
        data;

      const formData = new FormData();
      Object.entries(text).forEach(([key, value]) => formData.append(key, value ?? ""));
      // Price is hidden from the admin UI; never send it so it stays null server-side.
      void price;
      formData.append("sort_order", (sort_order || "1").toString());
      formData.append("is_active", (is_active ?? true).toString());
      formData.append("list_in_navbar", (list_in_navbar ?? true).toString());

      // A File uploads a new file; a string sends back the existing path unchanged.
      [
        ["main_media_path", main_media_path],
        ["list_media_path", list_media_path],
      ].forEach(([key, value]) => {
        if (value instanceof File || (typeof value === "string" && value)) {
          formData.append(key as string, value);
        }
      });

      formData.append("label_ids", JSON.stringify([...featureIds, ...tagIds, ...specificationIds]));
      formData.append("attribute_ids", JSON.stringify(attributeIds));
      formData.append("related_product_ids", JSON.stringify(relatedIds));

      if (isEditing && productId) {
        await updateProduct(productId, formData);
        toast({ title: "Success", description: "Product updated successfully" });
      } else {
        await createProduct(formData);
        toast({ title: "Success", description: "Product created successfully" });
      }
      navigate("/products");
    } catch (error) {
      applyFieldErrors(error);
      errorToast(error, `Failed to ${isEditing ? "update" : "create"} product`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isEditing ? "Edit" : "Add"} Product</h1>
            <p className="text-muted-foreground">
              {isEditing ? "Update" : "Create a new"} product
            </p>
          </div>
        </div>
        {isEditing && productId && (
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/products/${productId}/variants`)}
          >
            <Layers className="mr-2 h-4 w-4" />
            Variants
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="product_category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Combobox
                        options={categoryOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select category"
                        searchPlaceholder="Search categories..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="title" label="Title" placeholder="e.g., Hand-knotted Wool Rug" />
                <FormTextField
                  form={form}
                  name="title_ar"
                  label="Title (Arabic)"
                  placeholder="مثال: سجادة صوف معقودة يدوياً"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                  form={form}
                  name="slug"
                  label="Slug"
                  placeholder="e.g., hand-knotted-wool-rug"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextareaField
                  form={form}
                  name="short_description"
                  label="Short Description"
                  placeholder="One or two lines shown on product cards"
                />
                <FormTextareaField
                  form={form}
                  name="short_description_ar"
                  label="Short Description (Arabic)"
                  placeholder="وصف مختصر"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormRichTextField
                  form={form}
                  name="product_description"
                  label="Product Description"
                  placeholder="Full product description"
                />
                <FormRichTextField
                  form={form}
                  name="product_description_ar"
                  label="Product Description (Arabic)"
                  placeholder="وصف المنتج"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFileUploadField
                  form={form}
                  name="main_media_path"
                  label="Main Image"
                  placeholder="Upload product image"
                  accept="image/*"
                />
                <FormFileUploadField
                  form={form}
                  name="list_media_path"
                  label="Listing Image (optional)"
                  placeholder="Upload listing image"
                  accept="image/*"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="media_alt" label="Main Image Alt" placeholder="Describe the image" />
                <FormTextField
                  form={form}
                  name="media_alt_ar"
                  label="Main Image Alt (Arabic)"
                  placeholder="وصف الصورة"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="list_media_alt" label="Listing Image Alt" placeholder="Describe the image" />
                <FormTextField
                  form={form}
                  name="list_media_alt_ar"
                  label="Listing Image Alt (Arabic)"
                  placeholder="وصف الصورة"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features, Tags & Specifications</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Features", options: featureOptions, selected: featureIds, onChange: setFeatureIds },
                { label: "Tags", options: tagOptions, selected: tagIds, onChange: setTagIds },
                {
                  label: "Specifications",
                  options: specificationOptions,
                  selected: specificationIds,
                  onChange: setSpecificationIds,
                },
                {
                  label: "Related Products",
                  options: relatedOptions,
                  selected: relatedIds,
                  onChange: setRelatedIds,
                },
              ].map(({ label, options, selected, onChange }) => (
                <div key={label} className="space-y-2">
                  <Label>{label}</Label>
                  <MultiSelect
                    options={options}
                    selected={selected}
                    onChange={onChange}
                    placeholder={`Select ${label.toLowerCase()}`}
                  />
                </div>
              ))}
              <p className="text-xs text-muted-foreground md:col-span-2">
                Only active items are listed.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attributes & Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Attributes used for Variants</Label>
                <MultiSelect
                  options={attributeOptions}
                  selected={attributeIds}
                  onChange={setAttributeIds}
                  placeholder="Select attributes (e.g. Size, Color, Material)"
                />
                <p className="text-xs text-muted-foreground">
                  Select the attributes this product uses. Each variant will carry one value for each selected attribute.
                </p>
              </div>
              {isEditing && productId && (
                <div className="pt-2 flex items-center justify-between border-t">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Product Variants</p>
                    <p className="text-xs text-muted-foreground">
                      Manage or generate combinations of the selected attributes
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/products/${productId}/variants`)}
                  >
                    <Layers className="mr-2 h-4 w-4" />
                    Manage Variants
                  </Button>
                </div>
              )}
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
                        <p className="text-sm text-muted-foreground">
                          Enable or disable this product.
                        </p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="list_in_navbar"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">List in Navbar</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Show this product in the site navigation.
                        </p>
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
            <Button type="button" variant="outline" onClick={() => navigate("/products")}>
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