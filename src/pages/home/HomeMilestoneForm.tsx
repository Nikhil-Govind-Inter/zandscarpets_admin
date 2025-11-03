import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  fetchHomeMilestoneById,
  saveHomeMilestone,
} from "@/services/home/homeMilestoneApi";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  value: z.number().min(0, "Value must be 0 or greater"),
  sort_order: z.number().min(1, "Sort order must be at least 1"),
  status: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

export default function HomeMilestoneForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);

  const isEditMode = !!id;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      value: 0,
      sort_order: 1,
      status: true,
    },
  });

  useEffect(() => {
    if (isEditMode && id) {
      loadMilestoneData();
    }
  }, [id, isEditMode]);

  const loadMilestoneData = async () => {
    try {
      setInitialLoading(true);
      const response = await fetchHomeMilestoneById(Number(id));
      const data = response.data;

      form.reset({
        title: data.title,
        value: data.value,
        sort_order: data.sort_order,
        status: data.status,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load milestone data",
        variant: "destructive",
      });
      navigate("/home-milestone");
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      await saveHomeMilestone(
        {
          title: data.title,
          value: data.value,
          sort_order: data.sort_order,
          status: data.status,
        },
        isEditMode ? Number(id) : undefined
      );

      toast({
        title: "Success",
        description: `Milestone ${isEditMode ? "updated" : "created"} successfully`,
      });

      navigate("/home-milestone");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} milestone`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading milestone data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/home-milestone")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit" : "Create"} Home Milestone
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Update" : "Add a new"} milestone for the homepage
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Milestone Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Milestone Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter milestone title" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive title for this milestone achievement
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Milestone Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      The numerical value representing this milestone
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
                          Enable or disable this milestone
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
              onClick={() => navigate("/home-milestone")}
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