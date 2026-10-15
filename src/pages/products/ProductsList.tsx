import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import StatusToggleCell from "@/components/common/StatusToggleCell";
import SortOrderCell from "@/components/common/SortOrderCell";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import StatusChangeDialogue from "@/components/common/StatusChangeDialogue";
import MediaThumbnail from "@/components/common/MediaThumbnail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { HelpCircle, Images, Layers, RotateCcw, LayoutList, Tags } from "lucide-react";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { useToast } from "@/hooks/use-toast";
import { useSortOrder } from "@/hooks/useSortOrder";
import { useStatusToggle } from "@/hooks/useStatusToggle";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import {
  fetchProductList,
  deleteProduct,
  toggleProductStatus,
  updateProductSortOrder,
  ProductRecord,
  ProductFilters,
  ApiError,
} from "@/services/products/productsApi";
import { fetchActiveProductCategories } from "@/services/products/productCategoryApi";

const ALL = "all";

type StatusFilter = "all" | "active" | "inactive";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function ProductsList() {
  const navigate = useNavigate();
  const location = useLocation();
  // Passed along so the add/edit form can come back here with filters intact.
  const returnState = { state: { from: location.pathname + location.search } };
  const { toast } = useToast();
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const { filters: listFilters, setFilter, reset: resetListFilters } = useUrlFilters({
    product_category_id: ALL,
    status: ALL,
  });
  const categoryFilter = listFilters.product_category_id;
  const statusFilter = listFilters.status as StatusFilter;
  const [categoryOptions, setCategoryOptions] = useState<ComboboxOption[]>([]);

  useEffect(() => {
    fetchActiveProductCategories()
      .then((res) =>
        setCategoryOptions(res.data.map((c) => ({ value: String(c.id), label: c.title }))),
      )
      .catch(() => setCategoryOptions([]));
  }, []);

  const filters = useMemo<ProductFilters>(
    () => ({
      product_category_id: categoryFilter === ALL ? undefined : Number(categoryFilter),
      status: statusFilter === "all" ? undefined : statusFilter,
    }),
    [categoryFilter, statusFilter],
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
  } = usePaginatedList<ProductRecord, ProductFilters>(fetchProductList, 10, filters);

  const hasActiveFilters =
    categoryFilter !== ALL || statusFilter !== "all" || searchInput !== "";

  const resetAll = () => {
    resetListFilters();
    setSearchInput("");
    setPage(1);
  };

  const handleSortOrderChange = useSortOrder(items, setItems, updateProductSortOrder);
  const { statusToggleItem, setStatusToggleItem, confirmStatusToggle } = useStatusToggle({
    setItems,
    refetch,
    toggleStatus: toggleProductStatus,
    label: "Product",
  });

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      await deleteProduct(deleteItemId);
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({ title: "Success", description: "Product deleted successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to delete Product",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const columns: ColumnDef<ProductRecord>[] = [
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
      accessorKey: "main_media_path",
      header: "Image",
      cell: ({ row }) => (
        <MediaThumbnail
          path={row.original.main_media_path}
          alt={row.original.media_alt || row.original.title}
        />
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="font-medium max-w-[280px] truncate">
          {row.getValue("title")}
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      cell: ({ row }) => (
        <div className="text-sm">{row.original.category?.title || "-"}</div>
      ),
    },
    {
      id: "labels",
      header: "Tags",
      cell: ({ row }) => {
        const tags = (row.original.labels || []).filter((l) => l.type === "tag");
        if (!tags.length) return "-";
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((l) => (
              <Badge key={l.id} variant="secondary">
                {l.title}
              </Badge>
            ))}
            {tags.length > 3 && <Badge variant="outline">+{tags.length - 3}</Badge>}
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {row.original.price != null ? Number(row.original.price).toFixed(2) : "-"}
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
      id: "variants",
      header: "Variants",
      cell: ({ row }) => {
        const count = row.original.variant_count ?? 0;
        return (
          <Badge variant={count ? "secondary" : "outline"}>
            {count}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <RowActionsMenu
            extraItems={
              <>
                <DropdownMenuItem
                  onClick={() => navigate(`/products/${item.id}/variants`, returnState)}
                >
                  <Layers className="mr-2 h-4 w-4" />
                  Variants
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate(`/faqs?product_id=${item.id}`, returnState)}
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  FAQs
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate(`/products/${item.id}/media`, returnState)}
                >
                  <Images className="mr-2 h-4 w-4" />
                  Media
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate(`/products/${item.id}/details`, returnState)}
                >
                  <LayoutList className="mr-2 h-4 w-4" />
                  Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate(`/meta-tags?type=product&product_id=${item.id}`, returnState)}
                >
                  <Tags className="mr-2 h-4 w-4" />
                  SEO Meta
                </DropdownMenuItem>
              </>
            }
            onEdit={() => navigate(`/products/${item.id}/edit`, returnState)}
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
        title="Products"
        searchPlaceholder="Search Products..."
        onAdd={() => navigate("/products/new", returnState)}
        addButtonText="Add Product"
        loading={loading}
        searching={searching}
        searchQuery={searchInput}
        onSearchChange={setSearchInput}
        headerExtra={
          <>
            <Combobox
              maxVisibleItems={5}
              autoWidth
              value={categoryFilter}
              options={[{ value: ALL, label: "All categories" }, ...categoryOptions]}
              placeholder="All categories"
              searchPlaceholder="Search category..."
              onChange={(v) => setFilter("product_category_id", v || ALL)}
            />
            <Combobox
              maxVisibleItems={3}
              autoWidth
              value={statusFilter}
              options={STATUS_OPTIONS}
              placeholder="All statuses"
              searchPlaceholder="Search status..."
              onChange={(value) => setFilter("status", value)}
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
        itemLabel="Product"
      />

      <StatusChangeDialogue
        statusToggleItem={statusToggleItem}
        setStatusToggleItem={setStatusToggleItem}
        confirmStatusToggle={confirmStatusToggle}
        itemLabel="Product"
      />
    </>
  );
}
