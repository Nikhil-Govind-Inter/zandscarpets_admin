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
  FormTextareaField,
} from "@/components/forms/FormFieldComponents";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchProductFaqById,
  createProductFaq,
  updateProductFaq,
  ApiError,
} from "@/services/products/productFaqApi";
import {
  productFaqSchema,
  ProductFaqFormData,
} from "@/schemas/productFaqSchema";
import { useParentProduct } from "./useParentProduct";

export default function ProductFaqForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const {
    productId,
    productTitle,
    loading: productLoading,
  } = useParentProduct();
  const listPath = `/products/${productId}/faqs`;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  // The list passes the next free sort order when opening "Add FAQ".
  const nextSortOrder = (location.state as { nextSortOrder?: number } | null)
    ?.nextSortOrder;

  const form = useForm<ProductFaqFormData>({
    resolver: zodResolver(productFaqSchema),
    defaultValues: {
      question: "",
      question_ar: "",
      answer: "",
      answer_ar: "",
      sort_order: String(nextSortOrder ?? 1),
      is_active: true,
    },
  });

  useEffect(() => {
    if (isEditing && id) loadFaqData(parseInt(id));
  }, [id, isEditing]);

  const loadFaqData = async (itemId: number) => {
    try {
      setInitialLoading(true);
      const { data } = await fetchProductFaqById(itemId);
      form.reset({
        question: data.question || "",
        question_ar: data.question_ar || "",
        answer: data.answer || "",
        answer_ar: data.answer_ar || "",
        sort_order: (data.sort_order ?? 1).toString(),
        is_active: data.is_active ?? true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to load FAQ data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: ProductFaqFormData) => {
    try {
      setLoading(true);

      const payload = {
        product_id: productId,
        question: data.question,
        question_ar: data.question_ar,
        answer: data.answer,
        answer_ar: data.answer_ar,
        sort_order: parseInt(data.sort_order || "1"),
        is_active: data.is_active,
      };

      if (isEditing && id) {
        await updateProductFaq(parseInt(id), payload);
        toast({ title: "Success", description: "FAQ updated successfully" });
      } else {
        await createProductFaq(payload);
        toast({ title: "Success", description: "FAQ created successfully" });
      }

      navigate(listPath);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError
            ? error.message
            : `Failed to ${isEditing ? "update" : "create"} FAQ`,
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
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(listPath)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit" : "Add"} FAQ
          </h1>
          <p className="text-muted-foreground">For product: {productTitle}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>FAQ Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormTextField form={form} name="question" label="Question" />
                <FormTextField
                  form={form}
                  name="question_ar"
                  label="Question (Arabic)"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormTextareaField form={form} name="answer" label="Answer" />
                <FormTextareaField
                  form={form}
                  name="answer_ar"
                  label="Answer (Arabic)"
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
                        <p className="text-sm text-muted-foreground">
                          Enable or disable this item.
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
              onClick={() => navigate(listPath)}
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
