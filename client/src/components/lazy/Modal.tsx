export default function Modal({
  children,
  open,
  onClose,
}: {
  children: React.ReactNode;
  open: boolean;
  onClose?: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 w-screen h-screen bg-black/50 backdrop-blur-sm top-0 left-0 z-50 flex justify-center items-center fade"
      role="dialog"
      aria-modal="true"
      aria-labelledby="Modal"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div className="bg-[var(--card)] rounded-xl overflow-hidden pop flex flex-col max-h-[90vh] max-w-[90vw] shadow-2xl border border-[var(--border)]">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--muted)]/80 text-[var(--foreground)] transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
