import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Save, ArrowLeft, TrendingUp, Car, Building, Users, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/common/FileUpload";
import {
  fetchInvestInGoecCms,
  updateInvestInGoecCms,
} from "@/services/investingoec/investInGoecCmsApi";
import {
  investInGoecCmsSchema,
  InvestInGoecCmsFormData,
} from "@/schemas/investInGoecCmsSchema";

export default function InvestInGoecCmsForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // File states
  const [investMediaFile, setInvestMediaFile] = useState<File | null>(null);
  const [futureTransportMediaFile, setFutureTransportMediaFile] = useState<File | null>(null);
  const [whyInvestMediaFile, setWhyInvestMediaFile] = useState<File | null>(null);
  const [investInGoecMediaFile, setInvestInGoecMediaFile] = useState<File | null>(null);
  
  // Existing file paths
  const [existingInvestMedia, setExistingInvestMedia] = useState<string>("");
  const [existingFutureTransportMedia, setExistingFutureTransportMedia] = useState<string>("");
  const [existingWhyInvestMedia, setExistingWhyInvestMedia] = useState<string>("");
  const [existingInvestInGoecMedia, setExistingInvestInGoecMedia] = useState<string>("");

  const form = useForm<InvestInGoecCmsFormData>({
    resolver: zodResolver(investInGoecCmsSchema),
    defaultValues: {
      banner_title: "",
      invest_media_alt: "",
      invest_description: "",
      future_transportation_title: "",
      future_transportation_description: "",
      future_transportation_media_alt: "",
      business_model_title: "",
      why_invest_title: "",
      why_invest_description: "",
      why_invest_media_alt: "",
      partners_title: "",
      invest_in_goec_title: "",
      invest_in_goec_media_alt: "",
    },
  });

  useEffect(() => {
    loadCmsData();
  }, []);

  const loadCmsData = async () => {
    try {
      setInitialLoading(true);
      const response = await fetchInvestInGoecCms();
      const data = response.data;

      form.reset({
        banner_title: data.banner_title,
        invest_media_alt: data.invest_media_alt,
        invest_description: data.invest_description,
        future_transportation_title: data.future_transportation_title,
        future_transportation_description: data.future_transportation_description,
        future_transportation_media_alt: data.future_transportation_media_alt,
        business_model_title: data.business_model_title,
        why_invest_title: data.why_invest_title,
        why_invest_description: data.why_invest_description,
        why_invest_media_alt: data.why_invest_media_alt,
        partners_title: data.partners_title,
        invest_in_goec_title: data.invest_in_goec_title,
        invest_in_goec_media_alt: data.invest_in_goec_media_alt,
      });

      setExistingInvestMedia(data.invest_media_path as string);
      setExistingFutureTransportMedia(data.future_transportation_media_path as string);
      setExistingWhyInvestMedia(data.why_invest_media_path as string);
      setExistingInvestInGoecMedia(data.invest_in_goec_media_path as string);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load CMS data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInvestMediaSelect = (file: File | null) => {
    setInvestMediaFile(file);
    form.setValue("invest_media_file", file);
  };

  const handleFutureTransportMediaSelect = (file: File | null) => {
    setFutureTransportMediaFile(file);
    form.setValue("future_transportation_media_file", file);
  };

  const handleWhyInvestMediaSelect = (file: File | null) => {
    setWhyInvestMediaFile(file);
    form.setValue("why_invest_media_file", file);
  };

  const handleInvestInGoecMediaSelect = (file: File | null) => {
    setInvestInGoecMediaFile(file);
    form.setValue("invest_in_goec_media_file", file);
  };

  const onSubmit = async (data: InvestInGoecCmsFormData) => {
    try {
      setLoading(true);

      const submitData = {
        banner_title: data.banner_title,
        invest_media_file: investMediaFile,
        invest_media_alt: data.invest_media_alt || "",
        invest_description: data.invest_description,
        future_transportation_title: data.future_transportation_title,
        future_transportation_description: data.future_transportation_description,
        future_transportation_media_file: futureTransportMediaFile,
        future_transportation_media_alt: data.future_transportation_media_alt || "",
        business_model_title: data.business_model_title,
        why_invest_title: data.why_invest_title,
        why_invest_description: data.why_invest_description,
        why_invest_media_file: whyInvestMediaFile,
        why_invest_media_alt: data.why_invest_media_alt || "",
        partners_title: data.partners_title,
        invest_in_goec_title: data.invest_in_goec_title,
        invest_in_goec_media_file: investInGoecMediaFile,
        invest_in_goec_media_alt: data.invest_in_goec_media_alt || "",
      };

      await updateInvestInGoecCms(submitData);

      toast({
        title: "Success",
        description: "Invest in GO EC CMS updated successfully",
      });

      // Reload data to show updated content
      await loadCmsData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update CMS data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading CMS data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Invest in GO EC CMS</h1>
          <p className="text-muted-foreground">
            Manage content for the investment page
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Banner Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Banner Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="banner_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter banner title" {...field} />
                    </FormControl>
                    <FormDescription>
                      Main headline for the investment banner
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invest_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the investment opportunity..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detailed description of the investment opportunity
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invest_media_file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {existingInvestMedia && !investMediaFile && (
                          <div className="relative inline-block">
                            <img
                              src={`http://localhost:3000/${existingInvestMedia}`}
                              alt="Current banner"
                              className="max-w-xs h-32 object-cover rounded-lg border"
                            />
                            <div className="mt-2 text-sm text-muted-foreground">
                              Current banner image
                            </div>
                          </div>
                        )}
                        
                        <FileUpload
                          accept="image/*"
                          onFileSelect={handleInvestMediaSelect}
                          selectedFile={investMediaFile}
                          placeholder="Upload banner image"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload an image for the investment banner
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invest_media_alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Image Alt Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Describe the banner image" {...field} />
                    </FormControl>
                    <FormDescription>
                      Alternative text for the banner image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Future Transportation Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Future Transportation Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="future_transportation_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter future transportation title" {...field} />
                    </FormControl>
                    <FormDescription>
                      Title for the future transportation section
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="future_transportation_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the future of transportation..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Description for the future transportation section
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="future_transportation_media_file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {existingFutureTransportMedia && !futureTransportMediaFile && (
                          <div className="relative inline-block">
                            <img
                              src={`http://localhost:3000/${existingFutureTransportMedia}`}
                              alt="Current transportation"
                              className="max-w-xs h-32 object-cover rounded-lg border"
                            />
                            <div className="mt-2 text-sm text-muted-foreground">
                              Current transportation image
                            </div>
                          </div>
                        )}
                        
                        <FileUpload
                          accept="image/*"
                          onFileSelect={handleFutureTransportMediaSelect}
                          selectedFile={futureTransportMediaFile}
                          placeholder="Upload transportation image"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload an image for the future transportation section
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="future_transportation_media_alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transportation Image Alt Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Describe the transportation image" {...field} />
                    </FormControl>
                    <FormDescription>
                      Alternative text for the transportation image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Business Model Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Business Model Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="business_model_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Model Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter business model title" {...field} />
                    </FormControl>
                    <FormDescription>
                      Title for the business model section
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Why Invest Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Why Invest Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="why_invest_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter why invest title" {...field} />
                    </FormControl>
                    <FormDescription>
                      Title for the why invest section
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="why_invest_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Explain why to invest..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Description for the why invest section
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="why_invest_media_file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {existingWhyInvestMedia && !whyInvestMediaFile && (
                          <div className="relative inline-block">
                            <img
                              src={`http://localhost:3000/${existingWhyInvestMedia}`}
                              alt="Current why invest"
                              className="max-w-xs h-32 object-cover rounded-lg border"
                            />
                            <div className="mt-2 text-sm text-muted-foreground">
                              Current why invest image
                            </div>
                          </div>
                        )}
                        
                        <FileUpload
                          accept="image/*"
                          onFileSelect={handleWhyInvestMediaSelect}
                          selectedFile={whyInvestMediaFile}
                          placeholder="Upload why invest image"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload an image for the why invest section
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="why_invest_media_alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why Invest Image Alt Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Describe the why invest image" {...field} />
                    </FormControl>
                    <FormDescription>
                      Alternative text for the why invest image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Partners Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Partners Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="partners_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partners Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter partners section title" {...field} />
                    </FormControl>
                    <FormDescription>
                      Title for the partners/testimonials section
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Final CTA Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Final Call-to-Action Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="invest_in_goec_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CTA Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter final CTA title" {...field} />
                    </FormControl>
                    <FormDescription>
                      Final call-to-action title
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invest_in_goec_media_file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CTA Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {existingInvestInGoecMedia && !investInGoecMediaFile && (
                          <div className="relative inline-block">
                            <img
                              src={`http://localhost:3000/${existingInvestInGoecMedia}`}
                              alt="Current CTA"
                              className="max-w-xs h-32 object-cover rounded-lg border"
                            />
                            <div className="mt-2 text-sm text-muted-foreground">
                              Current CTA image
                            </div>
                          </div>
                        )}
                        
                        <FileUpload
                          accept="image/*"
                          onFileSelect={handleInvestInGoecMediaSelect}
                          selectedFile={investInGoecMediaFile}
                          placeholder="Upload CTA image"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload an image for the final call-to-action
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invest_in_goec_media_alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CTA Image Alt Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Describe the CTA image" {...field} />
                    </FormControl>
                    <FormDescription>
                      Alternative text for the CTA image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Update CMS"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}