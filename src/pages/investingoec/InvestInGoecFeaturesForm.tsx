import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Save, ArrowLeft, Star, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/common/FileUpload";
import {
  fetchInvestInGoecFeaturesById,
  saveInvestInGoecFeaturesItem,
} from "@/services/investingoec/investInGoecFeaturesApi";
import {
  investInGoecFeaturesSchema,
  InvestInGoecFeaturesFormData,
} from "@/schemas/investInGoecFeaturesSchema";

export default function InvestInGoecFeaturesForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingIconPath, setExistingIconPath] = useState<string>("");

  const isEditMode = !!id;

  const form = useForm<InvestInGoecFeaturesFormData>({
    resolver: zodResolver(investInGoecFeaturesSchema),
    defaultValues: {
      icon_alt: "",
      description: "",
      status: true,
      sort_order: "1",
    },
  });

  useEffect(() => {
    if (isEditMode && id) {
      loadFeaturesData();
    }
  }, [id, isEditMode]);

  const loadFeaturesData = async () => {
    try {
      setInitialLoading(true);
      const response = await fetchInvestInGoecFeaturesById(Number(id));
      const data = response.data;

      form.reset({
        icon_alt: data.icon_alt,
        description: data.description,
        status: data.status,
        sort_order: data.sort_order.toString(),
      });

      setExistingIconPath(data.icon_path as string);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load features data",
        variant: "destructive",
      });
      navigate("/invest-in-goec-features");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    form.setValue("icon_file", file);
  };

  const onSubmit = async (data: InvestInGoecFeaturesFormData) => {
    try {
      setLoading(true);

      const submitData = {
        icon_file: selectedFile,
        icon_alt: data.icon_alt || "",
        description: data.description,
        status: data.status,
        sort_order: parseInt(data.sort_order || "1"),
      };

      await saveInvestInGoecFeaturesItem(submitData, isEditMode ? Number(id) : undefined);

      toast({
        title: "Success",
        description: `Feature ${isEditMode ? "updated" : "created"} successfully`,
      });

      navigate("/invest-in-goec-features");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} feature`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading features data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/invest-in-goec-features")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit" : "Create"} Feature
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Update" : "Add a new"} investment feature
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Icon Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Feature Icon
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="icon_file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {existingIconPath && !selectedFile && (
                          <div className="relative inline-block">
                            <img
                              src={`http://localhost:3000/${existingIconPath}`}
                              alt="Current icon"
                              className="w-16 h-16 object-contain rounded-lg border p-2 bg-gray-50"
                            />
                            <div className="mt-2 text-sm text-muted-foreground">
                              Current icon
                            </div>
                          </div>
                        )}
                        
                        <FileUpload
                          accept="image/*"
                          onFileSelect={handleFileSelect}
                          selectedFile={selectedFile}
                          placeholder="Upload feature icon"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload an icon for this feature (PNG, JPG, SVG recommended)
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
                      <Input placeholder="Describe the icon for accessibility" {...field} />
                    </FormControl>
                    <FormDescription>
                      Alternative text for screen readers and accessibility
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Feature Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Feature Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter feature description (e.g., market growth information, opportunities, benefits...)"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detailed description of this investment feature or opportunity
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Settings */}
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
                          Enable or disable this feature
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
              onClick={() => navigate("/invest-in-goec-features")}
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