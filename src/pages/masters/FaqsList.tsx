import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import { Combobox } from "@/components/ui/combobox";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import StatusToggleCell from "@/components/common/StatusToggleCell";
import SortOrderCell from "@/components/common/SortOrderCell";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import StatusChangeDialogue from "@/components/common/StatusChangeDialogue";
import { useToast } from "@/hooks/use-toast";
import { useSortOrder } from "@/hooks/useSortOrder";
import { useStatusToggle } from "@/hooks/useStatusToggle";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import {
  fetchFaqsList,
  deleteFaq,
  toggleFaqStatus,
  updateFaqSortOrder,
  FaqRecord,
  FaqFilters,
  ApiError,
} from "@/services/masters/faqsApi";
import { fetchActiveProducts, ProductOption } from "@/services/products/productsApi";

const ALL = "all";
const GLOBAL = "global";

export default function FaqsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [productOptions, setProductOptions] = useState<{ value: string; label: string }[]>([]);

  const { filters: listFilters, setFilter } = useUrlFilters({ product_id: ALL });
  const productFilter = listFilters.product_id;

  const filters = useMemo<FaqFilters>(() => {
    if (productFilter === ALL) return {};
    if (productFilter === GLOBAL) return { product_id: "global" };
    const id = Number(productFilter);
    return Number.isInteger(id) && id > 0 ? { product_id: id } : {};
  }, [productFilter]);

  const {
    items: faqs,
    setItems: setFaqs,
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
  } = usePaginatedList<FaqRecord, FaqFilters>(fetchFaqsList, 10, filters);

  useEffect(() => {
    fetchActiveProducts()
      .then((res: { data: ProductOption[] }) =>
        setProductOptions(res.data.map((p) => ({ value: String(p.id), label: p.title }))),
      )
      .catch(() => setProductOptions([]));
  }, []);

  // A deep-link (Products-list "FAQs" action) can target an inactive product
  // that isn't in the active picker; surface it so the trigger shows its name.
  const productSelectOptions = useMemo(() => {
    const base = [
      { value: ALL, label: "All FAQs" },
      { value: GLOBAL, label: "Global only" },
      ...productOptions,
    ];
    if (
      productFilter !== ALL &&
      productFilter !== GLOBAL &&
      !productOptions.some((o) => o.value === productFilter)
    ) {
      const fromRow = faqs.find((f) => String(f.product_id) === productFilter)?.product;
      base.push({ value: productFilter, label: fromRow?.title || `Product #${productFilter}` });
    }
    return base;
  }, [productOptions, productFilter, faqs]);

  // Mirrors faqs so the debounced sort-order commit (below) can read the
  // latest optimistic value at fire time, instead of a stale one captured
  // when the timer was first scheduled.

  const handleSortOrderChange = useSortOrder(faqs, setFaqs, updateFaqSortOrder);
  const { statusToggleItem, setStatusToggleItem, confirmStatusToggle } = useStatusToggle({
    setItems: setFaqs,
    refetch,
    toggleStatus: toggleFaqStatus,
    label: "FAQ",
  });

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      await deleteFaq(deleteItemId);
      if (faqs.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({ title: "Success", description: "FAQ deleted successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to delete FAQ",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const columns: ColumnDef<FaqRecord>[] = [
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
      id: "product",
      header: "Product",
      cell: ({ row }) => {
        const item = row.original;
        const title = item.product?.title;
        return title ? (
          <div className="font-medium max-w-[220px] truncate">{title}</div>
        ) : (
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
            Global
          </span>
        );
      },
    },
    {
      accessorKey: "question",
      header: "Question",
      cell: ({ row }) => (
        <div className="font-medium max-w-[280px] truncate">
          {row.getValue("question")}
        </div>
      ),
    },
    {
      accessorKey: "answer",
      header: "Answer",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground max-w-[320px] truncate">
          {row.getValue("answer")}
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
            onEdit={() => navigate(`/faqs/${item.id}/edit`)}
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
        data={faqs}
        title="FAQs"
        searchPlaceholder="Search FAQs..."
        onAdd={() =>
          navigate(
            productFilter !== ALL && productFilter !== GLOBAL
              ? `/faqs/new?product_id=${productFilter}`
              : "/faqs/new",
          )
        }
        addButtonText="Add FAQ"
        headerExtra={
          <Combobox
            maxVisibleItems={5}
            autoWidth
            value={productFilter}
            options={productSelectOptions}
            placeholder="All FAQs"
            searchPlaceholder="Search product..."
            onChange={(v) => setFilter("product_id", v || ALL)}
          />
        }
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
        itemLabel="FAQ"
      />
    </>
  );
}
