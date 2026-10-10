import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router-dom";
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
} from "@/components/forms/FormFieldComponents";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchAttributeById,
  createAttribute,
  updateAttribute,
  AttributeType,
  ApiError,
} from "@/services/products/attributesApi";
import { attributeSchema, AttributeFormData } from "@/schemas/attributeSchema";
import { generateSlug } from "@/utils/formUtils";

const TYPE_OPTIONS = [
  { value: "text", label: "Text" },
  { value: "icon", label: "Icon" },
  { value: "color", label: "Color" },
];

export default function AttributeForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const form = useForm<AttributeFormData>({
    resolver: zodResolver(attributeSchema),
    defaultValues: {
      title: "",
      title_ar: "",
      slug: "",
      type: "text",
      sort_order: "1",
      is_active: true,
    },
  });

  useEffect(() => {
    if (isEditing && id) loadAttributeData(parseInt(id));
  }, [id, isEditing]);

  // Slug is derived from the title and is read-only. Guard against clobbering
  // the stored slug during the initial edit load; only regenerate once the
  // title actually changes.
  const titleValue = form.watch("title");
  const lastTitleRef = useRef<string | null>(null);
  useEffect(() => {
    if (isEditing && initialLoading) return;
    if (lastTitleRef.current === null) {
      lastTitleRef.current = titleValue;
      return;
    }
    if (titleValue === lastTitleRef.current) return;
    lastTitleRef.current = titleValue;
    form.setValue("slug", generateSlug(titleValue || ""), {
      shouldValidate: true,
    });
  }, [titleValue, isEditing, initialLoading, form]);

  const loadAttributeData = async (itemId: number) => {
    try {
      setInitialLoading(true);
      const { data } = await fetchAttributeById(itemId);
      form.reset({
        title: data.title || "",
        title_ar: data.title_ar || "",
        slug: data.slug || "",
        type: data.type || "text",
        sort_order: (data.sort_order ?? 1).toString(),
        is_active: data.is_active ?? true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to load Attribute data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: AttributeFormData) => {
    try {
      setLoading(true);

      const payload = {
        title: data.title,
        title_ar: data.title_ar,
        slug: data.slug,
        type: data.type as AttributeType,
        sort_order: parseInt(data.sort_order || "1"),
        is_active: data.is_active,
      };

      if (isEditing && id) {
        await updateAttribute(parseInt(id), payload);
        toast({ title: "Success", description: "Attribute updated successfully" });
      } else {
        await createAttribute(payload);
        toast({ title: "Success", description: "Attribute created successfully" });
      }

      navigate("/attributes");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError
            ? error.message
            : `Failed to ${isEditing ? "update" : "create"} Attribute`,
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
        <Button variant="outline" size="icon" onClick={() => navigate("/attributes")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? "Edit" : "Add"} Attribute</h1>
          <p className="text-muted-foreground">
            Attribute groups used on products, such as "Color" or "Material"
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attribute Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormTextField form={form} name="title" label="Title" placeholder="e.g., Color" />
                <FormTextField
                  form={form}
                  name="title_ar"
                  label="Title (Arabic)"
                  placeholder="مثال: اللون"
                />
              </div>
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        readOnly
                        disabled
                        placeholder="Auto-generated from title"
                        className="bg-muted cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormSelectField
                  form={form}
                  name="type"
                  label="Value Type"
                  placeholder="Select value type"
                  options={TYPE_OPTIONS}
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
            <Button type="button" variant="outline" onClick={() => navigate("/attributes")}>
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