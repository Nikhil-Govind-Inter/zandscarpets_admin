import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Tags, Edit } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/DataTable";
import { fetchMetaTagsList, MetaTag } from "@/services/common/metaTagsApi";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { MetaTagsForm } from "./MetaTagsForm";

export const MetaTagsList: React.FC = () => {
  const [editingMetaTag, setEditingMetaTag] = useState<MetaTag | null>(null);

  const {
    items: metaTags,
    page,
    setPage,
    limit,
    setLimit,
    itemsPage,
    itemsLimit,
    searchInput,
    setSearchInput,
    totalCount,
    totalPages,
    loading,
    searching,
    refetch,
  } = usePaginatedList<MetaTag>(fetchMetaTagsList);

  const columns: ColumnDef<MetaTag>[] = [
    // Serial ID that increments from 1 and stays continuous across pagination
    {
      id: "id",
      header: "ID",
      enableHiding: true,
      meta: { defaultVisible: true },
      cell: ({ row }) => (
        <div className="font-medium">{(itemsPage - 1) * itemsLimit + row.index + 1}</div>
      ),
    },
    {
      id: "page",
      accessorFn: (row) => row.page?.page,
      header: "Page",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.page?.page}</div>
      ),
    },
    // {
    //   id: "page_slug",
    //   accessorFn: (row) => row.page?.page_slug,
    //   header: "Page Slug",
    //   enableHiding: true,
    //   meta: { defaultVisible: true },
    //   cell: ({ row }) => (
    //     <div className="text-muted-foreground">{row.original.page?.page_slug}</div>
    //   ),
    // },
    {
      accessorKey: "meta_title",
      header: "Meta Title",
      cell: ({ row }) => (
        <div
          className="max-w-[250px] truncate"
          title={row.getValue("meta_title")}
        >
          {row.getValue("meta_title")}
        </div>
      ),
    },
    {
      accessorKey: "meta_description",
      header: "Meta Description",
      enableHiding: true,
      meta: { defaultVisible: true },
      cell: ({ row }) => (
        <div
          className="max-w-[300px] truncate"
          title={row.getValue("meta_description")}
        >
          {row.getValue("meta_description")}
        </div>
      ),
    },
    {
      accessorKey: "meta_keywords",
      header: "Keywords",
      enableHiding: true,
      meta: { defaultVisible: true },
      cell: ({ row }) => (
        <div
          className="max-w-[200px] truncate"
          title={row.getValue("meta_keywords")}
        >
          {row.getValue("meta_keywords")}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditingMetaTag(row.original)}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      ),
    },
  ];

  const handleEditComplete = () => {
    setEditingMetaTag(null);
    refetch();
  };

  return (
    <div className="">
      <DataTable
        columns={columns}
        data={metaTags}
        title="Meta Tags"
        loading={loading}
        searching={searching}
        searchPlaceholder="Search by page..."
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

      <MetaTagsForm
        metaTag={editingMetaTag}
        onClose={() => setEditingMetaTag(null)}
        onSuccess={handleEditComplete}
      />
    </div>
  );
};
