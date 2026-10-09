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
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchProductById,
  createProduct,
  updateProduct,
  fetchActiveProducts,
  ApiError,
} from "@/services/products/productsApi";
import { fetchActiveProductCategories } from "@/services/products/productCategoryApi";
import { fetchActiveTags } from "@/services/products/tagsApi";
import { fetchActiveColors } from "@/services/products/colorsApi";
import { fetchActiveSizes } from "@/services/products/sizesApi";
import { fetchActiveProductTags } from "@/services/products/productTagsApi";
import { productSchema, ProductFormData } from "@/schemas/productSchema";
import { generateSlug } from "@/utils/formUtils";
import { buildCategoryPathOptions } from "@/utils/productCategoryTree";
import ProductSpecificationField from "./ProductSpecificationField";

const NO_TAG = "0";

// Rich-text pairs rendered in the "Details" card, in display order.
const RICH_TEXT_FIELDS = [
  { name: "test_reports_description", label: "Test Reports" },
  { name: "installation_instruction", label: "Installation Instructions" },
  { name: "maintenance", label: "Maintenance" },
  { name: "packing_and_shipping", label: "Packing & Shipping" },
] as const;

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
  const [tagOptions, setTagOptions] = useState<ComboboxOption[]>([]);
  const [colorOptions, setColorOptions] = useState<MultiSelectOption[]>([]);
  const [sizeOptions, setSizeOptions] = useState<MultiSelectOption[]>([]);
  const [hashTagOptions, setHashTagOptions] = useState<MultiSelectOption[]>([]);
  const [relatedOptions, setRelatedOptions] = useState<MultiSelectOption[]>([]);
  const [colorIds, setColorIds] = useState<(number | string)[]>([]);
  const [sizeIds, setSizeIds] = useState<(number | string)[]>([]);
  const [hashTagIds, setHashTagIds] = useState<(number | string)[]>([]);
  const [relatedIds, setRelatedIds] = useState<(number | string)[]>([]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      product_category_id: "",
      tag_id: "",
      title: "",
      title_ar: "",
      slug: "",
      price: "",
      short_description: "",
      short_description_ar: "",
      product_description: "",
      product_description_ar: "",
      specification: [],
      test_reports_description: "",
      test_reports_description_ar: "",
      installation_instruction: "",
      installation_instruction_ar: "",
      maintenance: "",
      maintenance_ar: "",
      packing_and_shipping: "",
      packing_and_shipping_ar: "",
      related_accessories: "",
      media_path: "",
      media_alt: "",
      media_alt_ar: "",
      data_sheet: "",
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
    fetchActiveProductCategories()
      .then((res) => setCategoryOptions(buildCategoryPathOptions(res.data)))
      .catch((e) => errorToast(e, "Failed to load categories"));

    fetchActiveTags()
      .then((res) =>
        setTagOptions(res.data.map((t) => ({ value: t.id.toString(), label: t.title }))),
      )
      .catch((e) => errorToast(e, "Failed to load tags"));

    fetchActiveColors()
      .then((res) => setColorOptions(toOptions(res.data)))
      .catch((e) => errorToast(e, "Failed to load colors"));

    fetchActiveSizes()
      .then((res) => setSizeOptions(toOptions(res.data)))
      .catch((e) => errorToast(e, "Failed to load sizes"));

    fetchActiveProductTags()
      .then((res) => {
        setHashTagOptions(toOptions(res.data));
        // Global tags are applied to every product server-side; preselect them on create.
        if (!isEditing) {
          const globalIds = res.data.filter((t) => t.is_global).map((t) => t.id);
          setHashTagIds((prev) => [...new Set([...prev, ...globalIds])]);
        }
      })
      .catch((e) => errorToast(e, "Failed to load product tags"));

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

      const spec = data.specification || [];
      const specAr = data.specification_ar || [];
      const specRows = Array.from(
        { length: Math.max(spec.length, specAr.length) },
        (_, i) => ({ en: spec[i] ?? "", ar: specAr[i] ?? "" }),
      );

      form.reset({
        product_category_id: data.product_category_id.toString(),
        tag_id: data.tag_id ? data.tag_id.toString() : "",
        title: data.title || "",
        title_ar: data.title_ar || "",
        slug: data.slug || "",
        price: data.price != null ? String(data.price) : "",
        short_description: data.short_description || "",
        short_description_ar: data.short_description_ar || "",
        product_description: data.product_description || "",
        product_description_ar: data.product_description_ar || "",
        specification: specRows,
        test_reports_description: data.test_reports_description || "",
        test_reports_description_ar: data.test_reports_description_ar || "",
        installation_instruction: data.installation_instruction || "",
        installation_instruction_ar: data.installation_instruction_ar || "",
        maintenance: data.maintenance || "",
        maintenance_ar: data.maintenance_ar || "",
        packing_and_shipping: data.packing_and_shipping || "",
        packing_and_shipping_ar: data.packing_and_shipping_ar || "",
        related_accessories: data.related_accessories || "",
        media_path: data.media_path || "",
        media_alt: data.media_alt || "",
        media_alt_ar: data.media_alt_ar || "",
        data_sheet: data.data_sheet || "",
        sort_order: (data.sort_order ?? 1).toString(),
        is_active: data.is_active ?? true,
      });
      skipNextSlugSync.current = true;

      setColorIds((data.colors || []).map((c) => c.id));
      setSizeIds((data.sizes || []).map((s) => s.id));
      setHashTagIds((data.hash_tags || []).map((t) => t.id));
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

      const { specification, media_path, data_sheet, tag_id, sort_order, is_active, ...text } =
        data;

      const formData = new FormData();
      Object.entries(text).forEach(([key, value]) => formData.append(key, value ?? ""));
      formData.append("tag_id", tag_id || "");
      formData.append("sort_order", (sort_order || "1").toString());
      formData.append("is_active", (is_active ?? true).toString());

      formData.append("specification", JSON.stringify(specification.map((r) => r.en.trim())));
      formData.append("specification_ar", JSON.stringify(specification.map((r) => r.ar.trim())));

      // A File uploads a new file; a string sends back the existing path unchanged.
      [
        ["media_path", media_path],
        ["data_sheet", data_sheet],
      ].forEach(([key, value]) => {
        if (value instanceof File || (typeof value === "string" && value)) {
          formData.append(key as string, value);
        }
      });

      formData.append("color_ids", JSON.stringify(colorIds));
      formData.append("size_ids", JSON.stringify(sizeIds));
      formData.append("hash_tag_ids", JSON.stringify(hashTagIds));
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

  const tagComboOptions: ComboboxOption[] = [
    { value: NO_TAG, label: "— No tag —" },
    ...tagOptions,
  ];

  return (
    <div className="space-y-6">
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <FormField
                  control={form.control}
                  name="tag_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tag</FormLabel>
                      <FormControl>
                        <Combobox
                          options={tagComboOptions}
                          value={field.value || NO_TAG}
                          onChange={(v) => field.onChange(v === NO_TAG ? "" : v)}
                          placeholder="Select tag"
                          searchPlaceholder="Search tags..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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
                  name="media_path"
                  label="Main Image"
                  placeholder="Upload product image"
                  accept="image/*"
                />
                <FormFileUploadField
                  form={form}
                  name="data_sheet"
                  label="Data Sheet (PDF)"
                  placeholder="Upload data sheet PDF"
                  accept="application/pdf"
                  preview={false}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField form={form} name="media_alt" label="Image Alt" placeholder="Describe the image" />
                <FormTextField
                  form={form}
                  name="media_alt_ar"
                  label="Image Alt (Arabic)"
                  placeholder="وصف الصورة"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Specification</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductSpecificationField form={form} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {RICH_TEXT_FIELDS.map(({ name, label }) => (
                <div key={name} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormRichTextField form={form} name={name} label={label} />
                  <FormRichTextField form={form} name={`${name}_ar`} label={`${label} (Arabic)`} />
                </div>
              ))}
              <FormRichTextField form={form} name="related_accessories" label="Related Accessories" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variants & Relations</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Colors", options: colorOptions, selected: colorIds, onChange: setColorIds },
                { label: "Sizes", options: sizeOptions, selected: sizeIds, onChange: setSizeIds },
                {
                  label: "Product Tags",
                  options: hashTagOptions,
                  selected: hashTagIds,
                  onChange: setHashTagIds,
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
