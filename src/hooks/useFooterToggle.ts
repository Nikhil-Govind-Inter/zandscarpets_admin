import { useState, Dispatch, SetStateAction } from "react";
import { useToast } from "@/hooks/use-toast";

interface Options<T extends { id?: number }> {
  setItems: Dispatch<SetStateAction<T[]>>;
  toggleFooter: (item: T, showInFooter: boolean) => Promise<unknown>;
  /** Shown in the toast, e.g. "Product". */
  label: string;
}

/** Confirm-then-update flow for the "show in footer" flag on list pages. */
export function useFooterToggle<T extends { id?: number; show_in_footer?: boolean }>({
  setItems,
  toggleFooter,
  label,
}: Options<T>) {
  const { toast } = useToast();
  const [footerToggleItem, setFooterToggleItem] = useState<{
    item: T;
    newValue: boolean;
  } | null>(null);

  const confirmFooterToggle = async () => {
    if (!footerToggleItem) return;
    const { item, newValue } = footerToggleItem;
    try {
      await toggleFooter(item, newValue);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, show_in_footer: newValue } : i)),
      );
      toast({
        title: "Success",
        description: `${label} ${newValue ? "added to" : "removed from"} footer successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update footer visibility",
        variant: "destructive",
      });
    } finally {
      setFooterToggleItem(null);
    }
  };

  return { footerToggleItem, setFooterToggleItem, confirmFooterToggle };
}
