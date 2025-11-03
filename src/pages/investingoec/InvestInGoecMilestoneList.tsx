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
import { MoreHorizontal, Edit, Trash2, Target, Hash } from "lucide-react";
import {
  fetchInvestInGoecMilestone,
  deleteInvestInGoecMilestoneItem,
  InvestInGoecMilestoneItem,
} from "@/services/investingoec/investInGoecMilestoneApi";
import { useToast } from "@/hooks/use-toast";

export default function InvestInGoecMilestoneList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [milestoneItems, setMilestoneItems] = useState<InvestInGoecMilestoneItem[]>([]);
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

  // Load milestone items when page or debounced search changes
  useEffect(() => {
    loadMilestoneItems();
  }, [currentPage, debouncedSearchQuery]);

  // Track if user is actively searching
  useEffect(() => {
    if (searchQuery !== debouncedSearchQuery) {
      setSearching(true);
    } else {
      setSearching(false);
    }
  }, [searchQuery, debouncedSearchQuery]);

  const loadMilestoneItems = async () => {
    try {
      if (milestoneItems.length === 0) {
        setLoading(true);
      } else {
        setSearching(true);
      }
      
      const response = await fetchInvestInGoecMilestone(
        currentPage,
        pageSize,
        debouncedSearchQuery.trim() || undefined
      );
      setMilestoneItems(response.data.list);
      setTotalCount(response.data.pagination.totalCount);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load milestone items",
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
      await deleteInvestInGoecMilestoneItem(deleteItemId);
      setMilestoneItems((prev) => prev.filter((item) => item.id !== deleteItemId));
      setTotalCount((prev) => prev - 1);
      toast({
        title: "Success",
        description: "Milestone deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete milestone",
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

  const formatMilestoneDisplay = (item: InvestInGoecMilestoneItem) => {
    const prefix = item.prefix || "";
    const value = item.value.toLocaleString();
    return `${prefix}${value}`;
  };

  const columns: ColumnDef<InvestInGoecMilestoneItem>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.index + 1}</div>
      ),
    },
    {
      accessorKey: "value",
      header: "Milestone",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col">
            <div className="font-bold text-lg text-primary flex items-center gap-1">
              <Hash className="h-4 w-4" />
              {formatMilestoneDisplay(item)}
            </div>
            <div className="text-sm text-muted-foreground">{item.subtitle}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "prefix",
      header: "Prefix",
      cell: ({ row }) => {
        const prefix = row.getValue("prefix") as string;
        return prefix ? (
          <Badge variant="outline" className="font-mono">
            {prefix}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "subtitle",
      header: "Subtitle",
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <div className="font-medium">{row.getValue("subtitle")}</div>
        </div>
      ),
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => {
        const value = row.getValue("value") as number;
        return (
          <div className="font-mono text-right">
            {value.toLocaleString()}
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
                onClick={() => navigate(`/invest-in-goec-milestone/edit/${item.id}`)}
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
          Loading milestone items...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6" />
            Invest in GO EC - Milestones
          </h1>
          <p className="text-muted-foreground">
            Manage milestone counters and achievement numbers for the investment page
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={milestoneItems}
        title=""
        searchPlaceholder="Search milestones..."
        onAdd={() => navigate("/invest-in-goec-milestone/create")}
        addButtonText="Add Milestone"
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
              milestone and remove its data from the servers.
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