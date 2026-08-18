import { CircleCheck, Plus, Trash2, Clock, Target } from "lucide-react";
import TopBar from "../../../lazy/TopBar";
import useInitNavStackOnce from "../../../../hooks/useInitNavstack";
import { useMutation } from "@tanstack/react-query";
import type { CreateQuizRequestParams } from "../../../../types/zod";
import { CreateQuizRequest } from "../../../../types/zod";
import api from "../../../../lib/axios/axios";
import { API_ROUTES } from "../../../../lib/api";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useRouter from "../../../../hooks/useRouter";


export default function CreateQuiz() {
  useInitNavStackOnce([{ title: "Create Quiz", path: "/admin/quiz/create" }]);


  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
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
     
      questions: [
        {
          questionText: "",
          questionType: "MCQ",
          points: 1,
          order: 0,
          explanation: "",
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-quiz-form"
            disabled={isSubmitting || createQuizMutation.isPending}
            className="btn"
          >
            <CircleCheck size={18} />
            Create Quiz
          </button>
        </div>
      </TopBar>

      <div className="max-w-6xl mt-8 mx-auto px-8">
        <div className="bg-[var(--card)] rounded-2xl shadow border border-[var(--border)] overflow-hidden">
          <div className="px-8 pt-6 border-b border-[var(--border)]">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              Create New Quiz
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1 text-sm">
              Design your quiz with questions and settings
            </p>
          </div>

          <form
            id="create-quiz-form"
            onSubmit={handleSubmit(onSubmit)}
            className="p-8 space-y-8"
          >
            {/* Basic Info */}
            <div className="bg-[var(--muted)] rounded-xl p-6 border border-[var(--border)]">
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
                    className="input-form"
                    placeholder="Enter quiz title"
                  />
                  {errors.title && (
                    <p className="text-[var(--destructive)] text-sm mt-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2 flex items-center gap-2">
                    <Clock size={16} />
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    {...register("duration", { valueAsNumber: true })}
                    className="input-form"
                    placeholder="30"
                  />
                  {errors.duration && (
                    <p className="text-[var(--destructive)] text-sm mt-1">
                      {errors.duration.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    className="input-form resize-none"
                    placeholder="Brief description of the quiz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                    Instructions
                  </label>
                  <textarea
                    {...register("instruction")}
                    rows={3}
                    className="input-form resize-none"
                    placeholder="Instructions for students"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                    Max Attempts
                  </label>
                  <input
                    type="number"
                    {...register("maxAttempts", { valueAsNumber: true })}
                    className="input-form"
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
                    className="input-form"
                    defaultValue={60}
                  />
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  Questions
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
                      options: [
                        { optionText: "", isCorrect: false, order: 0 },
                        { optionText: "", isCorrect: false, order: 1 },
                      ],
                    })
                  }
                  className="flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors duration-300"
                >
                  <Plus size={16} />
                  Add Question
                </button>
              </div>

              {fields.map((field, questionIndex) => (
                <div
                  key={field.id}
                  className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-[var(--primary)] to-[var(--ring)] rounded-full flex items-center justify-center">
                        <span className="text-[var(--primary-foreground)] text-sm font-semibold">
                          {questionIndex + 1}
                        </span>
                      </div>
                      <h4 className="text-base font-semibold text-[var(--foreground)]">
                        Question {questionIndex + 1}
                      </h4>
                    </div>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(questionIndex)}
                        className="flex items-center gap-2 text-[var(--destructive)] hover:text-[var(--destructive)]/80 transition-colors duration-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                        Question Text *
                      </label>
                      <input
                        type="text"
                        {...register(`questions.${questionIndex}.questionText`)}
                        className="input-form"
                        placeholder="Enter your question"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                          Question Type
                        </label>
                        <select
                          {...register(
                            `questions.${questionIndex}.questionType`
                          )}
                          className="input-form"
                        >
                          <option value="MCQ">Multiple Choice</option>
                          <option value="TRUE_FALSE">True/False</option>
                          <option value="SHORT_ANSWER">Short Answer</option>
                          <option value="ESSAY">Essay</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                          Points
                        </label>
                        <input
                          type="number"
                          {...register(`questions.${questionIndex}.points`, {
                            valueAsNumber: true,
                          })}
                          className="input-form"
                          defaultValue={1}
                        />
                      </div>
                    </div>

                    <Controller
                      name={`questions.${questionIndex}.questionType`}
                      control={control}
                      render={({ field: { value } }) => {
                        if (value === "MCQ" || value === "TRUE_FALSE") {
                          return (
                            <div className="mt-4 space-y-2">
                              <label className="block text-sm font-medium text-[var(--foreground)]">
                                Options
                              </label>
                              <div className="text-sm text-[var(--muted-foreground)]">
                                Options will be rendered here
                              </div>
                            </div>
                          );
                        }
                        return <></>;
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
