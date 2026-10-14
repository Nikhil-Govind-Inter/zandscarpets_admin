import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import StatusToggleCell from "@/components/common/StatusToggleCell";
import SortOrderCell from "@/components/common/SortOrderCell";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import StatusChangeDialogue from "@/components/common/StatusChangeDialogue";
import { Combobox } from "@/components/ui/combobox";
import { useToast } from "@/hooks/use-toast";
import { useSortOrder } from "@/hooks/useSortOrder";
import { useStatusToggle } from "@/hooks/useStatusToggle";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import {
  fetchIndustryList,
  deleteIndustry,
  toggleIndustryStatus,
  updateIndustrySortOrder,
  IndustryRecord,
  IndustryFilters,
  ApiError,
} from "@/services/masters/industryApi";

type StatusFilter = "all" | "active" | "inactive";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function IndustryList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const {
    filters: industryFilters,
    setFilter: setIndustryFilter,
    reset: resetIndustryFilters,
  } = useUrlFilters({ status: "all" });

  const statusFilter = industryFilters.status as StatusFilter;

  const filters = useMemo<IndustryFilters>(
    () => ({
      status: statusFilter === "all" ? undefined : statusFilter,
    }),
    [statusFilter],
  );

  const {
    items: industries,
    setItems: setIndustries,
    page,
    setPage,
    limit,
    setLimit,
    searchInput,
    setSearchInput,
    totalCount,
    totalPages,
    loading,
    searching,
    itemsPage,
    itemsLimit,
    refetch,
  } = usePaginatedList<IndustryRecord, IndustryFilters>(fetchIndustryList, 10, filters);

  const hasActiveFilters = statusFilter !== "all" || searchInput !== "";

  const resetAll = () => {
    resetIndustryFilters();
    setSearchInput("");
    setPage(1);
  };

  const handleSortOrderChange = useSortOrder(industries, setIndustries, updateIndustrySortOrder);
  const { statusToggleItem, setStatusToggleItem, confirmStatusToggle } = useStatusToggle({
    setItems: setIndustries,
    refetch,
    toggleStatus: toggleIndustryStatus,
    label: "Industry",
  });

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      await deleteIndustry(deleteItemId);
      if (industries.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({ title: "Success", description: "Industry deleted successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to delete industry",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const columns: ColumnDef<IndustryRecord>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono">
          {(itemsPage - 1) * itemsLimit + row.index + 1}
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "sort_order",
      header: "Sort Order",
      cell: ({ row }) => {
        const item = row.original;
        const sortOrder = row.getValue("sort_order") as number;
        return (
          <SortOrderCell
            sortOrder={sortOrder}
            onIncrement={() => handleSortOrderChange(item, 1)}
            onDecrement={() => handleSortOrderChange(item, -1)}
          />
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("is_active") as boolean;
        return (
          <StatusToggleCell
            status={status}
            onCheckedChange={(checked) =>
              setStatusToggleItem({ item: row.original, newStatus: checked })
            }
          />
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.getValue("createdAt")
            ? new Date(row.getValue("createdAt")).toLocaleDateString()
            : "-"}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <RowActionsMenu
            onEdit={() => navigate(`/industry/${item.id}/edit`)}
            onDelete={() => setDeleteItemId(item.id)}
          />
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={industries}
        title="Industry"
        searchPlaceholder="Search industries..."
        onAdd={() => navigate("/industry/new")}
        addButtonText="Add Industry"
        loading={loading}
        searching={searching}
        searchQuery={searchInput}
        onSearchChange={setSearchInput}
        headerExtra={
          <>
            <Combobox
              maxVisibleItems={3}
              autoWidth
              value={statusFilter}
              options={STATUS_OPTIONS}
              placeholder="All statuses"
              searchPlaceholder="Search status..."
              onChange={(value) => setIndustryFilter("status", value)}
            />
            <Button variant="outline" size="sm" onClick={resetAll} disabled={!hasActiveFilters}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </>
        }
        pagination={{
          currentPage: page,
          totalPages,
          totalCount,
          onPageChange: setPage,
          pageSize: limit,
          onPageSizeChange: (size) => {
            setLimit(size);
            setPage(1);
          },
        }}
      />

      <DeleteDialogue
        deleteItemId={deleteItemId}
        setDeleteItemId={setDeleteItemId}
        confirmDelete={confirmDelete}
      />

      <StatusChangeDialogue
        statusToggleItem={statusToggleItem}
        setStatusToggleItem={setStatusToggleItem}
        confirmStatusToggle={confirmStatusToggle}
        itemLabel="industry"
      />
    </>
  );
}
