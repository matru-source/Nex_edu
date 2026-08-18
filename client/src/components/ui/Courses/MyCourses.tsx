import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import type { CourseWithCategory, Response } from "../../../types";
import { BookOpen, Sparkles, ArrowRight } from "lucide-react";
import MyCoursesCard from "../Cards/MyCourseCard";

import { useNavigate } from "react-router-dom";

interface PurchasedCoursesResponse extends Response {
  data: CourseWithCategory[];
}

interface MyCoursesProps {
  showHeader?: boolean;
}

export default function MyCourses({ }: MyCoursesProps) {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ["purchased-courses"],
    queryFn: async () => {
      const res = await api.get<PurchasedCoursesResponse>(
        API_ROUTES.PURCHASE.GET_PURCHASED_COURSES
      );
      return res.data;
    },
  });

  const handleCardClick = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-24 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-80 bg-[var(--muted)] rounded-2xl animate-pulse flex flex-col justify-end p-6"
            >
              <div className="h-6 w-2/3 bg-[var(--border)] rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-[var(--border)] rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 px-4">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full blur-2xl"></div>
          <div className="relative p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl border border-red-500/20">
            <BookOpen className="w-12 h-12 text-red-500" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
          Oops! Something went wrong
        </h3>
        <p className="text-[var(--muted-foreground)] text-center max-w-sm mb-6">
          We couldn't load your courses. Please try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-gradient-to-r from-[var(--primary)] to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
        >
          Retry
        </button>
      </div>
    );
  }

  const courses = data?.data || [];

  if (courses.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-4 px-4">
        <div className="relative mb-2 w-full max-w-xs">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-[var(--primary)]/30 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="relative">
            <svg
              viewBox="0 0 400 300"
              className="w-full h-auto drop-shadow-lg"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="100"
                y="80"
                width="200"
                height="140"
                rx="24"
                className="fill-[var(--card)] stroke-[var(--border)] stroke-2"
              />
              <rect
                x="120"
                y="100"
                width="160"
                height="100"
                rx="16"
                fill="url(#bookGradient)"
              />
              <defs>
                <linearGradient
                  id="bookGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--primary)"
                    stopOpacity="0.12"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--primary)"
                    stopOpacity="0.05"
                  />
                </linearGradient>
              </defs>
              <rect
                x="140"
                y="120"
                width="120"
                height="10"
                rx="5"
                className="fill-[var(--primary)] opacity-40"
              />
              <rect
                x="140"
                y="140"
                width="80"
                height="8"
                rx="4"
                className="fill-[var(--primary)] opacity-30"
              />
              <rect
                x="140"
                y="160"
                width="100"
                height="8"
                rx="4"
                className="fill-[var(--muted-foreground)] opacity-30"
              />
              <rect
                x="110"
                y="90"
                width="10"
                height="120"
                rx="5"
                className="fill-[var(--border)]"
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
            No Courses Purchased Yet
          </h3>
          <p className="text-[var(--muted-foreground)] text-lg max-w-md mx-auto leading-relaxed">
            Start exploring our premium courses and add them to your collection!
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
    );
  }

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {courses.map((course) => (
          <MyCoursesCard
            key={course.id}
            course={course}
            onCardClick={handleCardClick}
          />
        ))}
      </div>
    </div>
  );
}
