import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { RequestEmailStep } from "./steps/RequestEmailStep";
import { VerifyOtpStep } from "./steps/VerifyOtpStep";
import { ResetPasswordStep } from "./steps/ResetPasswordStep";

type Step = "email" | "otp" | "reset";

interface ForgotPasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

// One controlled dialog drives the whole forgot-password → OTP → reset-password
// flow. It intentionally has no close button and ignores Esc/outside-click —
// the only way out is completing the flow (or the browser back/refresh).
export function ForgotPasswordDialog({ open, onClose }: ForgotPasswordDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const resetFlow = () => {
    setStep("email");
    setEmail("");
    setResetToken("");
    setCooldownSeconds(0);
  };

  const handleComplete = () => {
    toast({
      title: "Password reset",
      description: "Your password has been reset successfully. Please log in with your new password.",
    });
    resetFlow();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => { /* not user-closable mid-flow */ }}>
      <DialogContent
        hideCloseButton
        className="sm:max-w-md"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {step === "email" && (
          <RequestEmailStep
            onSent={(sentEmail, sentCooldownSeconds) => {
              setEmail(sentEmail);
              setCooldownSeconds(sentCooldownSeconds);
              setStep("otp");
            }}
          />
        )}

        {step === "otp" && (
          <VerifyOtpStep
            email={email}
            initialCooldownSeconds={cooldownSeconds}
            onVerified={(token) => {
              setResetToken(token);
              setStep("reset");
            }}
          />
        )}

        {step === "reset" && (
          <ResetPasswordStep email={email} resetToken={resetToken} onReset={handleComplete} />
        )}
      </DialogContent>
    </Dialog>
  );
}
