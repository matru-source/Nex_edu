import { CircleCheck, Plus, Trash2, X } from "lucide-react";
import TopBar from "../../lazy/TopBar";
import { useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import type { CreateBulkModulesRequestParams } from "../../../types/zod";
import { CreateBulkModulesRequest } from "../../../types/zod";
import useRouter from "../../../hooks/useRouter";
import { useParams } from "react-router-dom";
import type { ErrorRes } from "../../../types";
import UploadImage from "../../lazy/UploadImage";

export default function CreateModule() {
  const { expertiseId } = useParams();
  const router = useRouter();

  if (!expertiseId) {
    return <div>Domain ID is required</div>;
  }

 const form = useForm<CreateBulkModulesRequestParams>({
   resolver: zodResolver(CreateBulkModulesRequest),
   defaultValues: {
     modules: [
       {
         title: "",
         description: "",
         expertiseId: expertiseId || "",
         tumbnailUrl: "", // <-- Fix spelling here
          isPublished: false,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "modules",
  });

  const createBulkModuleMutation = useMutation({
    mutationFn: async (data: CreateBulkModulesRequestParams) => {
      const res = await api.post(API_ROUTES.MODULE.CREATE_MODULES, data);
      return res.data;
    },
    onSuccess: () => {
      alert("Expertise created successfully");
      router.back();
    },
    onError: (error: ErrorRes) => {
      alert(error.response?.data?.message || "An Error Has Occurred");
    },
  });

  const onSubmit = (data: CreateBulkModulesRequestParams) => {
    createBulkModuleMutation.mutate(data);
  };

  const addModule = () => {
    append({
      title: "",
      description: "",
      expertiseId: expertiseId || "",
      tumbnailUrl: "",
      isPublished: false,
    });
  };

  const removeModule = (index: number) => {
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
            form="create-modules-form"
            disabled={createBulkModuleMutation.isPending}
            className="btn"
          >
            <CircleCheck size={20} />
            {createBulkModuleMutation.isPending ? "Creating..." : "Create"}
          </button>
        </div>
      </TopBar>

      <div className="max-w-7xl mt-8 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[var(--card)] rounded-2xl shadow border border-[var(--border)] overflow-hidden">
          <div className="px-8 pt-6">
            <h1 className="text-xl font-bold text-[var(--foreground)]">
              Create New Expertise
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1 text-sm">
              Fill in the details below to create new Expertise
            </p>
          </div>

          <form
            id="create-modules-form"
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
                        Expertise {index + 1}
                      </h3>
                    </div>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeModule(index)}
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
                        Expertise Title{" "}
                        <span className="text-[var(--destructive)]">*</span>
                      </label>
                      <input
                        {...form.register(`modules.${index}.title`)}
                        type="text"
                        className="input-form"
                        placeholder="e.g., Introduction to JavaScript, Advanced React Patterns"
                      />
                      {form.formState.errors.modules?.[index]?.title && (
                        <p className="text-[var(--destructive)] text-sm font-medium mt-1">
                          {form.formState.errors.modules[index]?.title?.message}
                        </p>
                      )}
                    </div>

                    {/* Hidden expertiseId field */}
                    <input
                      {...form.register(`modules.${index}.expertiseId`)}
                      type="hidden"
                      value={expertiseId}
                    />
                  </div>

                  <div className="mt-6 space-y-2">
                    <label className="block text-sm font-semibold text-[var(--foreground)]">
                      Description{" "}
                      <span className="text-[var(--destructive)]">*</span>
                    </label>
                    <textarea
                      {...form.register(`modules.${index}.description`)}
                      rows={3}
                      className="input-form resize-none"
                      placeholder="Describe this Expertise and what students will learn..."
                    />
                    {form.formState.errors.modules?.[index]?.description && (
                      <p className="text-[var(--destructive)] text-sm font-medium mt-1">
                        {
                          form.formState.errors.modules[index]?.description
                            ?.message
                        }
                      </p>
                    )}
                  </div>

                  {/* Expertise Level Tags */}
                  <div className="mt-6 space-y-2">
                    <label className="block text-sm font-semibold text-[var(--foreground)]">
                      Level Tags (optional)
                    </label>
                    <p className="text-xs text-[var(--muted-foreground)] mb-2">
                      Select one or more levels that this expertise targets
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Controller
                        name={`modules.${index}.levels`}
                        control={form.control}
                        defaultValue={[]}
                        render={({ field }) => (
                          <>
                            {(['LEARNER', 'PRACTITIONER', 'PROFESSIONAL'] as const).map((level) => (
                              <label
                                key={level}
                                className="flex items-center gap-2 cursor-pointer group"
                              >
                                <input
                                  type="checkbox"
                                  checked={field.value?.includes(level)}
                                  onChange={(e) => {
                                    const current = field.value || [];
                                    if (e.target.checked) {
                                      field.onChange([...current, level]);
                                    } else {
                                      field.onChange(current.filter((l: string) => l !== level));
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] transition-colors"
                                />
                                <span className="text-sm font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors capitalize">
                                  {level.toLowerCase()}
                                </span>
                              </label>
                            ))}
                          </>
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <label className="block text-sm font-semibold text-[var(--foreground)]">
                      Thumbnail (optional)
                    </label>
                    <Controller
                      name={`modules.${index}.tumbnailUrl`}
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
                  <div className="mt-6 space-y-2">
                    <label className="block text-sm font-semibold text-[var(--foreground)]">
                      Publish Status
                    </label>
                    <Controller
                      name={`modules.${index}.isPublished`}
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
                      When published, this Expertise will be visible to users.
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={addModule}
                  className="flex items-center gap-2 bg-[var(--card)] text-[var(--primary)] border border-[var(--border)] px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200 hover:bg-[var(--primary)]/10 hover:border-[var(--primary)] hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <Plus size={18} />
                  Add Expertise
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
                      Expertise
                    </p>
                  </div>
                  <div className="text-[var(--primary)]">
                    <div className="text-2xl font-bold">{fields.length}</div>
                    <div className="text-sm">Total</div>
                  </div>
                </div>
              </div>

              {/* Form-level errors */}
              {form.formState.errors.modules && (
                <div className="bg-[var(--destructive)]/10 border border-[var(--destructive)] rounded-xl p-4">
                  <p className="text-[var(--destructive)] text-sm font-medium">
                    {form.formState.errors.modules.message}
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
