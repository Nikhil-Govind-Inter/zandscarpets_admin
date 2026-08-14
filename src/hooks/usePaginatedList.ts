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

const SEARCH_DEBOUNCE_MS = 300;

// Drives a server-paginated, server-searched list: keeps page/limit/search
// state, debounces the search input, refetches whenever page/limit/debounced
// search changes, and resets to page 1 whenever the search term itself
// changes (not on mount, and not on plain page/limit changes). Exposes
// refetch() so callers can resync after a mutation (delete/update) without
// duplicating the fetch wiring.
export function usePaginatedList<T>(fetcher: Fetcher<T>, initialLimit = 10) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const isFirstRender = useRef(true);

  // Debounce the raw search input into debouncedSearch, which is what
  // actually drives the fetch effect below.
  useEffect(() => {
    setSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // A new search term invalidates the current page — jump back to page 1.
  // Skip on first mount so the initial load isn't double-fired.
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
    searchInput,
    setSearchInput,
    totalCount,
    totalPages,
    loading,
    searching,
    refetch: load,
  };
}
