import { useCallback, useMemo, useRef } from "react";
import { parseAsString, useQueryStates } from "nuqs";

// Every filter value is stored as a string in the URL; `defaults` supplies the
// "no filter" sentinel per key (e.g. "all") so a missing param reads back as
// that sentinel. Values equal to the default are omitted from the URL.
export type UrlFilterDefaults = Record<string, string>;

type StringParser = ReturnType<typeof parseAsString.withDefault>;

/**
 * Reusable URL-backed filter state for listing screens.
 *
 * ```ts
 * const { filters, setFilter } = useUrlFilters({ type: "all", status: "all" });
 * // filters.type, filters.status  -> always strings
 * // setFilter("status", "active")
 * ```
 *
 * The keys live in the query string (alongside `usePaginatedList`'s
 * `page`/`limit`/`search`), so filters survive refresh and can be shared.
 */
export function useUrlFilters<T extends UrlFilterDefaults>(defaults: T) {
  const keysKey = Object.keys(defaults).join(",");
  const defaultsRef = useRef(defaults);
  defaultsRef.current = defaults;

  // Parsers are rebuilt only when the set of filter keys changes.
  const parsers = useMemo(() => {
    const map: Record<string, StringParser> = {};
    for (const key of Object.keys(defaultsRef.current)) {
      map[key] = parseAsString.withDefault(defaultsRef.current[key]);
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keysKey]);

  const [values, setValues] = useQueryStates(parsers, {
    history: "replace",
    shallow: false,
  });

  const setFilter = useCallback(
    (key: keyof T & string, value: string) => {
      setValues({
        [key]: value === defaultsRef.current[key] ? null : value,
      });
    },
    [setValues]
  );

  const reset = useCallback(() => setValues(null), [setValues]);

  return {
    filters: values as T,
    setFilter,
    setValues,
    reset,
  };
}
