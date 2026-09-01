import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import MediaThumbnail from "@/components/common/MediaThumbnail";
import SortOrderCell from "@/components/common/SortOrderCell";
import StatusToggleCell from "@/components/common/StatusToggleCell";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import {
  fetchCoreValuesList,
  deleteCoreValues,
  toggleCoreValuesStatus,
  updateCoreValuesSortOrder,
  CoreValuesRecord,
  ApiError,
} from "@/services/about/coreValuesApi";
import { useToast } from "@/hooks/use-toast";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import StatusChangeDialogue from "@/components/common/StatusChangeDialogue";

export default function CoreValuesList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    items: coreValues,
    setItems: setCoreValues,
    page,
    setPage,
    limit,
    setLimit,
    itemsPage,
    itemsLimit,
    searchInput,
    setSearchInput,
    totalCount,
    totalPages,
    loading,
    searching,
    refetch,
  } = usePaginatedList<CoreValuesRecord>(fetchCoreValuesList);

  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [statusToggleItem, setStatusToggleItem] = useState<{
    item: CoreValuesRecord;
    newStatus: boolean;
  } | null>(null);

  const coreValuesRef = useRef<CoreValuesRecord[]>(coreValues);
  useEffect(() => {
    coreValuesRef.current = coreValues;
  }, [coreValues]);

  const sortOrderTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const sortOrderOriginal = useRef<Record<number, number>>({});

  useEffect(() => {
    const timers = sortOrderTimers.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  const confirmStatusToggle = async () => {
    if (!statusToggleItem) return;

    try {
      const { item, newStatus } = statusToggleItem;
      await toggleCoreValuesStatus(item, newStatus);

      setCoreValues((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_active: newStatus } : i)),
      );
      refetch();

      toast({
        title: "Success",
        description: "Core value status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to update core value status",
        variant: "destructive",
      });
    } finally {
      setStatusToggleItem(null);
    }
  };

  const SORT_ORDER_COMMIT_DELAY = 600;

  const handleSortOrderChange = (item: CoreValuesRecord, delta: number) => {
    const newSortOrder = Math.max(1, (item.sort_order ?? 1) + delta);
    if (newSortOrder === item.sort_order) return;

    if (!sortOrderTimers.current[item.id]) {
      sortOrderOriginal.current[item.id] = item.sort_order ?? 1;
    }

    setCoreValues((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, sort_order: newSortOrder } : i)),
    );

    clearTimeout(sortOrderTimers.current[item.id]);
    sortOrderTimers.current[item.id] = setTimeout(() => {
      delete sortOrderTimers.current[item.id];
      handleSortOrder(item.id);
    }, SORT_ORDER_COMMIT_DELAY);
  };

  const handleSortOrder = async (itemId: number) => {
    const latestItem = coreValuesRef.current.find((i) => i.id === itemId);
    if (!latestItem) return;

    const finalSortOrder = latestItem.sort_order ?? 1;
    const originalSortOrder = sortOrderOriginal.current[itemId];
    delete sortOrderOriginal.current[itemId];

    if (finalSortOrder === originalSortOrder) return;

    try {
      await updateCoreValuesSortOrder(latestItem, finalSortOrder);
      toast({ title: "Success", description: "Sort order updated successfully" });
    } catch (error) {
      setCoreValues((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, sort_order: originalSortOrder } : i)),
      );
      toast({
        title: "Error",
        description: "Failed to update sort order",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      await deleteCoreValues(deleteItemId);
      if (coreValues.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({
        title: "Success",
        description: "Core value deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to delete core value",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const columns: ColumnDef<CoreValuesRecord>[] = [
    {
      id: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {(itemsPage - 1) * itemsLimit + row.index + 1}
        </div>
      ),
    },
    {
      accessorKey: "media_path",
      header: "Media",
      cell: ({ row }) => (
        <MediaThumbnail path={row.getValue("media_path")} alt={row.original.media_alt} />
      ),
    },
    {
      accessorKey: "media_alt",
      header: "Media Alt",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("media_alt") || "-"}</div>
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
            onEdit={() => navigate(`/about-core-values/${item.id}/edit`)}
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
        data={coreValues}
        title="Core Values"
        searchPlaceholder="Search core values..."
        onAdd={() => navigate("/about-core-values/new")}
        addButtonText="Add Core Value"
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
        itemLabel="core value"
      />

      <StatusChangeDialogue
        statusToggleItem={statusToggleItem}
        setStatusToggleItem={setStatusToggleItem}
        confirmStatusToggle={confirmStatusToggle}
        itemLabel="core value"
      />
    </>
  );
}
