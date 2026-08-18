import { useCallback, useEffect, useRef, useState } from "react";

interface PaginatedResponse<T> {
  data: {
    data: T[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

type Fetcher<T> = (
  page: number,
  limit: number,
  search?: string
) => Promise<PaginatedResponse<T>>;

const SEARCH_DEBOUNCE_MS = 600;
export function usePaginatedList<T>(fetcher: Fetcher<T>, initialLimit = 10) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [itemsPage, setItemsPage] = useState(1);
  const [itemsLimit, setItemsLimit] = useState(initialLimit);
  const [limit, setLimit] = useState(initialLimit);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const isFirstRender = useRef(true);

  useEffect(() => {
    setSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
  }, [debouncedSearch]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetcher(page, limit, debouncedSearch || undefined);
      setItems(response.data.data);
      setItemsPage(page);
      setItemsLimit(limit);
      setTotalCount(response.data.pagination.totalCount);
      setTotalPages(response.data.pagination.totalPages);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, [fetcher, page, limit, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    items,
    setItems,
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
    refetch: load,
  };
}
