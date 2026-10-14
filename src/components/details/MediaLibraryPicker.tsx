import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, Loader2 } from "lucide-react";
import { FileUpload } from "@/components/common/FileUpload";
import { resolveImageUrl } from "@/lib/resolveImageUrl";
import { useToast } from "@/hooks/use-toast";
import { captureVideoThumbnail } from "@/utils/videoThumbnail";
import {
  fetchMediaList,
  uploadMedia,
  maxSizeForKind,
  formatMb,
  validateMediaText,
  MediaRecord,
  MediaKind,
  ApiError,
} from "@/services/details/mediaApi";

interface MediaLibraryPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: MediaKind;
  // Single-select mode (default): picking or uploading one item closes the
  // dialog immediately.
  onSelect?: (media: MediaRecord) => void;
  // Multi-select mode: pass `multiple` and this callback instead — the
  // admin can tick several library items and/or upload several files
  // before confirming, matching an `allows_multiple` field.
  multiple?: boolean;
  onSelectMultiple?: (media: MediaRecord[]) => void;
}

// Image/video picker for detail items: an existing-media grid (reuse) plus
// an upload tab (uploaded files only — no external links, per spec).
export default function MediaLibraryPicker({
  open,
  onOpenChange,
  kind,
  onSelect,
  multiple = false,
  onSelectMultiple,
}: MediaLibraryPickerProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("library");
  const [library, setLibrary] = useState<MediaRecord[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [generatingThumbnail, setGeneratingThumbnail] = useState(false);
  // Multi-select mode only: items picked so far (from the library and/or
  // just uploaded), kept until the admin confirms with "Add selected".
  const [selected, setSelected] = useState<MediaRecord[]>([]);

  useEffect(() => {
    if (!open) return;
    setActiveTab("library");
    setUploadFile(null);
    setAltText("");
    setTitle("");
    setDescription("");
    setSelected([]);
    setThumbnail(null);
    setThumbnailPreview(null);
    loadLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, kind]);

  const loadLibrary = async () => {
    try {
      setLoadingLibrary(true);
      const { data } = await fetchMediaList(1, 60, undefined, kind);
      setLibrary(data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to load media library",
        variant: "destructive",
      });
    } finally {
      setLoadingLibrary(false);
    }
  };

  const handlePick = (media: MediaRecord) => {
    onSelect?.(media);
    onOpenChange(false);
  };

  const toggleSelected = (media: MediaRecord) => {
    setSelected((prev) =>
      prev.some((m) => m.id === media.id) ? prev.filter((m) => m.id !== media.id) : [...prev, media],
    );
  };

  const confirmSelection = () => {
    if (!selected.length) return;
    onSelectMultiple?.(selected);
    onOpenChange(false);
  };

  const handleFileChange = (file: File | null) => {
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnail(null);
    setThumbnailPreview(null);

    if (file && file.size > maxSizeForKind(kind)) {
      toast({
        title: "File too large",
        description: `${kind === "image" ? "Image" : "Video"} files must be ${formatMb(maxSizeForKind(kind))} or smaller`,
        variant: "destructive",
      });
      setUploadFile(null);
      return;
    }

    setUploadFile(file);

    if (file && kind === "video") {
      setGeneratingThumbnail(true);
      captureVideoThumbnail(file)
        .then((thumb) => {
          setThumbnail(thumb);
          setThumbnailPreview(URL.createObjectURL(thumb));
        })
        .catch(() => {
          // No thumbnail could be captured — the admin can still add one
          // manually below, or upload without one.
        })
        .finally(() => setGeneratingThumbnail(false));
    }
  };

  const handleReplaceThumbnail = (file: File) => {
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    for (const [value, label] of [
      [altText, "Alt text"],
      [title, "Title"],
      [description, "Description"],
    ] as const) {
      const error = validateMediaText(value, label);
      if (error) {
        toast({ title: "Invalid input", description: error, variant: "destructive" });
        return;
      }
    }

    try {
      setUploading(true);
      const { data } = await uploadMedia(uploadFile, {
        altText: altText || undefined,
        title: title || undefined,
        description: description || undefined,
        thumbnail,
      });
      toast({ title: "Success", description: "Media uploaded successfully" });
      setUploadFile(null);
      setAltText("");
      setTitle("");
      setDescription("");
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      setThumbnail(null);
      setThumbnailPreview(null);
      if (multiple) {
        // Stay open so the admin can keep adding files, and surface the
        // new upload in the library tab too.
        setSelected((prev) => [...prev, data]);
        setLibrary((prev) => [data, ...prev]);
        setActiveTab("library");
      } else {
        handlePick(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to upload media",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose {kind === "video" ? "Video" : "Image"}{multiple ? "s" : ""}</DialogTitle>
          <DialogDescription>
            {multiple
              ? "Pick as many as you need from the library, and/or upload new files, then confirm."
              : "Pick from the media library or upload a new file."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Media Library</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>

          <TabsContent value="library">
            <ScrollArea className="h-80 rounded-md border p-3">
              {loadingLibrary ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : library.length === 0 ? (
                <p className="text-sm text-muted-foreground">No {kind}s uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {library.map((media) => {
                    const isSelected = multiple && selected.some((m) => m.id === media.id);
                    return (
                      <button
                        key={media.id}
                        type="button"
                        onClick={() => (multiple ? toggleSelected(media) : handlePick(media))}
                        className={`relative aspect-square rounded-md border overflow-hidden hover:ring-2 hover:ring-primary focus:outline-none ${
                          isSelected ? "ring-2 ring-primary" : ""
                        }`}
                        title={media.alt_text || undefined}
                      >
                        {media.kind === "image" ? (
                          <img
                            src={resolveImageUrl(media.location) || undefined}
                            alt={media.alt_text || ""}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={resolveImageUrl(media.location) || undefined}
                            className="w-full h-full object-cover"
                            muted
                          />
                        )}
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <FileUpload
              value={uploadFile}
              onChange={handleFileChange}
              accept={kind === "video" ? "video/*" : "image/*"}
              preview
            />
            <p className="text-xs text-muted-foreground">
              {kind === "video" ? "Videos" : "Images"} up to {formatMb(maxSizeForKind(kind))}
            </p>
            {kind === "video" && uploadFile && (
              <div className="flex items-center gap-3 rounded-md border p-2">
                <div className="w-14 h-14 rounded-md overflow-hidden bg-muted border flex items-center justify-center shrink-0">
                  {generatingThumbnail ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : thumbnailPreview ? (
                    <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-muted-foreground px-1 text-center">No thumbnail</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground flex-1">
                  {generatingThumbnail
                    ? "Capturing a thumbnail from the video..."
                    : "Auto-captured thumbnail — replace it if you want a different frame."}
                </div>
                <label className="text-xs text-primary cursor-pointer hover:underline shrink-0">
                  Replace
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleReplaceThumbnail(file);
                    }}
                  />
                </label>
              </div>
            )}
            <div>
              <Label htmlFor="media-alt-text">Alt Text</Label>
              <Input
                id="media-alt-text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe this media for accessibility"
              />
            </div>
            <div>
              <Label htmlFor="media-title">Title</Label>
              <Input
                id="media-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Optional title"
              />
            </div>
            <div>
              <Label htmlFor="media-description">Description</Label>
              <Textarea
                id="media-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={2}
              />
            </div>
            {multiple && (
              <Button type="button" variant="outline" onClick={handleUpload} disabled={!uploadFile || uploading}>
                {uploading ? "Uploading..." : "Upload & Add Another"}
              </Button>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="items-center sm:justify-between">
          {multiple ? (
            <>
              <span className="text-sm text-muted-foreground">
                {selected.length} selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={confirmSelection} disabled={selected.length === 0}>
                  Add {selected.length || ""} selected
                </Button>
              </div>
            </>
          ) : (
            activeTab === "upload" && (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={!uploadFile || uploading}>
                  {uploading ? "Uploading..." : "Upload & Use"}
                </Button>
              </>
            )
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
