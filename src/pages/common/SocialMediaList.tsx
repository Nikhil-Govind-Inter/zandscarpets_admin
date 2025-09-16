import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { MoreHorizontal, Edit, Trash2, ExternalLink } from "lucide-react";
import {
  fetchSocialMediaList,
  deleteSocialMedia,
  toggleSocialMediaStatus,
  SocialMedia,
} from "@/services/common/socialMediaApi";
import { useToast } from "@/hooks/use-toast";

export default function SocialMediaList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [socialMediaItems, setSocialMediaItems] = useState<SocialMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [statusToggleItem, setStatusToggleItem] = useState<{
    id: number;
    newStatus: boolean;
  } | null>(null);

  // Load social media items on component mount
  useEffect(() => {
    loadSocialMediaItems();
  }, []);

  const loadSocialMediaItems = async () => {
    try {
      setLoading(true);
      const response = await fetchSocialMediaList(1, 100); // Load all items
      setSocialMediaItems(response.data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load social media items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmStatusToggle = async () => {
    if (!statusToggleItem) return;

    try {
      const { id } = statusToggleItem;
      await toggleSocialMediaStatus(id);

      setSocialMediaItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: statusToggleItem.newStatus } : item
        )
      );

      toast({
        title: "Success",
        description: "Social media status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update social media status",
        variant: "destructive",
      });
    } finally {
      setStatusToggleItem(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      await deleteSocialMedia(deleteItemId);
      setSocialMediaItems((prev) =>
        prev.filter((item) => item.id !== deleteItemId)
      );
      toast({
        title: "Success",
        description: "Social media item deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete social media item",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const columns: ColumnDef<SocialMedia>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.index + 1}</div>
      ),
    },
    {
      accessorKey: "icon",
      header: "Icon",
      cell: ({ row }) => (
        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
          {row.getValue("icon") ? (
            <img
              src={`${import.meta.env.VITE_URL}/${row.getValue("icon")}`}
              alt={row.original.icon_alt}
              className="w-8 h-8 rounded object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded bg-muted-foreground/20" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium capitalize">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "link",
      header: "Link",
      cell: ({ row }) => {
        const link = row.getValue("link") as string;
        return (
          <div className="flex items-center gap-2">
            <div className="font-mono text-sm text-muted-foreground max-w-[200px] truncate">
              {link}
            </div>
            {link && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(link, "_blank")}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
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
          <div className="flex items-center space-x-2">
            <Switch
              checked={status}
              onCheckedChange={(checked) =>
                setStatusToggleItem({
                  id: row.original.id!,
                  newStatus: checked,
                })
              }
            />
            <Badge variant={status ? "default" : "secondary"}>
              {status ? "active" : "inactive"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {new Date(row.getValue("createdAt")).toLocaleDateString()}
        </div>
      ),
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
                onClick={() => navigate(`/social-media/${item.id}/edit`)}
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

  if (loading) {
    return <div>Loading social media items...</div>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={socialMediaItems}
        title="Social Media"
        searchPlaceholder="Search social media items..."
        onAdd={() => navigate("/social-media/new")}
        addButtonText="Add Social Media"
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
              social media item and remove its data from the servers.
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

      {/* Status Toggle Confirmation Dialog */}
      <AlertDialog
        open={!!statusToggleItem}
        onOpenChange={() => setStatusToggleItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              {statusToggleItem?.newStatus ? "activate" : "deactivate"} this
              social media item? This will change its visibility and availability in the
              system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusToggle}>
              {statusToggleItem?.newStatus ? "Activate" : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}