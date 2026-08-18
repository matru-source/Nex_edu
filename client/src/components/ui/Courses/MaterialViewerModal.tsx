import { X, FileText, AlertCircle } from "lucide-react";
import { useEffect } from "react";

interface MaterialViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: {
    title: string;
    materialType: string;
    fileUrl?: string | null;
    externalUrl?: string | null;
    description?: string | null;
  } | null;
}

export default function MaterialViewerModal({
  isOpen,
  onClose,
  material,
}: MaterialViewerModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !material) return null;

  const url = material.externalUrl || material.fileUrl;
  const type = material.materialType;

  // Get the URL suitable for inline viewing
  const getInlineUrl = (rawUrl: string) => {
    if (rawUrl.includes("cloudinary.com")) {
      const parts = rawUrl.split("/upload/");
      if (parts.length === 2) {
        return `${parts[0]}/upload/fl_attachment:false/${parts[1]}`;
      }
    }
    return rawUrl;
  };

  const renderContent = () => {
    if (!url) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <AlertCircle size={48} className="mb-4 opacity-50" />
          <p className="text-lg font-medium">No file available</p>
          <p className="text-sm">This material doesn't have an attached file.</p>
        </div>
      );
    }

    const inlineUrl = getInlineUrl(url);

    // Image types
    if (type === "IMAGE") {
      return (
        <div className="flex items-center justify-center h-full p-4 overflow-auto">
          <img
            src={inlineUrl}
            alt={material.title}
            className="max-w-full max-h-full object-contain rounded-lg"
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      );
    }

    // Video types
    if (type === "VIDEO") {
      return (
        <div className="flex items-center justify-center h-full p-4">
          <video
            src={inlineUrl}
            controls
            controlsList="nodownload"
            disablePictureInPicture
            className="max-w-full max-h-full rounded-lg"
            onContextMenu={(e) => e.preventDefault()}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    // Audio types
    if (type === "AUDIO") {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 gap-6">
          <FileText size={64} className="text-green-500 opacity-60" />
          <h3 className="text-xl font-semibold text-foreground">{material.title}</h3>
          <audio
            src={inlineUrl}
            controls
            controlsList="nodownload"
            className="w-full max-w-md"
            onContextMenu={(e) => e.preventDefault()}
          >
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    // PDF, Documents, Presentations — always use Google Docs Viewer to avoid Chrome cross-origin blocking
    if (type === "PDF" || type === "DOCUMENT" || type === "PRESENTATION") {
      const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
      return (
        <div className="relative w-full h-full">
          <iframe
            src={viewerUrl}
            title={material.title}
            className="w-full h-full border-0"
            allowFullScreen
          />
          {/* Overlay to hide Google Docs Viewer pop-out button */}
          <div
            className="absolute top-0 right-0 pointer-events-auto"
            style={{ width: "56px", height: "56px", zIndex: 10, backgroundColor: "#454545" }}
          />
        </div>
      );
    }

    // External links — show in iframe without sandbox (or fallback message)
    if (type === "LINK") {
      return (
        <iframe
          src={url}
          title={material.title}
          className="w-full h-full border-0"
          allowFullScreen
        />
      );
    }

    // Code and Other — try iframe, show fallback message
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
        <FileText size={48} className="mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">Preview not available</p>
        <p className="text-sm text-center">
          This file type ({type}) cannot be previewed inline.
        </p>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-card rounded-xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg font-semibold text-foreground truncate">
              {material.title}
            </h2>
            {material.description && (
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {material.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex-shrink-0"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-muted/10">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
