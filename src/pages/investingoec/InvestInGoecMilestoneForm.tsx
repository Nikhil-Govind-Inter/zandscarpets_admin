import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Save, ArrowLeft, Target, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchInvestInGoecMilestoneById,
  saveInvestInGoecMilestoneItem,
} from "@/services/investingoec/investInGoecMilestoneApi";
import {
  investInGoecMilestoneSchema,
  InvestInGoecMilestoneFormData,
} from "@/schemas/investInGoecMilestoneSchema";

export default function InvestInGoecMilestoneForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);

  const isEditMode = !!id;

  const form = useForm<InvestInGoecMilestoneFormData>({
    resolver: zodResolver(investInGoecMilestoneSchema),
    defaultValues: {
      value: 0,
      prefix: "+",
      subtitle: "",
      status: true,
      sort_order: "1",
    },
  });

  const watchedValue = form.watch("value");
  const watchedPrefix = form.watch("prefix");
  const watchedSubtitle = form.watch("subtitle");

  useEffect(() => {
    if (isEditMode && id) {
      loadMilestoneData();
    }
  }, [id, isEditMode]);

  const loadMilestoneData = async () => {
    try {
      setInitialLoading(true);
      const response = await fetchInvestInGoecMilestoneById(Number(id));
      const data = response.data;

      form.reset({
        value: data.value,
        prefix: data.prefix,
        subtitle: data.subtitle,
        status: data.status,
        sort_order: data.sort_order.toString(),
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load milestone data",
        variant: "destructive",
      });
      navigate("/invest-in-zandcarpets-milestone");
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: InvestInGoecMilestoneFormData) => {
    try {
      setLoading(true);

      const submitData = {
        value: data.value,
        prefix: data.prefix || "",
        subtitle: data.subtitle,
        status: data.status,
        sort_order: parseInt(data.sort_order || "1"),
      };

      await saveInvestInGoecMilestoneItem(submitData, isEditMode ? Number(id) : undefined);

      toast({
        title: "Success",
        description: `Milestone ${isEditMode ? "updated" : "created"} successfully`,
      });

      navigate("/invest-in-zandcarpets-milestone");
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

  const formatMilestonePreview = () => {
    const prefix = watchedPrefix || "";
    const value = watchedValue || 0;
    const subtitle = watchedSubtitle || "Subtitle";
    return `${prefix}${value.toLocaleString()} ${subtitle}`;
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
        <Button variant="outline" size="icon" onClick={() => navigate("/invest-in-zandcarpets-milestone")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit" : "Create"} Milestone
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Update" : "Add a new"} milestone counter
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Preview Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5" />
                Milestone Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {formatMilestonePreview()}
                </div>
                <div className="text-sm text-muted-foreground">
                  This is how your milestone will appear
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Milestone Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Milestone Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="273"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        The numeric value for this milestone
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prefix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prefix</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+"
                          maxLength={5}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional prefix like +, $, %, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle</FormLabel>
                    <FormControl>
                      <Input placeholder="Charging Points" {...field} />
                    </FormControl>
                    <FormDescription>
                      Description text that appears after the value
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Settings */}
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
              onClick={() => navigate("/invest-in-zandcarpets-milestone")}
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