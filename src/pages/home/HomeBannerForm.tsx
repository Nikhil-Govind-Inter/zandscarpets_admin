import { useState, useEffect } from "react";
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
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import {
  FormFileUploadField,
  FormTextareaField,
} from "@/components/forms/FormFieldComponents";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchHomeBannerById,
  fetchHomeBannerList,
  createHomeBanner,
  updateHomeBanner,
  ApiError,
} from "@/services/home/homeBannerApi";
import { fetchActiveIndustries } from "@/services/masters/industryApi";
import { homeBannerSchema, HomeBannerFormData } from "@/schemas/homeBannerSchema";

export default function HomeBannerForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [industryOptions, setIndustryOptions] = useState<ComboboxOption[]>([]);

  const form = useForm<HomeBannerFormData>({
    resolver: zodResolver(homeBannerSchema),
    defaultValues: {
      industry_id: "",
      title: "",
      description: "",
      media_path: "",
      media_alt: "",
      sort_order: "1",
      is_active: true,
    },
  });

  // Industries already assigned to another banner are excluded from the
  // picker (one banner per industry, enforced here rather than in the DB —
  // the currently-edited banner's own industry stays selectable since its
  // own row is excluded from the "used" set).
  useEffect(() => {
    loadIndustryOptions();
  }, [id]);

  const loadIndustryOptions = async () => {
    try {
      const [industriesRes, bannersRes] = await Promise.all([
        fetchActiveIndustries(),
        fetchHomeBannerList(1, 100, undefined, ["industry_id"]),
      ]);

      const currentId = isEditing && id ? parseInt(id) : null;
      const usedIndustryIds = new Set(
        bannersRes.data.data
          .filter((banner) => banner.id !== currentId)
          .map((banner) => banner.industry_id),
      );

      setIndustryOptions(
        industriesRes.data
          .filter((industry) => !usedIndustryIds.has(industry.id))
          .map((industry) => ({
            value: industry.id.toString(),
            label: industry.title,
          })),
      );
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to load industries",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isEditing && id) {
      loadHomeBannerData(parseInt(id));
    }
  }, [id, isEditing]);

  const loadHomeBannerData = async (itemId: number) => {
    try {
      setInitialLoading(true);
      const response = await fetchHomeBannerById(itemId);
      const data = response.data;

      if (data) {
        form.reset({
          industry_id: data.industry_id.toString(),
          title: data.title || "",
          description: data.description || "",
          media_path: data.media_path || "",
          media_alt: data.media_alt || "",
          sort_order: (data.sort_order ?? 1).toString(),
          is_active: data.is_active ?? true,
        });
      }
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

  const onSubmit = async (data: HomeBannerFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("industry_id", data.industry_id);
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("media_alt", data.media_alt || "");
      formData.append("sort_order", (data.sort_order || "1").toString());
      formData.append("is_active", (data.is_active ?? true).toString());

      if (data.media_path instanceof File) {
        formData.append("media_path", data.media_path);
      } else if (typeof data.media_path === "string" && data.media_path) {
        formData.append("media_path", data.media_path);
      }

      if (isEditing && id) {
        await updateHomeBanner(parseInt(id), formData);
        toast({ title: "Success", description: "Home banner updated successfully" });
      } else {
        await createHomeBanner(formData);
        toast({ title: "Success", description: "Home banner created successfully" });
      }

      navigate("/home-banner");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError
            ? error.message
            : `Failed to ${isEditing ? "update" : "create"} home banner`,
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
        <Button variant="outline" size="icon" onClick={() => navigate("/home-banner")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? "Edit" : "Add"} Home Banner</h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update" : "Create a new"} home banner
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
                        searchPlaceholder="Search industries..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <FormTextareaField
                form={form}
                name="description"
                label="Description"
                placeholder="Banner description"
              />

              <FormFileUploadField
                form={form}
                name="media_path"
                label="Image"
                placeholder="Upload banner image"
                accept="image/*"
              />

              <FormField
                control={form.control}
                name="media_alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image Alt Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Describe the banner media" {...field} />
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
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/home-banner")}
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
