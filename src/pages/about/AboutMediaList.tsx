import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Edit, Trash2, Image, Video, Monitor, Smartphone } from "lucide-react";
import {
  fetchAboutMedia,
  deleteAboutMediaItem,
  AboutMediaItem,
} from "@/services/about/aboutMediaApi";
import { useToast } from "@/hooks/use-toast";

export default function AboutMediaList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mediaItems, setMediaItems] = useState<AboutMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const pageSize = 10;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when debounced search query changes
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) return;
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  // Load media items when page or debounced search changes
  useEffect(() => {
    loadMediaItems();
  }, [currentPage, debouncedSearchQuery]);

  // Track if user is actively searching
  useEffect(() => {
    if (searchQuery !== debouncedSearchQuery) {
      setSearching(true);
    } else {
      setSearching(false);
    }
  }, [searchQuery, debouncedSearchQuery]);

  const loadMediaItems = async () => {
    try {
      if (mediaItems.length === 0) {
        setLoading(true);
      } else {
        setSearching(true);
      }
      
      const response = await fetchAboutMedia(
        currentPage,
        pageSize,
        debouncedSearchQuery.trim() || undefined
      );
      setMediaItems(response.data.list);
      setTotalCount(response.data.pagination.totalCount);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load media items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      await deleteAboutMediaItem(deleteItemId);
      setMediaItems((prev) => prev.filter((item) => item.id !== deleteItemId));
      setTotalCount((prev) => prev - 1);
      toast({
        title: "Success",
        description: "Media item deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete media item",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const MediaPreview = ({ src, alt, type }: { src: string; alt: string; type: "image" | "video" }) => {
    if (!src) {
      return <div className="text-center text-muted-foreground text-xs">No media</div>;
    }

    return (
      <div className="flex items-center justify-center">
        {type === "video" ? (
          <video
            src={`http://localhost:3000/${src}`}
            className="w-12 h-12 object-cover rounded-md border"
            muted
          />
        ) : (
          <img
            src={`http://localhost:3000/${src}`}
            alt={alt || "Media"}
            className="w-12 h-12 object-cover rounded-md border"
          />
        )}
      </div>
    );
  };

  const columns: ColumnDef<AboutMediaItem>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.index + 1}</div>
      ),
    },
    {
      accessorKey: "thumbnail",
      header: "Thumbnail",
      cell: ({ row }) => {
        const thumbnail = row.getValue("thumbnail") as string;
        const thumbnailAlt = row.original.thumbnail_alt;
        return (
          <MediaPreview 
            src={thumbnail} 
            alt={thumbnailAlt} 
            type="image" 
          />
        );
      },
    },
    {
      accessorKey: "media_type",
      header: "Type",
      cell: ({ row }) => {
        const mediaType = row.getValue("media_type") as string;
        return (
          <div className="flex items-center gap-2">
            {mediaType === "video" ? (
              <Video className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Image className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="capitalize">{mediaType}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "media_desktop_path",
      header: "Desktop",
      cell: ({ row }) => {
        const desktopPath = row.getValue("media_desktop_path") as string;
        const mediaAlt = row.original.media_alt;
        const mediaType = row.original.media_type;
        return (
          <div className="flex items-center gap-2">
            <Monitor className="h-3 w-3 text-muted-foreground" />
            <MediaPreview 
              src={desktopPath} 
              alt={mediaAlt} 
              type={mediaType} 
            />
          </div>
        );
      },
    },
    {
      accessorKey: "media_mobile_path",
      header: "Mobile",
      cell: ({ row }) => {
        const mobilePath = row.getValue("media_mobile_path") as string;
        const mediaAlt = row.original.media_alt;
        const mediaType = row.original.media_type;
        return (
          <div className="flex items-center gap-2">
            <Smartphone className="h-3 w-3 text-muted-foreground" />
            <MediaPreview 
              src={mobilePath} 
              alt={mediaAlt} 
              type={mediaType} 
            />
          </div>
        );
      },
    },
    {
      accessorKey: "thumbnail_alt",
      header: "Alt Text",
      cell: ({ row }) => {
        const thumbnailAlt = row.getValue("thumbnail_alt") as string;
        const mediaAlt = row.original.media_alt;
        const displayAlt = thumbnailAlt || mediaAlt || "";
        return (
          <div className="max-w-[150px]">
            <div className="text-sm text-muted-foreground">
              {displayAlt ? truncateText(displayAlt, 30) : "-"}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "sort_order",
      header: "Sort Order",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("sort_order")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as boolean;
        return (
          <Badge variant={status ? "default" : "secondary"}>
            {status ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        return date ? (
          <div className="text-sm text-muted-foreground">
            {formatDate(date)}
          </div>
        ) : (
          "-"
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigate(`/about-media/edit/${item.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeleteItemId(item.id!)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (loading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">
          Loading media items...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">About Media</h1>
          <p className="text-muted-foreground">
            Manage media content for the about page including images and videos
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={mediaItems}
        title=""
        searchPlaceholder="Search media items..."
        onAdd={() => navigate("/about-media/create")}
        addButtonText="Add Media"
        loading={loading}
        searching={searching}
        pagination={{
          pageSize,
          currentPage,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
          onPageChange: setCurrentPage,
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteItemId}
        onOpenChange={() => setDeleteItemId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              media item and remove its data from the servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}