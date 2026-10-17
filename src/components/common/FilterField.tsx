import { ReactNode } from "react";

// Small caption above a list filter so "All" dropdowns can be told apart.
const FilterField = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    {children}
  </div>
);

export default FilterField;
