import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { FolderPlus, RotateCcw } from "lucide-react";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import StatusToggleCell from "@/components/common/StatusToggleCell";
import SortOrderCell from "@/components/common/SortOrderCell";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import StatusChangeDialogue from "@/components/common/StatusChangeDialogue";
import { Combobox } from "@/components/ui/combobox";
import { useToast } from "@/hooks/use-toast";
import { useSortOrder } from "@/hooks/useSortOrder";
import { useStatusToggle } from "@/hooks/useStatusToggle";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import {
  fetchProductCategoryList,
  fetchActiveProductCategories,
  deleteProductCategory,
  toggleProductCategoryStatus,
  updateProductCategorySortOrder,
  ProductCategoryRecord,
  ProductCategoryOption,
  ProductCategoryFilters,
  ApiError,
} from "@/services/products/productCategoryApi";

type TypeFilter = "all" | "category" | "subcategory";
type StatusFilter = "all" | "active" | "inactive";

const TYPE_OPTIONS = [
  { value: "all", label: "All levels" },
  { value: "category", label: "Categories" },
  { value: "subcategory", label: "Sub-categories" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function ProductCategoryList() {
  const navigate = useNavigate();
  const location = useLocation();
  // Passed along so the add/edit form can come back here with filters intact.
  const returnState = { state: { from: location.pathname + location.search } };
  const { toast } = useToast();
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const { filters: categoryFilters, setFilter: setCategoryFilter, reset: resetCategoryFilters } =
    useUrlFilters({ type: "all", status: "all", parent_id: "all" });
  const [parentOptions, setParentOptions] = useState<ProductCategoryOption[]>([]);

  const typeFilter = categoryFilters.type as TypeFilter;
  const statusFilter = categoryFilters.status as StatusFilter;
  const parentFilter = categoryFilters.parent_id;

  useEffect(() => {
    fetchActiveProductCategories()
      .then((res) => setParentOptions(res.data))
      .catch(() => setParentOptions([]));
  }, []);

  const parentComboOptions = useMemo(
    () => [
      { value: "all", label: "All parents" },
      ...parentOptions.map((o) => ({ value: String(o.id), label: o.title })),
    ],
    [parentOptions],
  );

  const filters = useMemo<ProductCategoryFilters>(
    () => ({
      type: typeFilter === "all" ? undefined : typeFilter,
      parent_id: parentFilter === "all" ? undefined : Number(parentFilter),
      status: statusFilter === "all" ? undefined : statusFilter,
    }),
    [typeFilter, parentFilter, statusFilter],
  );

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
  } = usePaginatedList<ProductCategoryRecord, ProductCategoryFilters>(
    fetchProductCategoryList,
    10,
    filters,
  );


  const hasActiveFilters =
    typeFilter !== "all" ||
    statusFilter !== "all" ||
    parentFilter !== "all" ||
    searchInput !== "";

  const resetAll = () => {
    resetCategoryFilters();
    setSearchInput("");
    setPage(1);
  };

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
                onClick={() =>
                  navigate(`/product-categories/new?parent=${item.id}`, returnState)
                }
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                Add sub-category
              </DropdownMenuItem>
            }
            onEdit={() => navigate(`/product-categories/${item.id}/edit`, returnState)}
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
        onAdd={() => navigate("/product-categories/new", returnState)}
        addButtonText="Add Category"
        loading={loading}
        searching={searching}
        searchQuery={searchInput}
        onSearchChange={setSearchInput}
        headerExtra={
          <>
            <Combobox
              maxVisibleItems={5}
              autoWidth
              value={typeFilter}
              options={TYPE_OPTIONS}
              placeholder="All levels"
              searchPlaceholder="Search level..."
              onChange={(value) => {
                setCategoryFilter("type", value);
                // A specific parent already implies sub-categories.
                setCategoryFilter("parent_id", "all");
              }}
            />
            <Combobox
              maxVisibleItems={5}
              autoWidth
              value={parentFilter}
              options={parentComboOptions}
              placeholder="All parents"
              searchPlaceholder="Search parent..."
              onChange={(value) => setCategoryFilter("parent_id", value)}
            />
            <Combobox
              maxVisibleItems={3}
              autoWidth
              value={statusFilter}
              options={STATUS_OPTIONS}
              placeholder="All statuses"
              searchPlaceholder="Search status..."
              onChange={(value) => setCategoryFilter("status", value)}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={resetAll}
              disabled={!hasActiveFilters}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </>
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
