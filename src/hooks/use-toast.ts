import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  duration?: number;
};

export function useToast() {
  const toast = ({ title, description, action, variant, duration = 5000 }: ToastProps) => {
    return sonnerToast(title, {
      description,
      action,
      duration,
      className: variant === "destructive" ? "destructive" : undefined,
    });
  };

  return {
    toast,
  };
}
