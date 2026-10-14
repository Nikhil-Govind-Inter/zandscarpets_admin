import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import { FileUpload } from "@/components/common/FileUpload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { useToast } from "@/hooks/use-toast";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import {
  fetchProductDataSheets,
  uploadProductDataSheet,
  removeProductDataSheet,
  ProductDataSheetRecord,
  ApiError,
} from "@/services/products/productDataSheetApi";
import { fetchActiveProducts, ProductOption } from "@/services/products/productsApi";

const formatSize = (bytes: number | null) => {
  if (!bytes) return "-";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
};

export default function ProductDataSheetsList() {
  const { toast } = useToast();
  const [productOptions, setProductOptions] = useState<ComboboxOption[]>([]);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [dialogProductId, setDialogProductId] = useState<number | null>(null);
  const [dialogFile, setDialogFile] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { items, page, setPage, limit, setLimit, searchInput, setSearchInput, totalCount, totalPages, loading, searching, itemsPage, itemsLimit, refetch } =
    usePaginatedList<ProductDataSheetRecord, undefined>(fetchProductDataSheets, 10);

  useEffect(() => {
    fetchActiveProducts()
      .then((res: { data: ProductOption[] }) =>
        setProductOptions(res.data.map((p) => ({ value: String(p.id), label: p.title }))),
      )
      .catch(() => {
        /* picker is a convenience; list still works without it */
      });
  }, []);

  const openAttachDialog = (productId: number | null) => {
    setDialogProductId(productId);
    setDialogFile(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!dialogProductId || !dialogFile) return;
    setSaving(true);
    try {
      await uploadProductDataSheet(dialogProductId, dialogFile);
      toast({ title: "Success", description: "Data sheet saved successfully" });
      setDialogOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to save data sheet",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteProductId) return;
    try {
      await removeProductDataSheet(deleteProductId);
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({ title: "Success", description: "Data sheet removed successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to remove data sheet",
        variant: "destructive",
      });
    } finally {
      setDeleteProductId(null);
    }
  };

  const columns: ColumnDef<ProductDataSheetRecord>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono">{(itemsPage - 1) * itemsLimit + row.index + 1}</div>
      ),
    },
    {
      accessorKey: "title",
      header: "Product",
      cell: ({ row }) => <div className="font-medium">{row.original.title}</div>,
    },
    {
      accessorKey: "data_sheet_original_filename",
      header: "File",
      cell: ({ row }) => (
        <div className="max-w-[260px] truncate">
          {row.original.data_sheet_original_filename || "-"}
        </div>
      ),
    },
    {
      accessorKey: "data_sheet_size_bytes",
      header: "Size",
      cell: ({ row }) => formatSize(row.original.data_sheet_size_bytes),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated At",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.updatedAt ? new Date(row.original.updatedAt).toLocaleDateString() : "-"}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
        const viewUrl = item.data_sheet_path
          ? (() => {
              const baseUrl = import.meta.env.VITE_IMAGE_URL;
              const cleanPath = item.data_sheet_path!.replace(/^\//, "");
              return baseUrl ? `${baseUrl}/${cleanPath}` : item.data_sheet_path!;
            })()
          : null;
        return (
          <RowActionsMenu
            onView={viewUrl ? () => window.open(viewUrl, "_blank") : undefined}
            onEdit={() => openAttachDialog(item.id)}
            editLabel="Replace"
            onDelete={() => setDeleteProductId(item.id)}
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
        title="Data Sheets"
        searchPlaceholder="Search by product..."
        onAdd={() => openAttachDialog(null)}
        addButtonText="Attach Data Sheet"
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogProductId ? "Replace Data Sheet" : "Attach Data Sheet"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Combobox
              options={productOptions}
              value={dialogProductId ? String(dialogProductId) : ""}
              onChange={(v) => setDialogProductId(v ? Number(v) : null)}
              placeholder="Select product"
              searchPlaceholder="Search products..."
              disabled={!!items.find((i) => i.id === dialogProductId)}
            />
            <FileUpload
              value={dialogFile}
              onChange={setDialogFile}
              accept="application/pdf"
              maxSize={10 * 1024 * 1024}
              placeholder="Drop a PDF here or click to browse"
              preview={false}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!dialogProductId || !dialogFile || saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialogue
        deleteItemId={deleteProductId}
        setDeleteItemId={setDeleteProductId}
        confirmDelete={confirmDelete}
        itemLabel="Data Sheet"
      />
    </>
  );
}
