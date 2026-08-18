import { CircleCheck, Plus, Trash2, X } from "lucide-react";
import TopBar from "../../lazy/TopBar";
import { useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import type { CreateBulkChaptersRequestParams } from "../../../types/zod";
import { CreateBulkChaptersRequest } from "../../../types/zod";
import useRouter from "../../../hooks/useRouter";
import { useParams } from "react-router-dom";
import type { ErrorRes } from "../../../types";
import UploadImage from "../../lazy/UploadImage";

export default function CreateChapters() {
  const { moduleId } = useParams();
  const router = useRouter();

  if (!moduleId) {
    return <div>Module ID is required</div>;
  }

  const form = useForm<CreateBulkChaptersRequestParams>({
    resolver: zodResolver(CreateBulkChaptersRequest),
    defaultValues: {
      chapters: [
        {
          title: "",
          content: "",
          price: 0,
          moduleId: moduleId || "",
          tumbnailUrl: "",
          status: "DRAFT" as const,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "chapters",
  });

  const createBulkChapterMutation = useMutation({
    mutationFn: async (data: CreateBulkChaptersRequestParams) => {
      const res = await api.post(API_ROUTES.CHAPTER.CREATE_CHAPTERS, data);
      return res.data;
    },
    onSuccess: () => {
      alert("Chapters created successfully");
      router.back();
    },
    onError: (error: ErrorRes) => {
      alert(error.response?.data?.message || "An Error Has Occurred");
    },
  });

  const onSubmit = (data: CreateBulkChaptersRequestParams) => {
    createBulkChapterMutation.mutate(data);
  };

  const addChapter = () => {
    append({
      title: "",
      content: "",
      price: 0,
      moduleId: moduleId || "",
      tumbnailUrl: "",
      status: "DRAFT" as const,
    });
  };

  const removeChapter = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
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
            <X size={16} />
            Cancel
          </button>
          <button
            type="submit"
            form="create-chapters-form"
            disabled={createBulkChapterMutation.isPending}
            className="btn"
          >
            <CircleCheck size={20} />
            {createBulkChapterMutation.isPending ? "Creating..." : "Create"}
          </button>
        </div>
      </TopBar>

      <div className="max-w-7xl mt-8 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[var(--card)] rounded-2xl shadow border border-[var(--border)] overflow-hidden">
          <div className="px-8 pt-6">
            <h1 className="text-xl font-bold text-[var(--foreground)]">
              Create New Chapters
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1 text-sm">
              Fill in the details below to create new chapters
            </p>
          </div>

          <form
            id="create-chapters-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-8"
          >
            <div className="space-y-6">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="bg-[var(--muted)]/50 rounded-xl p-6 border border-[var(--border)] shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-[var(--primary)] to-[var(--ring)] rounded-full flex items-center justify-center">
                        <span className="text-[var(--primary-foreground)] text-sm font-semibold">
                          {index + 1}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">
                        Chapter {index + 1}
                      </h3>
                    </div>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChapter(index)}
                        className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--destructive)] px-3 py-2 rounded-lg transition-all duration-200 hover:bg-[var(--destructive)]/10"
                      >
                        <Trash2 size={16} />
                        <span className="text-sm font-medium">Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-[var(--foreground)]">
                        Chapter Title{" "}
                        <span className="text-[var(--destructive)]">*</span>
                      </label>
                      <input
                        {...form.register(`chapters.${index}.title`)}
                        type="text"
                        className="input-form"
                        placeholder="e.g., Getting Started, Advanced Concepts"
                      />
                      {form.formState.errors.chapters?.[index]?.title && (
                        <p className="text-[var(--destructive)] text-sm font-medium mt-1">
                          {
                            form.formState.errors.chapters[index]?.title
                              ?.message
                          }
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-[var(--foreground)]">
                        Price{" "}
                        <span className="text-[var(--destructive)]">*</span>
                      </label>
                      <input
                        {...form.register(`chapters.${index}.price`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        min="0"
                        step="0.01"
                        className="input-form"
                        placeholder="0.00"
                      />
                      {form.formState.errors.chapters?.[index]?.price && (
                        <p className="text-[var(--destructive)] text-sm font-medium mt-1">
                          {
                            form.formState.errors.chapters[index]?.price
                              ?.message
                          }
                        </p>
                      )}
                    </div>

                    {/* Hidden moduleId field */}
                    <input
                      {...form.register(`chapters.${index}.moduleId`)}
                      type="hidden"
                      value={moduleId}
                    />
                  </div>

                  <div className="mt-6 space-y-2">
                    <label className="block text-sm font-semibold text-[var(--foreground)]">
                      Content{" "}
                      <span className="text-[var(--destructive)]">*</span>
                    </label>
                    <textarea
                      {...form.register(`chapters.${index}.content`)}
                      rows={4}
                      className="input-form resize-none"
                      placeholder="Describe the chapter content and what students will learn..."
                    />
                    {form.formState.errors.chapters?.[index]?.content && (
                      <p className="text-[var(--destructive)] text-sm font-medium mt-1">
                        {
                          form.formState.errors.chapters[index]?.content
                            ?.message
                        }
                      </p>
                    )}
                  </div>

                  <div className="mt-6 space-y-2">
                    <label className="block text-sm font-semibold text-[var(--foreground)]">
                      Thumbnail (optional)
                    </label>
                    <Controller
                      name={`chapters.${index}.tumbnailUrl`}
                      control={form.control}
                      render={({ field }) => (
                        <UploadImage
                          imageUrl={field.value}
                          setImageUrl={(url: string) => field.onChange(url)}
                          width={"full"}
                          height={200}
                          text="Click to upload thumbnail"
                        />
                      )}
                    />
                  </div>

                  {/* Publish Toggle */}
                  <div className="mt-6">
                    <Controller
                      name={`chapters.${index}.status`}
                      control={form.control}
                      render={({ field }) => (
                        <div
                          className="flex items-center justify-between p-3 rounded-lg border transition-all duration-200"
                          style={{
                            borderColor: field.value === 'PUBLISHED' ? "var(--primary)" : "var(--border)",
                            backgroundColor: field.value === 'PUBLISHED'
                              ? "color-mix(in srgb, var(--primary) 10%, transparent)"
                              : "var(--muted)",
                          }}
                        >
                          <span
                            className="text-sm font-semibold"
                            style={{ color: field.value === 'PUBLISHED' ? "var(--primary)" : "var(--muted-foreground)" }}
                          >
                            {field.value === 'PUBLISHED' ? "Publish" : "Unpublish"}
                          </span>
                          <button
                            type="button"
                            onClick={() => field.onChange(field.value === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')}
                            className="w-10 h-6 rounded-full relative transition-colors duration-200 flex-shrink-0"
                            style={{ backgroundColor: field.value === 'PUBLISHED' ? "var(--primary)" : "var(--muted-foreground)" }}
                          >
                            <div
                              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
                              style={{ transform: field.value === 'PUBLISHED' ? "translateX(20px)" : "translateX(4px)" }}
                            />
                          </button>
                        </div>
                      )}
                    />
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={addChapter}
                  className="flex items-center gap-2 bg-[var(--card)] text-[var(--primary)] border border-[var(--border)] px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200 hover:bg-[var(--primary)]/10 hover:border-[var(--primary)] hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <Plus size={18} />
                  Add Chapter
                </button>
              </div>

              {/* Summary Card */}
              <div className="bg-[var(--muted)] border border-[var(--border)] rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--foreground)]">
                      Summary
                    </h4>
                    <p className="text-[var(--muted-foreground)] mt-1">
                      You're creating{" "}
                      <span className="font-bold text-[var(--primary)]">
                        {fields.length}
                      </span>{" "}
                      chapter{fields.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="text-[var(--primary)]">
                    <div className="text-2xl font-bold">{fields.length}</div>
                    <div className="text-sm">Total</div>
                  </div>
                </div>
              </div>

              {/* Form-level errors */}
              {form.formState.errors.chapters && (
                <div className="bg-[var(--destructive)]/10 border border-[var(--destructive)] rounded-xl p-4">
                  <p className="text-[var(--destructive)] text-sm font-medium">
                    {form.formState.errors.chapters.message}
                  </p>
                </div>
              )}
            </div>
          </form>

          {/* Footer Actions */}
          <div className="mt-12 py-8 border-t border-[var(--border)] text-center">
            <p className="text-sm text-[var(--muted-foreground)] flex items-center justify-center gap-2">
              <CircleCheck size={16} className="text-[var(--primary)]" />
              Click the "Create" button in the top bar to submit the form
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
