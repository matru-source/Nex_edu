import type { Lessons, Video } from "../../../../types";
import { FiBook, FiFileText, FiClock } from "react-icons/fi";
import { formatDuration } from "../../../../utils/formatDuration";

export default function Overview({
  currentLesson,
}: {
  currentLesson: Lessons & { Video: Video[] };
}) {


  const getVideoStats = () => {
    if (!currentLesson.Video || currentLesson.Video.length === 0) {
      return null;
    }

    const video = currentLesson.Video[0];
    return {
      duration: video.duration ? formatDuration(video.duration) : "N/A",
    };
  };

  const videoStats = getVideoStats();
  const hasContent = currentLesson.content?.trim().length > 0;

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm mt-6 overflow-hidden">
      {/* Header Section */}
      <div className="bg-primary/10 px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <FiBook className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                {currentLesson.title}
              </h3>

              {/* Lesson Metadata */}
              {videoStats && (
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <FiClock className="w-4 h-4 text-primary" />
                    <span>{videoStats.duration}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {hasContent ? (
          <div className="prose prose-lg max-w-none">
            <div className="text-foreground leading-relaxed space-y-4">
              {currentLesson.content.split("\n\n").map(
                (paragraph, index) =>
                  paragraph.trim() && (
                    <div
                      key={index}
                      className={`p-4 rounded-lg transition-all duration-200 ${
                        index % 2 === 0 ? "bg-muted" : "bg-card"
                      } hover:shadow-sm`}
                    >
                      <p className="text-foreground leading-7">{paragraph}</p>
                    </div>
                  )
              )}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-muted rounded-full mb-4">
              <FiFileText className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Lesson Content Coming Soon
            </h3>
            <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
              We're working on creating comprehensive content for this lesson.
              Check back later for detailed explanations, examples, and learning
              materials.
            </p>
            <div className="mt-6 flex items-center space-x-2 text-sm text-muted-foreground">
              <FiClock className="w-4 h-4" />
              <span>Content in progress</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {hasContent && (
        <div className="px-6 py-4 bg-muted border-t border-border">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <FiFileText className="w-4 h-4" />
                <span>{currentLesson.content.split(/\s+/).length} words</span>
              </span>
              <span className="flex items-center space-x-1">
                <FiBook className="w-4 h-4" />
                <span>
                  {currentLesson.content.split("\n\n").length} sections
                </span>
              </span>
            </div>
            <div className="text-muted-foreground">
              Last updated{" "}
              {new Date(currentLesson.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
