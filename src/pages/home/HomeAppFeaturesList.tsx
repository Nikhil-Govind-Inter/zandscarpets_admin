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
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  fetchHomeAppFeatures,
  deleteHomeAppFeature,
  HomeAppFeature,
} from "@/services/home/homeAppFeaturesApi";
import { useToast } from "@/hooks/use-toast";

export default function HomeAppFeaturesList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [features, setFeatures] = useState<HomeAppFeature[]>([]);
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

  // Load features when page or debounced search changes
  useEffect(() => {
    loadFeatures();
  }, [currentPage, debouncedSearchQuery]);

  // Track if user is actively searching
  useEffect(() => {
    if (searchQuery !== debouncedSearchQuery) {
      setSearching(true);
    } else {
      setSearching(false);
    }
  }, [searchQuery, debouncedSearchQuery]);

  const loadFeatures = async () => {
    try {
      if (features.length === 0) {
        setLoading(true);
      } else {
        setSearching(true);
      }
      
      const response = await fetchHomeAppFeatures(
        currentPage,
        pageSize,
        debouncedSearchQuery.trim() || undefined
      );
      setFeatures(response.data.list);
      setTotalCount(response.data.pagination.totalCount);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load home app features",
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
      await deleteHomeAppFeature(deleteItemId);
      setFeatures((prev) => prev.filter((item) => item.id !== deleteItemId));
      setTotalCount((prev) => prev - 1);
      toast({
        title: "Success",
        description: "App feature deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete app feature",
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

  const columns: ColumnDef<HomeAppFeature>[] = [
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
        <div>
          {row.original.icon ? (
            <div className="relative w-12 h-12 rounded border overflow-hidden">
              <img
                src={typeof row.original.icon === 'string' ? `${import.meta.env.VITE_URL}/${row.original.icon}` : ''}
                alt={row.original.icon_alt}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded border bg-muted" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <div className="font-medium">{truncateText(row.getValue("title"), 30)}</div>
        </div>
      ),
    },
    {
      accessorKey: "icon_alt",
      header: "Icon Alt Text",
      cell: ({ row }) => (
        <div className="max-w-[150px]">
          <div className="text-sm text-muted-foreground">
            {truncateText(row.getValue("icon_alt"), 25)}
          </div>
        </div>
      ),
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
                onClick={() => navigate(`/home-app-features/edit/${item.id}`)}
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
          Loading app features...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Home App Features</h1>
          <p className="text-muted-foreground">
            Manage app features displayed on the homepage
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={features}
        title=""
        searchPlaceholder="Search app features..."
        onAdd={() => navigate("/home-app-features/create")}
        addButtonText="Add App Feature"
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
              app feature and remove its data from the servers.
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