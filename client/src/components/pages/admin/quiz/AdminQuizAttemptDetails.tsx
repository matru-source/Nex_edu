import { useParams } from "react-router-dom";
import TopBar from "../../../lazy/TopBar";
import useInitNavStackOnce from "../../../../hooks/useInitNavstack";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../lib/axios/axios";
import { API_ROUTES } from "../../../../lib/api";
import type { Response } from "../../../../types";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  FileText,
  ArrowLeft,
  Trophy,
  Target,
} from "lucide-react";
import useRouter from "../../../../hooks/useRouter";

interface QuizAttemptDetails {
  id: string;
  score: number | null;
  totalPoints: number | null;
  percentage: number | null;
  status: string;
  startedAt: string;
  completedAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    profilePhoto: string | null;
  };
  quiz: {
    id: string;
    title: string;
    passingScore: number;
    chapter?: {
      title: string;
    };
    questions: Array<{
      id: string;
      questionText: string;
      points: number;
      questionType: string;
      explanation: string | null;
      options: Array<{
        id: string;
        optionText: string;
        isCorrect: boolean;
      }>;
    }>;
  };
  answers: Array<{
    id: string;
    questionId: string;
    selectedOptionId: string | null;
    points: number;
    isCorrect: boolean;
    question: {
      id: string;
      questionText: string;
      points: number;
      options: Array<{
        id: string;
        optionText: string;
        isCorrect: boolean;
      }>;
    };
  }>;
}

interface AttemptDetailsResponse extends Response {
  data: QuizAttemptDetails;
}

export default function AdminQuizAttemptDetails() {
  const { quizId, attemptId } = useParams();
  const router = useRouter();
  useInitNavStackOnce([
    { title: "Attempt Details", path: `/admin/quiz/${quizId}/attempts/${attemptId}` },
  ]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["quiz-attempt-details", attemptId],
    queryFn: async () => {
      const res = await api.get<AttemptDetailsResponse>(
        API_ROUTES.QUIZ.GET_ATTEMPT_DETAILS(attemptId!)
      );
      return res.data;
    },
    enabled: !!attemptId,
  });

  const attempt = data?.data;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return "-";
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diff = Math.floor((endTime - startTime) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}m ${seconds}s`;
  };

  const getStatusBadge = (status: string, percentage: number | null, passingScore: number) => {
    if (status === "ABANDONED") {
      return (
        <span className="px-4 py-2 rounded-full text-sm font-medium bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center gap-2">
          <AlertCircle size={16} />
          Abandoned
        </span>
      );
    }
    if (status === "IN_PROGRESS") {
      return (
        <span className="px-4 py-2 rounded-full text-sm font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center gap-2">
          <Clock size={16} />
          In Progress
        </span>
      );
    }
    if (percentage !== null && percentage >= passingScore) {
      return (
        <span className="px-4 py-2 rounded-full text-sm font-medium bg-green-500/10 text-green-600 dark:text-green-400 flex items-center gap-2">
          <CheckCircle size={16} />
          Passed
        </span>
      );
    }
    return (
      <span className="px-4 py-2 rounded-full text-sm font-medium bg-red-500/10 text-red-600 dark:text-red-400 flex items-center gap-2">
        <XCircle size={16} />
        Failed
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-[var(--background)] min-h-screen">
        <TopBar />
        <div className="p-8">
          <div className="animate-pulse max-w-4xl mx-auto">
            <div className="h-8 bg-[var(--muted)] rounded w-1/4 mb-6"></div>
            <div className="bg-[var(--card)] rounded-xl p-6">
              <div className="h-64 bg-[var(--muted)] rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="bg-[var(--background)] min-h-screen">
        <TopBar />
        <div className="p-8">
          <div className="text-center py-12">
            <div className="text-[var(--destructive)] text-lg mb-4">Attempt not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background)] min-h-screen">
      <TopBar />
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.push(`/admin/quiz/${quizId}/details`, "Quiz Details")}
            className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Quiz Details
          </button>

          {/* Header */}
          <div className="bg-[var(--card)] rounded-xl shadow-sm border border-[var(--border)] p-6 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                  Attempt Details
                </h1>
                <p className="text-[var(--muted-foreground)]">{attempt.quiz.title}</p>
              </div>
              {getStatusBadge(attempt.status, attempt.percentage, attempt.quiz.passingScore)}
            </div>

            {/* Student Info */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-[var(--muted)]/30 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--ring)] flex items-center justify-center">
                {attempt.user.profilePhoto ? (
                  <img
                    src={attempt.user.profilePhoto}
                    alt={attempt.user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="text-white" size={24} />
                )}
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">{attempt.user.name}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{attempt.user.email}</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[var(--primary)]/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy size={16} className="text-[var(--primary)]" />
                  <span className="text-sm font-medium text-[var(--primary)]">Score</span>
                </div>
                <div className="text-2xl font-bold text-[var(--foreground)]">
                  {attempt.percentage !== null ? `${attempt.percentage.toFixed(1)}%` : "-"}
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {attempt.score !== null ? `${attempt.score}/${attempt.totalPoints} points` : "-"}
                </p>
              </div>

              <div className="bg-green-500/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Target size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-600">Passing Score</span>
                </div>
                <div className="text-2xl font-bold text-[var(--foreground)]">
                  {attempt.quiz.passingScore}%
                </div>
              </div>

              <div className="bg-blue-500/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Started</span>
                </div>
                <div className="text-sm font-semibold text-[var(--foreground)]">
                  {formatDate(attempt.startedAt)}
                </div>
              </div>

              <div className="bg-purple-500/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={16} className="text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">Duration</span>
                </div>
                <div className="text-lg font-bold text-[var(--foreground)]">
                  {formatDuration(attempt.startedAt, attempt.completedAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Question Breakdown */}
          <div className="bg-[var(--card)] rounded-xl shadow-sm border border-[var(--border)] p-6">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
              <FileText size={20} />
              Question Breakdown
            </h2>

            <div className="space-y-6">
              {attempt.answers.map((answer, idx) => {
                const selectedOption = answer.question.options.find(
                  (opt) => opt.id === answer.selectedOptionId
                );
                const correctOption = answer.question.options.find((opt) => opt.isCorrect);

                return (
                  <div
                    key={answer.id}
                    className={`rounded-xl border-2 p-6 ${
                      answer.isCorrect
                        ? "bg-green-500/5 border-green-500/30"
                        : "bg-red-500/5 border-red-500/30"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                            answer.isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"
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
                        <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
                      ) : (
                        <XCircle className="text-red-600 dark:text-red-400" size={24} />
                      )}
                    </div>

                    <p className="text-lg font-medium text-[var(--foreground)] mb-4">
                      {answer.question.questionText}
                    </p>

                    <div className="space-y-3">
                      {/* Student's Answer */}
                      <div>
                        <p className="text-xs font-semibold text-[var(--muted-foreground)] mb-2 uppercase">
                          Student's Answer:
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

                      {/* Correct Answer (Admin can see this) */}
                      {!answer.isCorrect && correctOption && (
                        <div>
                          <p className="text-xs font-semibold text-[var(--muted-foreground)] mb-2 uppercase">
                            Correct Answer:
                          </p>
                          <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/30">
                            <p className="font-medium text-green-700 dark:text-green-400">
                              {correctOption.optionText}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
