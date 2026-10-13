import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, X, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { captureVideoThumbnail } from "@/utils/videoThumbnail";
import {
  uploadMedia,
  kindFromMimetype,
  maxSizeForKind,
  formatMb,
  MAX_BULK_UPLOAD_COUNT,
  MediaKind,
  ApiError,
} from "@/services/details/mediaApi";

type StagedStatus = "pending" | "uploading" | "done" | "failed";

interface StagedFile {
  id: string;
  file: File;
  kind: MediaKind | null;
  preview: string;
  altText: string;
  thumbnail: File | null;
  thumbnailPreview: string | null;
  generatingThumbnail: boolean;
  status: StagedStatus;
  error?: string;
}

const CONCURRENCY = 3;

// Uploads up to MAX_BULK_UPLOAD_COUNT files in one go. This is purely
// client-side orchestration of the existing single-file upload endpoint —
// each staged file (with its own auto-generated or manual thumbnail, for
// videos) becomes its own POST /details/media call; a few run at a time.
async function runWithConcurrency<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
  let index = 0;
  const next = async (): Promise<void> => {
    const i = index++;
    if (i >= items.length) return;
    await worker(items[i]);
    return next();
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, next));
}

interface BulkMediaUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => void;
}

export default function BulkMediaUploadDialog({ open, onOpenChange, onUploaded }: BulkMediaUploadDialogProps) {
  const { toast } = useToast();
  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const reset = () => {
    staged.forEach((s) => {
      URL.revokeObjectURL(s.preview);
      if (s.thumbnailPreview) URL.revokeObjectURL(s.thumbnailPreview);
    });
    setStaged([]);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen && !uploading) reset();
    onOpenChange(nextOpen);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setStaged((prev) => {
      const room = MAX_BULK_UPLOAD_COUNT - prev.length;
      if (room <= 0) {
        toast({
          title: "Limit reached",
          description: `You can only stage up to ${MAX_BULK_UPLOAD_COUNT} files at once`,
          variant: "destructive",
        });
        return prev;
      }
      const toAdd = acceptedFiles.slice(0, room);
      if (acceptedFiles.length > toAdd.length) {
        toast({
          title: "Some files were skipped",
          description: `Only ${toAdd.length} of ${acceptedFiles.length} fit the ${MAX_BULK_UPLOAD_COUNT}-file limit`,
        });
      }

      const next: StagedFile[] = toAdd.map((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file,
        kind: kindFromMimetype(file.type),
        preview: URL.createObjectURL(file),
        altText: "",
        thumbnail: null,
        thumbnailPreview: null,
        generatingThumbnail: false,
        status: "pending",
      }));

      // Auto-generate a thumbnail for each video, as soon as it's staged.
      next
        .filter((s) => s.kind === "video")
        .forEach((s) => {
          setStaged((current) => current.map((c) => (c.id === s.id ? { ...c, generatingThumbnail: true } : c)));
          captureVideoThumbnail(s.file)
            .then((thumb) => {
              setStaged((current) =>
                current.map((c) =>
                  c.id === s.id
                    ? { ...c, thumbnail: thumb, thumbnailPreview: URL.createObjectURL(thumb), generatingThumbnail: false }
                    : c,
                ),
              );
            })
            .catch(() => {
              setStaged((current) => current.map((c) => (c.id === s.id ? { ...c, generatingThumbnail: false } : c)));
            });
        });

      return [...prev, ...next];
    });
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "video/*": [] },
    multiple: true,
    maxFiles: MAX_BULK_UPLOAD_COUNT,
  });

  const removeStaged = (id: string) => {
    setStaged((prev) => {
      const target = prev.find((s) => s.id === id);
      if (target) {
        URL.revokeObjectURL(target.preview);
        if (target.thumbnailPreview) URL.revokeObjectURL(target.thumbnailPreview);
      }
      return prev.filter((s) => s.id !== id);
    });
  };

  const replaceThumbnail = (id: string, file: File) => {
    setStaged((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        if (s.thumbnailPreview) URL.revokeObjectURL(s.thumbnailPreview);
        return { ...s, thumbnail: file, thumbnailPreview: URL.createObjectURL(file) };
      }),
    );
  };

  const setAltText = (id: string, altText: string) =>
    setStaged((prev) => prev.map((s) => (s.id === id ? { ...s, altText } : s)));

  const isOversized = (s: StagedFile) => s.kind !== null && s.file.size > maxSizeForKind(s.kind);
  const isUploadable = (s: StagedFile) => s.kind !== null && !isOversized(s) && s.status !== "done";

  const handleUploadAll = async () => {
    setUploading(true);
    const targets = staged.filter(isUploadable);

    await runWithConcurrency(targets, CONCURRENCY, async (target) => {
      setStaged((prev) => prev.map((s) => (s.id === target.id ? { ...s, status: "uploading" } : s)));
      try {
        await uploadMedia(target.file, target.altText || undefined, target.thumbnail);
        setStaged((prev) => prev.map((s) => (s.id === target.id ? { ...s, status: "done" } : s)));
      } catch (error) {
        setStaged((prev) =>
          prev.map((s) =>
            s.id === target.id
              ? { ...s, status: "failed", error: error instanceof ApiError ? error.message : "Upload failed" }
              : s,
          ),
        );
      }
    });

    setUploading(false);
    onUploaded();

    setStaged((prev) => {
      const failedCount = prev.filter((s) => s.status === "failed").length;
      const succeededCount = prev.filter((s) => s.status === "done").length;
      toast({
        title: failedCount ? "Upload finished with errors" : "Success",
        description: `${succeededCount} uploaded${failedCount ? `, ${failedCount} failed` : ""}`,
        variant: failedCount ? "destructive" : undefined,
      });
      // Keep failed files staged so the admin can retry/remove them; drop
      // the ones that succeeded.
      return prev.filter((s) => s.status !== "done");
    });
  };

  const stageable = staged.length < MAX_BULK_UPLOAD_COUNT;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
          <DialogDescription>
            Up to {MAX_BULK_UPLOAD_COUNT} files at once. Images up to {formatMb(maxSizeForKind("image"))}, videos up
            to {formatMb(maxSizeForKind("video"))}. Video thumbnails are captured automatically — replace one if you
            want a different frame.
          </DialogDescription>
        </DialogHeader>

        {stageable && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {isDragActive ? "Drop the files here..." : "Drop images/videos here or click to browse"}
            </p>
          </div>
        )}

        {staged.length > 0 && (
          <ScrollArea className="h-80 rounded-md border p-3">
            <div className="space-y-3">
              {staged.map((s) => {
                const oversized = isOversized(s);
                return (
                  <div key={s.id} className="flex items-center gap-3 rounded-md border p-2">
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                      {s.kind === "video" ? (
                        <video src={s.preview} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={s.preview} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>

                    {s.kind === "video" && (
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-muted border flex items-center justify-center">
                          {s.generatingThumbnail ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : s.thumbnailPreview ? (
                            <img src={s.thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] text-muted-foreground px-1 text-center">No thumb</span>
                          )}
                        </div>
                        <label className="text-xs text-primary cursor-pointer hover:underline">
                          Replace
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) replaceThumbnail(s.id, file);
                            }}
                          />
                        </label>
                      </div>
                    )}

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm truncate">{s.file.name}</span>
                        {s.kind && <Badge variant="outline" className="capitalize text-xs">{s.kind}</Badge>}
                        {!s.kind && <Badge variant="destructive" className="text-xs">Unsupported type</Badge>}
                      </div>
                      {oversized && s.kind && (
                        <p className="text-xs text-destructive">
                          Too large — {s.kind} files must be {formatMb(maxSizeForKind(s.kind))} or smaller
                        </p>
                      )}
                      {s.error && <p className="text-xs text-destructive">{s.error}</p>}
                      <Input
                        value={s.altText}
                        onChange={(e) => setAltText(s.id, e.target.value)}
                        placeholder="Alt text (optional)"
                        className="h-7 text-xs"
                        disabled={s.status === "uploading" || s.status === "done"}
                      />
                    </div>

                    <div className="shrink-0">
                      {s.status === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      {s.status === "done" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                      {s.status === "failed" && <XCircle className="h-4 w-4 text-destructive" />}
                      {s.status === "pending" && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeStaged(s.id)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={uploading}>
            Close
          </Button>
          <Button
            onClick={handleUploadAll}
            disabled={uploading || staged.filter(isUploadable).length === 0}
          >
            {uploading ? "Uploading..." : `Upload All (${staged.filter(isUploadable).length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
