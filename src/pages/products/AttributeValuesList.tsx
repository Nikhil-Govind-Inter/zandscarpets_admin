import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import { Combobox } from "@/components/ui/combobox";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import StatusToggleCell from "@/components/common/StatusToggleCell";
import SortOrderCell from "@/components/common/SortOrderCell";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import StatusChangeDialogue from "@/components/common/StatusChangeDialogue";
import MediaThumbnail from "@/components/common/MediaThumbnail";
import { useToast } from "@/hooks/use-toast";
import { useSortOrder } from "@/hooks/useSortOrder";
import { useStatusToggle } from "@/hooks/useStatusToggle";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import {
  fetchAttributeValueList,
  deleteAttributeValue,
  toggleAttributeValueStatus,
  updateAttributeValueSortOrder,
  AttributeValueRecord,
  AttributeValueFilters,
  ApiError,
} from "@/services/products/attributeValuesApi";
import { fetchActiveAttributes, AttributeOption } from "@/services/products/attributesApi";

export default function AttributeValuesList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const initialAttributeId = searchParams.get("attribute_id");

  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [attributeFilter, setAttributeFilter] = useState<string>(
    initialAttributeId || "all",
  );
  const [attributeOptions, setAttributeOptions] = useState<AttributeOption[]>([]);

  useEffect(() => {
    fetchActiveAttributes()
      .then((res) => setAttributeOptions(res.data))
      .catch(() => setAttributeOptions([]));
  }, []);

  const filters = useMemo<AttributeValueFilters>(
    () => ({
      attribute_id:
        attributeFilter === "all" || !attributeFilter
          ? undefined
          : Number(attributeFilter),
    }),
    [attributeFilter],
  );

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
  } = usePaginatedList<AttributeValueRecord, AttributeValueFilters>(
    fetchAttributeValueList,
    10,
    filters,
  );

  const handleSortOrderChange = useSortOrder(
    items,
    setItems,
    updateAttributeValueSortOrder,
  );
  const { statusToggleItem, setStatusToggleItem, confirmStatusToggle } = useStatusToggle({
    setItems,
    refetch,
    toggleStatus: toggleAttributeValueStatus,
    label: "Attribute Value",
  });

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      await deleteAttributeValue(deleteItemId);
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({ title: "Success", description: "Attribute value deleted successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError
            ? error.message
            : "Failed to delete Attribute value",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const addPath =
    attributeFilter === "all" || !attributeFilter
      ? "/attribute-values/new"
      : `/attribute-values/new?attribute_id=${attributeFilter}`;

  const columns: ColumnDef<AttributeValueRecord>[] = [
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
      accessorKey: "media_path",
      header: "Media",
      cell: ({ row }) => (
        <MediaThumbnail
          path={row.original.media_path}
          alt={row.original.value || "Attribute value"}
        />
      ),
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => (
        <div className="font-medium max-w-[280px] truncate">
          {row.getValue("value") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "value_ar",
      header: "Value (Arabic)",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground max-w-[280px] truncate" dir="rtl">
          {row.getValue("value_ar") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <div className="font-mono text-sm text-muted-foreground">
          {row.getValue("slug") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "color_code",
      header: "Color",
      cell: ({ row }) => {
        const color = row.getValue("color_code") as string | null;
        return color ? (
          <div className="flex items-center gap-2">
            <span
              className="h-4 w-4 rounded-full border"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono text-sm">{color}</span>
          </div>
        ) : (
          "-"
        );
      },
    },
    {
      accessorKey: "attribute",
      header: "Attribute",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground max-w-[200px] truncate">
          {row.original.attribute?.title || `#${row.original.attribute_id}`}
        </div>
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
            onEdit={() => navigate(`/attribute-values/${item.id}/edit`)}
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
        data={items}
        title="Attribute Values"
        searchPlaceholder="Search Attribute Values..."
        onAdd={() => navigate(addPath)}
        addButtonText="Add Value"
        loading={loading}
        searching={searching}
        searchQuery={searchInput}
        onSearchChange={setSearchInput}
        headerExtra={
          <Combobox
            maxVisibleItems={5}
            autoWidth
            value={attributeFilter}
            options={[
              { value: "all", label: "All attributes" },
              ...attributeOptions.map((o) => ({
                value: String(o.id),
                label: o.title,
              })),
            ]}
            placeholder="All attributes"
            searchPlaceholder="Search attribute..."
            onChange={(value) => setAttributeFilter(value as string)}
          />
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
        itemLabel="Attribute value"
      />

      <StatusChangeDialogue
        statusToggleItem={statusToggleItem}
        setStatusToggleItem={setStatusToggleItem}
        confirmStatusToggle={confirmStatusToggle}
        itemLabel="Attribute value"
      />
    </>
  );
}