import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import type { CourseWithCategory, Response } from "../../../types";
import { PlayCircle, Sparkles, ArrowRight } from "lucide-react";
import ContinueWatchingCard from "../Cards/ContinueWatchingCard";

import { useNavigate } from "react-router-dom";

interface ContinueWatchingResponse extends Response {
  data: Array<{
    course: CourseWithCategory;
    lastLesson: {
      id: string;
      title: string;
      tumbnailUrl?: string | null;
      Video: Array<{ url: string; duration: number }>;
      chapterId: string;
    };
    progress: number;
    currentTime: number;
    duration: number;
    lastWatched: string;
  }>;
}

interface ContinueWatchingProps {}

export default function ContinueWatching({}: ContinueWatchingProps) {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ["continue-watching"],
    queryFn: async () => {
      const res = await api.get<ContinueWatchingResponse>(
        API_ROUTES.VIEWING_HISTORY.GET_CONTINUE_WATCHING
      );
      return res.data;
    },
    refetchInterval: 30000,
  });

  const handleCardClick = (courseId: string, chapterId?: string) => {
    if (chapterId) {
      navigate(`/course/lessons/${chapterId}`);
    } else {
      navigate(`/course/${courseId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-80 bg-[var(--muted)] rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full blur-2xl"></div>
            <div className="relative p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl border border-red-500/20">
              <PlayCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-[var(--muted-foreground)] text-center max-w-sm mb-6">
            We couldn't load your continue watching list. Please try again
            later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-gradient-to-r from-[var(--primary)] to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const continueWatching = data?.data || [];

  if (continueWatching.length === 0) {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center justify-center py-4 px-4">
          {/* Premium Illustration */}
          <div className="relative mb-2 w-full max-w-xs">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-[var(--primary)]/30 to-transparent rounded-full blur-3xl animate-pulse"></div>
            <div className="relative">
              <svg
                viewBox="0 0 400 300"
                className="w-full h-auto drop-shadow-lg"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="50"
                  y="40"
                  width="300"
                  height="200"
                  rx="20"
                  className="fill-[var(--card)] stroke-[var(--border)] stroke-2"
                />
                <defs>
                  <linearGradient
                    id="screenGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--primary)"
                      stopOpacity="0.1"
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--primary)"
                      stopOpacity="0.05"
                    />
                  </linearGradient>
                </defs>
                <rect
                  x="70"
                  y="60"
                  width="260"
                  height="160"
                  rx="10"
                  fill="url(#screenGradient)"
                />
                <circle
                  cx="200"
                  cy="140"
                  r="40"
                  className="fill-[var(--primary)] opacity-80"
                />
                <polygon
                  points="185,120 185,160 220,140"
                  fill="white"
                  opacity="0.9"
                />
              </svg>
              <div className="absolute -top-8 -right-8 animate-bounce">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)]/80 to-[var(--primary)]/40 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-[var(--foreground)] mb-3">
              Start Your Learning Journey
            </h3>
            <p className="text-[var(--muted-foreground)] text-lg max-w-md mx-auto leading-relaxed">
              No courses started yet. Explore our vast library of courses and
              begin learning today!
            </p>
          </div>
          <button 
            onClick={() => navigate("/dashboard")}
            className="group relative px-8 py-4 bg-gradient-to-r from-[var(--primary)] to-blue-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <span>Explore Courses</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {continueWatching.map((item) => (
          <ContinueWatchingCard
            key={item.course.id}
            course={item.course}
            lastLesson={item.lastLesson}
            progress={item.progress}
            lastWatched={item.lastWatched}
            chapterId={item.lastLesson.chapterId}
            onCardClick={handleCardClick}
          />
        ))}
      </div>
    </div>
  );
}
