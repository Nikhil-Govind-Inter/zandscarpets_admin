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
  fetchHomeMapById,
  saveHomeMap,
} from "@/services/home/homeMapApi";

const formSchema = z.object({
  year: z.number().min(1900, "Year must be 1900 or later").max(2100, "Year must be 2100 or earlier"),
  title: z.string().min(1, "Title is required"),
  media_alt: z.string().min(1, "Media alt text is required"),
  sort_order: z.number().min(1, "Sort order must be at least 1"),
  status: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

export default function HomeMapForm() {
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
      year: new Date().getFullYear(),
      title: "",
      media_alt: "",
      sort_order: 1,
      status: true,
    },
  });

  useEffect(() => {
    if (isEditMode && id) {
      loadMapData();
    }
  }, [id, isEditMode]);

  const loadMapData = async () => {
    try {
      setInitialLoading(true);
      const response = await fetchHomeMapById(Number(id));
      const data = response.data;

      form.reset({
        year: data.year,
        title: data.title,
        media_alt: data.media_alt,
        sort_order: data.sort_order,
        status: data.status,
      });

      // Set file path if it exists
      if (data.media_path) {
        setMediaFile(typeof data.media_path === 'string' ? `${import.meta.env.VITE_URL}/${data.media_path}` : data.media_path);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load map data",
        variant: "destructive",
      });
      navigate("/home-map");
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      await saveHomeMap(
        {
          year: data.year,
          title: data.title,
          media_alt: data.media_alt,
          sort_order: data.sort_order,
          status: data.status,
          media_file: mediaFile instanceof File ? mediaFile : undefined,
        },
        isEditMode ? Number(id) : undefined
      );

      toast({
        title: "Success",
        description: `Map entry ${isEditMode ? "updated" : "created"} successfully`,
      });

      navigate("/home-map");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} map entry`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading map data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/home-map")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit" : "Create"} Home Map Entry
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Update" : "Add a new"} timeline entry for the homepage
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Timeline Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        The year this event occurred
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what happened in this year..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A detailed description of the milestone or event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <FileUpload
                  label="Timeline Media"
                  value={mediaFile}
                  onChange={setMediaFile}
                  accept="image/*"
                  maxSize={5242880} // 5MB
                  placeholder="Drop image file here or click to browse"
                  preview={true}
                  recommendedDimensions="800×600px"
                  dimensionNote="Optimal dimensions for timeline display"
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Status</FormLabel>
                      <FormDescription>
                        Enable or disable this timeline entry
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
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/home-map")}
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