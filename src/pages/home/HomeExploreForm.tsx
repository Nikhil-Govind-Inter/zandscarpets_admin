import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/common/FileUpload";
import {
  fetchHomeExploreById,
  saveHomeExplore,
} from "@/services/home/homeExploreApi";

const formSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(5000, "Title must not exceed 5000 characters"),
  description: z.string()
    .min(1, "Description is required")
    .max(10000, "Description must not exceed 10000 characters"),
  button_text: z.string()
    .min(1, "Button text is required")
    .max(255, "Button text must not exceed 255 characters"),
  button_text_link: z.string()
    .url("Please enter a valid URL")
    .max(5000, "Button link must not exceed 5000 characters"),
  media_alt: z.string()
    .min(1, "Media alt text is required")
    .max(255, "Alt text must not exceed 255 characters"),
  sort_order: z.number().min(0, "Sort order must be 0 or greater"),
  status: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

export default function HomeExploreForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [mediaFile, setMediaFile] = useState<File | string | null>(null);

  const isEditMode = !!id;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      button_text: "",
      button_text_link: "",
      media_alt: "",
      sort_order: 1,
      status: true,
    },
  });

  useEffect(() => {
    if (isEditMode && id) {
      loadExploreData();
    }
  }, [id, isEditMode]);

  const loadExploreData = async () => {
    try {
      setInitialLoading(true);
      const response = await fetchHomeExploreById(Number(id));
      const data = response.data;

      form.reset({
        title: data.title,
        description: data.description,
        button_text: data.button_text,
        button_text_link: data.button_text_link,
        media_alt: data.media_alt,
        sort_order: data.sort_order,
        status: data.status,
      });

      // Set file path if it exists
      if (data.media_path) {
        setMediaFile(data.media_path);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load explore data",
        variant: "destructive",
      });
      navigate("/home-explore");
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      await saveHomeExplore(
        {
          title: data.title,
          description: data.description,
          button_text: data.button_text,
          button_text_link: data.button_text_link,
          media_alt: data.media_alt,
          sort_order: data.sort_order,
          status: data.status,
          media_file: mediaFile instanceof File ? mediaFile : undefined,
        },
        isEditMode ? Number(id) : undefined
      );

      toast({
        title: "Success",
        description: `Expertise entry ${isEditMode ? "updated" : "created"} successfully`,
      });

      navigate("/home-explore");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} expertise entry`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading explore data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/home-explore")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit" : "Create"} Expertise Entry
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Update" : "Add a new"} expertise showcase for the homepage
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expertise Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter expertise title" {...field} />
                      </FormControl>
                      <FormDescription>
                        The main title for this expertise area
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
                          placeholder="Enter detailed description of this expertise..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A detailed description of this expertise area
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
              <CardTitle>Call-to-Action Button</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="button_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button Text</FormLabel>
                      <FormControl>
                        <Input placeholder="Learn more" {...field} />
                      </FormControl>
                      <FormDescription>
                        Text displayed on the action button
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="button_text_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button Link</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        URL the button should link to
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
                <div className="space-y-2">
                  <FileUpload
                    label="Expertise Media"
                    value={mediaFile}
                    onChange={setMediaFile}
                    accept="image/*"
                    maxSize={5242880} // 5MB
                    placeholder="Drop image file here or click to browse"
                    preview={true}
                    recommendedDimensions="600×400px"
                    dimensionNote="Optimal dimensions for expertise showcase"
                  />
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
                          Enable or disable this expertise entry
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
              onClick={() => navigate("/home-explore")}
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