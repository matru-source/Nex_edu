import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../../../../lib/axios/axios";
import { API_ROUTES } from "../../../../lib/api";
import type { Response, Quiz, QuizAttempt } from "../../../../types";
import { Clock, CheckCircle, XCircle } from "lucide-react";

interface QuizResponse extends Response {
  data: Quiz;
}

interface QuizByLessonProps {
  lessonId: string;
}

export default function Quiz({ lessonId }: QuizByLessonProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(
    null
  );

  const { data: quizData } = useQuery({
    queryKey: ["quiz", lessonId],
    queryFn: async () => {
      const res = await api.get<QuizResponse>(
        API_ROUTES.QUIZ.GET_BY_CHAPTER_ID(lessonId)
      );
      return res.data;
    },
    enabled: !!lessonId,
  });

  const quiz = quizData?.data;

  const createAttemptMutation = useMutation({
    mutationFn: async (quizId: string) => {
      const res = await api.post(API_ROUTES.QUIZ.CREATE_ATTEMPT(quizId), {});
      return res.data;
    },
    onSuccess: (data) => {
      setSelectedAttempt(data.data);
      if (quiz?.duration) {
        setTimeRemaining(quiz.duration * 60);
      }
    },
  });

  const submitQuizMutation = useMutation({
    mutationFn: async ({
      attemptId,
      answers,
    }: {
      attemptId: string;
      answers: any[];
    }) => {
      const res = await api.post(API_ROUTES.QUIZ.SUBMIT_ATTEMPT(attemptId), {
        answers,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setSelectedAttempt(data.data);
      if (quiz?.duration) {
        setTimeRemaining(null);
      }
    },
  });

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && selectedAttempt) {
      // Auto submit when time runs out
      handleSubmit();
    }
  }, [timeRemaining, selectedAttempt]);

  const startQuiz = () => {
    if (quiz) {
      createAttemptMutation.mutate(quiz.id);
    }
  };

  const handleSubmit = () => {
    if (!selectedAttempt || !quiz) return;

    const answersArray = Object.entries(answers).map(
      ([questionId, answer]) => ({
        questionId,
        selectedOptionId: answer,
      })
    );

    submitQuizMutation.mutate({
      attemptId: selectedAttempt.id,
      answers: answersArray,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!quiz) return null;

  // If quiz not started
  if (!selectedAttempt) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {quiz.title}
          </h3>
          {quiz.description && (
            <p className="text-gray-600 mb-6">{quiz.description}</p>
          )}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">
                {quiz.questions?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">
                {quiz.duration || "∞"}
              </div>
              <div className="text-sm text-gray-600">Minutes</div>
            </div>
          </div>
          <button
            onClick={startQuiz}
            className="btn w-full"
            disabled={createAttemptMutation.isPending}
          >
            {createAttemptMutation.isPending ? "Starting..." : "Start Quiz"}
          </button>
        </div>
      </div>
    );
  }

  // Quiz completed - show results
  if (selectedAttempt.status === "COMPLETED") {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              selectedAttempt.percentage &&
              selectedAttempt.percentage >= quiz.passingScore
                ? "bg-green-100"
                : "bg-red-100"
            }`}
          >
            {selectedAttempt.percentage &&
            selectedAttempt.percentage >= quiz.passingScore ? (
              <CheckCircle className="w-12 h-12 text-green-600" />
            ) : (
              <XCircle className="w-12 h-12 text-red-600" />
            )}
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {selectedAttempt.percentage &&
            selectedAttempt.percentage >= quiz.passingScore
              ? "Congratulations!"
              : "Try Again"}
          </h3>
          <p className="text-gray-600 mb-8">
            {selectedAttempt.percentage &&
            selectedAttempt.percentage >= quiz.passingScore
              ? "You passed the quiz!"
              : "You did not meet the passing score"}
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-600">
                {selectedAttempt.score}
              </div>
              <div className="text-sm text-blue-600">Your Score</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-gray-900">
                {selectedAttempt.totalPoints}
              </div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
            <div
              className={`rounded-lg p-4 ${
                selectedAttempt.percentage &&
                selectedAttempt.percentage >= quiz.passingScore
                  ? "bg-green-50"
                  : "bg-red-50"
              }`}
            >
              <div
                className={`text-3xl font-bold ${
                  selectedAttempt.percentage &&
                  selectedAttempt.percentage >= quiz.passingScore
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {selectedAttempt.percentage?.toFixed(0)}%
              </div>
              <div
                className={`text-sm ${
                  selectedAttempt.percentage &&
                  selectedAttempt.percentage >= quiz.passingScore
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                Percentage
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz in progress
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      {timeRemaining !== null && (
        <div className="mb-6 flex items-center justify-between bg-cyan-50 border border-cyan-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-600" />
            <span className="font-semibold text-cyan-900">Time Remaining</span>
          </div>
          <div
            className={`text-2xl font-bold ${
              timeRemaining < 300 ? "text-red-600" : "text-cyan-600"
            }`}
          >
            {formatTime(timeRemaining)}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {quiz.questions?.map((question, index) => (
          <div
            key={question.id}
            className="border border-gray-200 rounded-lg p-6"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold">{index + 1}</span>
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-medium mb-3">
                  {question.questionText}
                </p>
                <div className="text-sm text-gray-500">
                  {question.points} point{question.points !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            <div className="ml-12 space-y-2">
              {question.options?.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    answers[question.id] === option.id
                      ? "border-cyan-500 bg-cyan-50"
                      : "border-gray-200 hover:border-cyan-300"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option.id}
                    checked={answers[question.id] === option.id}
                    onChange={() =>
                      setAnswers({ ...answers, [question.id]: option.id })
                    }
                    className="w-4 h-4 text-cyan-600"
                  />
                  <span className="ml-3 text-gray-900">
                    {option.optionText}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          className="btn"
          disabled={submitQuizMutation.isPending}
        >
          {submitQuizMutation.isPending ? "Submitting..." : "Submit Quiz"}
        </button>
      </div>
    </div>
  );
}
