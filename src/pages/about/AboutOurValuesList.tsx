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
  fetchAboutOurValues,
  deleteAboutOurValue,
  AboutOurValue,
} from "@/services/about/aboutOurValuesApi";
import { useToast } from "@/hooks/use-toast";

export default function AboutOurValuesList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [values, setValues] = useState<AboutOurValue[]>([]);
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

  // Load values when page or debounced search changes
  useEffect(() => {
    loadValues();
  }, [currentPage, debouncedSearchQuery]);

  // Track if user is actively searching
  useEffect(() => {
    if (searchQuery !== debouncedSearchQuery) {
      setSearching(true);
    } else {
      setSearching(false);
    }
  }, [searchQuery, debouncedSearchQuery]);

  const loadValues = async () => {
    try {
      if (values.length === 0) {
        setLoading(true);
      } else {
        setSearching(true);
      }
      
      const response = await fetchAboutOurValues(
        currentPage,
        pageSize,
        debouncedSearchQuery.trim() || undefined
      );
      setValues(response.data.list);
      setTotalCount(response.data.pagination.totalCount);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load our values",
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
      await deleteAboutOurValue(deleteItemId);
      setValues((prev) => prev.filter((item) => item.id !== deleteItemId));
      setTotalCount((prev) => prev - 1);
      toast({
        title: "Success",
        description: "Value deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete value",
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

  const columns: ColumnDef<AboutOurValue>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.index + 1}</div>
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
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <div className="text-sm text-muted-foreground">
            {truncateText(row.getValue("description"), 60)}
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
                onClick={() => navigate(`/about-our-values/edit/${item.id}`)}
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
          Loading our values...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">About Our Values</h1>
          <p className="text-muted-foreground">
            Manage the core values displayed on the about page
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={values}
        title=""
        searchPlaceholder="Search our values..."
        onAdd={() => navigate("/about-our-values/create")}
        addButtonText="Add Value"
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
              value and remove its data from the servers.
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