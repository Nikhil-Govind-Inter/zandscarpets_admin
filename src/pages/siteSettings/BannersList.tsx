import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import { useToast } from "@/hooks/use-toast";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import {
  fetchBannersList,
  deleteBanner,
  Banner,
  ApiError,
} from "@/services/siteSettings/bannerApi";

export default function BannersList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

  const {
    items: banners,
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
  } = usePaginatedList<Banner>(fetchBannersList);

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      await deleteBanner(deleteItemId);
      if (banners.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({ title: "Success", description: "Banner deleted successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to delete banner",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const columns: ColumnDef<Banner>[] = [
    {
      // id
      accessorKey: "id",
      header: "ID",
      enableHiding: true,
      meta: { defaultVisible: true },
      cell: ({ row }) => (
        <div className="font-medium">
          {(itemsPage - 1) * itemsLimit + row.index + 1}
        </div>
      ),
    },
    {
      accessorKey: "desktop_media_path",
      header: "Media",
      cell: ({ row }) => (
        <div className="w-14 h-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
          {row.original.desktop_media_path ? (
            <img
              src={`${import.meta.env.VITE_IMAGE_URL}/${row.original.desktop_media_path}`}
              alt={row.original.media_alt}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded bg-muted-foreground/20" />
          )}
        </div>
      ),
    },
    {
      id: "page",
      header: "Page",
      cell: ({ row }) => (
        <div className="font-medium capitalize">{row.original.page?.page ?? "-"}</div>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.getValue("title")}>
          {row.getValue("title")}
        </div>
      ),
    },
    {
      accessorKey: "sub_title",
      header: "Sub Title",
      cell: ({ row }) => (
        <div
          className="max-w-[200px] truncate text-muted-foreground"
          title={row.getValue("sub_title")}
        >
          {row.getValue("sub_title")}
        </div>
      ),
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
      cell: ({ row }) => {
        const item = row.original;
        return (
          <RowActionsMenu
            onEdit={() => navigate(`/banners/${item.id}/edit`)}
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
        data={banners}
        title="Banners"
        searchPlaceholder="Search banners by pages..."
        onAdd={() => navigate("/banners/new")}
        addButtonText="Add Banner"
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
    </>
  );
}
