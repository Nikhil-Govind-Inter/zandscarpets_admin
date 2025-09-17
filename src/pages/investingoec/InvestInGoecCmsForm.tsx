import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [bannerDesktopFile, setBannerDesktopFile] = useState<File | string | null>(null);
  const [bannerMobileFile, setBannerMobileFile] = useState<File | string | null>(null);
  const [aboutDesktopFile, setAboutDesktopFile] = useState<File | string | null>(null);
  const [aboutMobileFile, setAboutMobileFile] = useState<File | string | null>(null);
  const [growthDesktopFile, setGrowthDesktopFile] = useState<File | string | null>(null);
  const [growthMobileFile, setGrowthMobileFile] = useState<File | string | null>(null);
  const [whyInvestDesktopFile, setWhyInvestDesktopFile] = useState<File | string | null>(null);
  const [whyInvestMobileFile, setWhyInvestMobileFile] = useState<File | string | null>(null);
  const [investInGoecMediaFile, setInvestInGoecMediaFile] = useState<File | string | null>(null);
  const [investMediaFile, setInvestMediaFile] = useState<File | string | null>(null);

  const form = useForm<InvestInGoecCmsFormData>({
    resolver: zodResolver(investInGoecCmsSchema),
    defaultValues: {
      banner_title: "",
      banner_media_desktop_file: null,
      banner_media_mobile_file: null,
      banner_media_alt: "",
      about_description: "",
      about_media_type: "image",
      about_media_desktop_file: null,
      about_media_mobile_file: null,
      about_media_alt: "",
      growth_title: "",
      growth_description: "",
      growth_media_desktop_file: null,
      growth_media_mobile_file: null,
      growth_media_alt: "",
      explore_title: "",
      why_invest_title: "",
      why_invest_description: "",
      why_invest_media_desktop_file: null,
      why_invest_media_mobile_file: null,
      why_invest_media_alt: "",
      partners_title: "",
      invest_in_goec_title: "",
      invest_in_goec_media_file: null,
      invest_in_goec_media_alt: "",
      invest_media_file: null,
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
        banner_title: data.banner_title || "",
        banner_media_desktop_file: null,
        banner_media_mobile_file: null,
        banner_media_alt: data.banner_media_alt || "",
        about_description: data.about_description || "",
        about_media_type: data.about_media_type || "image",
        about_media_desktop_file: null,
        about_media_mobile_file: null,
        about_media_alt: data.about_media_alt || "",
        growth_title: data.growth_title || "",
        growth_description: data.growth_description || "",
        growth_media_desktop_file: null,
        growth_media_mobile_file: null,
        growth_media_alt: data.growth_media_alt || "",
        explore_title: data.explore_title || "",
        why_invest_title: data.why_invest_title || "",
        why_invest_description: data.why_invest_description || "",
        why_invest_media_desktop_file: null,
        why_invest_media_mobile_file: null,
        why_invest_media_alt: data.why_invest_media_alt || "",
        partners_title: data.partners_title || "",
        invest_in_goec_title: data.invest_in_goec_title || "",
        invest_in_goec_media_file: null,
        invest_in_goec_media_alt: data.invest_in_goec_media_alt || "",
        invest_media_file: null,
      });

      // Set file paths
      if (data.banner_media_desktop_path) setBannerDesktopFile(data.banner_media_desktop_path);
      if (data.banner_media_mobile_path) setBannerMobileFile(data.banner_media_mobile_path);
      if (data.about_media_desktop_path) setAboutDesktopFile(data.about_media_desktop_path);
      if (data.about_media_mobile_path) setAboutMobileFile(data.about_media_mobile_path);
      if (data.growth_media_desktop_path) setGrowthDesktopFile(data.growth_media_desktop_path);
      if (data.growth_media_mobile_path) setGrowthMobileFile(data.growth_media_mobile_path);
      if (data.why_invest_media_desktop_path) setWhyInvestDesktopFile(data.why_invest_media_desktop_path);
      if (data.why_invest_media_mobile_path) setWhyInvestMobileFile(data.why_invest_media_mobile_path);
      if (data.invest_in_goec_media_path) setInvestInGoecMediaFile(data.invest_in_goec_media_path);
      if (data.invest_media_path) setInvestMediaFile(data.invest_media_path);
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


  const onSubmit = async (data: InvestInGoecCmsFormData) => {
    try {
      setLoading(true);

      const submitData = {
        banner_title: data.banner_title,
        banner_media_desktop_file: bannerDesktopFile instanceof File ? bannerDesktopFile : undefined,
        banner_media_mobile_file: bannerMobileFile instanceof File ? bannerMobileFile : undefined,
        banner_media_alt: data.banner_media_alt || "",
        about_description: data.about_description,
        about_media_type: data.about_media_type,
        about_media_desktop_file: aboutDesktopFile instanceof File ? aboutDesktopFile : undefined,
        about_media_mobile_file: aboutMobileFile instanceof File ? aboutMobileFile : undefined,
        about_media_alt: data.about_media_alt || "",
        growth_title: data.growth_title,
        growth_description: data.growth_description,
        growth_media_desktop_file: growthDesktopFile instanceof File ? growthDesktopFile : undefined,
        growth_media_mobile_file: growthMobileFile instanceof File ? growthMobileFile : undefined,
        growth_media_alt: data.growth_media_alt || "",
        explore_title: data.explore_title,
        why_invest_title: data.why_invest_title,
        why_invest_description: data.why_invest_description,
        why_invest_media_desktop_file: whyInvestDesktopFile instanceof File ? whyInvestDesktopFile : undefined,
        why_invest_media_mobile_file: whyInvestMobileFile instanceof File ? whyInvestMobileFile : undefined,
        why_invest_media_alt: data.why_invest_media_alt || "",
        partners_title: data.partners_title,
        invest_in_goec_title: data.invest_in_goec_title,
        invest_in_goec_media_file: investInGoecMediaFile instanceof File ? investInGoecMediaFile : undefined,
        invest_in_goec_media_alt: data.invest_in_goec_media_alt || "",
        invest_media_file: investMediaFile instanceof File ? investMediaFile : undefined,
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="banner_media_desktop_file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banner Desktop Image</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={bannerDesktopFile}
                          onChange={setBannerDesktopFile}
                          accept="image/*"
                          maxSize={5242880} // 5MB
                          placeholder="Drop desktop banner image here"
                          preview={true}
                          recommendedDimensions="1440×614px"
                          dimensionNote="Desktop banner image"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="banner_media_mobile_file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banner Mobile Image</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={bannerMobileFile}
                          onChange={setBannerMobileFile}
                          accept="image/*"
                          maxSize={5242880} // 5MB
                          placeholder="Drop mobile banner image here"
                          preview={true}
                          recommendedDimensions="768×1024px"
                          dimensionNote="Mobile banner image"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="banner_media_alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Media Alt Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter alt text for banner media" {...field} />
                    </FormControl>
                    <FormDescription>
                      Alternative text for banner images
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* About Section */}
          <Card>
            <CardHeader>
              <CardTitle>About Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="about_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter about description..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="about_media_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About Media Type</FormLabel>
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
                  name="about_media_alt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About Media Alt Text</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter alt text for about media" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="about_media_desktop_file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About Desktop Media</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={aboutDesktopFile}
                          onChange={setAboutDesktopFile}
                          accept="image/*,video/*"
                          maxSize={10485760} // 10MB
                          placeholder="Drop desktop about media here"
                          preview={true}
                          recommendedDimensions="800×600px"
                          dimensionNote="Desktop about media"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="about_media_mobile_file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About Mobile Media</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={aboutMobileFile}
                          onChange={setAboutMobileFile}
                          accept="image/*,video/*"
                          maxSize={10485760} // 10MB
                          placeholder="Drop mobile about media here"
                          preview={true}
                          recommendedDimensions="400×300px"
                          dimensionNote="Mobile about media"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Growth Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Growth Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="growth_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Growth Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter growth title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="growth_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Growth Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter growth description..."
                          className="min-h-[100px]"
                          {...field}
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
                  name="growth_media_desktop_file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Growth Desktop Media</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={growthDesktopFile}
                          onChange={setGrowthDesktopFile}
                          accept="image/*"
                          maxSize={5242880} // 5MB
                          placeholder="Drop desktop growth media here"
                          preview={true}
                          recommendedDimensions="600×400px"
                          dimensionNote="Desktop growth media"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="growth_media_mobile_file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Growth Mobile Media</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={growthMobileFile}
                          onChange={setGrowthMobileFile}
                          accept="image/*"
                          maxSize={5242880} // 5MB
                          placeholder="Drop mobile growth media here"
                          preview={true}
                          recommendedDimensions="400×300px"
                          dimensionNote="Mobile growth media"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="growth_media_alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Growth Media Alt Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter alt text for growth media" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <FormLabel>Why Invest Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Explain why to invest..."
                          className="min-h-[100px]"
                          {...field}
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
                  name="why_invest_media_desktop_file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why Invest Desktop Media</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={whyInvestDesktopFile}
                          onChange={setWhyInvestDesktopFile}
                          accept="image/*"
                          maxSize={5242880} // 5MB
                          placeholder="Drop desktop why invest media here"
                          preview={true}
                          recommendedDimensions="600×400px"
                          dimensionNote="Desktop why invest media"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="why_invest_media_mobile_file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why Invest Mobile Media</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={whyInvestMobileFile}
                          onChange={setWhyInvestMobileFile}
                          accept="image/*"
                          maxSize={5242880} // 5MB
                          placeholder="Drop mobile why invest media here"
                          preview={true}
                          recommendedDimensions="400×300px"
                          dimensionNote="Mobile why invest media"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="why_invest_media_alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why Invest Media Alt Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter alt text for why invest media" {...field} />
                    </FormControl>
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
                Invest to GoEc
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="invest_in_goec_media_file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invest in GO EC Media</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={investInGoecMediaFile}
                          onChange={setInvestInGoecMediaFile}
                          accept="image/*"
                          maxSize={5242880} // 5MB
                          placeholder="Drop invest in GO EC media here"
                          preview={true}
                          recommendedDimensions="600×400px"
                          dimensionNote="Invest in GO EC media"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invest_in_goec_media_alt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invest in GO EC Media Alt Text</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter alt text for invest in GO EC media" {...field} />
                      </FormControl>
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