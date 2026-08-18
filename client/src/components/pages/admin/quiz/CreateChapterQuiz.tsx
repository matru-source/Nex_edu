import {
  CircleCheck,
  Plus,
  Trash2,
  Clock,
  Target,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import TopBar from "../../../lazy/TopBar";
import { useMutation } from "@tanstack/react-query";
import type { CreateQuizRequestParams } from "../../../../types/zod";
import { CreateQuizRequest } from "../../../../types/zod";
import api from "../../../../lib/axios/axios";
import { API_ROUTES } from "../../../../lib/api";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useRouter from "../../../../hooks/useRouter";
import { useParams } from "react-router-dom";
import { useState } from "react";
import useInitNavStackOnce from "../../../../hooks/useInitNavstack";

export default function CreateChapterQuiz() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);

  useInitNavStackOnce([
    { title: "Quizzes", path: "/admin/quizzes" },
    {
      title: "Create Chapter Quiz",
      path: `/admin/chapter/${chapterId}/quiz/create`,
    },
  ]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateQuizRequestParams>({
    resolver: zodResolver(CreateQuizRequest),
    defaultValues: {
      title: "",
      description: "",
      instruction: "",
      duration: 30,
      maxAttempts: 3,
      passingScore: 60,
      allowReview: true,
      showResultsImmediately: true,
      chapterId: chapterId || "",
      questions: [
        {
          questionText: "",
          questionType: "MCQ",
          points: 1,
          order: 0,
          explanation: "",
          allowMultipleCorrect: false,
          options: [
            { optionText: "", isCorrect: false, order: 0 },
            { optionText: "", isCorrect: false, order: 1 },
          ],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const watchedQuestions = watch("questions");

  const createQuizMutation = useMutation({
    mutationFn: async (data: CreateQuizRequestParams) => {
      const res = await api.post(API_ROUTES.QUIZ.CREATE, data);
      return res.data;
    },
    onSuccess: () => {
      alert("Quiz created successfully!");
      router.back();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to create quiz");
    },
  });

  const onSubmit = (data: CreateQuizRequestParams) => {
    createQuizMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300 pb-8">
      <TopBar>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors duration-200 flex items-center gap-2"
          >
            {showPreview ? "Edit Mode" : "Preview"}
          </button>
          <button
            type="submit"
            form="create-quiz-form"
            disabled={isSubmitting || createQuizMutation.isPending}
            className="btn flex items-center gap-2"
          >
            <CircleCheck size={18} />
            {createQuizMutation.isPending ? "Creating..." : "Create Quiz"}
          </button>
        </div>
      </TopBar>

      <div className="max-w-7xl mt-8 mx-auto px-8">
        <div className="bg-[var(--card)] rounded-2xl shadow-lg border border-[var(--border)] overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-6 pb-4 border-b border-[var(--border)] bg-gradient-to-r from-[var(--primary)]/5 to-[var(--ring)]/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--ring)] flex items-center justify-center">
                <BookOpen className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">
                  Create Chapter Quiz
                </h1>
                <p className="text-[var(--muted-foreground)] text-sm mt-1">
                  Chapter ID: {chapterId}
                </p>
              </div>
            </div>
          </div>

          {!showPreview ? (
            <form
              id="create-quiz-form"
              onSubmit={handleSubmit(onSubmit)}
              className="p-8 space-y-8"
            >
              {/* Show form errors */}
              {Object.keys(errors).length > 0 && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                  <p className="text-red-600 dark:text-red-400 font-medium mb-2">
                    Please fix the following errors:
                  </p>
                  <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400 space-y-1">
                    {errors.title && <li>Title: {errors.title.message}</li>}
                    {errors.chapterId && (
                      <li>Chapter: {errors.chapterId.message}</li>
                    )}
                    {errors.questions && (
                      <li>Questions: {errors.questions.message}</li>
                    )}
                    {errors.questions?.root && (
                      <li>{errors.questions.root.message}</li>
                    )}
                  </ul>
                </div>
              )}
              {/* Basic Info */}
              <div className="bg-gradient-to-br from-[var(--muted)]/50 to-[var(--accent)]/30 rounded-xl p-6 border border-[var(--border)]">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <Target size={20} className="text-[var(--primary)]" />
                  Quiz Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                      Quiz Title *
                    </label>
                    <input
                      type="text"
                      {...register("title")}
                      className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                      placeholder="Enter quiz title"
                    />
                    {errors.title && (
                      <p className="text-[var(--destructive)] text-sm mt-1 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--foreground)] mb-2 flex items-center gap-2">
                      <Clock
                        size={16}
                        className="text-[var(--muted-foreground)]"
                      />
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      {...register("duration", { valueAsNumber: true })}
                      className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                      placeholder="30"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                      Description
                    </label>
                    <textarea
                      {...register("description")}
                      rows={3}
                      className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted-foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                      placeholder="Brief description of the quiz"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                      Instructions
                    </label>
                    <textarea
                      {...register("instruction")}
                      rows={3}
                      className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted-foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                      placeholder="Instructions for students taking this quiz"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                      Max Attempts
                    </label>
                    <input
                      type="number"
                      {...register("maxAttempts", { valueAsNumber: true })}
                      className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                      defaultValue={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                      Passing Score (%)
                    </label>
                    <input
                      type="number"
                      {...register("passingScore", { valueAsNumber: true })}
                      className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                      defaultValue={60}
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center gap-4">
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-[var(--muted)]/50 transition-colors">
                      <input
                        type="checkbox"
                        {...register("allowReview")}
                        className="w-4 h-4 accent-[var(--primary)]"
                      />
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        Allow students to review answers after completion
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
                    <Target size={20} className="text-[var(--primary)]" />
                    Questions ({fields.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      append({
                        questionText: "",
                        questionType: "MCQ",
                        points: 1,
                        order: fields.length,
                        explanation: "",
                        allowMultipleCorrect: false,
                        options: [
                          { optionText: "", isCorrect: false, order: 0 },
                          { optionText: "", isCorrect: false, order: 1 },
                        ],
                      })
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--primary)]/90 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Plus size={16} />
                    Add Question
                  </button>
                </div>

                {fields.map((field, questionIndex) => (
                  <div
                    key={field.id}
                    className="bg-[var(--card)] border-2 border-[var(--border)] rounded-xl p-6 space-y-4 hover:border-[var(--primary)]/30 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--ring)] flex items-center justify-center text-white font-bold text-sm">
                          {questionIndex + 1}
                        </div>
                        <h4 className="font-semibold text-[var(--foreground)]">
                          Question {questionIndex + 1}
                        </h4>
                      </div>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(questionIndex)}
                          className="p-2 text-[var(--destructive)] hover:bg-[var(--destructive)]/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                        Question Text *
                      </label>
                      <textarea
                        {...register(`questions.${questionIndex}.questionText`)}
                        rows={2}
                        className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted-foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                        placeholder="Enter your question"
                      />
                      {errors.questions?.[questionIndex]?.questionText && (
                        <p className="text-[var(--destructive)] text-sm mt-1">
                          {
                            errors.questions[questionIndex]?.questionText
                              ?.message
                          }
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                          Points
                        </label>
                        <input
                          type="number"
                          {...register(`questions.${questionIndex}.points`, {
                            valueAsNumber: true,
                          })}
                          className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                          defaultValue={1}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                          Answer Type
                        </label>
                        <Controller
                          name={`questions.${questionIndex}.allowMultipleCorrect`}
                          control={control}
                          render={({ field }) => (
                            <select
                              value={field.value ? "true" : "false"}
                              onChange={(e) => {
                                const isMulti = e.target.value === "true";
                                field.onChange(isMulti);
                                // Reset options when switching modes
                                if (!isMulti) {
                                  // Reset to single correct - clear all isCorrect
                                  // We can't directly set these, but the UI will update
                                }
                              }}
                              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                            >
                              <option value="false">Single Correct</option>
                              <option value="true">Multiple Correct</option>
                            </select>
                          )}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                          Explanation (optional)
                        </label>
                        <input
                          type="text"
                          {...register(
                            `questions.${questionIndex}.explanation`
                          )}
                          className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                          placeholder="Why this answer is correct"
                        />
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-[var(--foreground)]">
                          Options * ({watchedQuestions?.[questionIndex]?.allowMultipleCorrect ? "Select multiple as correct" : "Select one as correct"})
                        </label>
                        <Controller
                          name={`questions.${questionIndex}.options`}
                          control={control}
                          render={({ field }) => (
                            <button
                              type="button"
                              onClick={() => {
                                const currentOptions = field.value || [];
                                field.onChange([
                                  ...currentOptions,
                                  {
                                    optionText: "",
                                    isCorrect: false,
                                    order: currentOptions.length,
                                  },
                                ]);
                              }}
                              className="text-sm text-[var(--primary)] hover:text-[var(--primary)]/80 flex items-center gap-1"
                            >
                              <Plus size={14} />
                              Add Option
                            </button>
                          )}
                        />
                      </div>

                      <Controller
                        name={`questions.${questionIndex}.options`}
                        control={control}
                        render={({ field }) => {
                          const isMultiCorrect = watchedQuestions?.[questionIndex]?.allowMultipleCorrect;
                          return (
                            <div className="space-y-2">
                              {field.value?.map((option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                                    option.isCorrect
                                      ? "bg-green-500/10 border-green-500/30"
                                      : "bg-[var(--muted)]/30 border-[var(--border)]"
                                  }`}
                                >
                                  <input
                                    type={isMultiCorrect ? "checkbox" : "radio"}
                                    checked={option.isCorrect}
                                    onChange={() => {
                                      if (isMultiCorrect) {
                                        // Toggle checkbox
                                        const newOptions = field.value?.map(
                                          (opt, idx) =>
                                            idx === optionIndex
                                              ? { ...opt, isCorrect: !opt.isCorrect }
                                              : opt
                                        );
                                        field.onChange(newOptions);
                                      } else {
                                        // Radio behavior - only one correct
                                        const newOptions = field.value?.map(
                                          (opt, idx) => ({
                                            ...opt,
                                            isCorrect: idx === optionIndex,
                                          })
                                        );
                                        field.onChange(newOptions);
                                      }
                                    }}
                                    className="w-4 h-4 accent-[var(--primary)]"
                                  />
                                  <input
                                    type="text"
                                    value={option.optionText}
                                    onChange={(e) => {
                                      const newOptions = field.value?.map(
                                        (opt, idx) =>
                                          idx === optionIndex
                                            ? {
                                                ...opt,
                                                optionText: e.target.value,
                                              }
                                            : opt
                                      );
                                      field.onChange(newOptions);
                                    }}
                                    className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                                    placeholder={`Option ${optionIndex + 1}`}
                                  />
                                  {field.value && field.value.length > 2 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newOptions = field.value?.filter(
                                          (_, idx) => idx !== optionIndex
                                        );
                                        field.onChange(newOptions);
                                      }}
                                      className="p-1 text-[var(--destructive)] hover:bg-[var(--destructive)]/10 rounded transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </form>
          ) : (
            <div className="p-8">
              <div className="bg-[var(--muted)]/30 rounded-xl p-6 mb-6">
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                  {watch("title") || "Untitled Quiz"}
                </h2>
                {watch("description") && (
                  <p className="text-[var(--muted-foreground)]">
                    {watch("description")}
                  </p>
                )}
              </div>
              {watchedQuestions?.map((q, idx) => (
                <div
                  key={idx}
                  className="mb-6 p-6 bg-[var(--card)] border border-[var(--border)] rounded-xl"
                >
                  <h3 className="font-semibold text-[var(--foreground)] mb-4">
                    {idx + 1}. {q.questionText || "Question text"}
                  </h3>
                  <div className="space-y-2">
                    {q.options?.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-lg border ${
                          opt.isCorrect
                            ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400"
                            : "bg-[var(--muted)]/30 border-[var(--border)]"
                        }`}
                      >
                        {opt.optionText || `Option ${optIdx + 1}`}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {!showPreview && (
            <div className="px-8 py-6 border-t border-[var(--border)] bg-[var(--muted)]/20 flex items-center justify-between sticky bottom-0">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-6 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-all duration-200 font-medium flex items-center gap-2"
                >
                  Preview
                </button>
                <button
                  type="submit"
                  form="create-quiz-form"
                  disabled={isSubmitting || createQuizMutation.isPending}
                  className="px-8 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--ring)] text-white rounded-lg hover:shadow-lg transition-all duration-200 font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CircleCheck size={20} />
                  {createQuizMutation.isPending
                    ? "Creating Quiz..."
                    : "Create Quiz"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
