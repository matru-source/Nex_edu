import { useQuery } from "@tanstack/react-query";
import useInitNavStackOnce from "../../../../hooks/useInitNavstack";
import TopBar from "../../../lazy/TopBar";
import VideoPlayer from "../../../ui/VideoPlayer";
import { useParams } from "react-router-dom";
import api from "../../../../lib/axios/axios";
import { API_ROUTES } from "../../../../lib/api";
import type { Lessons, Response, Video } from "../../../../types";
import { useState, useEffect, useRef } from "react";
import { Pause, Play } from "lucide-react";
import Tabs from "../../../lazy/Tabs";
import Notes from "../../../ui/Courses/Lesson/Notes";
import Overview from "../../../ui/Courses/Lesson/Overview";
import Faq from "../../../ui/Courses/Lesson/Faq";
import Trainer from "../../../ui/Courses/Lesson/Trainer";
import Materials from "../../../ui/Courses/Lesson/Material";
import { formatDuration } from "../../../../utils/formatDuration";
import { useToast } from "../../../../contexts/ToastContext";

interface LessonsWithVideoResponse extends Response {
  data: (Lessons & { Video: Video[]; isCompleted?: boolean })[];
}

export default function Lessons() {
  useInitNavStackOnce([{ title: "Lessons", path: "/course/lesson" }]);
  const { chapterId } = useParams();
  const [selectedLesson, setSelectedLesson] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoPlayerRef = useRef<any>(null);
  const { success, info } = useToast();

  // Autoplay state - load from localStorage
  const [autoplayEnabled, setAutoplayEnabled] = useState(() => {
    const saved = localStorage.getItem("video-autoplay");
    return saved ? JSON.parse(saved) : false;
  });

  // Save autoplay preference to localStorage
  useEffect(() => {
    localStorage.setItem("video-autoplay", JSON.stringify(autoplayEnabled));
  }, [autoplayEnabled]);

  // Handle autoplay toggle
  const handleAutoplayToggle = () => {
    const newValue = !autoplayEnabled;
    setAutoplayEnabled(newValue);

    // Show toast notification
    if (newValue) {
      success("Autoplay enabled - Next lesson will play automatically");
    } else {
      info("Autoplay disabled");
    }
  };

  if (!chapterId)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Invalid Chapter
      </div>
    );

  const {
    data: lessonsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["get-lessons-with-auth", chapterId],
    queryFn: async () => {
      const res = await api.get<LessonsWithVideoResponse>(
        API_ROUTES.LESSON.GET_LESSONS_BY_CHAPTER_ID_WITH_AUTH(chapterId)
      );
      return res.data;
    },
  });

  const lessons = lessonsData?.data || [];

  // Reset selected lesson when lessons change
  useEffect(() => {
    setSelectedLesson(0);
  }, [lessons]);

  // Handle autoplay - move to next lesson when video ends
  const handleVideoEnd = () => {
    if (selectedLesson < lessons.length - 1) {
      // Smooth transition to next lesson
      setIsTransitioning(true);

      // Small delay for smooth fade effect
      setTimeout(() => {
        setSelectedLesson(selectedLesson + 1);

        // Reset transition state after video loads
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }, 300);
    }
  };

  // Handle video player ready
  const handleVideoReady = (player: any) => {
    videoPlayerRef.current = player;
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <TopBar />
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 h-96 bg-muted rounded"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <TopBar />
        <div className="p-8">
          <div className="text-center py-12">
            <div className="text-destructive text-lg mb-4">
              Failed to load lessons
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!lessons.length) {
    return (
      <div className="w-full">
        <TopBar />
        <div className="p-8">
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg">
              No lessons available
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentLesson = lessons[selectedLesson];
  const currentVideo = currentLesson?.Video?.[0];

  return (
    <div className="w-full bg-background/50 min-h-screen">
      <TopBar />
      <div className="p-4 lg:p-8">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Video Section - Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player with smooth transition */}
            <div className="bg-card border-2 border-card overflow-hidden rounded-xl">
              {currentVideo ? (
                <div
                  className={`aspect-video bg-card transition-opacity duration-300 ${
                    isTransitioning ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <VideoPlayer
                    url={currentVideo.url}
                    lessonId={currentLesson.id}
                    videoId={currentVideo.id}
                    onReady={handleVideoReady}
                    onVideoEnd={handleVideoEnd}
                    autoplayEnabled={autoplayEnabled}
                    poster={currentLesson.tumbnailUrl || undefined}
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <div className="text-muted-foreground text-center">
                    <div className="text-4xl mb-2">🎬</div>
                    <div className="text-lg">No video available</div>
                  </div>
                </div>
              )}
            </div>

            {/* tabs */}
            <Tabs
              tabs={[
                {
                  title: "Overview",
                  content: <Overview currentLesson={currentLesson} />,
                },
                {
                  title: "Materials",
                  content: <Materials currentLesson={currentLesson} />,
                },
                {
                  title: "FAQ & Discussion",
                  content: <Faq currentLesson={currentLesson} />,
                },
                {
                  title: "Trainer",
                  content: <Trainer currentLesson={currentLesson} />,
                },
              ]}
            />
          </div>

          {/* Right */}
          <div className="space-y-8">
            {/* Lesson List*/}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    Lessons
                  </h3>
                  {/* Autoplay Toggle Button */}
                  <button
                    onClick={handleAutoplayToggle}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      autoplayEnabled
                        ? "bg-[var(--primary)]/20 text-[var(--primary)] hover:bg-[var(--primary)]/30"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]/80"
                    }`}
                    title={
                      autoplayEnabled ? "Autoplay enabled" : "Autoplay disabled"
                    }
                  >
                    {autoplayEnabled ? (
                      <Play size={18} fill="currentColor" />
                    ) : (
                      <Pause size={18} fill="currentColor" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {lessons.length} lessons • {formatTotalDuration(lessons)}
                </p>
              </div>

              <div className="max-h-[600px] overflow-y-auto">
                {lessons.map((lesson, index) => {
                  const lessonVideo = lesson.Video?.[0];
                  const isActive = index === selectedLesson;
                  const isCompleted = lesson.isCompleted || false; // ✅ Get completion status

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        setIsTransitioning(true);
                        setTimeout(() => {
                          setSelectedLesson(index);
                          setTimeout(() => {
                            setIsTransitioning(false);
                          }, 300);
                        }, 200);
                      }}
                      className={`w-full p-4 text-left border-b border-border last:border-b-0 transition-all duration-200 ${
                        isActive
                          ? "bg-primary/10 border-primary/20"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                            isActive
                              ? "bg-primary text-primary-foreground scale-110"
                              : isCompleted
                              ? "bg-green-500 text-white" // ✅ Green for completed
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Play size={12} fill="currentColor" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4
                            className={`font-medium text-sm leading-tight mb-1 transition-colors ${
                              isActive ? "text-primary" : "text-foreground"
                            }`}
                          >
                            {lesson.title}
                          </h4>

                          {lessonVideo && (
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span>🎬</span>
                              <span>
                                {formatDuration(lessonVideo.duration)}
                              </span>
                              {isCompleted && ( // ✅ Show completion indicator
                                <span className="text-green-500 font-medium">
                                  ✓ Completed
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {isActive && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            {/* notes */}
            <Notes currentLesson={currentLesson} />
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTotalDuration(
  lessons: (Lessons & { Video: Video[] })[]
): string {
  const totalSeconds = lessons.reduce((total, lesson) => {
    const video = lesson.Video?.[0];
    return total + (video?.duration || 0);
  }, 0);

  return formatDuration(totalSeconds);
}
