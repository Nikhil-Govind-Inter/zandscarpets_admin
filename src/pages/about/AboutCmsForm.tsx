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
import { Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/common/FileUpload";
import {
  fetchAboutCms,
  saveAboutCms,
} from "@/services/about/aboutCmsApi";
import {
  aboutCmsSchema,
  AboutCmsFormData,
} from "@/schemas/aboutSchema";

export default function AboutCmsForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // File states for all uploads
  const [bannerDesktopFile, setBannerDesktopFile] = useState<File | string | null>(null);
  const [bannerMobileFile, setBannerMobileFile] = useState<File | string | null>(null);
  const [aboutDesktopFile, setAboutDesktopFile] = useState<File | string | null>(null);
  const [aboutMobileFile, setAboutMobileFile] = useState<File | string | null>(null);
  const [learnMoreFile, setLearnMoreFile] = useState<File | string | null>(null);
  const [meetTeamFile, setMeetTeamFile] = useState<File | string | null>(null);

  const form = useForm<AboutCmsFormData>({
    resolver: zodResolver(aboutCmsSchema),
    defaultValues: {
      banner_title: "",
      banner_media_alt: "",
      about_description: "",
      about_media_type: "image",
      about_media_alt: "",
      learn_more_title: "",
      learn_more_description: "",
      learn_more_media_alt: "",
      our_mission_title: "",
      our_mission_description: "",
      our_vision_title: "",
      our_vision_description: "",
      leading_game_title: "",
      charging_station_count: "0",
      charging_station_subtitle: "",
      our_values_title: "",
      our_values_description: "",
      our_journey_title: "",
      our_journey_description: "",
      meet_team_title: "",
      meet_team_description: "",
      meet_team_media_alt: "",
      our_associate_title: "",
      our_associate_description: "",
      media_title: "",
      media_description: "",
      contact_us_super_title: "",
      contact_us_title: "",
    },
  });

  useEffect(() => {
    loadAboutCmsData();
  }, []);

  const loadAboutCmsData = async () => {
    try {
      setInitialLoading(true);
      const response = await fetchAboutCms();
      const data = response.data;

      form.reset({
        banner_title: data.banner_title || "",
        banner_media_alt: data.banner_media_alt || "",
        about_description: data.about_description || "",
        about_media_type: data.about_media_type || "image",
        about_media_alt: data.about_media_alt || "",
        learn_more_title: data.learn_more_title || "",
        learn_more_description: data.learn_more_description || "",
        learn_more_media_alt: data.learn_more_media_alt || "",
        our_mission_title: data.our_mission_title || "",
        our_mission_description: data.our_mission_description || "",
        our_vision_title: data.our_vision_title || "",
        our_vision_description: data.our_vision_description || "",
        leading_game_title: data.leading_game_title || "",
        charging_station_count: data.charging_station_count?.toString() || "0",
        charging_station_subtitle: data.charging_station_subtitle || "",
        our_values_title: data.our_values_title || "",
        our_values_description: data.our_values_description || "",
        our_journey_title: data.our_journey_title || "",
        our_journey_description: data.our_journey_description || "",
        meet_team_title: data.meet_team_title || "",
        meet_team_description: data.meet_team_description || "",
        meet_team_media_alt: data.meet_team_media_alt || "",
        our_associate_title: data.our_associate_title || "",
        our_associate_description: data.our_associate_description || "",
        media_title: data.media_title || "",
        media_description: data.media_description || "",
        contact_us_super_title: data.contact_us_super_title || "",
        contact_us_title: data.contact_us_title || "",
      });

      // Set file paths if they exist
      if (data.banner_media_desktop_path) {
        setBannerDesktopFile(typeof data.banner_media_desktop_path === 'string' ? `${import.meta.env.VITE_URL}/${data.banner_media_desktop_path}` : data.banner_media_desktop_path);
      }
      if (data.banner_media_mobile_path) {
        setBannerMobileFile(typeof data.banner_media_mobile_path === 'string' ? `${import.meta.env.VITE_URL}/${data.banner_media_mobile_path}` : data.banner_media_mobile_path);
      }
      if (data.about_media_desktop_path) {
        setAboutDesktopFile(typeof data.about_media_desktop_path === 'string' ? `${import.meta.env.VITE_URL}/${data.about_media_desktop_path}` : data.about_media_desktop_path);
      }
      if (data.about_media_mobile_path) {
        setAboutMobileFile(typeof data.about_media_mobile_path === 'string' ? `${import.meta.env.VITE_URL}/${data.about_media_mobile_path}` : data.about_media_mobile_path);
      }
      if (data.learn_more_media_path) {
        setLearnMoreFile(typeof data.learn_more_media_path === 'string' ? `${import.meta.env.VITE_URL}/${data.learn_more_media_path}` : data.learn_more_media_path);
      }
      if (data.meet_team_media_path) {
        setMeetTeamFile(typeof data.meet_team_media_path === 'string' ? `${import.meta.env.VITE_URL}/${data.meet_team_media_path}` : data.meet_team_media_path);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load About CMS data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: AboutCmsFormData) => {
    try {
      setLoading(true);

      await saveAboutCms({
        banner_title: data.banner_title,
        banner_media_alt: data.banner_media_alt,
        about_description: data.about_description,
        about_media_type: data.about_media_type,
        about_media_alt: data.about_media_alt,
        learn_more_title: data.learn_more_title,
        learn_more_description: data.learn_more_description,
        learn_more_media_alt: data.learn_more_media_alt,
        our_mission_title: data.our_mission_title,
        our_mission_description: data.our_mission_description,
        our_vision_title: data.our_vision_title,
        our_vision_description: data.our_vision_description,
        leading_game_title: data.leading_game_title,
        charging_station_count: parseInt(data.charging_station_count || "0"),
        charging_station_subtitle: data.charging_station_subtitle,
        our_values_title: data.our_values_title,
        our_values_description: data.our_values_description,
        our_journey_title: data.our_journey_title,
        our_journey_description: data.our_journey_description,
        meet_team_title: data.meet_team_title,
        meet_team_description: data.meet_team_description,
        meet_team_media_alt: data.meet_team_media_alt,
        our_associate_title: data.our_associate_title,
        our_associate_description: data.our_associate_description,
        media_title: data.media_title,
        media_description: data.media_description,
        contact_us_super_title: data.contact_us_super_title,
        contact_us_title: data.contact_us_title,
        banner_media_desktop_file: bannerDesktopFile instanceof File ? bannerDesktopFile : undefined,
        banner_media_mobile_file: bannerMobileFile instanceof File ? bannerMobileFile : undefined,
        about_media_desktop_file: aboutDesktopFile instanceof File ? aboutDesktopFile : undefined,
        about_media_mobile_file: aboutMobileFile instanceof File ? aboutMobileFile : undefined,
        learn_more_media_file: learnMoreFile instanceof File ? learnMoreFile : undefined,
        meet_team_media_file: meetTeamFile instanceof File ? meetTeamFile : undefined,
      });

      toast({
        title: "Success",
        description: "About CMS updated successfully",
      });

      // Optionally navigate back or refresh data
      loadAboutCmsData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update About CMS",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading About CMS data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">About CMS</h1>
          <p className="text-muted-foreground">
            Manage all content for the About page
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Banner Section */}
          <Card>
            <CardHeader>
              <CardTitle>Banner Section</CardTitle>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FileUpload
                    label="Banner Desktop Image"
                    value={bannerDesktopFile}
                    onChange={setBannerDesktopFile}
                    accept="image/*"
                    maxSize={5242880} // 5MB
                    placeholder="Drop desktop banner image here"
                    preview={true}
                    recommendedDimensions="1920×1080px"
                    dimensionNote="Desktop banner image"
                  />
                </div>
                
                <div className="space-y-2">
                  <FileUpload
                    label="Banner Mobile Image"
                    value={bannerMobileFile}
                    onChange={setBannerMobileFile}
                    accept="image/*"
                    maxSize={5242880} // 5MB
                    placeholder="Drop mobile banner image here"
                    preview={true}
                    recommendedDimensions="768×1024px"
                    dimensionNote="Mobile banner image"
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="banner_media_alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Alt Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter alt text for banner images" {...field} />
                    </FormControl>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FileUpload
                    label="About Desktop Media"
                    value={aboutDesktopFile}
                    onChange={setAboutDesktopFile}
                    accept="image/*,video/*"
                    maxSize={10485760} // 10MB
                    placeholder="Drop desktop about media here"
                    preview={true}
                    recommendedDimensions="800×600px"
                    dimensionNote="Desktop about media"
                  />
                </div>
                
                <div className="space-y-2">
                  <FileUpload
                    label="About Mobile Media"
                    value={aboutMobileFile}
                    onChange={setAboutMobileFile}
                    accept="image/*,video/*"
                    maxSize={10485760} // 10MB
                    placeholder="Drop mobile about media here"
                    preview={true}
                    recommendedDimensions="400×300px"
                    dimensionNote="Mobile about media"
                  />
                </div>
              </div>

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
            </CardContent>
          </Card>

          {/* Learn More Section */}
          <Card>
            <CardHeader>
              <CardTitle>Learn More Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="learn_more_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Learn More Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter learn more title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="learn_more_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Learn More Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter learn more description..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FileUpload
                  label="Learn More Media"
                  value={learnMoreFile}
                  onChange={setLearnMoreFile}
                  accept="image/*"
                  maxSize={5242880} // 5MB
                  placeholder="Drop learn more image here"
                  preview={true}
                  recommendedDimensions="600×400px"
                  dimensionNote="Learn more section image"
                />
              </div>

              <FormField
                control={form.control}
                name="learn_more_media_alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Learn More Media Alt Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter alt text for learn more media" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Mission and Vision Section */}
          <Card>
            <CardHeader>
              <CardTitle>Mission and Vision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="our_mission_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mission Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter mission title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="our_mission_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mission Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter mission description..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="our_vision_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vision Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter vision title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="our_vision_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vision Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter vision description..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leading Game Section */}
          <Card>
            <CardHeader>
              <CardTitle>Leading Game Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="leading_game_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leading Game Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter leading game title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="charging_station_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Charging Station Count</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="charging_station_subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Charging Station Subtitle</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter charging station subtitle" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Sections */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Content Sections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Our Values */}
              <div className="space-y-4 border-b pb-4">
                <h4 className="text-lg font-semibold">Our Values</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="our_values_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Values Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter values title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="our_values_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Values Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter values description..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Our Journey */}
              <div className="space-y-4 border-b pb-4">
                <h4 className="text-lg font-semibold">Our Journey</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="our_journey_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Journey Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter journey title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="our_journey_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Journey Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter journey description..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Meet Team */}
              <div className="space-y-4 border-b pb-4">
                <h4 className="text-lg font-semibold">Meet Our Team</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="meet_team_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter team title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="meet_team_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter team description..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-2">
                  <FileUpload
                    label="Team Media"
                    value={meetTeamFile}
                    onChange={setMeetTeamFile}
                    accept="image/*"
                    maxSize={5242880} // 5MB
                    placeholder="Drop team image here"
                    preview={true}
                    recommendedDimensions="600×400px"
                    dimensionNote="Team section image"
                  />
                </div>

                <FormField
                  control={form.control}
                  name="meet_team_media_alt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Media Alt Text</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter alt text for team media" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Our Associates */}
              <div className="space-y-4 border-b pb-4">
                <h4 className="text-lg font-semibold">Our Associates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="our_associate_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Associates Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter associates title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="our_associate_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Associates Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter associates description..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Media Section */}
              <div className="space-y-4 border-b pb-4">
                <h4 className="text-lg font-semibold">Media Highlights</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="media_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Media Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter media title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="media_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Media Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter media description..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contact Us Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Contact Us</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact_us_super_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Super Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contact super title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact_us_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contact title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
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