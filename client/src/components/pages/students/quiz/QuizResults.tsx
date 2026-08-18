import { useQuery } from "@tanstack/react-query";
import TopBar from "../../../lazy/TopBar";
import useInitNavStackOnce from "../../../../hooks/useInitNavstack";
import api from "../../../../lib/axios/axios";
import { API_ROUTES } from "../../../../lib/api";
import type { Response } from "../../../../types";
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  RotateCcw,
  FileText,
  Target,
} from "lucide-react";
import useRouter from "../../../../hooks/useRouter";
import { useParams } from "react-router-dom";

interface QuizAnswer {
  id: string;
  questionId: string;
  selectedOptionId: string | null;
  points: number | null;
  isCorrect: boolean | null;
  question: {
    id: string;
    questionText: string;
    points: number;
    explanation: string | null;
    options: Array<{
      id: string;
      optionText: string;
      isCorrect: boolean;
    }>;
  };
}

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
    allowReview: boolean;
    chapter: {
      title: string;
      module: {
        expertise: {
          skillCategory: {
            course: {
              title: string;
            };
          };
        };
      };
    };
  };
  answers: QuizAnswer[];
}

interface AttemptResponse extends Response {
  data: QuizAttempt;
}

export default function QuizResults() {
  const { quizId, attemptId } = useParams<{
    quizId: string;
    attemptId: string;
  }>();
  const router = useRouter();

  useInitNavStackOnce([
    { title: "Quizzes", path: "/quizzes" },
    { title: "Quiz Results", path: `/quiz/${quizId}/results/${attemptId}` },
  ]);

  const attemptQuery = useQuery({
    queryKey: ["quiz-attempt", attemptId],
    queryFn: async () => {
      const res = await api.get<AttemptResponse>(
        API_ROUTES.QUIZ.GET_ATTEMPT(attemptId!)
      );
      return res.data;
    },
    enabled: !!attemptId,
  });

  const attempt = attemptQuery.data?.data;
  const passed =
    attempt &&
    attempt.percentage &&
    attempt.percentage >= attempt.quiz.passingScore;
  const correctCount = attempt?.answers.filter((a) => a.isCorrect).length || 0;
  const totalQuestions = attempt?.answers.length || 0;


  const calculateDuration = (startedAt: string, completedAt: string | null) => {
    if (!completedAt) return "N/A";
    const start = new Date(startedAt).getTime();
    const end = new Date(completedAt).getTime();
    const minutes = Math.floor((end - start) / 60000);
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  };

  if (!attempt) {
    return (
      <div className="bg-[var(--background)] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto"></div>
          <p className="text-[var(--muted-foreground)] mt-4">
            Loading results...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background)] min-h-screen transition-colors duration-300">
      <TopBar />

      <div className="max-w-4xl mx-auto mt-8 px-8 pb-8">
        {/* Results Header */}
        <div className="bg-gradient-to-br from-[var(--primary)]/10 via-[var(--ring)]/5 to-[var(--primary)]/10 rounded-xl border border-[var(--primary)]/20 p-8 mb-8 text-center">
          <div
            className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
              passed ? "bg-green-500/20" : "bg-red-500/20"
            }`}
          >
            {passed ? (
              <CheckCircle
                className="text-green-600 dark:text-green-400"
                size={48}
              />
            ) : (
              <XCircle className="text-red-600 dark:text-red-400" size={48} />
            )}
          </div>

          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
            {passed ? "Congratulations!" : "Quiz Completed"}
          </h1>
          <p className="text-[var(--muted-foreground)] mb-6">
            {attempt.quiz.title}
          </p>

          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div
                className={`text-5xl font-bold mb-1 ${
                  passed
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {attempt.percentage?.toFixed(1)}%
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">Score</p>
            </div>
            <div className="w-px h-16 bg-[var(--border)]" />
            <div className="text-center">
              <div className="text-4xl font-bold text-[var(--foreground)] mb-1">
                {correctCount} / {totalQuestions}
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">Correct</p>
            </div>
            <div className="w-px h-16 bg-[var(--border)]" />
            <div className="text-center">
              <div className="text-4xl font-bold text-[var(--foreground)] mb-1">
                {attempt.score || 0} / {attempt.totalPoints || 0}
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">Points</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <div className="flex items-center justify-center gap-6 text-sm text-[var(--muted-foreground)]">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>
                  {calculateDuration(attempt.startedAt, attempt.completedAt)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Target size={16} />
                <span>Passing: {attempt.quiz.passingScore}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/quizzes", "My Quizzes")}
            className="px-6 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-all flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back to Quizzes
          </button>
          <button
            onClick={() => router.push(`/quiz/${quizId}/take`, "Retake Quiz")}
            className="px-6 py-3 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 transition-all flex items-center gap-2"
          >
            <RotateCcw size={18} />
            Retake Quiz
          </button>
        </div>

        {/* Question Review */}
        {attempt.quiz.allowReview && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
              <FileText size={24} />
              Question Review
            </h2>

            {attempt.answers.map((answer, idx) => {
              const selectedOption = answer.question.options.find(
                (opt) => opt.id === answer.selectedOptionId
              );

              return (
                <div
                  key={answer.id}
                  className={`rounded-xl border-2 p-6 ${
                    answer.isCorrect
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-red-500/10 border-red-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                          answer.isCorrect
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--foreground)]">
                          Question {idx + 1}
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {answer.points || 0} / {answer.question.points} points
                        </p>
                      </div>
                    </div>
                    {answer.isCorrect ? (
                      <CheckCircle
                        className="text-green-600 dark:text-green-400"
                        size={24}
                      />
                    ) : (
                      <XCircle
                        className="text-red-600 dark:text-red-400"
                        size={24}
                      />
                    )}
                  </div>

                  <p className="text-lg font-medium text-[var(--foreground)] mb-4">
                    {answer.question.questionText}
                  </p>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-[var(--muted-foreground)] mb-2 uppercase">
                        Your Answer:
                      </p>
                      <div
                        className={`p-3 rounded-lg ${
                          answer.isCorrect
                            ? "bg-green-500/20 border border-green-500/30"
                            : "bg-red-500/20 border border-red-500/30"
                        }`}
                      >
                        <p
                          className={`font-medium ${
                            answer.isCorrect
                              ? "text-green-700 dark:text-green-400"
                              : "text-red-700 dark:text-red-400"
                          }`}
                        >
                          {selectedOption?.optionText || "No answer selected"}
                        </p>
                      </div>
                    </div>

                    {/* Note: Correct answer is intentionally NOT shown to students */}
                    {!answer.isCorrect && (
                      <p className="text-sm text-[var(--muted-foreground)] italic">
                        The answer you selected was incorrect.
                      </p>
                    )}

                    {answer.question.explanation && (
                      <div className="mt-3 p-3 bg-[var(--muted)]/30 rounded-lg border border-[var(--border)]">
                        <p className="text-xs font-semibold text-[var(--muted-foreground)] mb-1 uppercase">
                          Explanation:
                        </p>
                        <p className="text-sm text-[var(--foreground)]">
                          {answer.question.explanation}
                        </p>
                      </div>
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
