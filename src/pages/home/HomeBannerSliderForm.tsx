import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  fetchHomeBannerSliderById,
  saveHomeBannerSlider,
} from "@/services/home/homeBannerSliderApi";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  media_type: z.enum(["image", "video"], {
    required_error: "Please select a media type",
  }),
  media_alt: z.string().min(1, "Media alt text is required"),
  button_text_one: z.string().min(1, "Button one text is required"),
  button_text_one_link: z.string().url("Please enter a valid URL"),
  button_text_two: z.string().min(1, "Button two text is required"),
  button_text_two_link: z.string().url("Please enter a valid URL"),
  sort_order: z.number().min(1, "Sort order must be at least 1"),
  status: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

export default function HomeBannerSliderForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [mediaDesktopFile, setMediaDesktopFile] = useState<File | string | null>(null);
  const [mediaMobileFile, setMediaMobileFile] = useState<File | string | null>(null);

  const isEditMode = !!id;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      media_type: "image",
      media_alt: "",
      button_text_one: "",
      button_text_one_link: "",
      button_text_two: "",
      button_text_two_link: "",
      sort_order: 1,
      status: true,
    },
  });

  const watchMediaType = form.watch("media_type");

  useEffect(() => {
    if (isEditMode && id) {
      loadSliderData();
    }
  }, [id, isEditMode]);

  const loadSliderData = async () => {
    try {
      setInitialLoading(true);
      const response = await fetchHomeBannerSliderById(Number(id));
      const data = response.data;

      form.reset({
        title: data.title,
        description: data.description,
        media_type: data.media_type,
        media_alt: data.media_alt,
        button_text_one: data.button_text_one,
        button_text_one_link: data.button_text_one_link,
        button_text_two: data.button_text_two,
        button_text_two_link: data.button_text_two_link,
        sort_order: data.sort_order,
        status: data.status,
      });

      // Set file paths if they exist
      if (data.media_desktop_path) {
        setMediaDesktopFile(typeof data.media_desktop_path === 'string' ? `${import.meta.env.VITE_URL}/${data.media_desktop_path}` : data.media_desktop_path);
      }
      if (data.media_mobile_path) {
        setMediaMobileFile(typeof data.media_mobile_path === 'string' ? `${import.meta.env.VITE_URL}/${data.media_mobile_path}` : data.media_mobile_path);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load banner slider data",
        variant: "destructive",
      });
      navigate("/home-banner-slider");
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const submitData = {
        title: data.title,
        description: data.description,
        media_type: data.media_type,
        media_alt: data.media_alt,
        button_text_one: data.button_text_one,
        button_text_one_link: data.button_text_one_link,
        button_text_two: data.button_text_two,
        button_text_two_link: data.button_text_two_link,
        sort_order: data.sort_order,
        status: data.status,
        media_desktop_file: mediaDesktopFile instanceof File ? mediaDesktopFile : undefined,
        media_mobile_file: mediaMobileFile instanceof File ? mediaMobileFile : undefined,
      };

      await saveHomeBannerSlider(submitData, isEditMode ? Number(id) : undefined);

      toast({
        title: "Success",
        description: `Banner slider ${isEditMode ? "updated" : "created"} successfully`,
      });

      navigate("/home-banner-slider");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} banner slider`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading banner slider data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/home-banner-slider")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit" : "Create"} Home Banner Slider
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Update" : "Add a new"} banner slider for the homepage
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
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter banner title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter banner description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Action Buttons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="button_text_one"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button One Text</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first button text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="button_text_one_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button One Link</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="button_text_two"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button Two Text</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter second button text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="button_text_two_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button Two Link</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
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
                          onChange={(e) => field.onChange(Number(e.target.value))}
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
                          Enable or disable this banner slider
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

          <Card>
            <CardHeader>
              <CardTitle>Media Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="media_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Media Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select media type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FileUpload
                    label="Desktop Media"
                    value={mediaDesktopFile}
                    onChange={setMediaDesktopFile}
                    accept={watchMediaType === "image" ? "image/*" : "video/*"}
                    maxSize={5242880} // 5MB
                    placeholder={`Drop desktop ${watchMediaType} file here or click to browse`}
                    preview={true}
                    recommendedDimensions="1440×900px"
                    dimensionNote="Optimal banner dimensions for desktop display"
                  />
                </div>

                <div className="space-y-2">
                  <FileUpload
                    label="Mobile Media"
                    value={mediaMobileFile}
                    onChange={setMediaMobileFile}
                    accept={watchMediaType === "image" ? "image/*" : "video/*"}
                    maxSize={5242880} // 5MB
                    placeholder={`Drop mobile ${watchMediaType} file here or click to browse`}
                    preview={true}
                    recommendedDimensions="1440×900px"
                    dimensionNote="Optimal banner dimensions for mobile display"
                  />
                </div>
              </div>
              <FormField
                control={form.control}
                name="media_alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alt Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter alt text for media" {...field} />
                    </FormControl>
                    <FormDescription>
                      Alt text for accessibility and SEO
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-sm text-muted-foreground">
                Upload {watchMediaType} for banner slider (Max: 5MB). Recommended dimensions: 1440×810 pixels.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/home-banner-slider")}
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