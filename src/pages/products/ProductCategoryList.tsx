import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { FolderPlus } from "lucide-react";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import StatusToggleCell from "@/components/common/StatusToggleCell";
import SortOrderCell from "@/components/common/SortOrderCell";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import StatusChangeDialogue from "@/components/common/StatusChangeDialogue";
import { useToast } from "@/hooks/use-toast";
import { useSortOrder } from "@/hooks/useSortOrder";
import { useStatusToggle } from "@/hooks/useStatusToggle";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import {
  fetchProductCategoryList,
  deleteProductCategory,
  toggleProductCategoryStatus,
  updateProductCategorySortOrder,
  ProductCategoryRecord,
  ApiError,
} from "@/services/products/productCategoryApi";



export default function ProductCategoryList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

  const {
    items: categories,
    setItems: setCategories,
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
  } = usePaginatedList<ProductCategoryRecord>(fetchProductCategoryList);


  const handleSortOrderChange = useSortOrder(categories, setCategories, updateProductCategorySortOrder);
  const { statusToggleItem, setStatusToggleItem, confirmStatusToggle } = useStatusToggle({
    setItems: setCategories,
    refetch,
    toggleStatus: toggleProductCategoryStatus,
    label: "Category",
  });

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      await deleteProductCategory(deleteItemId);
      if (categories.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({ title: "Success", description: "Category deleted successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError
            ? error.message
            : "Failed to delete category",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const columns: ColumnDef<ProductCategoryRecord>[] = [
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
      id: "industry",
      header: "Industry",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.industry?.title || "-"}
        </div>
      ),
    },
    {
      id: "parent",
      header: "Parent Category",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.parent?.title || "-"}
        </div>
      ),
    },
    {
      id: "children",
      header: "Sub-categories",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.children?.length ?? 0}
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
            extraItems={
              <DropdownMenuItem
                onClick={() => navigate(`/product-categories/new?parent=${item.id}`)}
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                Add sub-category
              </DropdownMenuItem>
            }
            onEdit={() => navigate(`/product-categories/${item.id}/edit`)}
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
        data={categories}
        title="Categories"
        searchPlaceholder="Search categories..."
        onAdd={() => navigate("/product-categories/new")}
        addButtonText="Add Category"
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
        itemLabel="category"
      />
    </>
  );
}
