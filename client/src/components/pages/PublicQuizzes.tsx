import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Clock,
  HelpCircle,
  Search,
  ArrowUpDown,
  BookOpen,
  Users,
  TrendingUp,
  LogIn,
  ChevronRight,
} from "lucide-react";
import NavBar from "../ui/Landing/NavBar";
import Footer from "../ui/Landing/Footer";
import useLogin from "../../hooks/useLogin";
import { API_ROUTES } from "../../lib/api";

interface PublicQuiz {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  maxAttempts: number;
  passingScore: number;
  chapter: {
    id: string;
    title: string;
    module: {
      title: string;
      expertise: {
        name: string;
        skillCategory: {
          name: string;
          course: {
            id: string;
            title: string;
            tumbnailUrl?: string;
          };
        };
      };
    };
  };
  questions: { id: string }[];
  _count: { attempts: number };
}

interface QuizzesResponse {
  success: boolean;
  data: PublicQuiz[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function PublicQuizzes() {
  const navigate = useNavigate();
  const { isLogedIn } = useLogin();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["public-quizzes", page, searchQuery, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        sortBy,
      });
      if (searchQuery) params.append("search", searchQuery);
      
      const res = await fetch(`${API_ROUTES.QUIZ.PUBLIC_EXPLORE}?${params}`);
      return res.json() as Promise<QuizzesResponse>;
    },
  });

  const quizzes = data?.data || [];
  const pagination = data?.pagination;

  const handleTakeQuiz = (quizId: string) => {
    if (!isLogedIn) {
      navigate("/login?redirect=/student/quiz/" + quizId);
      return;
    }
    navigate(`/student/quiz/${quizId}`);
  };

  const handleViewDetails = (quizId: string) => {
    if (!isLogedIn) {
      navigate("/login?redirect=/student/quiz/" + quizId);
      return;
    }
    navigate(`/student/quiz/${quizId}`);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold bg-[var(--primary)]/15 text-[var(--primary)] mb-6 border border-[var(--primary)]/20">
            <Brain className="w-4 h-4" />
            Test Your Knowledge
          </div>
          <h1 className="text-5xl font-bold text-[var(--foreground)] mb-6">
            Explore <span className="text-[var(--primary)]">Quizzes</span>
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Challenge yourself with our curated collection of quizzes. 
            Track your progress and master new skills.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search quizzes..."
              className="w-full pl-12 pr-4 py-4 bg-[var(--card)] border-2 border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition-all"
            />
          </div>
          
          {/* Sort */}
          <div className="relative">
            <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as "latest" | "popular");
                setPage(1);
              }}
              className="pl-12 pr-8 py-4 bg-[var(--card)] border-2 border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition-all appearance-none cursor-pointer"
            >
              <option value="latest">Latest</option>
              <option value="popular">Popular</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)]">
            <TrendingUp className="w-8 h-8 text-[var(--primary)] mb-2" />
            <div className="text-2xl font-bold text-[var(--foreground)]">{pagination?.total || 0}</div>
            <div className="text-sm text-[var(--muted-foreground)]">Total Quizzes</div>
          </div>
          <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)]">
            <BookOpen className="w-8 h-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold text-[var(--foreground)]">{quizzes.reduce((acc, q) => acc + q.questions.length, 0)}</div>
            <div className="text-sm text-[var(--muted-foreground)]">Questions</div>
          </div>
          <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)]">
            <Users className="w-8 h-8 text-purple-500 mb-2" />
            <div className="text-2xl font-bold text-[var(--foreground)]">{quizzes.reduce((acc, q) => acc + q._count.attempts, 0)}</div>
            <div className="text-sm text-[var(--muted-foreground)]">Attempts</div>
          </div>
          <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)]">
            <HelpCircle className="w-8 h-8 text-orange-500 mb-2" />
            <div className="text-2xl font-bold text-[var(--foreground)]">MCQ</div>
            <div className="text-sm text-[var(--muted-foreground)]">Question Type</div>
          </div>
        </div>

        {/* Quiz Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)] animate-pulse">
                <div className="h-6 bg-[var(--muted)] rounded w-3/4 mb-4" />
                <div className="h-4 bg-[var(--muted)] rounded w-full mb-2" />
                <div className="h-4 bg-[var(--muted)] rounded w-2/3 mb-6" />
                <div className="h-10 bg-[var(--muted)] rounded" />
              </div>
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-20">
            <Brain className="w-16 h-16 text-[var(--muted-foreground)] mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">No quizzes found</h3>
            <p className="text-[var(--muted-foreground)]">
              {searchQuery ? `No results for "${searchQuery}"` : "Check back later for new quizzes"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="group bg-[var(--card)] rounded-2xl border-2 border-[var(--border)] hover:border-[var(--primary)]/50 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-[var(--primary)]/5"
              >
                {/* Card Header with Course Info */}
                <div className="p-5 bg-gradient-to-br from-[var(--primary)]/10 to-transparent border-b border-[var(--border)]">
                  <div className="flex items-start gap-3">
                    {quiz.chapter.module.expertise.skillCategory.course.tumbnailUrl && (
                      <img
                        src={quiz.chapter.module.expertise.skillCategory.course.tumbnailUrl}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs text-[var(--primary)] font-semibold truncate">
                        {quiz.chapter.module.expertise.skillCategory.course.title}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] truncate">
                        {quiz.chapter.title}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-[var(--foreground)] mb-2 line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
                    {quiz.title}
                  </h3>
                  {quiz.description && (
                    <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-4">
                      {quiz.description}
                    </p>
                  )}

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)] mb-5">
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" />
                      <span>{quiz.questions.length} Questions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{quiz.duration || "∞"} min</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {/* <div className="mb-5">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[var(--muted-foreground)]">Pass Rate</span>
                      <span className="font-semibold text-[var(--primary)]">{quiz.passingScore}%</span>
                    </div>
                    <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--ring)] rounded-full"
                        style={{ width: `${quiz.passingScore}%` }}
                      />
                    </div>
                  </div> */}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewDetails(quiz.id)}
                      className="flex-1 px-4 py-2.5 border-2 border-[var(--border)] rounded-lg text-sm font-semibold text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all flex items-center justify-center gap-1"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleTakeQuiz(quiz.id)}
                      className="flex-1 px-4 py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg text-sm font-semibold hover:bg-[var(--primary)]/90 transition-all flex items-center justify-center gap-1 group/btn"
                    >
                      {isLogedIn ? (
                        <>
                          Take Quiz
                          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          Login to Start
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-[var(--muted-foreground)]">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page === pagination.totalPages}
              className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
