import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Upload, Copy, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadBulkMedia, BulkMediaFileResult, BulkMediaType } from "@/services/bulkUpload/bulkMediaApi";

// Bulk image upload for the spreadsheet steps: many files at once, each
// returned with the stored path to paste into main_image / list_image /
// media_path columns. Mirrors BulkMediaUploadDialog's staged-file approach
// (src/components/details/BulkMediaUploadDialog.tsx) at page scope instead
// of a modal, since this is its own wizard step rather than a picker
// launched from another screen.

const TYPE_OPTIONS: { value: BulkMediaType; label: string }[] = [
  { value: "products", label: "Products (main_image / list_image)" },
  { value: "products-variants", label: "Product Variants (media_path)" },
];

export default function MediaBulkUpload() {
  const { toast } = useToast();
  const [type, setType] = useState<BulkMediaType>("products");
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<BulkMediaFileResult[]>([]);

  const onDrop = useCallback(
    async (accepted: File[]) => {
      if (!accepted.length) return;
      setUploading(true);
      try {
        const files = await uploadBulkMedia(type, accepted);
        setResults((prev) => [...files, ...prev]);
        const failedCount = files.filter((f) => f.status === "failed").length;
        toast({
          title: "Upload processed",
          description: `${files.length - failedCount} succeeded, ${failedCount} failed.`,
        });
      } catch (error) {
        toast({ title: "Upload failed", description: (error as Error).message, variant: "destructive" });
      } finally {
        setUploading(false);
      }
    },
    [type, toast],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] },
    maxFiles: 50,
    disabled: uploading,
  });

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    toast({ title: "Copied", description: path });
  };

  const copyAll = () => {
    const paths = results.filter((r) => r.status === "success" && r.storedPath).map((r) => r.storedPath);
    navigator.clipboard.writeText(paths.join("\n"));
    toast({ title: "Copied", description: `${paths.length} path(s) copied` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bulk Upload: Media</h1>
        <p className="text-muted-foreground mt-1">
          Upload product and variant images here first, then paste the stored paths into the Products / Product
          Variants spreadsheets.
        </p>
      </div>

      <Alert>
        <AlertTitle>Important notes</AlertTitle>
        <AlertDescription>
          Only jpg, png and webp are accepted. One bad file won't fail the rest of the batch — failed files are
          listed with a reason below.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload type</CardTitle>
          <CardDescription>Pick which sheet these images are for — it decides the storage folder.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          {TYPE_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={type === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setType(opt.value)}
              disabled={uploading}
            >
              {opt.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
              <span>{uploading ? "Uploading…" : "Drag and drop images here, or click to browse (up to 50)"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Uploaded files</CardTitle>
            <Button variant="outline" size="sm" onClick={copyAll}>
              <Copy className="h-4 w-4 mr-2" /> Copy all paths
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stored path</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.originalName ?? "—"}</TableCell>
                    <TableCell>
                      {r.status === "success" ? (
                        <Badge variant="secondary">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> success
                        </Badge>
                      ) : (
                        <Badge variant="destructive" title={r.error}>
                          <XCircle className="h-3 w-3 mr-1" /> failed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{r.storedPath ?? r.error}</TableCell>
                    <TableCell>
                      {r.storedPath && (
                        <Button variant="ghost" size="icon" onClick={() => copyPath(r.storedPath!)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
