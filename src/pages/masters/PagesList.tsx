import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import SortOrderCell from "@/components/common/SortOrderCell";
import StatusToggleCell from "@/components/common/StatusToggleCell";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import StatusChangeDialogue from "@/components/common/StatusChangeDialogue";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useSortOrder } from "@/hooks/useSortOrder";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import {
  fetchPagesList,
  deletePage,
  togglePageStatus,
  updatePage,
  PageRecord,
  ApiError,
} from "@/services/masters/pagesApi";

export default function PagesList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [statusToggleItem, setStatusToggleItem] = useState<{
    item: PageRecord;
    newStatus: boolean;
  } | null>(null);

  const {
    items: pages,
    setItems: setPages,
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
  } = usePaginatedList<PageRecord>(fetchPagesList);

  // The backend's PUT requires the full record, so resend it with the new sort order.
  const handleSortOrderChange = useSortOrder(
    pages,
    setPages,
    (item: PageRecord, sortOrder: number) =>
      updatePage(item.id, {
        page: item.page,
        page_slug: item.page_slug,
        page_ar: item.page_ar ?? null,
        link: item.link ?? null,
        show_in_nav: item.show_in_nav,
        show_in_footer: item.show_in_footer,
        sort_order: sortOrder,
        is_active: item.is_active,
      }),
  );

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      await deletePage(deleteItemId);
      if (pages.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({ title: "Success", description: "Page deleted successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to delete page",
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
      await togglePageStatus(item, newStatus);

      setPages((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, is_active: newStatus } : i,
        ),
      );
      refetch();

      toast({
        title: "Success",
        description: "Page status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError
            ? error.message
            : "Failed to update page status",
        variant: "destructive",
      });
    } finally {
      setStatusToggleItem(null);
    }
  };

  // The backend's PUT requires the full record, so resend it with one flag changed.
  const toggleFlag = async (
    item: PageRecord,
    key: "show_in_nav" | "show_in_footer",
    value: boolean,
  ) => {
    setPages((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, [key]: value } : i)),
    );
    try {
      await updatePage(item.id, {
        page: item.page,
        page_slug: item.page_slug,
        page_ar: item.page_ar ?? null,
        link: item.link ?? null,
        show_in_nav: item.show_in_nav,
        show_in_footer: item.show_in_footer,
        sort_order: item.sort_order ?? 0,
        is_active: item.is_active,
        [key]: value,
      });
      toast({ title: "Success", description: "Page updated successfully" });
    } catch (error) {
      setPages((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, [key]: !value } : i)),
      );
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to update page",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<PageRecord>[] = [
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
      accessorKey: "page",
      header: "Page",
      cell: ({ row }) => (
        <div className="font-medium capitalize">{row.getValue("page")}</div>
      ),
    },
    {
      accessorKey: "page_slug",
      header: "Slug",
      cell: ({ row }) => (
        <div className="font-mono text-sm text-muted-foreground">
          {row.getValue("page_slug")}
        </div>
      ),
    },
    {
      accessorKey: "link",
      header: "Link",
      cell: ({ row }) => (
        <div className="font-mono text-sm text-muted-foreground">
          {(row.getValue("link") as string) || "-"}
        </div>
      ),
    },
    {
      accessorKey: "show_in_nav",
      header: "Nav",
      cell: ({ row }) => (
        <Switch
          checked={row.original.show_in_nav}
          onCheckedChange={(checked) =>
            toggleFlag(row.original, "show_in_nav", checked)
          }
        />
      ),
    },
    {
      accessorKey: "show_in_footer",
      header: "Footer",
      cell: ({ row }) => (
        <Switch
          checked={row.original.show_in_footer}
          onCheckedChange={(checked) =>
            toggleFlag(row.original, "show_in_footer", checked)
          }
        />
      ),
    },
    {
      accessorKey: "sort_order",
      header: "Sort Order",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <SortOrderCell
            sortOrder={item.sort_order ?? 1}
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
            onEdit={() => navigate(`/pages/${item.id}/edit`)}
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
        data={pages}
        title="Pages"
        searchPlaceholder="Search pages..."
        onAdd={() => navigate("/pages/new")}
        addButtonText="Add Page"
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
        itemLabel="page"
      />
    </>
  );
}
