import { X } from "lucide-react";
import { useEffect } from "react";

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export default function SidePanel({
  isOpen,
  onClose,
  title,
  children,
  width = "600px",
}: SidePanelProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Side Panel */}
      <div
        className="fixed right-0 top-0 h-full bg-[var(--card)] border-l border-[var(--border)] shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out"
        style={{
          width,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)] flex-shrink-0">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-sm">{children}</div>
      </div>
    </>
  );
}
