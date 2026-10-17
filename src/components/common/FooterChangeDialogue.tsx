import { useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  footerToggleItem: { newValue: boolean } | null;
  setFooterToggleItem: (value: null) => void;
  confirmFooterToggle: () => void;
  itemLabel?: string;
}

const FooterChangeDialogue = ({
  footerToggleItem,
  setFooterToggleItem,
  confirmFooterToggle,
  itemLabel = "item",
}: Props) => {
  const actionRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog open={!!footerToggleItem} onOpenChange={() => setFooterToggleItem(null)}>
      <AlertDialogContent
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          actionRef.current?.focus();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Footer Change</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to{" "}
            {footerToggleItem?.newValue
              ? `show this ${itemLabel} in the footer`
              : `remove this ${itemLabel} from the footer`}
            ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction ref={actionRef} onClick={confirmFooterToggle}>
            {footerToggleItem?.newValue ? "Show in Footer" : "Remove from Footer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default FooterChangeDialogue;
