import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import StatusToggleCell from "@/components/common/StatusToggleCell";
import SortOrderCell from "@/components/common/SortOrderCell";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import StatusChangeDialogue from "@/components/common/StatusChangeDialogue";
import { useToast } from "@/hooks/use-toast";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import {
  fetchMaterialsList,
  deleteMaterial,
  toggleMaterialStatus,
  updateMaterialSortOrder,
  MaterialRecord,
  ApiError,
} from "@/services/masters/materialsApi";

export default function MaterialsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [statusToggleItem, setStatusToggleItem] = useState<{
    item: MaterialRecord;
    newStatus: boolean;
  } | null>(null);

  const {
    items: materials,
    setItems: setMaterials,
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
  } = usePaginatedList<MaterialRecord>(fetchMaterialsList);

  const materialsRef = useRef<MaterialRecord[]>(materials);
  useEffect(() => {
    materialsRef.current = materials;
  }, [materials]);

  const sortOrderTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const sortOrderOriginal = useRef<Record<number, number>>({});

  useEffect(() => {
    const timers = sortOrderTimers.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  const SORT_ORDER_COMMIT_DELAY = 600;

  const handleSortOrderChange = (item: MaterialRecord, delta: number) => {
    const newSortOrder = Math.max(1, (item.sort_order ?? 1) + delta);
    if (newSortOrder === item.sort_order) return;

    if (!sortOrderTimers.current[item.id]) {
      sortOrderOriginal.current[item.id] = item.sort_order ?? 1;
    }

    setMaterials((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, sort_order: newSortOrder } : i)),
    );

    clearTimeout(sortOrderTimers.current[item.id]);
    sortOrderTimers.current[item.id] = setTimeout(() => {
      delete sortOrderTimers.current[item.id];
      handleSortOrder(item.id);
    }, SORT_ORDER_COMMIT_DELAY);
  };

  const handleSortOrder = async (itemId: number) => {
    const latestItem = materialsRef.current.find((i) => i.id === itemId);
    if (!latestItem) return;

    const finalSortOrder = latestItem.sort_order ?? 1;
    const originalSortOrder = sortOrderOriginal.current[itemId];
    delete sortOrderOriginal.current[itemId];

    if (finalSortOrder === originalSortOrder) return;

    try {
      await updateMaterialSortOrder(latestItem, finalSortOrder);
      toast({ title: "Success", description: "Sort order updated successfully" });
    } catch (error) {
      setMaterials((prev) =>
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
      await deleteMaterial(deleteItemId);
      if (materials.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({ title: "Success", description: "Material deleted successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to delete material",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const confirmStatusToggle = async () => {
    if (!statusToggleItem) return;

    try {
      const { item, newStatus } = statusToggleItem;
      await toggleMaterialStatus(item, newStatus);

      setMaterials((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_active: newStatus } : i)),
      );
      refetch();

      toast({ title: "Success", description: "Material status updated successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to update material status",
        variant: "destructive",
      });
    } finally {
      setStatusToggleItem(null);
    }
  };

  const columns: ColumnDef<MaterialRecord>[] = [
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
            onEdit={() => navigate(`/materials/${item.id}/edit`)}
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
        data={materials}
        title="Materials"
        searchPlaceholder="Search materials..."
        onAdd={() => navigate("/materials/new")}
        addButtonText="Add Material"
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
      />

      <StatusChangeDialogue
        statusToggleItem={statusToggleItem}
        setStatusToggleItem={setStatusToggleItem}
        confirmStatusToggle={confirmStatusToggle}
        itemLabel="material"
      />
    </>
  );
}
