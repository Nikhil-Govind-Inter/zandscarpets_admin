import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { otpSchema, type OtpFormData } from "@/schemas/forgotPasswordSchema";
import * as authApi from "@/services/auth/authApi";
import { ApiError } from "@/services/auth/authApi";

const formatCooldown = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

interface VerifyOtpStepProps {
  email: string;
  initialCooldownSeconds: number;
  onVerified: (resetToken: string) => void;
}

export function VerifyOtpStep({
  email,
  initialCooldownSeconds,
  onVerified,
}: VerifyOtpStepProps) {
  const [serverError, setServerError] = useState("");
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(
    null,
  );
  const [maxAttemptsReached, setMaxAttemptsReached] = useState(false);
  const [cooldown, setCooldown] = useState(initialCooldownSeconds);
  const [isResending, setIsResending] = useState(false);

  const form = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(
      () => setCooldown((c) => Math.max(c - 1, 0)),
      1000,
    );
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    setServerError("");
    setIsResending(true);
    try {
      const { cooldownSeconds } = await authApi.forgotPassword(email);
      setMaxAttemptsReached(false);
      setRemainingAttempts(null);
      form.reset({ otp: "" });
      setCooldown(cooldownSeconds);
    } catch (error) {
      if (error instanceof ApiError && error.code === "OTP_COOLDOWN") {
        const details = error.details as
          | { cooldownSeconds?: number }
          | undefined;
        if (typeof details?.cooldownSeconds === "number") {
          setCooldown(details.cooldownSeconds);
        }
      }
      setServerError(
        error instanceof ApiError
          ? error.message
          : "Failed to resend code. Please try again.",
      );
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (values: OtpFormData) => {
    setServerError("");
    try {
      const { resetToken } = await authApi.verifyOtp(email, values.otp);
      onVerified(resetToken);
    } catch (error) {
      if (error instanceof ApiError && error.code === "OTP_MAX_ATTEMPTS") {
        const details = error.details as
          | { cooldownSeconds?: number }
          | undefined;
        setMaxAttemptsReached(true);
        setRemainingAttempts(0);
        setServerError(error.message);
        // The code is dead server-side now; lock resend behind the longer cooldown.
        setCooldown(details?.cooldownSeconds ?? 0);
        return;
      }

      if (error instanceof ApiError && error.code === "OTP_INVALID") {
        const details = error.details as
          | { remainingAttempts?: number }
          | undefined;
        if (typeof details?.remainingAttempts === "number") {
          setRemainingAttempts(details.remainingAttempts);
        }
      }

      setServerError(
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.",
      );
      form.reset({ otp: "" });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Enter verification code</DialogTitle>
        <DialogDescription>
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{email}</span>. It
          expires in 5 minutes.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        {!maxAttemptsReached && remainingAttempts !== null && (
          <p className="text-sm text-muted-foreground">
            {remainingAttempts} attempt{remainingAttempts === 1 ? "" : "s"}{" "}
            remaining.
          </p>
        )}

        <div className="flex justify-center">
          <Controller
            control={form.control}
            name="otp"
            render={({ field }) => (
              <InputOTP
                maxLength={6}
                value={field.value}
                onChange={field.onChange}
                disabled={maxAttemptsReached}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            )}
          />
        </div>
        {form.formState.errors.otp && (
          <p className="text-center text-sm text-destructive">
            {form.formState.errors.otp.message}
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting || maxAttemptsReached}
        >
          {form.formState.isSubmitting ? "Verifying..." : "Verify code"}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          {cooldown > 0 ? (
            <span>Resend code in {formatCooldown(cooldown)}</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="font-medium text-primary underline-offset-4 hover:underline disabled:opacity-50"
            >
              {isResending ? "Sending..." : "Resend code"}
            </button>
          )}
        </div>
      </form>
    </>
  );
}
