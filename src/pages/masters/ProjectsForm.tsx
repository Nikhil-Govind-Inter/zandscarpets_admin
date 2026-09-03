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
import { Label } from "@/components/ui/label";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { MultiSelect, Option as MultiSelectOption } from "@/components/ui/multi-select";
import {
  FormFileUploadField,
  FormTextareaField,
} from "@/components/forms/FormFieldComponents";
import { Save, ArrowLeft, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchProjectById,
  createProject,
  updateProject,
  fetchActiveProjects,
  ApiError,
} from "@/services/masters/projectsApi";
import { fetchActiveIndustries } from "@/services/masters/industryApi";
import { projectsSchema, ProjectsFormData } from "@/schemas/projectsSchema";

const resolveImageUrl = (path: string) => {
  if (/^https?:\/\//.test(path)) return path;
  return `${import.meta.env.VITE_IMAGE_URL}/${path}`;
};

// Gallery accepts the same image + video types the backend's upload
// middleware allows for project_media (see multerMiddleware.js's fileFilter).
const GALLERY_ACCEPT = "image/*,video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm";
const VIDEO_EXTENSIONS = /\.(mp4|mov|avi|mkv|webm)$/i;

const isVideoPath = (path: string) => VIDEO_EXTENSIONS.test(path);
const isVideoFile = (file: File) => file.type.startsWith("video/") || isVideoPath(file.name);

export default function ProjectsForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [categoryOptions, setCategoryOptions] = useState<ComboboxOption[]>([]);
  const [relatedOptions, setRelatedOptions] = useState<MultiSelectOption[]>([]);
  const [relatedProjectIds, setRelatedProjectIds] = useState<(number | string)[]>([]);

  // Gallery (project_media): paths already on the server that should stay,
  // plus files picked in this session not yet uploaded. Kept outside
  // react-hook-form since it's a mixed string[]/File[] value, not a single
  // field — merged into the FormData payload at submit time.
  const [galleryKept, setGalleryKept] = useState<string[]>([]);
  const [galleryNewFiles, setGalleryNewFiles] = useState<File[]>([]);
  const [galleryNewPreviews, setGalleryNewPreviews] = useState<string[]>([]);

  // One object URL per new gallery file, created/revoked as the file list
  // changes so previews don't leak blob URLs across re-renders.
  useEffect(() => {
    const urls = galleryNewFiles.map((file) => URL.createObjectURL(file));
    setGalleryNewPreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [galleryNewFiles]);

  const form = useForm<ProjectsFormData>({
    resolver: zodResolver(projectsSchema),
    defaultValues: {
      category_id: "",
      title: "",
      location: "",
      date_of_completion: "",
      material_type: "",
      thumbnail: "",
      media_path: "",
      description: "",
      sort_order: "0",
      is_active: true,
      is_show_in_home: false,
    },
  });

  useEffect(() => {
    loadCategoryOptions();
    loadRelatedOptions(id);
  }, [id]);

  const loadCategoryOptions = async () => {
    try {
      const response = await fetchActiveIndustries();
      setCategoryOptions(
        response.data.map((industry) => ({
          value: industry.id.toString(),
          label: industry.title,
        })),
      );
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  const loadRelatedOptions = async (currentId?: string) => {
    try {
      const response = await fetchActiveProjects(currentId ? parseInt(currentId) : undefined);
      setRelatedOptions(
        response.data.map((project) => ({ id: project.id, name: project.title })),
      );
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to load related projects",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isEditing && id) {
      loadProjectData(parseInt(id));
    }
  }, [id, isEditing]);

  const loadProjectData = async (itemId: number) => {
    try {
      setInitialLoading(true);
      const response = await fetchProjectById(itemId);
      const data = response.data;

      form.reset({
        category_id: data.category_id.toString(),
        title: data.title || "",
        location: data.location || "",
        date_of_completion: data.date_of_completion
          ? data.date_of_completion.slice(0, 10)
          : "",
        material_type: data.material_type || "",
        thumbnail: data.thumbnail || "",
        media_path: data.media_path || "",
        description: data.description || "",
        sort_order: (data.sort_order ?? 0).toString(),
        is_active: data.is_active ?? true,
        is_show_in_home: data.is_show_in_home ?? false,
      });

      setGalleryKept(data.project_media || []);
      setRelatedProjectIds((data.relatedProjects || []).map((p) => p.id));
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to load project data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleGalleryFilesSelected = (files: FileList | null) => {
    if (!files || !files.length) return;
    setGalleryNewFiles((prev) => [...prev, ...Array.from(files)]);
  };

  const removeKeptGalleryItem = (path: string) => {
    setGalleryKept((prev) => prev.filter((p) => p !== path));
  };

  const removeNewGalleryFile = (index: number) => {
    setGalleryNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProjectsFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("category_id", data.category_id);
      formData.append("title", data.title);
      formData.append("location", data.location || "");
      formData.append("date_of_completion", data.date_of_completion || "");
      formData.append("material_type", data.material_type || "");
      formData.append("description", data.description || "");
      formData.append("sort_order", (data.sort_order || "0").toString());
      formData.append("is_active", (data.is_active ?? true).toString());
      formData.append("is_show_in_home", (data.is_show_in_home ?? false).toString());

      if (data.thumbnail instanceof File) {
        formData.append("thumbnail", data.thumbnail);
      } else if (typeof data.thumbnail === "string" && data.thumbnail) {
        formData.append("thumbnail", data.thumbnail);
      }

      if (data.media_path instanceof File) {
        formData.append("media_path", data.media_path);
      } else if (typeof data.media_path === "string" && data.media_path) {
        formData.append("media_path", data.media_path);
      }

      formData.append("project_media", JSON.stringify(galleryKept));
      galleryNewFiles.forEach((file) => formData.append("project_media", file));

      formData.append("related_project_ids", JSON.stringify(relatedProjectIds));

      if (isEditing && id) {
        await updateProject(parseInt(id), formData);
        toast({ title: "Success", description: "Project updated successfully" });
      } else {
        await createProject(formData);
        toast({ title: "Success", description: "Project created successfully" });
      }

      navigate("/projects");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError
            ? error.message
            : `Failed to ${isEditing ? "update" : "create"} project`,
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
        <Button variant="outline" size="icon" onClick={() => navigate("/projects")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? "Edit" : "Add"} Project</h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update" : "Create a new"} project
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Combobox
                        options={categoryOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select industry"
                        searchPlaceholder="Search industry..."
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
                      <Input placeholder="Project title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Dubai, UAE" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date_of_completion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Completion</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="material_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Marble, Wool" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormTextareaField
                form={form}
                name="description"
                label="Description"
                placeholder="Describe this project"
                rows={4}
              />

              <FormFileUploadField
                form={form}
                name="thumbnail"
                label="Thumbnail"
                placeholder="Upload listing thumbnail"
                accept="image/*"
              />

              <FormFileUploadField
                form={form}
                name="media_path"
                label="Detail Image"
                placeholder="Upload detail/banner image"
                accept="image/*"
              />

              <div className="space-y-2">
                <Label>Project Gallery</Label>
                <div className="flex flex-wrap gap-3">
                  {galleryKept.map((path) => (
                    <div key={path} className="relative">
                      {isVideoPath(path) ? (
                        <video
                          src={resolveImageUrl(path)}
                          className="h-20 w-20 rounded border object-cover"
                          muted
                        />
                      ) : (
                        <img
                          src={resolveImageUrl(path)}
                          alt="Gallery item"
                          className="h-20 w-20 rounded border object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeKeptGalleryItem(path)}
                        className="absolute -right-2 -top-2 rounded-full bg-background border p-0.5 hover:bg-muted"
                        aria-label="Remove item"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {galleryNewFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="relative">
                      {isVideoFile(file) ? (
                        <video
                          src={galleryNewPreviews[index]}
                          className="h-20 w-20 rounded border object-cover"
                          muted
                        />
                      ) : (
                        <img
                          src={galleryNewPreviews[index]}
                          alt={file.name}
                          className="h-20 w-20 rounded border object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeNewGalleryFile(index)}
                        className="absolute -right-2 -top-2 rounded-full bg-background border p-0.5 hover:bg-muted"
                        aria-label="Remove item"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <Input
                  type="file"
                  accept={GALLERY_ACCEPT}
                  multiple
                  onChange={(e) => {
                    handleGalleryFilesSelected(e.target.files);
                    e.target.value = "";
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Images or videos (mp4, mov, avi, mkv, webm), up to 5MB each.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Related Projects</Label>
                <MultiSelect
                  options={relatedOptions}
                  selected={relatedProjectIds}
                  onChange={setRelatedProjectIds}
                  placeholder="Select related projects"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sort_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="0" {...field} />
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
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="is_show_in_home"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Show on Home</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/projects")}>
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
