import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useRef, useCallback } from "react";
import TopBar from "../../../lazy/TopBar";
import useInitNavStackOnce from "../../../../hooks/useInitNavstack";
import api from "../../../../lib/axios/axios";
import { API_ROUTES } from "../../../../lib/api";
import type { Response, Quiz, QuizQuestion } from "../../../../types";
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Send,
  XCircle,
} from "lucide-react";
import useRouter from "../../../../hooks/useRouter";
import { useParams } from "react-router-dom";
import ConfirmDialog from "../../../lazy/ConfirmDialog";
import QuizRulesModal from "./QuizRulesModal";

interface QuizWithQuestions extends Quiz {
  questions: QuizQuestion[];
}

interface QuizResponse extends Response {
  data: QuizWithQuestions;
}

interface AttemptResponse extends Response {
  data: {
    id: string;
    quizId: string;
    status: string;
  };
}

export default function TakeQuiz() {
  const { quizId } = useParams<{ quizId: string }>();
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [showRulesModal, setShowRulesModal] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [isAbandoning, setIsAbandoning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasAbandonedRef = useRef(false);

  useInitNavStackOnce([
    { title: "Quizzes", path: "/quizzes" },
    { title: "Take Quiz", path: `/quiz/${quizId}/take` },
  ]);

  // Get quiz details
  const quizQuery = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const res = await api.get<QuizResponse>(
        API_ROUTES.QUIZ.GET_BY_ID(quizId!)
      );
      return res.data;
    },
    enabled: !!quizId,
  });

  // Create attempt
  const createAttemptMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<AttemptResponse>(
        API_ROUTES.QUIZ.CREATE_ATTEMPT(quizId!)
      );
      return res.data;
    },
    onSuccess: (data) => {
      setAttemptId(data.data.id);
      setQuizStarted(true);
    },
    onError: (error: any) => {
      // Handle max attempts reached
      if (error?.response?.data?.message?.includes("Maximum attempts")) {
        router.push("/quizzes", "Quizzes");
      }
    },
  });

  // Submit quiz
  const submitQuizMutation = useMutation({
    mutationFn: async () => {
      if (!attemptId) throw new Error("No attempt ID");
      const answersArray = Object.entries(answers).map(
        ([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        })
      );

      const res = await api.post(API_ROUTES.QUIZ.SUBMIT_ATTEMPT(attemptId), {
        answers: answersArray,
      });
      return res.data;
    },
    onSuccess: (data) => {
      router.push(`/quiz/${quizId}/results/${data.data.id}`, "Quiz Results");
    },
  });

  // Abandon quiz (for tab switching)
  const abandonQuizMutation = useMutation({
    mutationFn: async () => {
      if (!attemptId) throw new Error("No attempt ID");
      const answersArray = Object.entries(answers).map(
        ([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        })
      );

      const res = await api.post(API_ROUTES.QUIZ.ABANDON_ATTEMPT(attemptId), {
        answers: answersArray,
      });
      return res.data;
    },
    onSuccess: (data) => {
      router.push(`/quiz/${quizId}/results/${data.data.id}`, "Quiz Abandoned");
    },
  });

  // Handle visibility change (tab switching detection)
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && quizStarted && attemptId && !hasAbandonedRef.current && !isAbandoning) {
      hasAbandonedRef.current = true;
      setIsAbandoning(true);
      abandonQuizMutation.mutate();
    }
  }, [quizStarted, attemptId, isAbandoning, abandonQuizMutation]);

  // Handle window blur (for some edge cases)
  const handleWindowBlur = useCallback(() => {
    if (quizStarted && attemptId && !hasAbandonedRef.current && !isAbandoning) {
      // Small delay to avoid false positives from clicking system UI
      setTimeout(() => {
        if (document.hidden && !hasAbandonedRef.current) {
          hasAbandonedRef.current = true;
          setIsAbandoning(true);
          abandonQuizMutation.mutate();
        }
      }, 100);
    }
  }, [quizStarted, attemptId, isAbandoning, abandonQuizMutation]);

  // Set up visibility change listeners
  useEffect(() => {
    if (quizStarted && attemptId) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("blur", handleWindowBlur);

      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("blur", handleWindowBlur);
      };
    }
  }, [quizStarted, attemptId, handleVisibilityChange, handleWindowBlur]);

  // Timer effect
  useEffect(() => {
    if (quizQuery.data?.data.duration && attemptId && quizStarted) {
      const durationMs = quizQuery.data.data.duration * 60 * 1000;
      setTimeRemaining(durationMs);

      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1000) {
            if (timerRef.current) clearInterval(timerRef.current);
            // Auto-submit when time runs out
            if (attemptId && !hasAbandonedRef.current) {
              submitQuizMutation.mutate();
            }
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [quizQuery.data, attemptId, quizStarted]);

  const handleStartQuiz = () => {
    setShowRulesModal(false);
    createAttemptMutation.mutate();
  };

  const handleCancelQuiz = () => {
    setShowRulesModal(false);
    router.push("/quizzes", "Quizzes");
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleNext = () => {
    if (
      currentQuestionIndex <
      (quizQuery.data?.data.questions.length || 0) - 1
    ) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    setShowSubmitConfirm(true);
  };

  const confirmSubmit = () => {
    setShowSubmitConfirm(false);
    submitQuizMutation.mutate();
  };

  const currentQuestion = quizQuery.data?.data.questions[currentQuestionIndex];
  const totalQuestions = quizQuery.data?.data.questions.length || 0;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  // Loading state
  if (!quizQuery.data) {
    return (
      <div className="bg-[var(--background)] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto"></div>
          <p className="text-[var(--muted-foreground)] mt-4">Loading quiz...</p>
        </div>
      </div>
    );
  }

  // Abandoning state
  if (isAbandoning) {
    return (
      <div className="bg-[var(--background)] min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <XCircle className="text-red-500" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
            Quiz Session Ended
          </h2>
          <p className="text-[var(--muted-foreground)] mb-4">
            Your quiz session was terminated because you left the page or switched tabs.
            Redirecting to results...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background)] min-h-screen transition-colors duration-300">
      {/* Hide TopBar during quiz to prevent navigation */}
      {!quizStarted && <TopBar />}

      {/* Quiz Rules Modal */}
      <QuizRulesModal
        isOpen={showRulesModal}
        onClose={handleCancelQuiz}
        onAccept={handleStartQuiz}
        quizTitle={quizQuery.data.data.title}
        duration={quizQuery.data.data.duration}
        maxAttempts={quizQuery.data.data.maxAttempts}
        totalQuestions={quizQuery.data.data.questions.length}
      />

      {/* Quiz Content - Only show when quiz has started */}
      {quizStarted && !showRulesModal && (
        <div className="max-w-4xl mx-auto mt-8 px-8 pb-8">
          {/* Quiz Header */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                  {quizQuery.data.data.title}
                </h1>
                {quizQuery.data.data.description && (
                  <p className="text-[var(--muted-foreground)]">
                    {quizQuery.data.data.description}
                  </p>
                )}
              </div>
              {timeRemaining !== null && (
                <div
                  className={`px-4 py-2 rounded-lg font-mono text-lg font-bold ${
                    timeRemaining < 300000
                      ? "bg-red-500/10 text-red-600 dark:text-red-400"
                      : "bg-[var(--muted)] text-[var(--foreground)]"
                  }`}
                >
                  <Clock size={20} className="inline mr-2" />
                  {formatTime(timeRemaining)}
                </div>
              )}
            </div>

            {/* Warning Banner */}
            <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
              <AlertCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0" size={20} />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                <strong>Warning:</strong> Do not switch tabs or leave this page. Your quiz will be automatically submitted if you do.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)] mb-2">
                <span>
                  Progress: {answeredCount} / {totalQuestions} answered
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--ring)] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question Navigation */}
            <div className="flex flex-wrap gap-2">
              {quizQuery.data.data.questions.map((q, idx) => {
                const isAnswered = answers[q.id];
                const isCurrent = idx === currentQuestionIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      isCurrent
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] ring-2 ring-[var(--primary)]/50"
                        : isAnswered
                        ? "bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30"
                        : "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--muted)]/80"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Card */}
          {currentQuestion && (
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-8 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--ring)] flex items-center justify-center text-white font-bold">
                    {currentQuestionIndex + 1}
                  </div>
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Question
                    </p>
                    <p className="text-lg font-semibold text-[var(--foreground)]">
                      {currentQuestionIndex + 1} of {totalQuestions}
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-[var(--muted)] rounded-lg">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {currentQuestion.points}{" "}
                    {currentQuestion.points === 1 ? "point" : "points"}
                  </span>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">
                {currentQuestion.questionText}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options?.map((option) => {
                  const isSelected = answers[currentQuestion.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() =>
                        handleAnswerSelect(currentQuestion.id, option.id)
                      }
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        isSelected
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 shadow-md"
                          : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? "border-[var(--primary)] bg-[var(--primary)]"
                              : "border-[var(--border)]"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2.5 h-2.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-[var(--foreground)] font-medium">
                          {option.optionText}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Previous
            </button>

            <div className="flex items-center gap-3">
              {currentQuestionIndex === totalQuestions - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitQuizMutation.isPending || answeredCount === 0}
                  className="px-8 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--ring)] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
                >
                  <Send size={18} />
                  {submitQuizMutation.isPending ? "Submitting..." : "Submit Quiz"}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--primary)]/90 transition-all flex items-center gap-2"
                >
                  Next
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Warning for unanswered questions */}
          {answeredCount < totalQuestions && (
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3">
              <AlertCircle
                className="text-amber-600 dark:text-amber-400"
                size={20}
              />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                You have {totalQuestions - answeredCount} unanswered question(s).
                Please answer all questions before submitting.
              </p>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={showSubmitConfirm}
        title="Submit Quiz"
        description={`Are you sure you want to submit? You have answered ${answeredCount} out of ${totalQuestions} questions.`}
        confirmText="Submit"
        onConfirm={confirmSubmit}
        onClose={() => setShowSubmitConfirm(false)}
        loading={submitQuizMutation.isPending}
      />
    </div>
  );
}
