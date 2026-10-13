import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { BulkUploadIssue } from "@/services/bulkUpload/bulkUploadApi";

const PAGE_SIZE = 50;

// Grouped by nothing extra (one sheet per wizard instance already), sorted
// by row, with a severity/column/search filter and a 50-row cap + "show
// all" — spec §11.
export function ErrorList({ issues }: { issues: BulkUploadIssue[] }) {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const sorted = useMemo(
    () => [...issues].sort((a, b) => (a.row ?? -1) - (b.row ?? -1)),
    [issues],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (issue) =>
        issue.message.toLowerCase().includes(q) ||
        issue.column?.toLowerCase().includes(q) ||
        String(issue.row ?? "").includes(q),
    );
  }, [sorted, search]);

  const visible = showAll ? filtered : filtered.slice(0, PAGE_SIZE);

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search errors (row, column, message)…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Row</TableHead>
              <TableHead className="w-40">Column</TableHead>
              <TableHead className="w-24">Severity</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((issue, i) => (
              <TableRow key={i}>
                <TableCell>{issue.row ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{issue.column ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={issue.severity === "error" ? "destructive" : "secondary"}>
                    {issue.severity}
                  </Badge>
                </TableCell>
                <TableCell>{issue.message}</TableCell>
              </TableRow>
            ))}
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                  No issues match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {!showAll && filtered.length > PAGE_SIZE && (
        <Button variant="outline" size="sm" onClick={() => setShowAll(true)}>
          Show all {filtered.length} issues
        </Button>
      )}
    </div>
  );
}
