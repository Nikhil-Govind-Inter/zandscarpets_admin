import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  toggleProductCategoryNavbar,
  updateProductCategorySortOrder,
  ProductCategoryRecord,
  ProductCategoryOption,
  ProductCategoryFilters,
  ApiError,
} from "@/services/products/productCategoryApi";

type TypeFilter = "all" | "category" | "subcategory";
type StatusFilter = "all" | "active" | "inactive";
type NavbarFilter = "all" | "yes" | "no";

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

const NAVBAR_OPTIONS = [
  { value: "all", label: "All navbar" },
  { value: "yes", label: "In navbar" },
  { value: "no", label: "Not in navbar" },
];

export default function ProductCategoryList() {
  const navigate = useNavigate();
  const location = useLocation();
  // Passed along so the add/edit form can come back here with filters intact.
  const returnState = { state: { from: location.pathname + location.search } };
  const { toast } = useToast();
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const {
    filters: categoryFilters,
    setFilter: setCategoryFilter,
    reset: resetCategoryFilters,
  } = useUrlFilters({ type: "all", status: "all", parent_id: "all", navbar: "all" });
  const [parentOptions, setParentOptions] = useState<ProductCategoryOption[]>([]);

  const typeFilter = categoryFilters.type as TypeFilter;
  const statusFilter = categoryFilters.status as StatusFilter;
  const parentFilter = categoryFilters.parent_id;
  const navbarFilter = categoryFilters.navbar as NavbarFilter;

  useEffect(() => {
    fetchActiveProductCategories()
      .then((res) => setParentOptions(res.data))
      .catch(() => setParentOptions([]));
  }, []);

  const parentComboOptions = useMemo(
    () => [{ value: "all", label: "All parents" }, ...parentOptions.map((o) => ({ value: String(o.id), label: o.title }))],
    [parentOptions],
  );

  const filters = useMemo<ProductCategoryFilters>(
    () => ({
      type: typeFilter === "all" ? undefined : typeFilter,
      parent_id: parentFilter === "all" ? undefined : Number(parentFilter),
      status: statusFilter === "all" ? undefined : statusFilter,
      show_in_navbar: navbarFilter === "all" ? undefined : navbarFilter === "yes",
    }),
    [typeFilter, parentFilter, statusFilter, navbarFilter],
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
  } = usePaginatedList<ProductCategoryRecord, ProductCategoryFilters>(fetchProductCategoryList, 10, filters);

  const hasActiveFilters = typeFilter !== "all" || statusFilter !== "all" || parentFilter !== "all" || navbarFilter !== "all" || searchInput !== "";

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

  // Navbar toggle — same confirm→API→toast flow as status.
  const [navbarToggleItem, setNavbarToggleItem] = useState<{
    item: ProductCategoryRecord;
    newValue: boolean;
  } | null>(null);

  const confirmNavbarToggle = async () => {
    if (!navbarToggleItem) return;
    const { item, newValue } = navbarToggleItem;
    try {
      await toggleProductCategoryNavbar(item, newValue);
      setCategories((prev) => prev.map((c) => (c.id === item.id ? { ...c, show_in_navbar: newValue } : c)));
      toast({
        title: "Success",
        description: `Category ${newValue ? "added to" : "removed from"} navbar successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to update navbar visibility",
        variant: "destructive",
      });
    } finally {
      setNavbarToggleItem(null);
    }
  };

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
        description: error instanceof ApiError ? error.message : "Failed to delete category",
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
      cell: ({ row }) => <div className="font-mono">{(itemsPage - 1) * itemsLimit + row.index + 1}</div>,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
    },
    {
      id: "industry",
      header: "Industry",
      cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.original.industry?.title || "-"}</div>,
    },
    {
      id: "parent",
      header: "Parent Category",
      cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.original.parent?.title || "-"}</div>,
    },
    {
      id: "children",
      header: "Sub-categories",
      cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.original.children?.length ?? 0}</div>,
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
        return <StatusToggleCell status={status} onCheckedChange={(checked) => setStatusToggleItem({ item: row.original, newStatus: checked })} />;
      },
    },
    {
      accessorKey: "show_in_navbar",
      header: "Navbar Visibility",
      cell: ({ row }) => (
        <StatusToggleCell
          status={row.original.show_in_navbar}
          onCheckedChange={(checked) => setNavbarToggleItem({ item: row.original, newValue: checked })}
        />
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.getValue("createdAt") ? new Date(row.getValue("createdAt")).toLocaleDateString() : "-"}
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
              <DropdownMenuItem onClick={() => navigate(`/product-categories/new?parent=${item.id}`, returnState)}>
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
            <Combobox
              maxVisibleItems={3}
              autoWidth
              value={navbarFilter}
              options={NAVBAR_OPTIONS}
              placeholder="All navbar"
              searchPlaceholder="Search navbar..."
              onChange={(value) => setCategoryFilter("navbar", value)}
            />
            <Button variant="outline" size="sm" onClick={resetAll} disabled={!hasActiveFilters}>
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

      <DeleteDialogue deleteItemId={deleteItemId} setDeleteItemId={setDeleteItemId} confirmDelete={confirmDelete} />

      <StatusChangeDialogue
        statusToggleItem={statusToggleItem}
        setStatusToggleItem={setStatusToggleItem}
        confirmStatusToggle={confirmStatusToggle}
        itemLabel="category"
      />

      <NavbarChangeDialogue navbarToggleItem={navbarToggleItem} setNavbarToggleItem={setNavbarToggleItem} confirmNavbarToggle={confirmNavbarToggle} />
    </>
  );
}

// ─── Navbar confirmation dialog ───────────────────────────────────────────────
interface NavbarChangeDialogueProps {
  navbarToggleItem: { item: ProductCategoryRecord; newValue: boolean } | null;
  setNavbarToggleItem: (val: null) => void;
  confirmNavbarToggle: () => void;
}

function NavbarChangeDialogue({ navbarToggleItem, setNavbarToggleItem, confirmNavbarToggle }: NavbarChangeDialogueProps) {
  const actionRef = useRef<HTMLButtonElement>(null);
  return (
    <AlertDialog open={!!navbarToggleItem} onOpenChange={() => setNavbarToggleItem(null)}>
      <AlertDialogContent
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          actionRef.current?.focus();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Navbar Change</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {navbarToggleItem?.newValue ? "show this category in the navbar" : "remove this category from the navbar"}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction ref={actionRef} onClick={confirmNavbarToggle}>
            {navbarToggleItem?.newValue ? "Show in Navbar" : "Remove from Navbar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
