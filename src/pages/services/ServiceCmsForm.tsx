import { useState, useEffect } from "react";
import PageLoader from "@/components/layout/PageLoader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FormTextField, FormTextareaField } from "@/components/forms/FormFieldComponents";
import { serviceCmsSchema, ServiceCmsFormData } from "@/schemas/serviceCmsSchema";
import { fetchServiceCms, saveServiceCms } from "@/services/services/serviceCmsApi";

const defaultValues: ServiceCmsFormData = {
  title: "",
  description: "",
  service_title: "",
  process_steps_title: "",
};

export default function ServiceCmsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [recordId, setRecordId] = useState<number | undefined>(undefined);

  const form = useForm<ServiceCmsFormData>({
    resolver: zodResolver(serviceCmsSchema),
    defaultValues,
  });

  useEffect(() => {
    loadServiceCmsData();
  }, []);

  const loadServiceCmsData = async () => {
    try {
      setInitialLoading(true);
      const response = await fetchServiceCms();
      const data = response.data;

      if (data) {
        setRecordId(data.id);
        form.reset({
          title: data.title || "",
          description: data.description || "",
          service_title: data.service_title || "",
          process_steps_title: data.process_steps_title || "",
        });
      }
    } catch (error) {
      console.log("No existing data found, starting with empty form");
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: ServiceCmsFormData) => {
    try {
      setLoading(true);
      const payload = {
        title: data.title,
        description: data.description,
        service_title: data.service_title,
        process_steps_title: data.process_steps_title,
      };
      const response = await saveServiceCms(payload, recordId ?? 1);
      if (response.data?.id) {
        setRecordId(response.data.id);
      }
      toast({
        title: "Success",
        description: "Service CMS data saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save Service CMS data",
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
      <div>
        <h1 className="text-2xl font-bold">Services Page CMS</h1>
        <p className="text-muted-foreground">Manage content for the Services page</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Services Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormTextField
                form={form}
                name="title"
                label="Title"
                placeholder="Enter section title"
              />
              <FormTextareaField
                form={form}
                name="description"
                label="Description"
                placeholder="Enter section description"
              />
              <FormTextField
                form={form}
                name="service_title"
                label="Services List Title"
                placeholder="Enter services list heading"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Process Steps Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormTextField
                form={form}
                name="process_steps_title"
                label="Process Steps Title"
                placeholder="Enter process steps heading"
              />
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
