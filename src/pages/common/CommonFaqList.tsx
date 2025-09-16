import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { MoreHorizontal, Edit, Trash2, Search, Filter } from "lucide-react";
import {
  fetchCommonFAQList,
  deleteCommonFAQ,
  CommonFAQ,
  PAGE_OPTIONS,
} from "@/services/common/commonFaqApi";
import { useToast } from "@/hooks/use-toast";

export default function CommonFaqList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<CommonFAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [selectedPage, setSelectedPage] = useState<string>("");
  const [pagination, setPagination] = useState({
    totalItems: 0,
    itemsPerPage: 15,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Debounce effect for search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Track searching state
  useEffect(() => {
    if (searchQuery !== debouncedSearchQuery) {
      setSearching(true);
    } else {
      setSearching(false);
    }
  }, [searchQuery, debouncedSearchQuery]);

  // Reset page when debounced search changes
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) return;
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  useEffect(() => {
    loadCommonFAQs();
  }, [currentPage, debouncedSearchQuery, selectedPage]);

  const loadCommonFAQs = async () => {
    try {
      if (faqs.length === 0) {
        setLoading(true);
      } else {
        setSearching(true);
      }
      
      const filterPage = selectedPage && selectedPage !== "all" ? selectedPage : undefined;
      const response = await fetchCommonFAQList(currentPage, 15, debouncedSearchQuery, filterPage);
      
      setFaqs(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setPagination({
        totalItems: response.data.pagination.totalCount,
        itemsPerPage: response.data.pagination.limit,
        hasNextPage: response.data.pagination.currentPage < response.data.pagination.totalPages,
        hasPrevPage: response.data.pagination.currentPage > 1,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load Common FAQs",
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
      await deleteCommonFAQ(deleteItemId);
      setFaqs((prev) => prev.filter((item) => item.id !== deleteItemId));
      toast({
        title: "Success",
        description: "Common FAQ deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete Common FAQ",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handlePageFilter = (value: string) => {
    setSelectedPage(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPageLabel = (pageValue: string) => {
    const page = PAGE_OPTIONS.find(p => p.value === pageValue);
    return page ? page.label : pageValue;
  };

  const columns: ColumnDef<CommonFAQ>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.index + 1}</div>
      ),
    },
    {
      accessorKey: "page",
      header: "Page",
      cell: ({ row }) => {
        const pageValue = row.getValue("page") as string;
        return (
          <Badge variant="outline" className="font-medium">
            {getPageLabel(pageValue)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "question",
      header: "Question",
      cell: ({ row }) => (
        <div className="max-w-[350px]">
          <div className="font-medium text-sm truncate" title={row.getValue("question")}>
            {row.getValue("question")}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "answers",
      header: "Answer",
      enableHiding: true,
      meta: { defaultVisible: false },
      cell: ({ row }) => (
        <div className="max-w-[400px]">
          <div className="text-sm text-muted-foreground truncate" title={row.getValue("answers")}>
            {row.getValue("answers")}
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
                onClick={() => navigate(`/common-faq/${item.id}/edit`)}
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

  if (loading && faqs.length === 0) {
    return <div>Loading Common FAQs...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Common FAQ Management</h1>
            <p className="text-muted-foreground">
              Manage frequently asked questions for different pages
            </p>
          </div>
          <Button onClick={() => navigate("/common-faq/new")}>
            Add Common FAQ
          </Button>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedPage} onValueChange={handlePageFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pages</SelectItem>
                {PAGE_OPTIONS.map((page) => (
                  <SelectItem key={page.value} value={page.value}>
                    {page.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={faqs}
          pagination={{
            pageIndex: currentPage - 1,
            pageSize: pagination.itemsPerPage,
            totalItems: pagination.totalItems,
            pageCount: totalPages,
          }}
          onPaginationChange={(pageIndex) => handlePageChange(pageIndex + 1)}
          loading={loading}
          searching={searching}
        />
      </div>

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
              Common FAQ and remove its data from the servers.
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
    </>
  );
}