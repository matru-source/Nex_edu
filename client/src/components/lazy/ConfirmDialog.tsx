import Modal from "./Modal";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onClose,
  loading,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}) {
  if (!open) return null;

  return (
    <Modal open={open}>
      <div className="w-[420px]">
        <div className="p-4 border-b border-[var(--border)]">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              {description}
            </p>
          )}
        </div>
        <div className="p-4 flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-md text-[var(--foreground)] bg-[var(--muted)] hover:bg-[var(--muted)]/80 transition-all duration-300"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className="px-4 py-2 rounded-md text-[var(--primary-foreground)] bg-[var(--destructive)] hover:bg-[var(--destructive)]/90 disabled:opacity-70 transition-all duration-300"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
