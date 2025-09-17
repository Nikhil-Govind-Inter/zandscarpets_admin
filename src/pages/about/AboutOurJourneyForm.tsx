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
import { Save, ArrowLeft, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/common/FileUpload";
import {
  fetchAboutOurJourneyById,
  saveAboutOurJourneyItem,
} from "@/services/about/aboutOurJourneyApi";
import {
  aboutOurJourneySchema,
  AboutOurJourneyFormData,
} from "@/schemas/aboutOurJourneySchema";

export default function AboutOurJourneyForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [mediaFile, setMediaFile] = useState<File | string | null>(null);

  const isEditMode = !!id;

  const form = useForm<AboutOurJourneyFormData>({
    resolver: zodResolver(aboutOurJourneySchema),
    defaultValues: {
      year: new Date().getFullYear(),
      title: "",
      description: "",
      media_alt: "",
      status: true,
      sort_order: "1",
    },
  });

  useEffect(() => {
    if (isEditMode && id) {
      loadJourneyData();
    }
  }, [id, isEditMode]);

  const loadJourneyData = async () => {
    try {
      setInitialLoading(true);
      const response = await fetchAboutOurJourneyById(Number(id));
      const data = response.data;

      form.reset({
        year: data.year,
        title: data.title,
        description: data.description,
        media_alt: data.media_alt,
        status: data.status,
        sort_order: data.sort_order.toString(),
      });

      if (data.media_path) {
        setMediaFile(data.media_path);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load journey data",
        variant: "destructive",
      });
      navigate("/about-our-journey");
    } finally {
      setInitialLoading(false);
    }
  };


  const onSubmit = async (data: AboutOurJourneyFormData) => {
    try {
      setLoading(true);

      const submitData = {
        year: data.year,
        title: data.title,
        description: data.description,
        media_file: mediaFile instanceof File ? mediaFile : undefined,
        media_alt: data.media_alt || "",
        status: data.status,
        sort_order: parseInt(data.sort_order || "1"),
      };

      await saveAboutOurJourneyItem(submitData, isEditMode ? Number(id) : undefined);

      toast({
        title: "Success",
        description: `Journey entry ${isEditMode ? "updated" : "created"} successfully`,
      });

      navigate("/about-our-journey");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} journey entry`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading journey data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/about-our-journey")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit" : "Create"} Journey Entry
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Update" : "Add a new"} milestone in our journey
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Journey Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2024"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      The year this milestone occurred
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter journey milestone title" {...field} />
                      </FormControl>
                      <FormDescription>
                        A compelling title for this journey milestone
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe this milestone in our journey..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A detailed description of this milestone
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
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
                <FormField
                  control={form.control}
                  name="media_file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <FormControl>
                        <FileUpload
                          label="Journey Image"
                          value={mediaFile}
                          onChange={setMediaFile}
                          accept="image/*"
                          maxSize={5242880} // 5MB
                          placeholder="Drop journey image here or click to browse"
                          preview={true}
                          recommendedDimensions="556×491px"
                          dimensionNote="Journey milestone image"
                        />
                      </FormControl>
                      <FormDescription>
                        Upload an image to represent this milestone (JPEG, PNG, WebP, GIF)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="media_alt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alt Text</FormLabel>
                      <FormControl>
                        <Input placeholder="Describe the image for accessibility" {...field} />
                      </FormControl>
                      <FormDescription>
                        Alternative text for screen readers and accessibility
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
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
                          Enable or disable this journey entry
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
              onClick={() => navigate("/about-our-journey")}
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