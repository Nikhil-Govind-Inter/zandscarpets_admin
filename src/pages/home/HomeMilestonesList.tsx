import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import MediaThumbnail from "@/components/common/MediaThumbnail";
import SortOrderCell from "@/components/common/SortOrderCell";
import StatusToggleCell from "@/components/common/StatusToggleCell";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import {
  fetchHomeMilestoneList,
  deleteHomeMilestone,
  toggleHomeMilestoneStatus,
  updateHomeMilestoneSortOrder,
  HomeMilestonesRecord,
  ApiError,
} from "@/services/home/homeMilestonesApi";
import { useToast } from "@/hooks/use-toast";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import StatusChangeDialogue from "@/components/common/StatusChangeDialogue";

export default function HomeMilestoneList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    items: milestones,
    setItems: setMilestones,
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
  } = usePaginatedList<HomeMilestonesRecord>(fetchHomeMilestoneList);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [statusToggleItem, setStatusToggleItem] = useState<{
    item: HomeMilestonesRecord;
    newStatus: boolean;
  } | null>(null);

  const milestonesRef = useRef<HomeMilestonesRecord[]>(milestones);
  useEffect(() => {
    milestonesRef.current = milestones;
  }, [milestones]);

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
      await toggleHomeMilestoneStatus(item, newStatus);

      setMilestones((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_active: newStatus } : i)),
      );
      refetch();

      toast({
        title: "Success",
        description: "Home milestone status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to update milestone status",
        variant: "destructive",
      });
    } finally {
      setStatusToggleItem(null);
    }
  };

  const SORT_ORDER_COMMIT_DELAY = 600;

  const handleSortOrderChange = (item: HomeMilestonesRecord, delta: number) => {
    const newSortOrder = Math.max(1, (item.sort_order ?? 1) + delta);
    if (newSortOrder === item.sort_order) return;

    if (!sortOrderTimers.current[item.id]) {
      sortOrderOriginal.current[item.id] = item.sort_order ?? 1;
    }

    setMilestones((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, sort_order: newSortOrder } : i)),
    );

    clearTimeout(sortOrderTimers.current[item.id]);
    sortOrderTimers.current[item.id] = setTimeout(() => {
      delete sortOrderTimers.current[item.id];
      handleSortOrder(item.id);
    }, SORT_ORDER_COMMIT_DELAY);
  };

  const handleSortOrder = async (itemId: number) => {
    const latestItem = milestonesRef.current.find((i) => i.id === itemId);
    if (!latestItem) return;

    const finalSortOrder = latestItem.sort_order ?? 1;
    const originalSortOrder = sortOrderOriginal.current[itemId];
    delete sortOrderOriginal.current[itemId];

    if (finalSortOrder === originalSortOrder) return;

    try {
      await updateHomeMilestoneSortOrder(latestItem, finalSortOrder);
      toast({ title: "Success", description: "Sort order updated successfully" });
    } catch (error) {
      setMilestones((prev) =>
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
      await deleteHomeMilestone(deleteItemId);
      if (milestones.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({
        title: "Success",
        description: "Home milestone deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to delete milestone",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const columns: ColumnDef<HomeMilestonesRecord>[] = [
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
        <MediaThumbnail
          path={row.getValue("media_path")}
          alt={row.original.media_alt}
        />
      ),
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("value") || "-"}</div>
      ),
    },
    {
      accessorKey: "label",
      header: "Label",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("label") || "-"}</div>
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
              setStatusToggleItem({
                item: row.original,
                newStatus: checked,
              })
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
            onEdit={() => navigate(`/home-milestones/${item.id}/edit`)}
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
        data={milestones}
        title="Home Milestone"
        searchPlaceholder="Search home milestones..."
        onAdd={() => navigate("/home-milestones/new")}
        addButtonText="Add Home Milestone"
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
        itemLabel="home milestone"
      />
    </>
  );
}
