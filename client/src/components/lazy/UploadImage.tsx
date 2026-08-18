import { useRef, useState } from "react";
import { Image } from "lucide-react";
import { uploadMediaFile } from "../../lib/upload";

const UploadImage = ({
  imageUrl,
  setImageUrl,
  width,
  height,
  text,
}: {
  imageUrl: string | null | undefined;
  setImageUrl: Function;
  width?: number | "full";
  height?: number | "full";
  text?: string;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<
    "idle" | "uploading" | "uploaded" | "error"
  >("idle");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !selectedFile.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    const previewURL = URL.createObjectURL(selectedFile);
    setPreview(previewURL);
    setUploadState("uploading");

    try {
      const result = await uploadMediaFile(selectedFile, { folder: "erp-bugs/images" });
      setImageUrl(result.fileUrl);
      setUploadState("uploaded");
    } catch (err) {
      console.error("Image upload error:", err);
      setUploadState("error");
    }
  };

  return (
    <div
      className="flex flex-col justify-center items-center gap-2 w-fit cursor-pointer"
      style={{
        width: width === "full" ? "100%" : `${width}px`,
        height: height === "full" ? "100%" : `${height}px`,
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
          height: height === "full" ? "100%" : `${height}px`,
        }}
      >
        {preview || imageUrl ? (
          <img
            src={preview || imageUrl!}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="flex flex-col items-center gap-4 justify-center">
            <Image size={48} className="text-[var(--muted-foreground)] mb-2" />
            <span className="text-sm text-[var(--muted-foreground)] whitespace-wrap">
              {text || "Click to upload"}
            </span>
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
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

export default UploadImage;
