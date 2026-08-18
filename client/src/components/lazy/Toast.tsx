import { useEffect, useState } from "react";
import { CheckCircle2, X, XCircle, AlertCircle, Info } from "lucide-react";
import { useToast } from "../../contexts/ToastContext";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto close
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(toast.id), 300); // Wait for animation
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: "bg-green-500/20 border-green-500/50 text-green-500",
    error: "bg-red-500/20 border-red-500/50 text-red-500",
    warning: "bg-yellow-500/20 border-yellow-500/50 text-yellow-500",
    info: "bg-blue-500/20 border-blue-500/50 text-blue-500",
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm 
                  transition-all duration-300 min-w-[300px] max-w-[500px]
                  ${colors[toast.type]}
                  ${
                    isVisible
                      ? "translate-x-0 opacity-100"
                      : "translate-x-full opacity-0"
                  }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium text-[var(--foreground)]">
        {toast.message}
      </p>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(toast.id), 300);
        }}
        className="ml-2 p-1 rounded-lg hover:bg-black/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onClose={removeToast} />
        </div>
      ))}
    </div>
  );
}
