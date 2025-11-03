import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/common/FileUpload";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchHomeCms, saveHomeCms, HomeCms } from "@/services/home/homeCmsApi";

const formSchema = z.object({
  milestone_description: z.string().optional(),
  make_ride_title: z.string().optional(),
  make_ride_highlight_title: z.string().optional(),
  make_ride_description: z.string().optional(),
  make_ride_media_type: z.string().optional(),
  make_ride_media_desktop_path: z.any().optional(),
  make_ride_media_mobile_path: z.any().optional(),
  make_ride_media_alt: z.string().optional(),
  explore_title: z.string().optional(),
  explore_description: z.string().optional(),
  app_feature_title: z.string().optional(),
  app_feature_description: z.string().optional(),
  app_feature_sub_title: z.string().optional(),
  app_feature_media_type: z.string().optional(),
  app_feature_media_desktop_path: z.any().optional(),
  app_feature_media_mobile_path: z.any().optional(),
  app_feature_media_alt: z.string().optional(),
  investment_title: z.string().optional(),
  investment_media_type: z.string().optional(),
  investment_media_desktop_path: z.any().optional(),
  investment_media_mobile_path: z.any().optional(),
  investment_media_alt: z.string().optional(),
  partners_title: z.string().optional(),
  news_title: z.string().optional(),
  blog_title: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function HomeCmsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      milestone_description: "",
      make_ride_title: "",
      make_ride_highlight_title: "",
      make_ride_description: "",
      make_ride_media_type: "image",
      make_ride_media_desktop_path: null,
      make_ride_media_mobile_path: null,
      make_ride_media_alt: "",
      explore_title: "",
      explore_description: "",
      app_feature_title: "",
      app_feature_description: "",
      app_feature_sub_title: "",
      app_feature_media_type: "image",
      app_feature_media_desktop_path: null,
      app_feature_media_mobile_path: null,
      app_feature_media_alt: "",
      investment_title: "",
      investment_media_type: "image",
      investment_media_desktop_path: null,
      investment_media_mobile_path: null,
      investment_media_alt: "",
      partners_title: "",
      news_title: "",
      blog_title: "",
    },
  });

  useEffect(() => {
    loadHomeCmsData();
  }, []);

  const loadHomeCmsData = async () => {
    try {
      setInitialLoading(true);
      const response = await fetchHomeCms();
      const data = response.data;

      if (data) {
        form.reset({
          milestone_description: data.milestone_description || "",
          make_ride_title: data.make_ride_title || "",
          make_ride_highlight_title: data.make_ride_highlight_title || "",
          make_ride_description: data.make_ride_description || "",
          make_ride_media_type: data.make_ride_media_type || "image",
          make_ride_media_desktop_path: data.make_ride_media_desktop_path || null,
          make_ride_media_mobile_path: data.make_ride_media_mobile_path || null,
          make_ride_media_alt: data.make_ride_media_alt || "",
          explore_title: data.explore_title || "",
          explore_description: data.explore_description || "",
          app_feature_title: data.app_feature_title || "",
          app_feature_description: data.app_feature_description || "",
          app_feature_sub_title: data.app_feature_sub_title || "",
          app_feature_media_type: data.app_feature_media_type || "image",
          app_feature_media_desktop_path: data.app_feature_media_desktop_path || null,
          app_feature_media_mobile_path: data.app_feature_media_mobile_path || null,
          app_feature_media_alt: data.app_feature_media_alt || "",
          investment_title: data.investment_title || "",
          investment_media_type: data.investment_media_type || "image",
          investment_media_desktop_path: data.investment_media_desktop_path || null,
          investment_media_mobile_path: data.investment_media_mobile_path || null,
          investment_media_alt: data.investment_media_alt || "",
          partners_title: data.partners_title || "",
          news_title: data.news_title || "",
          blog_title: data.blog_title || "",
        });
      }
    } catch (error) {
      console.log("No existing data found, starting with empty form");
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await saveHomeCms(data);
      toast({
        title: "Success",
        description: "Home CMS data saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Home CMS data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading Home CMS data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Home Page CMS</h1>
        <p className="text-muted-foreground">Manage content for the Home page</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Milestone Section */}
          <Card>
            <CardHeader>
              <CardTitle>Milestone Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="milestone_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Milestone Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter milestone description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Make Ride Section */}
          <Card>
            <CardHeader>
              <CardTitle>Make Ride Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="make_ride_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make Ride Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter make ride title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="make_ride_highlight_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make Ride Highlight Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter text to highlight" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="make_ride_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make Ride Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter make ride description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="make_ride_media_desktop_path"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desktop Image</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={field.value}
                          onChange={field.onChange}
                          accept="image/*"
                          placeholder="Upload desktop image"
                          recommendedDimensions="1360×700px"
                          dimensionNote="Make every ride section desktop image"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="make_ride_media_mobile_path"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Image</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={field.value}
                          onChange={field.onChange}
                          accept="image/*"
                          placeholder="Upload mobile image"
                          recommendedDimensions="700×1360px"
                          dimensionNote="Make every ride section mobile image"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="make_ride_media_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Media Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                <FormField
                  control={form.control}
                  name="make_ride_media_alt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image Alt Text</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter image alt text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Explore Section */}
          <Card>
            <CardHeader>
              <CardTitle>Explore Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="explore_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Explore Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter explore title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="explore_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Explore Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter explore description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </CardContent>
          </Card>

          {/* App Feature Section */}
          <Card>
            <CardHeader>
              <CardTitle>App Feature Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="app_feature_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>App Feature Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter app feature title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="app_feature_sub_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>App Feature Sub Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter app feature sub title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="app_feature_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App Feature Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter app feature description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="app_feature_media_desktop_path"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desktop Image</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={field.value}
                          onChange={field.onChange}
                          accept="image/*"
                          placeholder="Upload desktop image"
                          recommendedDimensions="470×560px"
                          dimensionNote="Say hi to your section desktop image"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="app_feature_media_mobile_path"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Image</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={field.value}
                          onChange={field.onChange}
                          accept="image/*"
                          placeholder="Upload mobile image"
                          recommendedDimensions="470×560px"
                          dimensionNote="Say hi to your section mobile image"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="app_feature_media_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Media Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                <FormField
                  control={form.control}
                  name="app_feature_media_alt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image Alt Text</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter image alt text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Investment Section */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="investment_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter investment title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="investment_media_desktop_path"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desktop Image</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={field.value}
                          onChange={field.onChange}
                          accept="image/*"
                          placeholder="Upload desktop image"
                          recommendedDimensions="1360×260px"
                          dimensionNote="Invest in India's fast-growing electric vehicle infrastructure section desktop image"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="investment_media_mobile_path"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Image</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={field.value}
                          onChange={field.onChange}
                          accept="image/*"
                          placeholder="Upload mobile image"
                          recommendedDimensions="700×400px"
                          dimensionNote="Invest in India's fast-growing electric vehicle infrastructure section mobile image"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="investment_media_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Media Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                <FormField
                  control={form.control}
                  name="investment_media_alt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image Alt Text</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter image alt text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Other Sections */}
          <Card>
            <CardHeader>
              <CardTitle>Other Sections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="partners_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partners Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter partners title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="news_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>News Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter news title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="blog_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blog Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter blog title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
