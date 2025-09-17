import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Save, ArrowLeft, Image, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/common/FileUpload";
import {
  fetchAboutMediaById,
  saveAboutMediaItem,
} from "@/services/about/aboutMediaApi";
import {
  aboutMediaSchema,
  AboutMediaFormData,
} from "@/schemas/aboutMediaSchema";

export default function AboutMediaForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [desktopMediaFile, setDesktopMediaFile] = useState<File | null>(null);
  const [mobileMediaFile, setMobileMediaFile] = useState<File | null>(null);
  const [existingThumbnail, setExistingThumbnail] = useState<string>("");
  const [existingDesktopMedia, setExistingDesktopMedia] = useState<string>("");
  const [existingMobileMedia, setExistingMobileMedia] = useState<string>("");

  const isEditMode = !!id;

  const form = useForm<AboutMediaFormData>({
    resolver: zodResolver(aboutMediaSchema),
    defaultValues: {
      thumbnail_alt: "",
      media_type: "image",
      media_alt: "",
      status: true,
      sort_order: "1",
    },
  });

  const watchedMediaType = form.watch("media_type");

  useEffect(() => {
    if (isEditMode && id) {
      loadMediaData();
    }
  }, [id, isEditMode]);

  const loadMediaData = async () => {
    try {
      setInitialLoading(true);
      const response = await fetchAboutMediaById(Number(id));
      const data = response.data;

      form.reset({
        thumbnail_alt: data.thumbnail_alt,
        media_type: data.media_type,
        media_alt: data.media_alt,
        status: data.status,
        sort_order: data.sort_order.toString(),
      });

      setExistingThumbnail(data.thumbnail as string);
      setExistingDesktopMedia(data.media_desktop_path as string);
      setExistingMobileMedia(data.media_mobile_path as string);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load media data",
        variant: "destructive",
      });
      navigate("/about-media");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleThumbnailSelect = (file: File | null) => {
    setThumbnailFile(file);
    form.setValue("thumbnail", file);
  };

  const handleDesktopMediaSelect = (file: File | null) => {
    setDesktopMediaFile(file);
    form.setValue("media_desktop_file", file);
  };

  const handleMobileMediaSelect = (file: File | null) => {
    setMobileMediaFile(file);
    form.setValue("media_mobile_file", file);
  };

  const onSubmit = async (data: AboutMediaFormData) => {
    try {
      setLoading(true);

      const submitData = {
        thumbnail: thumbnailFile,
        thumbnail_alt: data.thumbnail_alt || "",
        media_type: data.media_type,
        media_desktop_file: desktopMediaFile,
        media_mobile_file: mobileMediaFile,
        media_alt: data.media_alt || "",
        status: data.status,
        sort_order: parseInt(data.sort_order || "1"),
      };

      await saveAboutMediaItem(submitData, isEditMode ? Number(id) : undefined);

      toast({
        title: "Success",
        description: `Media item ${isEditMode ? "updated" : "created"} successfully`,
      });

      navigate("/about-media");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} media item`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMediaAccept = () => {
    return watchedMediaType === "video" ? "video/*" : "image/*";
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading media data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/about-media")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit" : "Create"} Media Item
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Update" : "Add a new"} media item for the about page
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Media Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="media_type"
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
                        <SelectItem value="image">
                          <div className="flex items-center gap-2">
                            <Image className="h-4 w-4" />
                            Image
                          </div>
                        </SelectItem>
                        <SelectItem value="video">
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Video
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose whether this is an image or video content
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thumbnail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {existingThumbnail && !thumbnailFile && (
                          <div className="relative inline-block">
                            <img
                              src={`http://localhost:3000/${existingThumbnail}`}
                              alt="Current thumbnail"
                              className="max-w-xs h-32 object-cover rounded-lg border"
                            />
                            <div className="mt-2 text-sm text-muted-foreground">
                              Current thumbnail
                            </div>
                          </div>
                        )}
                        
                        <FileUpload
                          accept="image/*"
                          onFileSelect={handleThumbnailSelect}
                          selectedFile={thumbnailFile}
                          placeholder="Upload thumbnail image"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload a thumbnail image (JPEG, PNG, WebP, GIF)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thumbnail_alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail Alt Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Describe the thumbnail for accessibility" {...field} />
                    </FormControl>
                    <FormDescription>
                      Alternative text for the thumbnail image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Desktop Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="media_desktop_file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desktop {watchedMediaType === "video" ? "Video" : "Image"}</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {existingDesktopMedia && !desktopMediaFile && (
                          <div className="relative inline-block">
                            {watchedMediaType === "video" ? (
                              <video
                                src={`http://localhost:3000/${existingDesktopMedia}`}
                                className="max-w-xs h-32 object-cover rounded-lg border"
                                controls
                              />
                            ) : (
                              <img
                                src={`http://localhost:3000/${existingDesktopMedia}`}
                                alt="Current desktop media"
                                className="max-w-xs h-32 object-cover rounded-lg border"
                              />
                            )}
                            <div className="mt-2 text-sm text-muted-foreground">
                              Current desktop {watchedMediaType}
                            </div>
                          </div>
                        )}
                        
                        <FileUpload
                          accept={getMediaAccept()}
                          onFileSelect={handleDesktopMediaSelect}
                          selectedFile={desktopMediaFile}
                          placeholder={`Upload desktop ${watchedMediaType}`}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload {watchedMediaType} optimized for desktop viewing
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mobile Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="media_mobile_file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile {watchedMediaType === "video" ? "Video" : "Image"}</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {existingMobileMedia && !mobileMediaFile && (
                          <div className="relative inline-block">
                            {watchedMediaType === "video" ? (
                              <video
                                src={`http://localhost:3000/${existingMobileMedia}`}
                                className="max-w-xs h-32 object-cover rounded-lg border"
                                controls
                              />
                            ) : (
                              <img
                                src={`http://localhost:3000/${existingMobileMedia}`}
                                alt="Current mobile media"
                                className="max-w-xs h-32 object-cover rounded-lg border"
                              />
                            )}
                            <div className="mt-2 text-sm text-muted-foreground">
                              Current mobile {watchedMediaType}
                            </div>
                          </div>
                        )}
                        
                        <FileUpload
                          accept={getMediaAccept()}
                          onFileSelect={handleMobileMediaSelect}
                          selectedFile={mobileMediaFile}
                          placeholder={`Upload mobile ${watchedMediaType}`}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload {watchedMediaType} optimized for mobile viewing
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
                    <FormLabel>Media Alt Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Describe the media for accessibility" {...field} />
                    </FormControl>
                    <FormDescription>
                      Alternative text for the media content
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
                          Enable or disable this media item
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
              onClick={() => navigate("/about-media")}
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