import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import StatusToggleCell from "@/components/common/StatusToggleCell";
import SortOrderCell from "@/components/common/SortOrderCell";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import StatusChangeDialogue from "@/components/common/StatusChangeDialogue";
import FooterChangeDialogue from "@/components/common/FooterChangeDialogue";
import { useFooterToggle } from "@/hooks/useFooterToggle";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import FilterField from "@/components/common/FilterField";
import { RotateCcw } from "lucide-react";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { useToast } from "@/hooks/use-toast";
import { useSortOrder } from "@/hooks/useSortOrder";
import { useStatusToggle } from "@/hooks/useStatusToggle";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import {
  fetchServiceList,
  deleteService,
  toggleServiceStatus,
  toggleServiceFooter,
  updateServiceSortOrder,
  ServiceRecord,
  ServiceFilters,
  ApiError,
} from "@/services/services/serviceApi";

const ALL = "all";
const STATUS_OPTIONS = [
  { value: ALL, label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];
const FOOTER_OPTIONS = [
  { value: ALL, label: "All" },
  { value: "yes", label: "In footer" },
  { value: "no", label: "Not in footer" },
];

export default function ServiceList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const { filters: listFilters, setFilter, reset: resetListFilters } = useUrlFilters({
    status: ALL,
    footer: ALL,
  });
  const statusFilter = listFilters.status;
  const footerFilter = listFilters.footer;
  const filters = useMemo<ServiceFilters>(
    () => ({
      status: statusFilter === ALL ? undefined : (statusFilter as ServiceFilters["status"]),
      show_in_footer: footerFilter === ALL ? undefined : footerFilter === "yes",
    }),
    [statusFilter, footerFilter],
  );

  const {
    items: services,
    setItems: setServices,
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
  } = usePaginatedList<ServiceRecord, ServiceFilters>(fetchServiceList, 10, filters);

  const resetAll = () => {
    resetListFilters();
    setSearchInput("");
    setPage(1);
  };


  const handleSortOrderChange = useSortOrder(services, setServices, updateServiceSortOrder);
  const { statusToggleItem, setStatusToggleItem, confirmStatusToggle } = useStatusToggle({
    setItems: setServices,
    refetch,
    toggleStatus: toggleServiceStatus,
    label: "Service",
  });

  const { footerToggleItem, setFooterToggleItem, confirmFooterToggle } = useFooterToggle<ServiceRecord>({
    setItems: setServices,
    toggleFooter: toggleServiceFooter,
    label: "Service",
  });

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      await deleteService(deleteItemId);
      if (services.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({ title: "Success", description: "Service deleted successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to delete service",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const columns: ColumnDef<ServiceRecord>[] = [
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
      accessorKey: "show_in_footer",
      header: "Footer Visibility",
      cell: ({ row }) => (
        <StatusToggleCell
          status={!!row.original.show_in_footer}
          onCheckedChange={(checked) =>
            setFooterToggleItem({ item: row.original, newValue: checked })
          }
        />
      ),
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
            onEdit={() => navigate(`/services/${item.id}/edit`)}
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
        data={services}
        title="Service"
        searchPlaceholder="Search services..."
        onAdd={() => navigate("/services/new")}
        addButtonText="Add Service"
        loading={loading}
        searching={searching}
        searchQuery={searchInput}
        onSearchChange={setSearchInput}
        headerExtra={
          <>
            <FilterField label="Status">
              <Combobox
                maxVisibleItems={3}
                autoWidth
                value={statusFilter}
                options={STATUS_OPTIONS}
                placeholder="All"
                searchPlaceholder="Search status..."
                onChange={(value) => setFilter("status", value || ALL)}
              />
            </FilterField>
            <FilterField label="Footer">
              <Combobox
                maxVisibleItems={3}
                autoWidth
                value={footerFilter}
                options={FOOTER_OPTIONS}
                placeholder="All"
                searchPlaceholder="Search footer..."
                onChange={(value) => setFilter("footer", value || ALL)}
              />
            </FilterField>
            <Button
              variant="outline"
              size="sm"
              onClick={resetAll}
              disabled={statusFilter === ALL && footerFilter === ALL && searchInput === ""}
            >
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
        itemLabel="service"
      />

      <FooterChangeDialogue
        footerToggleItem={footerToggleItem}
        setFooterToggleItem={setFooterToggleItem}
        confirmFooterToggle={confirmFooterToggle}
        itemLabel="service"
      />

      <StatusChangeDialogue
        statusToggleItem={statusToggleItem}
        setStatusToggleItem={setStatusToggleItem}
        confirmStatusToggle={confirmStatusToggle}
        itemLabel="service"
      />
    </>
  );
}
