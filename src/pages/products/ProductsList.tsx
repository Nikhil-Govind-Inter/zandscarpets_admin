import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import StatusToggleCell from "@/components/common/StatusToggleCell";
import SortOrderCell from "@/components/common/SortOrderCell";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import StatusChangeDialogue from "@/components/common/StatusChangeDialogue";
import MediaThumbnail from "@/components/common/MediaThumbnail";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { HelpCircle, Images } from "lucide-react";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { useToast } from "@/hooks/use-toast";
import { useSortOrder } from "@/hooks/useSortOrder";
import { useStatusToggle } from "@/hooks/useStatusToggle";
import { usePaginatedList } from "@/hooks/usePaginatedList";
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
import { fetchActiveTags } from "@/services/products/tagsApi";

const ALL = "all";

export default function ProductsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState(ALL);
  const [tagFilter, setTagFilter] = useState(ALL);
  const [categoryOptions, setCategoryOptions] = useState<ComboboxOption[]>([]);
  const [tagOptions, setTagOptions] = useState<ComboboxOption[]>([]);

  useEffect(() => {
    fetchActiveProductCategories()
      .then((res) =>
        setCategoryOptions(res.data.map((c) => ({ value: String(c.id), label: c.title }))),
      )
      .catch(() => setCategoryOptions([]));
    fetchActiveTags()
      .then((res) => setTagOptions(res.data.map((t) => ({ value: String(t.id), label: t.title }))))
      .catch(() => setTagOptions([]));
  }, []);

  const filters = useMemo<ProductFilters>(
    () => ({
      product_category_id: categoryFilter === ALL ? undefined : Number(categoryFilter),
      tag_id: tagFilter === ALL ? undefined : Number(tagFilter),
    }),
    [categoryFilter, tagFilter],
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
      accessorKey: "media_path",
      header: "Image",
      cell: ({ row }) => (
        <MediaThumbnail
          path={row.original.media_path}
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
      id: "tag",
      header: "Tag",
      cell: ({ row }) =>
        row.original.tag ? <Badge variant="secondary">{row.original.tag.title}</Badge> : "-",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{Number(row.original.price).toFixed(2)}</div>
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
              <>
                <DropdownMenuItem onClick={() => navigate(`/products/${item.id}/faqs`)}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  FAQs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/products/${item.id}/media`)}>
                  <Images className="mr-2 h-4 w-4" />
                  Media
                </DropdownMenuItem>
              </>
            }
            onEdit={() => navigate(`/products/${item.id}/edit`)}
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
        onAdd={() => navigate("/products/new")}
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
              onChange={(v) => setCategoryFilter(v || ALL)}
            />
            <Combobox
              maxVisibleItems={5}
              autoWidth
              value={tagFilter}
              options={[{ value: ALL, label: "All tags" }, ...tagOptions]}
              placeholder="All tags"
              searchPlaceholder="Search tag..."
              onChange={(v) => setTagFilter(v || ALL)}
            />
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
