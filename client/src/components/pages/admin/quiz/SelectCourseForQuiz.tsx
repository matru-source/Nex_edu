import { BookOpen, ArrowRight } from "lucide-react";
import TopBar from "../../../lazy/TopBar";
import useRouter from "../../../../hooks/useRouter";
import useInitNavStackOnce from "../../../../hooks/useInitNavstack";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../lib/axios/axios";
import { API_ROUTES } from "../../../../lib/api";
import type { Response, CourseWithCategory } from "../../../../types";
import { useState } from "react";

interface CoursesResponse extends Response {
  data: CourseWithCategory[];
}

export default function SelectCourseForQuiz() {
  useInitNavStackOnce([
    { title: "Quizzes", path: "/admin/quizzes" },
    {
      title: "Create Quiz - Select Course",
      path: "/admin/quiz/create/select-course",
    },
  ]);

  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const coursesQuery = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await api.get<CoursesResponse>(API_ROUTES.COURSE.GET_COURSES);
      return res.data;
    },
  });

  const handleNext = () => {
    if (selectedCourse) {
      router.push(
        `/admin/quiz/create/select-module/${selectedCourse}`,
        "Select Module"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      <TopBar />

      <div className="max-w-4xl mx-auto mt-8 px-8 pb-8">
        <div className="bg-[var(--card)] rounded-2xl shadow-lg border border-[var(--border)] overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-6 pb-4 border-b border-[var(--border)] bg-gradient-to-r from-[var(--primary)]/5 to-[var(--ring)]/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--ring)] flex items-center justify-center">
                <BookOpen className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">
                  Select Course
                </h1>
                <p className="text-[var(--muted-foreground)] text-sm mt-1">
                  Choose the course for your quiz
                </p>
              </div>
            </div>
          </div>

          {/* Course List */}
          <div className="p-6">
            {coursesQuery.isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto"></div>
                <p className="text-[var(--muted-foreground)] mt-4">
                  Loading courses...
                </p>
              </div>
            ) : coursesQuery.data?.data.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-[var(--muted-foreground)] mx-auto mb-4" />
                <p className="text-lg font-medium text-[var(--foreground)]">
                  No courses found
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {coursesQuery.data?.data.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedCourse === course.id
                        ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md"
                        : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/30 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[var(--foreground)] mb-1">
                          {course.title}
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs px-2 py-1 bg-[var(--muted)] rounded-full text-[var(--muted-foreground)]">
                            {course.category.name}
                          </span>
                          <span className="text-xs px-2 py-1 bg-[var(--muted)] rounded-full text-[var(--muted-foreground)]">
                            {course.subCategory.name}
                          </span>
                        </div>
                      </div>
                      {selectedCourse === course.id && (
                        <div className="ml-4 w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-4 border-t border-[var(--border)] bg-[var(--muted)]/20 flex justify-between items-center">
            <button
              onClick={() => router.back()}
              className="px-6 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleNext}
              disabled={!selectedCourse}
              className="px-6 py-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next: Select Module
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
