import { CircleCheck, Plus, Trash2, X } from "lucide-react";
import TopBar from "../../lazy/TopBar";
import { useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateBulkSkillCategoriesRequestParams } from "../../../types/zod";
import { CreateBulkSkillCategoriesRequest } from "../../../types/zod";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import useRouter from "../../../hooks/useRouter";
import type { ErrorRes } from "../../../types";
import UploadImage from "../../lazy/UploadImage";

export default function CreateSkillCategory() {
  const { courseId } = useParams();
  const router = useRouter();

  const form = useForm<CreateBulkSkillCategoriesRequestParams>({
    resolver: zodResolver(CreateBulkSkillCategoriesRequest),
    defaultValues: {
      skillCategories: [
        {
          name: "",
          description: "",
          courseId: courseId || "",
          tumbnailUrl: "",
          isPublished: false,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "skillCategories",
  });

  const createBulkSkillCategoryMutation = useMutation({
    mutationFn: async (data: CreateBulkSkillCategoriesRequestParams) => {
      const res = await api.post(
        API_ROUTES.SKILL_CATEGORY.CREATE_BULK_SKILL_CATEGORIES,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      alert("Module created successfully");
      router.back();
    },
    onError: (error: ErrorRes) => {
      alert(error.response?.data?.message || "An Error Has Occured");
    },
  });

  const onSubmit = (data: CreateBulkSkillCategoriesRequestParams) => {
    createBulkSkillCategoryMutation.mutate(data);
  };

const addSkillCategory = () => {
  append({
    name: "",
    description: "",
    courseId: courseId || "",
    tumbnailUrl: "", // <-- Ensure this is always present
    isPublished: false,
  });
};

  const removeSkillCategory = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      <TopBar>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            <X size={20} />
            Cancel
          </button>
          <button
            type="submit"
            form="create-skill-categories-form"
            disabled={createBulkSkillCategoryMutation.isPending}
            className="btn"
          >
            <CircleCheck size={20} />
            {createBulkSkillCategoryMutation.isPending ? "Creating..." : "Create"}
          </button>
        </div>
      </TopBar>

      <div className="max-w-7xl mt-6 mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-[var(--card)] rounded-2xl shadow border border-[var(--border)] overflow-hidden">
          <div className="px-8 pt-6">
            <h1 className="text-xl font-bold text-[var(--foreground)]">
              Create New Module
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1 text-sm">
              Fill in the details below to create a new Module
            </p>
          </div>

          <form
            id="create-skill-categories-form"
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
                        Module {index + 1}
                      </h3>
                    </div>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSkillCategory(index)}
                        className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--destructive)] px-3 py-2 rounded-lg transition-all duration-200 hover:bg-[var(--destructive)]/10"
                      >
                        <Trash2 size={16} />
                        <span className="text-sm font-medium">Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-[var(--foreground)]">
                        Module Name{" "}
                        <span className="text-[var(--destructive)]">*</span>
                      </label>
                      <input
                        {...form.register(`skillCategories.${index}.name`)}
                        type="text"
                        className="input-form"
                        placeholder="e.g., Technical Skills, Soft Skills"
                      />
                      {form.formState.errors.skillCategories?.[index]?.name && (
                        <p className="text-[var(--destructive)] text-sm font-medium mt-1">
                          {
                            form.formState.errors.skillCategories[index]?.name
                              ?.message
                          }
                        </p>
                      )}
                    </div>

                    {/* Hidden courseId field */}
                    <input
                      {...form.register(`skillCategories.${index}.courseId`)}
                      type="hidden"
                      value={courseId}
                    />

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-[var(--foreground)]">
                        Description{" "}
                        <span className="text-[var(--destructive)]">*</span>
                      </label>
                      <textarea
                        {...form.register(
                          `skillCategories.${index}.description`
                        )}
                        rows={3}
                        className="input-form resize-none"
                        placeholder="Describe what this Module encompasses..."
                      />
                      {form.formState.errors.skillCategories?.[index]
                        ?.description && (
                        <p className="text-[var(--destructive)] text-sm font-medium mt-1">
                          {
                            form.formState.errors.skillCategories[index]
                              ?.description?.message
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[var(--foreground)]">
                      Thumbnail (optional)
                    </label>
                    <Controller
                      name={`skillCategories.${index}.tumbnailUrl`}
                      control={form.control}
                      render={({ field }) => (
                        <>
                          <UploadImage
                            imageUrl={field.value}
                            setImageUrl={(url: string) => field.onChange(url)}
                            width={"full"}
                            height={200}
                            text="Click to upload thumbnail"
                          />
                          {field.value && (
                            <button
                              type="button"
                              onClick={() => field.onChange("")}
                              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-all duration-200"
                            >
                              Remove Image
                            </button>
                          )}
                        </>
                      )}
                    />
                  </div>

                  {/* Publish Toggle */}
                  <div className="mt-4 space-y-2">
                    <label className="block text-sm font-semibold text-[var(--foreground)]">
                      Publish Status
                    </label>
                    <Controller
                      name={`skillCategories.${index}.isPublished`}
                      control={form.control}
                      render={({ field }) => (
                        <button
                          type="button"
                          onClick={() => field.onChange(!field.value)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200"
                          style={{
                            borderColor: field.value ? "var(--primary)" : "var(--border)",
                            backgroundColor: field.value ? "color-mix(in srgb, var(--primary) 10%, transparent)" : "var(--muted)",
                          }}
                        >
                          <div
                            className="w-10 h-6 rounded-full relative transition-colors duration-200 flex-shrink-0"
                            style={{
                              backgroundColor: field.value ? "var(--primary)" : "var(--muted-foreground)",
                            }}
                          >
                            <div
                              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
                              style={{
                                transform: field.value ? "translateX(20px)" : "translateX(4px)",
                              }}
                            />
                          </div>
                          <span
                            className="text-sm font-semibold"
                            style={{ color: field.value ? "var(--primary)" : "var(--muted-foreground)" }}
                          >
                            {field.value ? "Publish" : "Unpublish"}
                          </span>
                        </button>
                      )}
                    />
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      When published, this Module will be visible to users.
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={addSkillCategory}
                  className="flex items-center gap-2 bg-[var(--card)] text-[var(--primary)] border border-[var(--border)] px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200 hover:bg-[var(--primary)]/10 hover:border-[var(--primary)] hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <Plus size={18} />
                  Add Module
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
                      Module
                    </p>
                  </div>
                  <div className="text-[var(--primary)]">
                    <div className="text-2xl font-bold">{fields.length}</div>
                    <div className="text-sm">Total</div>
                  </div>
                </div>
              </div>

              {/* Form-level errors */}
              {form.formState.errors.skillCategories && (
                <div className="bg-[var(--destructive)]/10 border border-[var(--destructive)] rounded-xl p-4">
                  <p className="text-[var(--destructive)] text-sm font-medium">
                    {form.formState.errors.skillCategories.message}
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
