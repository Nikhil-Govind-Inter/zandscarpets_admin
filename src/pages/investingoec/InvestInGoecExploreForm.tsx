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
import { Save, ArrowLeft, Compass, Image, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/common/FileUpload";
import {
  fetchInvestInGoecExploreById,
  saveInvestInGoecExploreItem,
} from "@/services/investingoec/investInGoecExploreApi";
import {
  investInGoecExploreSchema,
  InvestInGoecExploreFormData,
} from "@/schemas/investInGoecExploreSchema";

export default function InvestInGoecExploreForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingMediaPath, setExistingMediaPath] = useState<string>("");

  const isEditMode = !!id;

  const form = useForm<InvestInGoecExploreFormData>({
    resolver: zodResolver(investInGoecExploreSchema),
    defaultValues: {
      name: "",
      title: "",
      description: "",
      media_alt: "",
      points: "",
      status: true,
      sort_order: "1",
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
      const response = await fetchInvestInGoecExploreById(Number(id));
      const data = response.data;

      form.reset({
        name: data.name,
        title: data.title,
        description: data.description,
        media_alt: data.media_alt,
        points: data.points,
        status: data.status,
        sort_order: data.sort_order.toString(),
      });

      setExistingMediaPath(data.media_path as string);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load explore item data",
        variant: "destructive",
      });
      navigate("/invest-in-zandcarpets-explore");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    form.setValue("media_file", file);
  };

  const onSubmit = async (data: InvestInGoecExploreFormData) => {
    try {
      setLoading(true);

      const submitData = {
        name: data.name,
        title: data.title,
        description: data.description,
        media_file: selectedFile,
        media_alt: data.media_alt || "",
        points: data.points,
        status: data.status,
        sort_order: parseInt(data.sort_order || "1"),
      };

      await saveInvestInGoecExploreItem(submitData, isEditMode ? Number(id) : undefined);

      toast({
        title: "Success",
        description: `Explore item ${isEditMode ? "updated" : "created"} successfully`,
      });

      navigate("/invest-in-zandcarpets-explore");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} explore item`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading explore item data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/invest-in-zandcarpets-explore")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit" : "Create"} Explore Item
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Update" : "Add a new"} investment exploration item
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass className="h-5 w-5" />
                Basic Information
              </CardTitle>
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
                        <Input placeholder="Enter short name (e.g., COCO)" {...field} />
                      </FormControl>
                      <FormDescription>
                        Short identifier for this item (e.g., COCO, FOFO)
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
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full title" {...field} />
                    </FormControl>
                    <FormDescription>
                      Full descriptive title for this exploration item
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
                        placeholder="Enter detailed description..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detailed description explaining this exploration option
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Media Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="media_file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {existingMediaPath && !selectedFile && (
                          <div className="relative inline-block">
                            <img
                              src={`http://localhost:3000/${existingMediaPath}`}
                              alt="Current media"
                              className="max-w-xs h-32 object-cover rounded-lg border"
                            />
                            <div className="mt-2 text-sm text-muted-foreground">
                              Current image
                            </div>
                          </div>
                        )}
                        
                        <FileUpload
                          accept="image/*"
                          onFileSelect={handleFileSelect}
                          selectedFile={selectedFile}
                          placeholder="Upload explore item image"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload an image to represent this exploration item
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
            </CardContent>
          </Card>

          {/* Points Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Key Points
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Points</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter key points separated by * (asterisk)..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      <div className="space-y-1">
                        <div>Enter key points, each separated by * (asterisk)</div>
                        <div className="text-xs text-muted-foreground">
                          Example: "First point * Second point * Third point"
                        </div>
                      </div>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Points Preview */}
              {form.watch("points") && (
                <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                  <div className="text-sm font-medium mb-2">Points Preview:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {form.watch("points")
                      .split("*")
                      .map((point, index) => {
                        const trimmedPoint = point.trim();
                        return trimmedPoint ? (
                          <li key={index} className="text-sm text-muted-foreground">
                            {trimmedPoint}
                          </li>
                        ) : null;
                      })}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Status</FormLabel>
                      <FormDescription>
                        Enable or disable this exploration item
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
              onClick={() => navigate("/invest-in-zandcarpets-explore")}
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