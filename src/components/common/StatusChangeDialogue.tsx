import { useRef } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog"

const StatusChangeDialogue = ({
    statusToggleItem,
    setStatusToggleItem,
    confirmStatusToggle,
    itemLabel = "item",

}) => {
  const actionRef = useRef<HTMLButtonElement>(null)

  return (
    <div>
       <AlertDialog
              open={!!statusToggleItem}
              onOpenChange={() => setStatusToggleItem(null)}
            >
              {/* Radix focuses Cancel by default; focus Confirm instead so Enter confirms. */}
              <AlertDialogContent
                onOpenAutoFocus={(e) => {
                  e.preventDefault();
                  actionRef.current?.focus();
                }}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to{" "}
                    {statusToggleItem?.newStatus ? "activate" : "deactivate"} this{" "}
                    {itemLabel}? This will change its visibility and availability in the
                    system.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction ref={actionRef} onClick={confirmStatusToggle}>
                    {statusToggleItem?.newStatus ? "Activate" : "Deactivate"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

    </div>
  )
}

export default StatusChangeDialogue
