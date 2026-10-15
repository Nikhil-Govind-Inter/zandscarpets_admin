export type StatusFilter = "all" | "active" | "inactive";

export const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] satisfies { value: StatusFilter; label: string }[];
