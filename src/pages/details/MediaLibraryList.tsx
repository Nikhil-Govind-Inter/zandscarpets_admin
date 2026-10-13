import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { resolveImageUrl } from "@/lib/resolveImageUrl";
import { useToast } from "@/hooks/use-toast";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import BulkMediaUploadDialog from "@/components/details/BulkMediaUploadDialog";
import {
  fetchMediaList,
  deleteMedia,
  updateMediaAltText,
  MediaRecord,
  MediaKind,
  ApiError,
} from "@/services/details/mediaApi";

const ALL = "all";
type KindFilter = MediaKind | typeof ALL;

const isKind = (value: string): value is MediaKind => value === "image" || value === "video";

// A stable module-level reference (not an inline arrow inside the
// component) — usePaginatedList's internal `load` callback depends on this
// function's identity, so a fresh arrow on every render would re-trigger
// its fetch effect on every render too.
const fetchMedia = (page: number, limit: number, search?: string, filters?: { kind?: MediaKind }) =>
  fetchMediaList(page, limit, search, filters?.kind);

// Standalone management page for the central media library behind
// image/video detail items: browse, bulk-upload, edit alt text, delete.
export default function MediaLibraryList() {
  const { toast } = useToast();
  const [kindFilter, setKindFilter] = useState<KindFilter>(ALL);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [altEditor, setAltEditor] = useState<MediaRecord | null>(null);
  const [altValue, setAltValue] = useState("");

  const filters = useMemo(() => (kindFilter === ALL ? undefined : { kind: kindFilter }), [kindFilter]);
  const {
    items,
    setItems,
    page,
    setPage,
    totalCount,
    totalPages,
    loading,
    refetch,
  } = usePaginatedList<MediaRecord, { kind?: MediaKind }>(fetchMedia, 24, filters);

  const confirmDelete = async () => {
    if (!deleteItemId) return;
    try {
      await deleteMedia(deleteItemId);
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({ title: "Success", description: "Media deleted successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to delete media",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const openAltEditor = (media: MediaRecord) => {
    setAltEditor(media);
    setAltValue(media.alt_text || "");
  };

  const saveAltText = async () => {
    if (!altEditor) return;
    try {
      const { data } = await updateMediaAltText(altEditor.id, altValue);
      setItems((prev) => prev.map((m) => (m.id === data.id ? data : m)));
      toast({ title: "Success", description: "Alt text updated" });
      setAltEditor(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to update alt text",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">
            Images and videos available to attach to product/variant detail content
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Upload Media
        </Button>
      </div>

      <Combobox
        maxVisibleItems={3}
        autoWidth
        value={kindFilter}
        options={[
          { value: ALL, label: "All types" },
          { value: "image", label: "Images" },
          { value: "video", label: "Videos" },
        ]}
        placeholder="All types"
        searchPlaceholder="Search type..."
        onChange={(v) => {
          setKindFilter(isKind(v) ? v : ALL);
          setPage(1);
        }}
      />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-md" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No media uploaded yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((media) => (
            <div key={media.id} className="group relative">
              <div className="aspect-square rounded-md border overflow-hidden bg-muted">
                {media.kind === "image" ? (
                  <img
                    src={resolveImageUrl(media.location) || undefined}
                    alt={media.alt_text || ""}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={resolveImageUrl(media.location) || undefined}
                    poster={resolveImageUrl(media.thumbnail_location) || undefined}
                    className="w-full h-full object-cover"
                    muted
                  />
                )}
              </div>
              <Badge variant="secondary" className="absolute top-1 left-1 capitalize text-xs">
                {media.kind}
              </Badge>
              <div className="absolute inset-x-0 bottom-0 hidden group-hover:flex justify-end gap-1 p-1 bg-gradient-to-t from-background/90 to-transparent">
                <Button variant="secondary" size="icon" className="h-7 w-7" onClick={() => openAltEditor(media)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setDeleteItemId(media.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page <= 1}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({totalCount} total)
          </span>
          <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      <BulkMediaUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={() => {
          setPage(1);
          refetch();
        }}
      />

      <DeleteDialogue
        deleteItemId={deleteItemId}
        setDeleteItemId={setDeleteItemId}
        confirmDelete={confirmDelete}
        itemLabel="Media"
      />

      <Dialog open={Boolean(altEditor)} onOpenChange={(open) => !open && setAltEditor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Alt Text</DialogTitle>
          </DialogHeader>
          <div>
            <Label htmlFor="media-alt-edit">Alt Text</Label>
            <Input
              id="media-alt-edit"
              value={altValue}
              onChange={(e) => setAltValue(e.target.value)}
              placeholder="Describe this media for accessibility"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAltEditor(null)}>
              Cancel
            </Button>
            <Button onClick={saveAltText}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
