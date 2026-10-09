import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft } from "lucide-react";
import { DataTable } from "@/components/common/DataTable";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import StatusToggleCell from "@/components/common/StatusToggleCell";
import SortOrderCell from "@/components/common/SortOrderCell";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import StatusChangeDialogue from "@/components/common/StatusChangeDialogue";
import MediaThumbnail from "@/components/common/MediaThumbnail";
import { resolveImageUrl } from "@/lib/resolveImageUrl";
import PageLoader from "@/components/layout/PageLoader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSortOrder } from "@/hooks/useSortOrder";
import { useStatusToggle } from "@/hooks/useStatusToggle";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import {
  fetchProductMediaList,
  deleteProductMedia,
  toggleProductMediaStatus,
  updateProductMediaSortOrder,
  ProductMediaRecord,
  ApiError,
} from "@/services/products/productMediaApi";
import { useParentProduct } from "./useParentProduct";

// Gallery images/videos for one product, reached from the Products list row actions.
export default function ProductMediaList() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { productId, productTitle, loading: productLoading } = useParentProduct();
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const basePath = `/products/${productId}/media`;

  const filters = useMemo(() => ({ product_id: productId }), [productId]);
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
  } = usePaginatedList<ProductMediaRecord, { product_id: number }>(fetchProductMediaList, 10, filters);

  const handleSortOrderChange = useSortOrder(items, setItems, updateProductMediaSortOrder);
  const { statusToggleItem, setStatusToggleItem, confirmStatusToggle } = useStatusToggle({
    setItems,
    refetch,
    toggleStatus: toggleProductMediaStatus,
    label: "Media",
  });

  const confirmDelete = async () => {
    if (!deleteItemId) return;
    try {
      await deleteProductMedia(deleteItemId);
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({ title: "Success", description: "Media deleted successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to delete media",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const columns: ColumnDef<ProductMediaRecord>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono">{(itemsPage - 1) * itemsLimit + row.index + 1}</div>
      ),
    },
    {
      accessorKey: "media_path",
      header: "Preview",
      cell: ({ row }) =>
        row.original.media_type === "video" ? (
          // Muted preview: shows the thumbnail (or first frame), plays on hover.
          <video
            src={resolveImageUrl(row.original.media_path) || undefined}
            poster={resolveImageUrl(row.original.thumbnail) || undefined}
            muted
            loop
            playsInline
            preload="metadata"
            className="w-16 h-10 rounded-md bg-muted object-cover"
            onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
            onMouseLeave={(e) => {
              e.currentTarget.pause();
              e.currentTarget.currentTime = 0;
            }}
          />
        ) : (
          <MediaThumbnail path={row.original.media_path} alt={row.original.media_alt} />
        ),
    },
    {
      accessorKey: "media_type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.media_type}
        </Badge>
      ),
    },
    {
      accessorKey: "media_alt",
      header: "Alt Text",
      cell: ({ row }) => (
        <div className="text-sm max-w-[280px] truncate">{row.original.media_alt || "-"}</div>
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
          status={row.original.is_active}
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
          onEdit={() => navigate(`${basePath}/${row.original.id}/edit`)}
          onDelete={() => setDeleteItemId(row.original.id)}
        />
      ),
    },
  ];

  if (productLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/products")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Gallery Media — {productTitle}</h1>
          <p className="text-muted-foreground">Images and videos shown in this product's gallery</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        title="Gallery Media"
        searchPlaceholder="Search by alt text..."
        onAdd={() => navigate(`${basePath}/new`, { state: { nextSortOrder: totalCount + 1 } })}
        addButtonText="Add Media"
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
        itemLabel="Media"
      />

      <StatusChangeDialogue
        statusToggleItem={statusToggleItem}
        setStatusToggleItem={setStatusToggleItem}
        confirmStatusToggle={confirmStatusToggle}
        itemLabel="Media"
      />
    </div>
  );
}
