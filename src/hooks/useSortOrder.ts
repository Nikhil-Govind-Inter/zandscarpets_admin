import { useEffect, useRef, Dispatch, SetStateAction } from "react";
import { useToast } from "@/hooks/use-toast";

const COMMIT_DELAY_MS = 600;

interface Sortable {
  id: number;
  sort_order?: number | null;
}

/**
 * Optimistic, debounced sort-order stepper for list pages.
 * Each click updates the row immediately; the API call is sent once the user
 * stops clicking, and the row is rolled back if the call fails.
 */
export function useSortOrder<T extends Sortable>(
  items: T[],
  setItems: Dispatch<SetStateAction<T[]>>,
  updateSortOrder: (item: T, sortOrder: number) => Promise<unknown>,
) {
  const { toast } = useToast();
  const itemsRef = useRef(items);
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const originals = useRef<Record<number, number>>({});

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    const pending = timers.current;
    return () => Object.values(pending).forEach(clearTimeout);
  }, []);

  const setSortOrder = (id: number, sortOrder: number) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, sort_order: sortOrder } : i)));

  const commit = async (id: number) => {
    const latest = itemsRef.current.find((i) => i.id === id);
    if (!latest) return;

    const finalOrder = latest.sort_order ?? 1;
    const original = originals.current[id];
    delete originals.current[id];
    if (finalOrder === original) return;

    try {
      await updateSortOrder(latest, finalOrder);
      toast({ title: "Success", description: "Sort order updated successfully" });
    } catch {
      setSortOrder(id, original);
      toast({
        title: "Error",
        description: "Failed to update sort order",
        variant: "destructive",
      });
    }
  };

  return (item: T, delta: number) => {
    const next = Math.max(1, (item.sort_order ?? 1) + delta);
    if (next === item.sort_order) return;

    if (!timers.current[item.id]) originals.current[item.id] = item.sort_order ?? 1;
    setSortOrder(item.id, next);

    clearTimeout(timers.current[item.id]);
    timers.current[item.id] = setTimeout(() => {
      delete timers.current[item.id];
      commit(item.id);
    }, COMMIT_DELAY_MS);
  };
}
