import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import RowActionsMenu from "@/components/common/RowActionsMenu";
import StatusToggleCell from "@/components/common/StatusToggleCell";
import SortOrderCell from "@/components/common/SortOrderCell";
import DeleteDialogue from "@/components/common/DeleteDialogue";
import StatusChangeDialogue from "@/components/common/StatusChangeDialogue";
import { useToast } from "@/hooks/use-toast";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import {
  fetchProjectsList,
  deleteProject,
  toggleProjectStatus,
  updateProjectSortOrder,
  ProjectRecord,
  ApiError,
} from "@/services/masters/projectsApi";

const resolveImageUrl = (path: string | null) => {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${import.meta.env.VITE_IMAGE_URL}/${path}`;
};

export default function ProjectsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [statusToggleItem, setStatusToggleItem] = useState<{
    item: ProjectRecord;
    newStatus: boolean;
  } | null>(null);

  const {
    items: projects,
    setItems: setProjects,
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
  } = usePaginatedList<ProjectRecord>(fetchProjectsList);

  const projectsRef = useRef<ProjectRecord[]>(projects);
  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  const sortOrderTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const sortOrderOriginal = useRef<Record<number, number>>({});

  useEffect(() => {
    const timers = sortOrderTimers.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  const SORT_ORDER_COMMIT_DELAY = 600;

  const handleSortOrderChange = (item: ProjectRecord, delta: number) => {
    const newSortOrder = Math.max(0, (item.sort_order ?? 0) + delta);
    if (newSortOrder === item.sort_order) return;

    if (!sortOrderTimers.current[item.id]) {
      sortOrderOriginal.current[item.id] = item.sort_order ?? 0;
    }

    setProjects((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, sort_order: newSortOrder } : p)),
    );

    clearTimeout(sortOrderTimers.current[item.id]);
    sortOrderTimers.current[item.id] = setTimeout(() => {
      delete sortOrderTimers.current[item.id];
      handleSortOrder(item.id);
    }, SORT_ORDER_COMMIT_DELAY);
  };

  const handleSortOrder = async (itemId: number) => {
    const latestItem = projectsRef.current.find((p) => p.id === itemId);
    if (!latestItem) return;

    const finalSortOrder = latestItem.sort_order ?? 0;
    const originalSortOrder = sortOrderOriginal.current[itemId];
    delete sortOrderOriginal.current[itemId];

    if (finalSortOrder === originalSortOrder) return;

    try {
      await updateProjectSortOrder(latestItem, finalSortOrder);
      toast({ title: "Success", description: "Sort order updated successfully" });
    } catch (error) {
      setProjects((prev) =>
        prev.map((p) => (p.id === itemId ? { ...p, sort_order: originalSortOrder } : p)),
      );
      toast({
        title: "Error",
        description: "Failed to update sort order",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      await deleteProject(deleteItemId);
      if (projects.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refetch();
      }
      toast({ title: "Success", description: "Project deleted successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to delete project",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const confirmStatusToggle = async () => {
    if (!statusToggleItem) return;

    try {
      const { item, newStatus } = statusToggleItem;
      await toggleProjectStatus(item, newStatus);

      setProjects((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, is_active: newStatus } : p)),
      );
      refetch();

      toast({ title: "Success", description: "Project status updated successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof ApiError ? error.message : "Failed to update project status",
        variant: "destructive",
      });
    } finally {
      setStatusToggleItem(null);
    }
  };

  const columns: ColumnDef<ProjectRecord>[] = [
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
      accessorKey: "thumbnail",
      header: "Thumbnail",
      cell: ({ row }) => {
        const url = resolveImageUrl(row.original.thumbnail);
        return url ? (
          <img
            src={url}
            alt={row.original.title}
            className="h-10 w-10 rounded object-cover border"
          />
        ) : (
          <div className="h-10 w-10 rounded border bg-muted" />
        );
      },
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("title")}</div>
      ),
    },
    {
      id: "category",
      header: "Category",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.category?.title || "-"}
        </div>
      ),
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.getValue("location") || "-"}
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
            onEdit={() => navigate(`/projects/${item.id}/edit`)}
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
        data={projects}
        title="Projects"
        searchPlaceholder="Search projects..."
        onAdd={() => navigate("/projects/new")}
        addButtonText="Add Project"
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
        itemLabel="project"
      />
    </>
  );
}
