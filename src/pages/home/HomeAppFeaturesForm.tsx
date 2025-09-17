import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/common/FileUpload";
import {
  fetchHomeAppFeatureById,
  saveHomeAppFeature,
} from "@/services/home/homeAppFeaturesApi";
import {
  homeAppFeatureSchema,
  HomeAppFeatureFormData,
} from "@/schemas/homeAppFeaturesSchema";

export default function HomeAppFeaturesForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [iconFile, setIconFile] = useState<File | string | null>(null);

  const isEditMode = !!id;

  const form = useForm<HomeAppFeatureFormData>({
    resolver: zodResolver(homeAppFeatureSchema),
    defaultValues: {
      title: "",
      icon_alt: "",
      sort_order: "1",
      status: true,
    },
  });

  useEffect(() => {
    if (isEditMode && id) {
      loadFeatureData();
    }
  }, [id, isEditMode]);

  const loadFeatureData = async () => {
    try {
      setInitialLoading(true);
      const response = await fetchHomeAppFeatureById(Number(id));
      const data = response.data;

      form.reset({
        title: data.title,
        icon_alt: data.icon_alt,
        sort_order: data.sort_order.toString(),
        status: data.status,
      });

      // Set file path if it exists
      if (data.icon) {
        setIconFile(typeof data.icon === 'string' ? `${import.meta.env.VITE_URL}/${data.icon}` : data.icon);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load app feature data",
        variant: "destructive",
      });
      navigate("/home-app-features");
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: HomeAppFeatureFormData) => {
    try {
      setLoading(true);

      await saveHomeAppFeature(
        {
          title: data.title,
          icon_alt: data.icon_alt,
          sort_order: parseInt(data.sort_order || "1"),
          status: data.status,
          icon_file: iconFile instanceof File ? iconFile : undefined,
        },
        isEditMode ? Number(id) : undefined
      );

      toast({
        title: "Success",
        description: `App feature ${isEditMode ? "updated" : "created"} successfully`,
      });

      navigate("/home-app-features");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} app feature`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading app feature data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/home-app-features")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit" : "Create"} App Feature
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Update" : "Add a new"} app feature for the homepage
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter feature title" {...field} />
                    </FormControl>
                    <FormDescription>
                      The main title for this app feature
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon_alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon Alt Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter alt text for the icon" {...field} />
                    </FormControl>
                    <FormDescription>
                      Alt text for the feature icon (accessibility and SEO)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature Icon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <FileUpload
                  label="Feature Icon"
                  value={iconFile}
                  onChange={setIconFile}
                  accept="image/*"
                  maxSize={2097152} // 2MB
                  placeholder="Drop icon file here or click to browse"
                  preview={true}
                  recommendedDimensions="64×64px"
                  dimensionNote="Optimal dimensions for feature icons"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                          placeholder="1"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Lower numbers appear first
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Status</FormLabel>
                        <FormDescription>
                          Enable or disable this app feature
                        </FormDescription>
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
              onClick={() => navigate("/home-app-features")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : isEditMode ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}