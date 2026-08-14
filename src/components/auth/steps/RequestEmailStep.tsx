import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { emailSchema, type EmailFormData } from "@/schemas/forgotPasswordSchema";
import * as authApi from "@/services/auth/authApi";
import { ApiError } from "@/services/auth/authApi";

interface RequestEmailStepProps {
  onSent: (email: string, cooldownSeconds: number) => void;
}

export function RequestEmailStep({ onSent }: RequestEmailStepProps) {
  const [serverError, setServerError] = useState("");

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: EmailFormData) => {
    setServerError("");
    try {
      const { cooldownSeconds } = await authApi.forgotPassword(values.email);
      onSent(values.email, cooldownSeconds);
    } catch (error) {
      if (error instanceof ApiError && error.code === "EMAIL_NOT_FOUND") {
        form.setError("email", { type: "server", message: error.message });
        return;
      }
      setServerError(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Reset your password</DialogTitle>
        <DialogDescription>
          Enter the email address associated with your admin account. We'll send you a
          verification code.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="forgot-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="forgot-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="pl-10"
              {...form.register("email")}
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Sending..." : "Send verification code"}
        </Button>
      </form>
    </>
  );
}
