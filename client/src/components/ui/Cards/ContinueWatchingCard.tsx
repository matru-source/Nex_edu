import { PlayCircle, Clock } from "lucide-react";
import type { CourseWithCategory } from "../../../types";

interface ContinueWatchingCardProps {
  course: CourseWithCategory;
  lastLesson: {
    id: string;
    title: string;
    tumbnailUrl?: string | null;
    Video: Array<{ url: string; duration: number }>;
  };
  progress: number;
  lastWatched: string;
  chapterId?: string;
  onCardClick: (courseId: string, chapterId?: string) => void;
}

export default function ContinueWatchingCard({
  course,
  lastLesson,
  progress,
  lastWatched,
  chapterId,
  onCardClick,
}: ContinueWatchingCardProps) {
  const videoUrl = lastLesson.Video?.[0]?.url;
  const thumbnailUrl =
    lastLesson.tumbnailUrl || course.tumbnailUrl || "https://via.placeholder.com/400x225";

  // Format last watched date
  const formatLastWatched = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div
      className="group relative bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden 
                 hover:shadow-xl hover:border-[var(--primary)]/30 transition-all duration-300 cursor-pointer"
      onClick={() => onCardClick(course.id, chapterId)}
    >
      {/* Video Thumbnail with Play Button */}
      <div className="relative aspect-video bg-[var(--muted)] overflow-hidden">
        {videoUrl ? (
          <video
            src={videoUrl}
            className="w-full h-full object-cover"
            muted
            playsInline
            onMouseEnter={(e) => {
              const video = e.currentTarget;
              video.currentTime = (video.duration * progress) / 100;
              video.play().catch(() => {});
            }}
            onMouseLeave={(e) => {
              e.currentTarget.pause();
            }}
          />
        ) : (
          <img
            src={thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://via.placeholder.com/400x225";
            }}
          />
        )}

        {/* Progress Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
          <div
            className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
            <PlayCircle className="w-10 h-10 text-[var(--primary)] fill-[var(--primary)]" />
          </div>
        </div>

        {/* Progress Badge */}
        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
          <Clock size={12} />
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Course Info */}
      <div className="p-4">
        <h3 className="font-semibold text-[var(--foreground)] mb-2 line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-[var(--muted-foreground)] mb-1 line-clamp-1">
          {lastLesson.title}
        </p>
        <p className="text-xs text-[var(--muted-foreground)]">
          Last seen {formatLastWatched(lastWatched)}
        </p>
      </div>
    </div>
  );
}
