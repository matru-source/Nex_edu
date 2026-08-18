import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import TopBar from "../../../lazy/TopBar";
import useInitNavStackOnce from "../../../../hooks/useInitNavstack";
import api from "../../../../lib/axios/axios";
import { API_ROUTES } from "../../../../lib/api";
import type { Response, Quiz } from "../../../../types";
import {
  PlusCircle,
  Trash2,
  FileText,
  Eye,
  BookOpen,
  Users,
  Clock,
  TrendingUp,
  Search,
  Pencil,
} from "lucide-react";
import useRouter from "../../../../hooks/useRouter";
import ConfirmDialog from "../../../lazy/ConfirmDialog";

interface AllQuizzesResponse extends Response {
  data: (Quiz & {
    chapter: {
      id: string;
      title: string;
      module: {
        title: string;
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
      questions: number;
    };
  })[];
}

export default function AdminQuizzes() {
  useInitNavStackOnce([{ title: "Quizzes", path: "/admin/quizzes" }]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Quiz | null>(null);
  const [searchInput, setSearchInput] = useState<string>("");

  const getAllQuizzesQuery = useQuery({
    queryKey: ["quizzes", "all"],
    queryFn: async () => {
      const res = await api.get<AllQuizzesResponse>(API_ROUTES.QUIZ.GET_ALL);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(API_ROUTES.QUIZ.DELETE(id));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes", "all"] });
      setDeleteOpen(false);
      setSelected(null);
    },
  });

  const openDelete = (row: Quiz) => {
    setSelected(row);
    setDeleteOpen(true);
  };

  const quizzes = getAllQuizzesQuery.data?.data || [];

  const filteredQuizzes = useMemo(() => {
    if (!searchInput.trim()) return quizzes;
    const lowerSearch = searchInput.toLowerCase();
    return quizzes.filter(
      (quiz) =>
        quiz.title.toLowerCase().includes(lowerSearch) ||
        quiz.chapter?.title.toLowerCase().includes(lowerSearch) ||
        quiz.chapter?.module?.expertise?.skillCategory?.course?.title
          ?.toLowerCase()
          .includes(lowerSearch)
    );
  }, [quizzes, searchInput]);

  return (
    <div className="bg-[var(--background)] min-h-screen transition-colors duration-300">
      <TopBar>
        <button
          className="btn flex items-center gap-2"
          onClick={() =>
            router.push("/admin/quiz/create/select-course", "Create Quiz")
          }
        >
          <PlusCircle size={16} />
          Create Quiz
        </button>
      </TopBar>

      <div className="mt-8 px-8 pb-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Search quizzes by title, chapter, or course..."
              className="w-full px-4 py-3 pl-11 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        {/* Quizzes Table */}
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
          {getAllQuizzesQuery.isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto"></div>
              <p className="text-[var(--muted-foreground)] mt-4">
                Loading quizzes...
              </p>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-[var(--muted-foreground)] mx-auto mb-4" />
              <p className="text-lg font-medium text-[var(--foreground)]">
                No quizzes found
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-2">
                Create your first quiz to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--muted)]/30">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--foreground)]">
                      Quiz Title
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--foreground)]">
                      Chapter
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--foreground)]">
                      Value Stream
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-[var(--foreground)]">
                      <div className="flex items-center justify-center gap-1">
                        <FileText size={14} />
                        Questions
                      </div>
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-[var(--foreground)]">
                      <div className="flex items-center justify-center gap-1">
                        <Users size={14} />
                        Attempts
                      </div>
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-[var(--foreground)]">
                      <div className="flex items-center justify-center gap-1">
                        <Clock size={14} />
                        Duration
                      </div>
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-[var(--foreground)]">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp size={14} />
                        Pass %
                      </div>
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-[var(--foreground)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuizzes.map((quiz) => (
                    <tr
                      key={quiz.id}
                      className="border-b border-[var(--border)] hover:bg-[var(--muted)]/20 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-[var(--foreground)]">
                            {quiz.title}
                          </p>
                          {quiz.description && (
                            <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 mt-0.5">
                              {quiz.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-[var(--foreground)]">
                          {quiz.chapter?.title || "-"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-[var(--muted-foreground)]">
                          {quiz.chapter?.module?.expertise?.skillCategory
                            ?.course?.title || "-"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          {quiz._count?.questions ||
                            quiz.questions?.length ||
                            0}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          {quiz._count?.attempts || 0}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm text-[var(--foreground)]">
                          {quiz.duration ? `${quiz.duration} min` : "∞"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                          {quiz.passingScore}%
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              router.push(
                                `/admin/quiz/${quiz.id}/details`,
                                "Quiz Details"
                              )
                            }
                            className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors"
                            title="View Details & Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() =>
                              router.push(
                                `/admin/quiz/${quiz.id}/details`,
                                "Quiz Details"
                              )
                            }
                            className="p-2 rounded-lg bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--muted)]/80 transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openDelete(quiz)}
                            className="p-2 rounded-lg bg-[var(--destructive)]/10 text-[var(--destructive)] hover:bg-[var(--destructive)]/20 transition-colors"
                            title="Delete Quiz"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {!getAllQuizzesQuery.isLoading && filteredQuizzes.length > 0 && (
          <div className="mt-4 text-sm text-[var(--muted-foreground)]">
            Showing {filteredQuizzes.length} of {quizzes.length} quizzes
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Quiz"
        description={`Are you sure you want to delete "${selected?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => selected && deleteMutation.mutate(selected.id)}
        onClose={() => setDeleteOpen(false)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
