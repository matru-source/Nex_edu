import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import TopBar from "../../../lazy/TopBar";
import useInitNavStackOnce from "../../../../hooks/useInitNavstack";
import api from "../../../../lib/axios/axios";
import { API_ROUTES } from "../../../../lib/api";
import type { Response, Quiz } from "../../../../types";
import {
  BookOpen,
  Clock,
  Target,
  Play,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  TrendingUp,
  FileText,
  Award,
  AlertCircle,
} from "lucide-react";
import useRouter from "../../../../hooks/useRouter";

interface QuizWithDetails extends Quiz {
  chapter: {
    id: string;
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
  _count: {
    attempts: number;
  };
}

interface QuizzesResponse extends Response {
  data: QuizWithDetails[];
}

interface QuizAttempt {
  id: string;
  quizId: string;
  status: string;
  percentage: number | null;
  startedAt: string;
  completedAt: string | null;
}

interface MyAttemptsResponse extends Response {
  data: QuizAttempt[];
}

export default function StudentQuizzes() {
  useInitNavStackOnce([{ title: "Quizzes", path: "/quizzes" }]);
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");


  // Get all quizzes for enrolled courses
  const quizzesQuery = useQuery({
    queryKey: ["student-quizzes"],
    queryFn: async () => {
      // Get all enrolled courses
      const coursesRes = await api.get(
        API_ROUTES.PURCHASE.GET_PURCHASED_COURSES
      );
      const courses = coursesRes.data.data || [];

      // Get quizzes for each course
      const allQuizzes: QuizWithDetails[] = [];
      for (const course of courses) {
        try {
          const quizzesRes = await api.get<QuizzesResponse>(
            API_ROUTES.QUIZ.GET_BY_COURSE_ID(course.id)
          );
          allQuizzes.push(...(quizzesRes.data.data || []));
        } catch (error) {
          console.error(
            `Error fetching quizzes for course ${course.id}:`,
            error
          );
        }
      }

      return { data: allQuizzes };
    },
  });

  // Get my attempts
  const attemptsQuery = useQuery({
    queryKey: ["my-quiz-attempts"],
    queryFn: async () => {
      const res = await api.get<MyAttemptsResponse>(
        API_ROUTES.QUIZ.GET_MY_ATTEMPTS
      );
      return res.data;
    },
  });

  const attemptsMap = useMemo(() => {
    const map = new Map<string, QuizAttempt[]>();
    attemptsQuery.data?.data.forEach((attempt) => {
      const existing = map.get(attempt.quizId) || [];
      map.set(attempt.quizId, [...existing, attempt]);
    });
    return map;
  }, [attemptsQuery.data]);

  const getQuizStatus = (quiz: QuizWithDetails) => {
    const attempts = attemptsMap.get(quiz.id) || [];
    
    // Filter attempts for the last 14 days for the limit check
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const recentAttempts = attempts.filter(a => new Date(a.startedAt || a.completedAt || Date.now()) >= fourteenDaysAgo);
    
    // Count both COMPLETED and ABANDONED attempts toward the limit
    const completedAttempts = attempts.filter((a) => a.status === "COMPLETED");
    const recentFinishedAttempts = recentAttempts.filter((a) => a.status === "COMPLETED" || a.status === "ABANDONED");
    const abandonedAttempts = attempts.filter((a) => a.status === "ABANDONED");
    
    const bestAttempt = completedAttempts.reduce(
      (best, current) =>
        (current.percentage || 0) > (best?.percentage || 0) ? current : best,
      null as QuizAttempt | null
    );

    // No finished attempts at all (IN_PROGRESS are ignored - they'll be auto-abandoned)
    const hasFinishedAttempts = completedAttempts.length > 0 || abandonedAttempts.length > 0;
    if (!hasFinishedAttempts) {
      return { status: "not_started", bestScore: null, attemptsUsed: 0, lastAttemptId: null, nextAttemptAt: null };
    }

    const passed =
      bestAttempt &&
      bestAttempt.percentage &&
      bestAttempt.percentage >= quiz.passingScore;
      
    // Count RECENT COMPLETED + ABANDONED attempts toward max limit
    const maxReached = recentFinishedAttempts.length >= quiz.maxAttempts;
    
    // Calculate when the next attempt is available if max reached
    let nextAttemptAt = null;
    if (maxReached) {
      // Find the oldest attempt in the recent window
      const sortedRecent = [...recentFinishedAttempts].sort((a, b) => 
        new Date(a.startedAt || 0).getTime() - new Date(b.startedAt || 0).getTime()
      );
      if (sortedRecent.length > 0) {
        const oldestRecent = sortedRecent[0];
        const resetDate = new Date(new Date(oldestRecent.startedAt || Date.now()).getTime() + 14 * 24 * 60 * 60 * 1000);
        nextAttemptAt = resetDate;
      }
    }

    if (passed) {
      return {
        status: "passed",
        bestScore: bestAttempt.percentage,
        attemptsUsed: recentFinishedAttempts.length,
        lastAttemptId: bestAttempt.id,
        nextAttemptAt,
      };
    } else if (maxReached) {
      return {
        status: "failed",
        bestScore: bestAttempt?.percentage || null,
        attemptsUsed: recentFinishedAttempts.length,
        lastAttemptId: bestAttempt?.id || abandonedAttempts[0]?.id || null,
        nextAttemptAt,
      };
    } else {
      // Has some attempts but not passed and not maxed out - can retake
      return {
        status: "attempted",
        bestScore: bestAttempt?.percentage || null,
        attemptsUsed: recentFinishedAttempts.length,
        lastAttemptId: bestAttempt?.id || abandonedAttempts[0]?.id || null,
        nextAttemptAt: null,
      };
    }
  };

  const filteredQuizzes = useMemo(() => {
    if (!quizzesQuery.data?.data) return [];
    let filtered = quizzesQuery.data.data;

    // Search filter
    if (searchInput) {
      const lowerSearch = searchInput.toLowerCase();
      filtered = filtered.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(lowerSearch) ||
          quiz.chapter.title.toLowerCase().includes(lowerSearch) ||
          quiz.chapter.module.expertise.skillCategory.course.title
            .toLowerCase()
            .includes(lowerSearch)
      );
    }

    // Course filter
    if (selectedCourse !== "all") {
      filtered = filtered.filter(
        (quiz) =>
          quiz.chapter.module.expertise.skillCategory.course.id ===
          selectedCourse
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((quiz) => {
        const status = getQuizStatus(quiz);
        return status.status === statusFilter;
      });
    }

    return filtered;
  }, [
    quizzesQuery.data,
    searchInput,
    selectedCourse,
    statusFilter,
    attemptsMap,
  ]);

  const courses = useMemo(() => {
    if (!quizzesQuery.data?.data) return [];
    const courseMap = new Map();
    quizzesQuery.data.data.forEach((quiz) => {
      const course = quiz.chapter.module.expertise.skillCategory.course;
      if (!courseMap.has(course.id)) {
        courseMap.set(course.id, course);
      }
    });
    return Array.from(courseMap.values());
  }, [quizzesQuery.data]);

  const StatusBadge = ({ status }: { status: string }) => {
    const config = {
      not_started: {
        label: "Not Started",
        icon: <AlertCircle size={14} />,
        className: "bg-[var(--muted)] text-[var(--muted-foreground)]",
      },
      attempted: {
        label: "Attempted",
        icon: <TrendingUp size={14} />,
        className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      },
      passed: {
        label: "Passed",
        icon: <CheckCircle size={14} />,
        className: "bg-green-500/10 text-green-600 dark:text-green-400",
      },
      failed: {
        label: "Failed",
        icon: <XCircle size={14} />,
        className: "bg-red-500/10 text-red-600 dark:text-red-400",
      },
    };

    const { label, icon, className } =
      config[status as keyof typeof config] || config.not_started;

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${className}`}
      >
        {icon}
        {label}
      </span>
    );
  };

  return (
    <div className="bg-[var(--background)] min-h-screen transition-colors duration-300">
      <TopBar />

      <div className="mt-8 px-8 pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--ring)] flex items-center justify-center">
              <FileText className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--foreground)]">
                My Quizzes
              </h1>
              <p className="text-[var(--muted-foreground)] mt-1">
                Test your knowledge and track your progress
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search quizzes by title, chapter, or course..."
                className="w-full px-4 py-3 pl-11 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-[var(--muted-foreground)]" />
            </div>

            {/* Course Filter */}
            <div className="relative">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
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

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 pr-10 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="not_started">Not Started</option>
                <option value="attempted">Attempted</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
              </select>
              <Target className="absolute right-3 top-3.5 w-5 h-5 text-[var(--muted-foreground)] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Quizzes Grid */}
        {quizzesQuery.isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--primary)] mx-auto"></div>
            <p className="text-[var(--muted-foreground)] mt-4">
              Loading quizzes...
            </p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-20 bg-[var(--card)] rounded-xl border border-[var(--border)]">
            <BookOpen className="w-20 h-20 text-[var(--muted-foreground)] mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
              No quizzes found
            </h3>
            <p className="text-[var(--muted-foreground)]">
              {searchInput || selectedCourse !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "You don't have any quizzes available yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => {
              const quizStatus = getQuizStatus(quiz);
              const canAttempt = quizStatus.attemptsUsed < quiz.maxAttempts;

              return (
                <div
                  key={quiz.id}
                  className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 hover:shadow-lg transition-all duration-200 hover:border-[var(--primary)]/30 group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-[var(--foreground)] text-lg mb-2 group-hover:text-[var(--primary)] transition-colors">
                        {quiz.title}
                      </h3>
                      <div className="space-y-1">
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {
                            quiz.chapter.module.expertise.skillCategory.course
                              .title
                          }
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          Chapter: {quiz.chapter.title}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={quizStatus.status} />
                  </div>

                  {/* Description */}
                  {quiz.description && (
                    <p className="text-sm text-[var(--muted-foreground)] mb-4 line-clamp-2">
                      {quiz.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-[var(--muted)]/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock
                        className="text-[var(--muted-foreground)]"
                        size={16}
                      />
                      <span className="text-sm text-[var(--foreground)]">
                        {quiz.duration || "∞"} min
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target
                        className="text-[var(--muted-foreground)]"
                        size={16}
                      />
                      <span className="text-sm text-[var(--foreground)]">
                        Pass: {quiz.passingScore}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp
                        className="text-[var(--muted-foreground)]"
                        size={16}
                      />
                      <span className="text-sm text-[var(--foreground)]">
                        {quizStatus.attemptsUsed} / {quiz.maxAttempts} attempts
                      </span>
                    </div>
                    {quizStatus.bestScore !== null && (
                      <div className="flex items-center gap-2">
                        <Award
                          className="text-[var(--muted-foreground)]"
                          size={16}
                        />
                        <span className="text-sm text-[var(--foreground)] font-medium">
                          Best: {quizStatus.bestScore.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {canAttempt ? (
                      <button
                        onClick={() =>
                          router.push(`/quiz/${quiz.id}/take`, "Take Quiz")
                        }
                        className="flex-1 px-4 py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--primary)]/90 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                      >
                        <Play size={16} />
                        {quizStatus.status === "not_started"
                          ? "Start Quiz"
                          : "Retake Quiz"}
                      </button>
                    ) : (
                      <div className="flex-1 flex flex-col gap-1">
                        <button
                          disabled
                          className="w-full px-4 py-2.5 bg-[var(--muted)] text-[var(--muted-foreground)] rounded-lg cursor-not-allowed font-medium"
                        >
                          Limit Reached
                        </button>
                        {quizStatus.nextAttemptAt && (
                          <p className="text-xs text-center text-[var(--muted-foreground)]">
                            Next attempt: {new Date(quizStatus.nextAttemptAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                    {quizStatus.status !== "not_started" && quizStatus.lastAttemptId && (
                      <button
                        onClick={() =>
                          router.push(
                            `/quiz/${quiz.id}/results/${quizStatus.lastAttemptId}`,
                            "View Results"
                          )
                        }
                        className="px-4 py-2.5 bg-[var(--muted)] text-[var(--foreground)] rounded-lg hover:bg-[var(--muted)]/80 transition-all duration-200"
                      >
                        <FileText size={16} />
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
