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
import PageLoader from "@/components/layout/PageLoader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSortOrder } from "@/hooks/useSortOrder";
import { useStatusToggle } from "@/hooks/useStatusToggle";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import {
  fetchProductFaqList,
  deleteProductFaq,
  toggleProductFaqStatus,
  updateProductFaqSortOrder,
  ProductFaqRecord,
  ApiError,
} from "@/services/products/productFaqApi";
import { useParentProduct } from "./useParentProduct";

// FAQs for one product, reached from the Products list row actions.
export default function ProductFaqList() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { productId, productTitle, loading: productLoading } = useParentProduct();
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const basePath = `/products/${productId}/faqs`;

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
  } = usePaginatedList<ProductFaqRecord, { product_id: number }>(fetchProductFaqList, 10, filters);

  const handleSortOrderChange = useSortOrder(items, setItems, updateProductFaqSortOrder);
  const { statusToggleItem, setStatusToggleItem, confirmStatusToggle } = useStatusToggle({
    setItems,
    refetch,
    toggleStatus: toggleProductFaqStatus,
    label: "FAQ",
  });

  const confirmDelete = async () => {
    if (!deleteItemId) return;
    try {
      await deleteProductFaq(deleteItemId);
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({ title: "Success", description: "FAQ deleted successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to delete FAQ",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const columns: ColumnDef<ProductFaqRecord>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono">{(itemsPage - 1) * itemsLimit + row.index + 1}</div>
      ),
    },
    {
      accessorKey: "question",
      header: "Question",
      cell: ({ row }) => (
        <div className="font-medium max-w-[320px] truncate">{row.original.question}</div>
      ),
    },
    {
      accessorKey: "question_ar",
      header: "Question (Arabic)",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground max-w-[320px] truncate" dir="rtl">
          {row.original.question_ar}
        </div>
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
          <h1 className="text-2xl font-bold">FAQs — {productTitle}</h1>
          <p className="text-muted-foreground">Frequently asked questions shown on this product</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items}
        title="FAQs"
        searchPlaceholder="Search FAQs..."
        onAdd={() => navigate(`${basePath}/new`, { state: { nextSortOrder: totalCount + 1 } })}
        addButtonText="Add FAQ"
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
        itemLabel="FAQ"
      />

      <StatusChangeDialogue
        statusToggleItem={statusToggleItem}
        setStatusToggleItem={setStatusToggleItem}
        confirmStatusToggle={confirmStatusToggle}
        itemLabel="FAQ"
      />
    </div>
  );
}
