import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { generateSlug } from "@/utils/formUtils";
// Import your schema and form components here
// import { yourSchema, YourFormData } from "@/schemas/yourSchema";
// import { FormTextField, FormSelectField, ... } from "@/components/forms/FormFieldComponents";

// TODO: Replace with actual API functions
const createItem = async (data: any): Promise<any> => {
  console.log("Creating item:", data);
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

const updateItem = async (id: string, data: any): Promise<any> => {
  console.log("Updating item:", id, data);
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

// TODO: Replace YourFormData with actual type
interface YourFormData {
  name: string;
  slug: string;
  // Add other fields
}

// TODO: Create your Zod schema
const yourSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  // Add other fields
});

export default function YourFormComponent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEdit = Boolean(id && id !== "new");

  const form = useForm<YourFormData>({
    resolver: zodResolver(yourSchema),
    defaultValues: {
      name: "",
      slug: "",
      // Add other default values
    },
  });

  const createMutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Item created successfully",
      });
      navigate("/your-list-route");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create item",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: YourFormData) => updateItem(id!, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
      navigate("/your-list-route");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update item",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: YourFormData) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  // Auto-generate slug from name
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "name" && value.name && !form.getValues("slug")) {
        form.setValue("slug", generateSlug(value.name));
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/your-list-route")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEdit ? "Edit Item" : "Add New Item"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? "Update item information" : "Create a new item"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add your form fields here using the FormField components */}
              {/* Example:
              <FormTextField
                form={form}
                name="name"
                label="Name"
                placeholder="Enter name"
              />
              */}
            </CardContent>
          </Card>

          {/* Additional sections as needed */}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/your-list-route")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading 
                ? (isEdit ? "Updating..." : "Creating...") 
                : (isEdit ? "Update Item" : "Create Item")
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

/*
MODERNIZATION CHECKLIST:
✅ Replace useState with useForm + zodResolver
✅ Create Zod validation schema
✅ Use FormField components instead of manual inputs
✅ Add proper TypeScript types
✅ Implement TanStack Query mutations
✅ Add loading states and error handling
✅ Use consistent toast notifications
✅ Add proper form validation
✅ Implement auto-slug generation
✅ Use consistent header sizing (text-3xl)
✅ Add proper disabled states for buttons
✅ Use consistent spacing and layout
*/