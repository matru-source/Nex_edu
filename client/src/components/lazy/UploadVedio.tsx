import { useRef, useState } from "react";
import { Video } from "lucide-react";
import { uploadMediaFile } from "../../lib/upload";

const UploadVideo = ({
  videoUrl,
  setVideoUrl,
  setVideoDuration,
  width,
  height,
  text,
}: {
  videoUrl: string | null | undefined;
  setVideoUrl: Function;
  setVideoDuration: Function;
  width?: number | "full";
  height?: number | "full";
  text?: string;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<
    "idle" | "uploading" | "uploaded" | "error"
  >("idle");
  const [progress, setProgress] = useState<number>(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !selectedFile.type.startsWith("video/")) {
      alert("Please select a valid video file.");
      return;
    }

    const previewURL = URL.createObjectURL(selectedFile);
    setPreview(previewURL);
    setUploadState("uploading");
    setProgress(0);

    // ✅ Extract duration with proper metadata loading
    const tempVideo = document.createElement("video");
    tempVideo.preload = "metadata";
    tempVideo.src = previewURL;

    tempVideo.onloadedmetadata = () => {
      try {
        const durationSec = Math.round(tempVideo.duration);
        if (durationSec > 0) {
          setVideoDuration(durationSec);
        } else {
          setVideoDuration(1);
        }
      } catch (err) {
        console.error("Error extracting duration:", err);
        setVideoDuration(1);
      }
    };

    tempVideo.onerror = () => {
      console.error("Error loading video metadata");
      setVideoDuration(1);
      URL.revokeObjectURL(tempVideo.src);
    };

    try {
      const result = await uploadMediaFile(selectedFile, {
        folder: "erp-bugs/videos",
        onProgress: (percent) => setProgress(percent),
      });

      if (result.duration && result.duration > 0) {
        setVideoDuration(result.duration);
      }

      setVideoUrl(result.fileUrl);
      setUploadState("uploaded");
    } catch (err) {
      console.error("Video upload error:", err);
      setUploadState("error");
    }
  };

  return (
    <div
      className="flex flex-col items-center gap-2 w-fit"
      style={{
        width: width === "full" ? "100%" : `${width}px`,
        height: height === "full" ? "100%" : `${height}px`,
      }}
    >
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`bg-gradient-to-br from-[var(--muted)] to-[var(--primary)]/50 rounded-xl p-6 border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] transition-colors duration-200 aspect-video ${
          uploadState === "uploading"
            ? "animate-pulse border-[var(--primary)]"
            : "border-[var(--border)]"
        }`}
        style={{
          width: width === "full" ? "100%" : `${width}px`,
          height: height === "full" ? "100%" : `${height}px`,
        }}
      >
        {preview || videoUrl ? (
          <video
            src={preview || videoUrl!}
            controls
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="flex flex-col items-center gap-4 justify-center h-full">
            <Video size={48} className="text-[var(--muted-foreground)] mb-2" />
            <span className="text-sm text-[var(--muted-foreground)] whitespace-wrap">
              {text || "Click to upload video"}
            </span>
          </div>
        )}
      </div>

      <input
        type="file"
        accept="video/*"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploadState === "uploading" && (
        <p className="text-[var(--primary)] text-sm">
          Uploading... {progress}%
        </p>
      )}
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

export default UploadVideo;
