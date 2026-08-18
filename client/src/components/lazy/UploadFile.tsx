import { useRef, useState } from "react";
import { FileText, Upload } from "lucide-react";
import { uploadMediaFile } from "../../lib/upload";

interface UploadFileProps {
  fileUrl: string | null | undefined;
  setFileUrl: (url: string) => void;
  setFileName?: (name: string) => void;
  setFileType?: (type: string) => void;
  setFileSize?: (size: number) => void;
  width?: number | "full";
  height?: number;
  text?: string;
  accept?: string;
}

const UploadFile = ({
  fileUrl,
  setFileUrl,
  setFileName,
  setFileType,
  setFileSize,
  width = "full",
  height = 200,
  text = "Click to upload file",
  accept = "*/*",
}: UploadFileProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<
    "idle" | "uploading" | "uploaded" | "error"
  >("idle");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    setUploadState("uploading");

    try {
      const result = await uploadMediaFile(selectedFile, {
        folder: "erp-bugs/materials",
      });

      setFileUrl(result.fileUrl);
      if (setFileName) setFileName(selectedFile.name);
      if (setFileType) setFileType(selectedFile.type || result.format || "application/octet-stream");
      if (setFileSize) setFileSize(result.bytes || selectedFile.size);
      setUploadState("uploaded");
    } catch (err) {
      console.error("File upload error:", err);
      setUploadState("error");
    }
  };

  return (
    <div
      className="flex flex-col justify-center items-center gap-2 w-fit cursor-pointer"
      style={{
        width: width === "full" ? "100%" : `${width}px`,
      }}
    >
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`bg-gradient-to-br from-[var(--muted)] to-[var(--primary)]/50 rounded-xl p-6 border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] transition-colors duration-200 ${
          uploadState === "uploading"
            ? "animate-pulse border-[var(--primary)]"
            : "border-[var(--border)] flex items-center justify-center"
        }`}
        style={{
          width: width === "full" ? "100%" : `${width}px`,
          height: `${height}px`,
        }}
      >
        {fileUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <FileText size={48} className="text-[var(--primary)]" />
            <span className="text-sm text-[var(--foreground)] truncate max-w-full px-2">
              {fileUrl.split("/").pop() || "File uploaded"}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 justify-center">
            <Upload size={48} className="text-[var(--muted-foreground)] mb-2" />
            <span className="text-sm text-[var(--muted-foreground)] whitespace-wrap text-center">
              {text}
            </span>
          </div>
        )}
      </div>

      <input
        type="file"
        accept={accept}
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploadState === "uploaded" && (
        <p className="text-[var(--primary)] text-sm">Uploaded successfully!</p>
      )}
      {uploadState === "error" && (
        <p className="text-[var(--destructive)] text-sm">
          Upload failed. Try again.
        </p>
      )}
    </div>
  );
};

export default UploadFile;
