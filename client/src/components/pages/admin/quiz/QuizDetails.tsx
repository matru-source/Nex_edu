import { useParams } from "react-router-dom";
import TopBar from "../../../lazy/TopBar";
import useInitNavStackOnce from "../../../../hooks/useInitNavstack";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios/axios";
import { API_ROUTES } from "../../../../lib/api";
import type { Response, Quiz, QuizQuestion, QuizOption } from "../../../../types";
import {
  Clock,
  Target,
  FileText,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  Eye,
  AlertCircle,
  Pencil,
  Trash2,
  Plus,
  Save,
  X,
  Loader,
} from "lucide-react";
import useRouter from "../../../../hooks/useRouter";
import { useState } from "react";
import Modal from "../../../lazy/Modal";
import ConfirmDialog from "../../../lazy/ConfirmDialog";
import { useToast } from "../../../../contexts/ToastContext";

interface QuizDetailsResponse extends Response {
  data: Quiz;
}

interface QuizAttempt {
  id: string;
  userId: string;
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
  };
}

interface AttemptsResponse extends Response {
  data: QuizAttempt[];
}

interface EditingQuestion {
  id?: string;
  questionText: string;
  questionType: string;
  points: number;
  explanation: string;
  options: {
    id?: string;
    optionText: string;
    isCorrect: boolean;
  }[];
}

export default function QuizDetails() {
  const { quizId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();
  
  useInitNavStackOnce([
    { title: "Quiz Details", path: `/admin/quiz/${quizId}/details` },
  ]);

  // Edit states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<EditingQuestion | null>(null);
  const [deleteQuestionOpen, setDeleteQuestionOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const {
    data: quizData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const res = await api.get<QuizDetailsResponse>(
        API_ROUTES.QUIZ.GET_BY_ID(quizId!)
      );
      return res.data;
    },
    enabled: !!quizId,
  });

  const attemptsQuery = useQuery({
    queryKey: ["quiz-attempts", quizId],
    queryFn: async () => {
      const res = await api.get<AttemptsResponse>(
        API_ROUTES.QUIZ.GET_ATTEMPTS_BY_QUIZ_ID(quizId!)
      );
      return res.data;
    },
    enabled: !!quizId,
  });

  // Mutation for updating quiz (including questions)
  const updateQuizMutation = useMutation({
    mutationFn: async (data: { questions: QuizQuestion[] }) => {
      const res = await api.put(API_ROUTES.QUIZ.UPDATE(quizId!), data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
      setEditModalOpen(false);
      setEditingQuestion(null);
      success("Quiz updated successfully");
    },
    onError: (error: any) => {
      console.error("Failed to update quiz:", error);
      showError(error?.response?.data?.message || "Failed to update quiz. Please try again.");
    },
  });

  const quiz = quizData?.data;
  const attempts = attemptsQuery.data?.data || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string, percentage: number | null, passingScore: number) => {
    if (status === "ABANDONED") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center gap-1">
          <AlertCircle size={12} />
          Abandoned
        </span>
      );
    }
    if (status === "IN_PROGRESS") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center gap-1">
          <Clock size={12} />
          In Progress
        </span>
      );
    }
    if (percentage !== null && percentage >= passingScore) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 flex items-center gap-1">
          <CheckCircle size={12} />
          Passed
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 flex items-center gap-1">
        <XCircle size={12} />
        Failed
      </span>
    );
  };

  const openEditQuestion = (question: QuizQuestion) => {
    setIsAddingNew(false);
    setEditingQuestion({
      id: question.id,
      questionText: question.questionText,
      questionType: question.questionType,
      points: question.points,
      explanation: question.explanation || "",
      options: question.options?.map((opt: QuizOption) => ({
        id: opt.id,
        optionText: opt.optionText,
        isCorrect: opt.isCorrect,
      })) || [],
    });
    setEditModalOpen(true);
  };

  const openAddQuestion = () => {
    setIsAddingNew(true);
    setEditingQuestion({
      questionText: "",
      questionType: "MULTIPLE_CHOICE",
      points: 1,
      explanation: "",
      options: [
        { optionText: "", isCorrect: true },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
      ],
    });
    setEditModalOpen(true);
  };

  const openDeleteQuestion = (questionId: string) => {
    setSelectedQuestionId(questionId);
    setDeleteQuestionOpen(true);
  };

  const handleSaveQuestion = async () => {
    if (!editingQuestion || !quiz) return;

    const updatedQuestions = isAddingNew
      ? [...(quiz.questions || []), editingQuestion]
      : (quiz.questions || []).map((q) =>
          q.id === editingQuestion.id ? { ...q, ...editingQuestion } : q
        );

    // Call mutation to update quiz with new questions array
    updateQuizMutation.mutate({ questions: updatedQuestions as any[] });
  };

  const handleDeleteQuestion = async () => {
    if (!selectedQuestionId || !quiz) return;
    
    // Filter out the question to delete
    const updatedQuestions = (quiz.questions || []).filter(q => q.id !== selectedQuestionId);

    // Call mutation to update quiz
    updateQuizMutation.mutate({ questions: updatedQuestions as any[] }); 
    setDeleteQuestionOpen(false);
    setSelectedQuestionId(null);
  };

  const updateOption = (index: number, field: string, value: string | boolean) => {
    if (!editingQuestion) return;
    const newOptions = [...editingQuestion.options];
    
    if (field === "isCorrect" && value === true) {
      // Only one option can be correct for single choice
      newOptions.forEach((opt, i) => {
        opt.isCorrect = i === index;
      });
    } else {
      newOptions[index] = { ...newOptions[index], [field]: value };
    }
    
    setEditingQuestion({ ...editingQuestion, options: newOptions });
  };

  const addOption = () => {
    if (!editingQuestion) return;
    setEditingQuestion({
      ...editingQuestion,
      options: [...editingQuestion.options, { optionText: "", isCorrect: false }],
    });
  };

  const removeOption = (index: number) => {
    if (!editingQuestion || editingQuestion.options.length <= 2) return;
    const newOptions = editingQuestion.options.filter((_, i) => i !== index);
    setEditingQuestion({ ...editingQuestion, options: newOptions });
  };

  if (isLoading) {
    return (
      <div className="bg-[var(--background)] min-h-screen">
        <TopBar />
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-[var(--muted)] rounded w-1/4 mb-6"></div>
            <div className="bg-[var(--card)] rounded-xl p-6">
              <div className="h-64 bg-[var(--muted)] rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="bg-[var(--background)] min-h-screen">
        <TopBar />
        <div className="p-8">
          <div className="text-center py-12">
            <div className="text-[var(--destructive)] text-lg mb-4">Quiz not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background)] min-h-screen">
      <TopBar />
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          {/* Quiz Header */}
          <div className="bg-[var(--card)] rounded-xl shadow-sm border border-[var(--border)] p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                  {quiz.title}
                </h1>
                {quiz.description && (
                  <p className="text-[var(--muted-foreground)]">{quiz.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <FileText size={16} />
                {quiz.questions?.length || 0} questions
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[var(--primary)]/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={16} className="text-[var(--primary)]" />
                  <span className="text-sm font-medium text-[var(--primary)]">
                    Duration
                  </span>
                </div>
                <div className="text-lg font-bold text-[var(--foreground)]">
                  {quiz.duration || "Unlimited"} min
                </div>
              </div>

              <div className="bg-green-500/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Target size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    Passing Score
                  </span>
                </div>
                <div className="text-lg font-bold text-[var(--foreground)]">
                  {quiz.passingScore}%
                </div>
              </div>

              <div className="bg-blue-500/10 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-600 mb-1">
                  Max Attempts
                </div>
                <div className="text-lg font-bold text-[var(--foreground)]">
                  {quiz.maxAttempts}
                </div>
              </div>

              <div className="bg-purple-500/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users size={16} className="text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">
                    Total Attempts
                  </span>
                </div>
                <div className="text-lg font-bold text-[var(--foreground)]">
                  {attempts.length}
                </div>
              </div>
            </div>
          </div>

          {/* Student Attempts Section */}
          <div className="bg-[var(--card)] rounded-xl shadow-sm border border-[var(--border)] p-6 mb-6">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Users size={20} />
              Student Attempts
            </h2>

            {attemptsQuery.isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mx-auto"></div>
              </div>
            ) : attempts.length === 0 ? (
              <div className="text-center py-12">
                <Users size={48} className="text-[var(--muted-foreground)] mx-auto mb-4 opacity-50" />
                <p className="text-[var(--muted-foreground)]">No attempts yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-3 px-4 text-sm font-medium text-[var(--muted-foreground)]">Student</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[var(--muted-foreground)]">Score</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[var(--muted-foreground)]">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[var(--muted-foreground)]">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[var(--muted-foreground)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((attempt) => (
                      <tr key={attempt.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-[var(--foreground)]">{attempt.user.name}</p>
                            <p className="text-sm text-[var(--muted-foreground)]">{attempt.user.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-[var(--foreground)]">
                            {attempt.percentage !== null ? `${attempt.percentage.toFixed(1)}%` : "-"}
                          </span>
                          {attempt.score !== null && (
                            <span className="text-sm text-[var(--muted-foreground)] ml-2">
                              ({attempt.score}/{attempt.totalPoints})
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(attempt.status, attempt.percentage, quiz.passingScore)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                            <Calendar size={14} />
                            {attempt.completedAt ? formatDate(attempt.completedAt) : formatDate(attempt.startedAt)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => router.push(`/admin/quiz/${quizId}/attempts/${attempt.id}`, "View Details")}
                            className="p-2 rounded-lg bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--muted)]/80 transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Questions Section */}
          <div className="bg-[var(--card)] rounded-xl shadow-sm border border-[var(--border)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Questions</h2>
              <button
                onClick={openAddQuestion}
                className="btn flex items-center gap-2"
              >
                <Plus size={16} />
                Add Question
              </button>
            </div>

            {quiz.questions?.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="text-[var(--muted-foreground)] mx-auto mb-4 opacity-50" />
                <p className="text-[var(--muted-foreground)]">No questions added yet</p>
                <button
                  onClick={openAddQuestion}
                  className="mt-4 btn flex items-center gap-2 mx-auto"
                >
                  <Plus size={16} />
                  Add Your First Question
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {quiz.questions?.map((question: QuizQuestion, index: number) => (
                  <div
                    key={question.id}
                    className="border border-[var(--border)] rounded-lg p-6 hover:border-[var(--primary)]/30 transition-colors"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-[var(--primary)] to-[var(--ring)] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-[var(--primary-foreground)] font-semibold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[var(--foreground)] font-medium mb-2">
                          {question.questionText}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                          <span className="px-2 py-1 bg-[var(--muted)] rounded">
                            {question.questionType}
                          </span>
                          <span>
                            {question.points} point
                            {question.points !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditQuestion(question)}
                          className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors"
                          title="Edit Question"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteQuestion(question.id)}
                          className="p-2 rounded-lg bg-[var(--destructive)]/10 text-[var(--destructive)] hover:bg-[var(--destructive)]/20 transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {question.options && question.options.length > 0 && (
                      <div className="ml-12 space-y-2">
                        {question.options.map((option: QuizOption) => (
                          <div
                            key={option.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border ${
                              option.isCorrect
                                ? "border-green-500/30 bg-green-500/10"
                                : "border-[var(--border)] bg-[var(--muted)]/50"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                option.isCorrect
                                  ? "bg-green-500"
                                  : "bg-[var(--muted-foreground)]/30"
                              }`}
                            >
                              {option.isCorrect && (
                                <CheckCircle size={12} className="text-white" />
                              )}
                            </div>
                            <span className="text-[var(--foreground)]">
                              {option.optionText}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {question.explanation && (
                      <div className="ml-12 mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-sm text-[var(--foreground)]">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Question Modal */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <div className="w-[600px] max-w-[90vw] max-h-[80vh] overflow-y-auto">
          <div className="p-6 border-b border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              {isAddingNew ? "Add Question" : "Edit Question"}
            </h2>
          </div>
          
          {editingQuestion && (
            <div className="p-6 space-y-4">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Question Text *
                </label>
                <textarea
                  value={editingQuestion.questionText}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  rows={3}
                  placeholder="Enter your question..."
                />
              </div>

              {/* Points */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Points
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingQuestion.points}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, points: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Question Type
                  </label>
                  <select
                    value={editingQuestion.questionType}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, questionType: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    <option value="TRUE_FALSE">True/False</option>
                  </select>
                </div>
              </div>

              {/* Options */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    Answer Options
                  </label>
                  <button
                    type="button"
                    onClick={addOption}
                    className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Add Option
                  </button>
                </div>
                <div className="space-y-3">
                  {editingQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updateOption(index, "isCorrect", true)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          option.isCorrect
                            ? "border-green-500 bg-green-500"
                            : "border-[var(--border)] hover:border-green-500"
                        }`}
                      >
                        {option.isCorrect && <CheckCircle size={14} className="text-white" />}
                      </button>
                      <input
                        type="text"
                        value={option.optionText}
                        onChange={(e) => updateOption(index, "optionText", e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                      {editingQuestion.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="p-2 text-[var(--destructive)] hover:bg-[var(--destructive)]/10 rounded-lg transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-2">
                  Click the circle to mark the correct answer
                </p>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Explanation (optional)
                </label>
                <textarea
                  value={editingQuestion.explanation}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  rows={2}
                  placeholder="Explain why this answer is correct..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <button
                  onClick={() => setEditModalOpen(false)}
                  disabled={updateQuizMutation.isPending}
                  className="px-4 py-2 text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveQuestion}
                  disabled={
                    updateQuizMutation.isPending ||
                    !editingQuestion.questionText ||
                    editingQuestion.options.some(o => !o.optionText)
                  }
                  className="btn flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateQuizMutation.isPending ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {isAddingNew ? "Add Question" : "Save Changes"}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Question Confirmation */}
      <ConfirmDialog
        open={deleteQuestionOpen}
        title="Delete Question"
        description="Are you sure you want to delete this question? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDeleteQuestion}
        onClose={() => setDeleteQuestionOpen(false)}
        loading={updateQuizMutation.isPending}
      />
    </div>
  );
}
