import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import TopBar from "../../../lazy/TopBar";
import useInitNavStackOnce from "../../../../hooks/useInitNavstack";
import api from "../../../../lib/axios/axios";
import { API_ROUTES } from "../../../../lib/api";
import type { Response } from "../../../../types";
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  TrendingUp,
  BookOpen,
  Search,
  Filter,
  Award,
} from "lucide-react";
import useRouter from "../../../../hooks/useRouter";

interface QuizAttempt {
  id: string;
  quizId: string;
  score: number | null;
  totalPoints: number | null;
  percentage: number | null;
  status: string;
  startedAt: string;
  completedAt: string | null;
  quiz: {
    id: string;
    title: string;
    passingScore: number;
    chapter: {
      title: string;
      module: {
        expertise: {
          skillCategory: {
            course: {
              id: string;
              title: string;
            };
          };
        };
      };
    };
  };
}

interface AttemptsResponse extends Response {
  data: QuizAttempt[];
}

export default function MyQuizAttempts() {
  useInitNavStackOnce([{ title: "My Quiz Attempts", path: "/quiz/attempts" }]);
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");

  const attemptsQuery = useQuery({
    queryKey: ["my-quiz-attempts"],
    queryFn: async () => {
      const res = await api.get<AttemptsResponse>(
        API_ROUTES.QUIZ.GET_MY_ATTEMPTS
      );
      return res.data;
    },
  });

  const filteredAttempts = useMemo(() => {
    if (!attemptsQuery.data?.data) return [];
    let filtered = attemptsQuery.data.data;

    // Search filter
    if (searchInput) {
      const lowerSearch = searchInput.toLowerCase();
      filtered = filtered.filter(
        (attempt) =>
          attempt.quiz.title.toLowerCase().includes(lowerSearch) ||
          attempt.quiz.chapter.title.toLowerCase().includes(lowerSearch) ||
          attempt.quiz.chapter.module.expertise.skillCategory.course.title
            .toLowerCase()
            .includes(lowerSearch)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((attempt) => {
        if (statusFilter === "passed") {
          return (
            attempt.percentage &&
            attempt.percentage >= attempt.quiz.passingScore
          );
        } else if (statusFilter === "failed") {
          return (
            attempt.percentage && attempt.percentage < attempt.quiz.passingScore
          );
        } else {
          return attempt.status === statusFilter.toUpperCase();
        }
      });
    }

    // Course filter
    if (courseFilter !== "all") {
      filtered = filtered.filter(
        (attempt) =>
          attempt.quiz.chapter.module.expertise.skillCategory.course.id ===
          courseFilter
      );
    }

    return filtered;
  }, [attemptsQuery.data, searchInput, statusFilter, courseFilter]);

  const courses = useMemo(() => {
    if (!attemptsQuery.data?.data) return [];
    const courseMap = new Map();
    attemptsQuery.data.data.forEach((attempt) => {
      const course = attempt.quiz.chapter.module.expertise.skillCategory.course;
      if (!courseMap.has(course.id)) {
        courseMap.set(course.id, course);
      }
    });
    return Array.from(courseMap.values());
  }, [attemptsQuery.data]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = (startedAt: string, completedAt: string | null) => {
    if (!completedAt) return "In Progress";
    const start = new Date(startedAt).getTime();
    const end = new Date(completedAt).getTime();
    const minutes = Math.floor((end - start) / 60000);
    return `${minutes} min`;
  };

  return (
    <div className="bg-[var(--background)] min-h-screen transition-colors duration-300">
      <TopBar />

      <div className="mt-8 px-8 pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--ring)] flex items-center justify-center">
              <BookOpen className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--foreground)]">
                My Quiz Attempts
              </h1>
              <p className="text-[var(--muted-foreground)] mt-1">
                View your quiz history and performance
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by quiz title, chapter, or course..."
                className="w-full px-4 py-3 pl-11 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-[var(--muted-foreground)]" />
            </div>

            <div className="relative">
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="px-4 py-3 pr-10 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-3.5 w-5 h-5 text-[var(--muted-foreground)] pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 pr-10 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <TrendingUp className="absolute right-3 top-3.5 w-5 h-5 text-[var(--muted-foreground)] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Attempts List */}
        {attemptsQuery.isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--primary)] mx-auto"></div>
            <p className="text-[var(--muted-foreground)] mt-4">
              Loading attempts...
            </p>
          </div>
        ) : filteredAttempts.length === 0 ? (
          <div className="text-center py-20 bg-[var(--card)] rounded-xl border border-[var(--border)]">
            <BookOpen className="w-20 h-20 text-[var(--muted-foreground)] mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
              No attempts found
            </h3>
            <p className="text-[var(--muted-foreground)]">
              {searchInput || courseFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "You haven't taken any quizzes yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAttempts.map((attempt) => {
              const passed =
                attempt.percentage &&
                attempt.percentage >= attempt.quiz.passingScore;

              return (
                <div
                  key={attempt.id}
                  className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-[var(--foreground)] text-lg mb-2">
                        {attempt.quiz.title}
                      </h3>
                      <div className="space-y-1">
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {
                            attempt.quiz.chapter.module.expertise.skillCategory
                              .course.title
                          }
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          Chapter: {attempt.quiz.chapter.title}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div
                        className={`flex items-center gap-2 mb-1 ${
                          passed
                            ? "text-green-600 dark:text-green-400"
                            : attempt.status === "COMPLETED"
                            ? "text-red-600 dark:text-red-400"
                            : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        {attempt.status === "COMPLETED" && (
                          <>
                            {passed ? (
                              <CheckCircle size={20} />
                            ) : (
                              <XCircle size={20} />
                            )}
                            <span className="text-2xl font-bold">
                              {attempt.percentage?.toFixed(1)}%
                            </span>
                          </>
                        )}
                        {attempt.status === "IN_PROGRESS" && (
                          <>
                            <Clock size={20} />
                            <span className="text-lg font-semibold">
                              In Progress
                            </span>
                          </>
                        )}
                      </div>
                      {attempt.status === "COMPLETED" && (
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {attempt.score || 0} / {attempt.totalPoints || 0}{" "}
                          points
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)] mb-4 pb-4 border-b border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>
                        {formatDate(attempt.completedAt || attempt.startedAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>
                        {calculateDuration(
                          attempt.startedAt,
                          attempt.completedAt
                        )}
                      </span>
                    </div>
                    {attempt.status === "COMPLETED" && (
                      <div className="flex items-center gap-2">
                        <Award size={16} />
                        <span>Pass: {attempt.quiz.passingScore}%</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {attempt.status === "COMPLETED" && (
                      <button
                        onClick={() =>
                          router.push(
                            `/quiz/${attempt.quizId}/results/${attempt.id}`,
                            "View Results"
                          )
                        }
                        className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--primary)]/90 transition-all flex items-center gap-2"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    )}
                    {attempt.status === "IN_PROGRESS" && (
                      <button
                        onClick={() =>
                          router.push(
                            `/quiz/${attempt.quizId}/take`,
                            "Continue Quiz"
                          )
                        }
                        className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--primary)]/90 transition-all flex items-center gap-2"
                      >
                        <Clock size={16} />
                        Continue
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
