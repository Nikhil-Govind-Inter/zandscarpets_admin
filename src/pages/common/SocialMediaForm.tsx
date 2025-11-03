import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/common/FileUpload";
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchSocialMediaById,
  createSocialMedia,
  updateSocialMedia,
  SocialMedia,
} from "@/services/common/socialMediaApi";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon_alt: z.string().min(1, "Icon alt text is required"),
  link: z.string().min(1, "Link is required"),
  sort_order: z.number().min(0, "Sort order must be 0 or greater").optional(),
  status: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function SocialMediaForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [iconFile, setIconFile] = useState<File | string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      icon_alt: "",
      link: "",
      sort_order: 0,
      status: true,
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      loadSocialMediaData(parseInt(id));
    }
  }, [id, isEditing]);

  const loadSocialMediaData = async (itemId: number) => {
    try {
      setInitialLoading(true);
      const response = await fetchSocialMediaById(itemId);
      const data = response.data;
      
      if (data) {
        form.reset({
          name: data.name || "",
          icon_alt: data.icon_alt || "",
          link: data.link || "",
          sort_order: data.sort_order || 0,
          status: data.status ?? true,
        });

        // Set existing icon URL for preview if it exists
        if (data.icon) {
          setIconFile(`${import.meta.env.VITE_URL}/${data.icon}`);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load social media data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("icon_alt", data.icon_alt);
      formData.append("link", data.link);
      formData.append("sort_order", (data.sort_order || 0).toString());
      formData.append("status", (data.status ?? true).toString());

      // Add icon file if it exists and is a File object
      if (iconFile instanceof File) {
        formData.append("icon", iconFile);
      }

      if (isEditing && id) {
        await updateSocialMedia(parseInt(id), formData);
        toast({
          title: "Success",
          description: "Social media item updated successfully",
        });
      } else {
        await createSocialMedia(formData);
        toast({
          title: "Success",
          description: "Social media item created successfully",
        });
      }
      
      navigate("/social-media");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} social media item`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading social media data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/social-media")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit" : "Add"} Social Media
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update" : "Create a new"} social media item
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Facebook, Twitter, LinkedIn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Icon</label>
                <FileUpload
                  value={iconFile}
                  onChange={setIconFile}
                  accept="image/*"
                  placeholder="Upload social media icon"
                  preview={true}
                />
              </div>

              <FormField
                control={form.control}
                name="icon_alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon Alt Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Alt text for the icon" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value === "true")} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
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
              onClick={() => navigate("/social-media")}
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