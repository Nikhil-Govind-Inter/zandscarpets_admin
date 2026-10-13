import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import StatusToggleCell from "@/components/common/StatusToggleCell";
import SortOrderCell from "@/components/common/SortOrderCell";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import StatusChangeDialogue from "@/components/common/StatusChangeDialogue";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSortOrder } from "@/hooks/useSortOrder";
import { useStatusToggle } from "@/hooks/useStatusToggle";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import {
  fetchDetailFieldList,
  deleteDetailField,
  toggleDetailFieldStatus,
  updateDetailFieldSortOrder,
  DetailFieldRecord,
  DetailFieldType,
  ApiError,
} from "@/services/details/detailFieldsApi";

const TYPE_LABELS: Record<DetailFieldType, string> = {
  rich_text: "Rich Text",
  image: "Image",
  video: "Video",
};

// Master list of content-block types (Description, Installation Guide,
// Gallery, Demo Videos, ...) that products/variants can map content onto.
export default function DetailFieldsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

  const {
    items,
    setItems,
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
  } = usePaginatedList<DetailFieldRecord>(fetchDetailFieldList, 10);

  const handleSortOrderChange = useSortOrder(items, setItems, updateDetailFieldSortOrder);
  const { statusToggleItem, setStatusToggleItem, confirmStatusToggle } = useStatusToggle({
    setItems,
    refetch,
    toggleStatus: toggleDetailFieldStatus,
    label: "Detail Field",
  });

  const confirmDelete = async () => {
    if (!deleteItemId) return;
    try {
      await deleteDetailField(deleteItemId);
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({ title: "Success", description: "Detail field deleted successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to delete detail field",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const columns: ColumnDef<DetailFieldRecord>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono">{(itemsPage - 1) * itemsLimit + row.index + 1}</div>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <Badge variant="secondary">{TYPE_LABELS[row.original.type]}</Badge>,
    },
    {
      accessorKey: "allows_multiple",
      header: "Multiple Items",
      cell: ({ row }) => (
        <Badge variant={row.original.allows_multiple ? "default" : "outline"}>
          {row.original.allows_multiple ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      accessorKey: "sort_order",
      header: "Sort Order",
      cell: ({ row }) => (
        <SortOrderCell
          sortOrder={row.original.sort_order}
          onIncrement={() => handleSortOrderChange(row.original, 1)}
          onDecrement={() => handleSortOrderChange(row.original, -1)}
        />
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <StatusToggleCell
          status={row.getValue("is_active") as boolean}
          onCheckedChange={(checked) =>
            setStatusToggleItem({ item: row.original, newStatus: checked })
          }
        />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <RowActionsMenu
          onEdit={() => navigate(`/details/fields/${row.original.id}/edit`)}
          onDelete={() => setDeleteItemId(row.original.id)}
        />
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={items}
        title="Detail Fields"
        searchPlaceholder="Search fields..."
        onAdd={() => navigate("/details/fields/new")}
        addButtonText="Add Field"
        loading={loading}
        searching={searching}
        searchQuery={searchInput}
        onSearchChange={setSearchInput}
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
        itemLabel="Detail Field"
      />

      <StatusChangeDialogue
        statusToggleItem={statusToggleItem}
        setStatusToggleItem={setStatusToggleItem}
        confirmStatusToggle={confirmStatusToggle}
        itemLabel="Detail Field"
      />
    </>
  );
}
