import { useQuery } from "@tanstack/react-query";
import TopBar from "../../../lazy/TopBar";
import useInitNavStackOnce from "../../../../hooks/useInitNavstack";
import api from "../../../../lib/axios/axios";
import { API_ROUTES } from "../../../../lib/api";
import type { Response, Quiz } from "../../../../types";
import { useParams } from "react-router-dom";
import { PlusCircle, FileText } from "lucide-react";
import useRouter from "../../../../hooks/useRouter";

interface ChapterQuizzesResponse extends Response {
  data: Quiz[];
}

export default function ViewChapterQuizzes() {
  const { chapterId } = useParams();
  const router = useRouter();

  useInitNavStackOnce([
    { title: "Quizzes", path: "/admin/quizzes" },
    { title: "Chapter Quizzes", path: `/admin/chapter/${chapterId}/quizzes` },
  ]);

  const quizzesQuery = useQuery({
    queryKey: ["chapter-quizzes", chapterId],
    queryFn: async () => {
      const res = await api.get<ChapterQuizzesResponse>(
        API_ROUTES.QUIZ.GET_BY_CHAPTER_ID(chapterId!)
      );
      return res.data;
    },
    enabled: !!chapterId,
  });

  return (
    <div className="bg-[var(--background)] min-h-screen transition-colors duration-300">
      <TopBar>
        <button
          className="btn flex items-center gap-2"
          onClick={() =>
            router.push(
              `/admin/chapter/${chapterId}/quiz/create`,
              "Create Quiz"
            )
          }
        >
          <PlusCircle size={16} />
          Create Quiz
        </button>
      </TopBar>

      <div className="mt-8 px-8 pb-8">
        {quizzesQuery.isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto"></div>
          </div>
        ) : quizzesQuery.data?.data.length === 0 ? (
          <div className="text-center py-12 bg-[var(--card)] rounded-xl border border-[var(--border)]">
            <FileText className="w-16 h-16 text-[var(--muted-foreground)] mx-auto mb-4" />
            <p className="text-lg font-medium text-[var(--foreground)]">
              No quizzes found
            </p>
            <button
              onClick={() =>
                router.push(
                  `/admin/chapter/${chapterId}/quiz/create`,
                  "Create Quiz"
                )
              }
              className="mt-4 btn"
            >
              Create First Quiz
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {quizzesQuery.data?.data.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-[var(--foreground)] text-lg mb-2">
                  {quiz.title}
                </h3>
                {quiz.description && (
                  <p className="text-sm text-[var(--muted-foreground)] mb-4">
                    {quiz.description}
                  </p>
                )}
                <button
                  onClick={() =>
                    router.push(
                      `/admin/quiz/${quiz.id}/details`,
                      "Quiz Details"
                    )
                  }
                  className="text-sm text-[var(--primary)] hover:text-[var(--primary)]/80"
                >
                  View Details →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
