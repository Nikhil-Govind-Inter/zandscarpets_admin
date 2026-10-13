import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Download, Upload, CheckCircle2, XCircle, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  BulkUploadEntity,
  BulkUploadValidateResult,
  downloadTemplate,
  validateBulkUploadFile,
  commitBulkUploadImport,
  BulkUploadApiError,
} from "@/services/bulkUpload/bulkUploadApi";
import { ErrorList } from "./ErrorList";

// Four-step wizard shared by every spreadsheet entity (spec §5): download
// template, upload file, review errors/warnings or a success preview,
// confirm import + result summary. No generic wizard library — same
// lightweight `useState<Step>` pattern as
// src/components/auth/ForgotPasswordDialog.tsx.

type Status = "idle" | "validating" | "failed" | "passed" | "committing" | "done";

export interface BulkUploadWizardProps {
  entity: BulkUploadEntity;
  title: string;
  description: string;
  notes: string[];
}

export function BulkUploadWizard({ entity, title, description, notes }: BulkUploadWizardProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<BulkUploadValidateResult | null>(null);
  const [commitResult, setCommitResult] = useState<{ created: number; skipped: number; updated?: number } | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const validationIdRef = useRef<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setFileName(file.name);
      setStatus("validating");
      setCommitResult(null);
      try {
        const res = await validateBulkUploadFile(entity, file);
        setResult(res);
        validationIdRef.current = res.validationId ?? null;
        setStatus(res.status === "passed" ? "passed" : "failed");
      } catch (error) {
        const message = error instanceof BulkUploadApiError ? error.message : "Upload failed";
        toast({ title: "Upload failed", description: message, variant: "destructive" });
        setStatus("idle");
      }
    },
    [entity, toast],
  );

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) handleFile(accepted[0]);
    },
    [handleFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] },
    maxFiles: 1,
    disabled: status === "validating" || status === "committing",
  });

  const handleConfirm = async () => {
    if (!validationIdRef.current) return;
    setStatus("committing");
    try {
      const res = await commitBulkUploadImport(entity, validationIdRef.current);
      setCommitResult(res);
      setStatus("done");
      const updatedPart = res.updated ? `, ${res.updated} updated` : "";
      toast({ title: "Import complete", description: `${res.created} created${updatedPart}, ${res.skipped} skipped.` });
    } catch (error) {
      const message = error instanceof BulkUploadApiError ? error.message : "Import failed";
      toast({ title: "Import failed", description: message, variant: "destructive" });
      setStatus("failed");
    }
  };

  const reset = () => {
    setStatus("idle");
    setResult(null);
    setCommitResult(null);
    setFileName(null);
    validationIdRef.current = null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>

      <Alert>
        <AlertTitle>Important notes</AlertTitle>
        <AlertDescription>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Download the template fresh from this page. Don't use old copies or change header names.</li>
            <li>Don't rename, reorder or delete columns. Leave optional cells blank — not "N/A" or "-".</li>
            <li>If any row has errors, the whole file is rejected and nothing is saved until you fix it and confirm.</li>
            {notes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Step 1: Download template</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => downloadTemplate(entity)}>
            <Download className="h-4 w-4 mr-2" />
            Download {title} template
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Step 2: Upload file</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            } ${status === "validating" || status === "committing" ? "opacity-50 pointer-events-none" : ""}`}
          >
            <input {...getInputProps()} />
            {status === "validating" ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Validating {fileName}…</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="h-6 w-6" />
                <span>Drag and drop the filled .xlsx file here, or click to browse</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {status === "failed" ? (
                <>
                  <XCircle className="h-5 w-5 text-destructive" /> Step 3: Review
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" /> Step 3: Review
                </>
              )}
            </CardTitle>
            <CardDescription>
              {result.status === "failed"
                ? `We found ${result.errors.length} problem(s) in this file. Nothing has been imported. Fix them and upload the file again.`
                : `Your file looks good. ${result.summary.created} row(s) will be created${
                    result.summary.updated ? `, ${result.summary.updated} existing row(s) will be updated` : ""
                  }.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.errors.length > 0 && <ErrorList issues={result.errors} />}
            {result.warnings.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Warnings (won't block import)</h4>
                <ErrorList issues={result.warnings} />
              </div>
            )}

            {result.status === "passed" && status !== "done" && (
              <div className="flex items-center gap-3 pt-2 border-t">
                <Button onClick={handleConfirm} disabled={status === "committing"}>
                  {status === "committing" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Confirm Import
                </Button>
                <Button variant="ghost" onClick={reset} disabled={status === "committing"}>
                  Cancel
                </Button>
              </div>
            )}

            {status === "failed" && (
              <Button variant="outline" onClick={reset}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Fix and re-upload
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {status === "done" && commitResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" /> Step 4: Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              {commitResult.created} created
              {typeof commitResult.updated === "number" ? `, ${commitResult.updated} updated` : ""}, {commitResult.skipped} skipped.
            </p>
            <Button variant="outline" onClick={reset}>
              Upload another file
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
