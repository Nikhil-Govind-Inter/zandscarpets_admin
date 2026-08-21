import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import MediaThumbnail from "@/components/common/MediaThumbnail";
import SortOrderCell from "@/components/common/SortOrderCell";
import StatusToggleCell from "@/components/common/StatusToggleCell";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import {
  fetchFooterMediaList,
  deleteFooterMedia,
  toggleFooterMediaStatus,
  updateFooterMediaSortOrder,
  FooterMedia,
} from "@/services/siteSettings/footerMediaApi";
import { useToast } from "@/hooks/use-toast";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import StatusChangeDialogue from "@/components/common/StatusChangeDialogue";

export default function FooterMediaList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    items: footerMediaItems,
    setItems: setFooterMediaItems,
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
  } = usePaginatedList<FooterMedia>(fetchFooterMediaList);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [statusToggleItem, setStatusToggleItem] = useState<{
    item: FooterMedia;
    newStatus: boolean;
  } | null>(null);

  // Mirrors footerMediaItems so the debounced sort-order commit (below) can
  // read the latest optimistic value at fire time, instead of a stale one
  // captured when the timer was first scheduled.
  const footerMediaItemsRef = useRef<FooterMedia[]>(footerMediaItems);
  useEffect(() => {
    footerMediaItemsRef.current = footerMediaItems;
  }, [footerMediaItems]);

  // Per-item debounce state for sort-order changes: the pending commit timer,
  // and the last server-confirmed value to revert to if the eventual commit
  // fails.
  const sortOrderTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const sortOrderOriginal = useRef<Record<number, number>>({});

  // Clear any pending debounce timers on unmount so they don't fire (and try
  // to setState) after the component is gone.
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
      await toggleFooterMediaStatus(item, newStatus);

      // Optimistic update for instant feedback...
      setFooterMediaItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, is_active: newStatus } : i
        )
      );
      // ...then resync with the server so the row can't drift from the
      // current page/search results.
      refetch();

      toast({
        title: "Success",
        description: "Footer media status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update footer media status",
        variant: "destructive",
      });
    } finally {
      setStatusToggleItem(null);
    }
  };

  const SORT_ORDER_COMMIT_DELAY = 600;

  // Every click updates the visible value immediately, but the API call is
  // debounced per item: rapid clicks just reschedule the same timer, so only
  // the final value is sent once the user stops clicking.
  const handleSortOrderChange = (item: FooterMedia, delta: number) => {
    const newSortOrder = Math.max(1, (item.sort_order ?? 1) + delta);
    if (newSortOrder === item.sort_order) return;

    // First change in this burst — remember the server-confirmed value in
    // case the eventual commit fails and we need to revert.
    if (!sortOrderTimers.current[item.id!]) {
      sortOrderOriginal.current[item.id!] = item.sort_order ?? 1;
    }

    // Optimistic update
    setFooterMediaItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, sort_order: newSortOrder } : i))
    );

    clearTimeout(sortOrderTimers.current[item.id!]);
    sortOrderTimers.current[item.id!] = setTimeout(() => {
      delete sortOrderTimers.current[item.id!];
      handleSortOrder(item.id!);
    }, SORT_ORDER_COMMIT_DELAY);
  };

  const handleSortOrder = async (itemId: number) => {
    // Read the latest optimistic value, not whatever was captured when the
    // first click in this burst scheduled the timer.
    const latestItem = footerMediaItemsRef.current.find((i) => i.id === itemId);
    if (!latestItem) return;

    const finalSortOrder = latestItem.sort_order ?? 1;
    const originalSortOrder = sortOrderOriginal.current[itemId];
    delete sortOrderOriginal.current[itemId];

    if (finalSortOrder === originalSortOrder) return;

    try {
      await updateFooterMediaSortOrder(latestItem, finalSortOrder);
      toast({
        title: "Success",
        description: "Sort order updated successfully",
      });
    } catch (error) {
      // Revert to the last server-confirmed value
      setFooterMediaItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, sort_order: originalSortOrder } : i))
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
      await deleteFooterMedia(deleteItemId);
      // Deleting shrinks totalCount and can empty the current page, so
      // resync from the server rather than just splicing the local array.
      // If this was the last row on a page beyond the first, step back a
      // page first so the refetch doesn't land on a now-empty page.
      if (footerMediaItems.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({
        title: "Success",
        description: "Footer media item deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete footer media item",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const columns: ColumnDef<FooterMedia>[] = [
    {
      id: "id",
      header: "ID",
      // Serial ID that increments from 1 and stays continuous across
      // pagination. Uses itemsPage/itemsLimit (the page/limit the currently
      // loaded data actually corresponds to) rather than page/limit
      // directly, so it doesn't flash the next page's numbers over the
      // still-loading current page's rows.
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
      accessorKey: "media_alt",
      header: "Alt Text",
      cell: ({ row }) => (
        <div className="font-medium capitalize">{row.getValue("media_alt")}</div>
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
          {new Date(row.getValue("createdAt")).toLocaleDateString()}
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
            onEdit={() => navigate(`/footer-media/${item.id}/edit`)}
            onDelete={() => setDeleteItemId(item.id!)}
          />
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={footerMediaItems}
        title="Footer Media"
        searchPlaceholder="Search footer media items..."
        onAdd={() => navigate("/footer-media/new")}
        addButtonText="Add Footer Media"
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

      {/* Delete Confirmation Dialog */}
      <DeleteDialogue
        deleteItemId={deleteItemId}
        setDeleteItemId={setDeleteItemId}
        confirmDelete={confirmDelete}
      />

      {/* Status Toggle Confirmation Dialog */}
      <StatusChangeDialogue
        statusToggleItem={statusToggleItem}
        setStatusToggleItem={setStatusToggleItem}
        confirmStatusToggle={confirmStatusToggle}
        itemLabel="footer media item"
      />
    </>
  );
}
