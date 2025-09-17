import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Tags } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/DataTable';
import { fetchMetaTagsList, MetaTag } from '@/services/common/metaTagsApi';
import { MetaTagsForm } from './MetaTagsForm';

export const MetaTagsList: React.FC = () => {
  const [editingMetaTag, setEditingMetaTag] = useState<MetaTag | null>(null);

  const {
    data: metaTagsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['metaTags'],
    queryFn: fetchMetaTagsList,
  });

  const columns: ColumnDef<MetaTag>[] = [
    {
      accessorKey: 'page',
      header: 'Page',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('page')}</div>
      ),
    },
    {
      accessorKey: 'meta_title',
      header: 'Meta Title',
      cell: ({ row }) => (
        <div className="max-w-[250px] truncate" title={row.getValue('meta_title')}>
          {row.getValue('meta_title')}
        </div>
      ),
    },
    {
      accessorKey: 'meta_description',
      header: 'Meta Description',
      enableHiding: true,
      meta: { defaultVisible: false },
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate" title={row.getValue('meta_description')}>
          {row.getValue('meta_description')}
        </div>
      ),
    },
    {
      accessorKey: 'meta_keywords',
      header: 'Keywords',
      enableHiding: true,
      meta: { defaultVisible: false },
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.getValue('meta_keywords')}>
          {row.getValue('meta_keywords')}
        </div>
      ),
    },
    {
      accessorKey: 'canonical_url',
      header: 'Canonical URL',
      enableHiding: true,
      meta: { defaultVisible: false },
      cell: ({ row }) => {
        const url = row.getValue('canonical_url') as string;
        return url ? (
          <Badge variant="secondary" className="max-w-[150px] truncate">
            {url}
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Tags className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Meta Tags</h1>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500">Error loading meta tags: {(error as Error).message}</p>
            <Button onClick={() => refetch()} className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Tags className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Meta Tags</h1>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={metaTagsData?.data?.data || []}
            loading={isLoading}
            pagination={{
              totalCount: metaTagsData?.data?.pagination?.totalCount || 0,
              totalPages: metaTagsData?.data?.pagination?.totalPages || 0,
              currentPage: metaTagsData?.data?.pagination?.currentPage || 1,
              limit: metaTagsData?.data?.pagination?.limit || 15,
            }}
          />
        </CardContent>
      </Card>

      {editingMetaTag && (
        <MetaTagsForm
          metaTag={editingMetaTag}
          onClose={() => setEditingMetaTag(null)}
          onSuccess={handleEditComplete}
        />
      )}
    </div>
  );
};