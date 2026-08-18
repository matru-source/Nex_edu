import { CircleCheck, Plus, X, Loader2, ChevronDown } from "lucide-react";
import TopBar from "../../lazy/TopBar";
import useInitNavStackOnce from "../../../hooks/useInitNavstack";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateCategoryServiceParams,
  CreateCourseRequestParams,
  CreateSubCategoryServiceParams,
} from "../../../types/zod";
import { CreateCourseRequest } from "../../../types/zod";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import useRouter from "../../../hooks/useRouter";
import UploadImage from "../../lazy/UploadImage";
import { userStore } from "../../../state/global";

interface CreateCourseResponse extends Response {
  data: {
    description: string;
    id: string;
    title: string;
    categoryId: string;
    subCategoryId: string;
    tumbnailUrl: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
    published: boolean;
  };
}

interface CreateCategoryMutationResponse extends Response {
  data: {
    name: string;
    description: string;
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
  };
}

interface CreateSubCategoryMutationResponse extends Response {
  data: {
    name: string;
    description: string;
    categoryId: string;
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
  };
}

interface CategoriesQueryResponse extends Response {
  data: {
    name: string;
    description: string;
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
  }[];
}

interface SubCategoryQueryResponse extends Response {
  data: {
    name: string;
    description: string;
    categoryId: string;
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
  }[];
}

export default function CreateCourses() {
  const user = userStore((state) => state.user);
  const isContributor = user?.role === "CONTRIBUTOR";
  const isAdmin = user?.role === "ADMIN";

  useInitNavStackOnce([
    {
      title: "Create Value Stream",
      path: isContributor
        ? "/contributor/courses/create"
        : "/admin/courses/create",
    },
  ]);

  const queryClient = useQueryClient();
  const router = useRouter();

  // States for new category and subcategory creation
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [showNewSubCategoryInput, setShowNewSubCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newSubCategoryName, setNewSubCategoryName] = useState("");
  const [newSubCategoryDescription, setNewSubCategoryDescription] =
    useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");


  // Form setup with react-hook-form and zod
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
    control,
  } = useForm<CreateCourseRequestParams>({
    resolver: zodResolver(CreateCourseRequest),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      subCategoryId: "",
      tumbnailUrl: "",
      published: false,
    },
  });

  const watchedCategoryId = watch("categoryId");

  const createCourseMutation = useMutation({
    mutationFn: async (data: CreateCourseRequestParams) => {
      const res = await api.post<CreateCourseResponse>(
        API_ROUTES.COURSE.CREATE_COURSE,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      reset();
      setSelectedCategoryId("");
      alert("Value Stream created successfully!");
      router.back();
    },
    onError: (error) => {
      console.error("Error creating course:", error);
      alert("Failed to create Value Stream. Please try again.");
    },
  });

  const createCategory = useMutation({
    mutationFn: async (data: CreateCategoryServiceParams) => {
      const res = await api.post<CreateCategoryMutationResponse>(
        API_ROUTES.ADMIN.CREATE_CATEGORY,
        data
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setValue("categoryId", data.data.id);
      setSelectedCategoryId(data.data.id);
      setShowNewCategoryInput(false);
      setNewCategoryName("");
      setNewCategoryDescription("");
      alert("Brand created successfully!");
    },
    onError: (error) => {
      console.error("Error creating category:", error);
      alert("Failed to create Brand. Please try again.");
    },
  });

  const createSubCategory = useMutation({
    mutationFn: async (data: CreateSubCategoryServiceParams) => {
      const res = await api.post<CreateSubCategoryMutationResponse>(
        API_ROUTES.ADMIN.CREATE_SUBCATEGORY,
        data
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["subcategories", selectedCategoryId],
      });
      setValue("subCategoryId", data.data.id);
      setShowNewSubCategoryInput(false);
      setNewSubCategoryName("");
      setNewSubCategoryDescription("");
      alert("Application created successfully!");
    },
    onError: (error) => {
      console.error("Error creating subcategory:", error);
      alert("Failed to create Application. Please try again.");
    },
  });

  const getAllCategoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get<CategoriesQueryResponse>(
        API_ROUTES.COURSE.GET_CATEGORIES
      );
      return res.data;
    },
  });

  // Fetch all subcategories independently (not filtered by category)
  const subCategoryQuery = useQuery({
    queryKey: ["subcategories-all"],
    queryFn: async () => {
      const res = await api.get<SubCategoryQueryResponse>(
        API_ROUTES.COURSE.GET_ALL_SUBCATEGORIES
      );
      return res.data;
    },
  });

  // Update selectedCategoryId when categoryId changes (for new subcategory creation)
  useEffect(() => {
    if (watchedCategoryId !== selectedCategoryId) {
      setSelectedCategoryId(watchedCategoryId);
    }
  }, [watchedCategoryId, selectedCategoryId]);

  const onSubmit = (data: CreateCourseRequestParams) => {
    createCourseMutation.mutate(data);
  };

  const handleCreateNewCategory = () => {
    if (!newCategoryName.trim() || !newCategoryDescription.trim()) {
      alert("Please fill in both Brand name and description");
      return;
    }
    createCategory.mutate({
      name: newCategoryName.trim(),
      description: newCategoryDescription.trim(),
    });
  };

  const handleCreateNewSubCategory = () => {
    if (!newSubCategoryName.trim() || !newSubCategoryDescription.trim()) {
      alert("Please fill in both Application name and description");
      return;
    }
    if (!selectedCategoryId) {
      alert("Please select a Brand first");
      return;
    }
    createSubCategory.mutate({
      name: newSubCategoryName.trim(),
      description: newSubCategoryDescription.trim(),
      categoryId: selectedCategoryId,
    });
  };

  return (
    <div
      className="min-h-screen pb-8"
      style={{ backgroundColor: "var(--background)" }}
    >
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
            form="create-course-form"
            disabled={isSubmitting || createCourseMutation.isPending}
            className="btn"
          >
            {isSubmitting || createCourseMutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CircleCheck size={18} />
                Create
              </>
            )}
          </button>
        </div>
      </TopBar>

      <div className="max-w-7xl mt-6 mx-auto px-8">
        <div
          className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <div className="px-8 pt-6">
            <h1
              className="text-xl font-bold text-gray-900"
              style={{ color: "var(--foreground)" }}
            >
              Create New Value Stream
            </h1>
            <p
              className="text-gray-400 mt-1 text-sm"
              style={{ color: "var(--muted-foreground)" }}
            >
              Fill in the details below to create a new Value Stream
            </p>
          </div>

          <form
            id="create-course-form"
            onSubmit={handleSubmit(onSubmit)}
            className="p-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column - Thumbnail */}
              <div className="space-y-8">
                <div>
                  <label
                    className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide"
                    style={{ color: "var(--foreground)" }}
                  >
                    Value Stream Thumbnail (800x450px)
                  </label>
                  <div className="h-[250px]">
                    <Controller
                      name="tumbnailUrl"
                      control={control}
                      render={({ field }) => (
                        <>
                          <UploadImage
                            imageUrl={field.value}
                            setImageUrl={(url: string) => field.onChange(url)}
                            width={"full"}
                            height={"full"}
                            text={`Click to upload thumbnail`}
                          />
                          {field.value && (
                            <button
                              type="button"
                              onClick={() => field.onChange("")}
                              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-all duration-200 flex items-center gap-2"
                              style={{
                                backgroundColor: "var(--destructive)",
                                color: "var(--destructive-foreground)",
                              }}
                            >
                              <X size={14} />
                              Remove Image
                            </button>
                          )}
                        </>
                      )}
                    />
                    {errors.tumbnailUrl && (
                      <p
                        className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg"
                        style={{
                          color: "var(--destructive)",
                          backgroundColor: "var(--destructive)",
                          opacity: 0.1,
                        }}
                      >
                        {errors.tumbnailUrl.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {/* Right Column - Form Fields */}
              <div className="space-y-6">
                {/* Product/ Application */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide"
                    style={{ color: "var(--foreground)" }}
                  >
                    Value Stream *
                  </label>
                  <input
                    type="text"
                    id="title"
                    {...register("title")}
                    className="input-form"
                    placeholder="Enter Value Stream"
                  />
                  {errors.title && (
                    <p
                      className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg"
                      style={{
                        color: "var(--destructive)",
                        backgroundColor: "var(--destructive)",
                        opacity: 0.1,
                      }}
                    >
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Course Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide"
                    style={{ color: "var(--foreground)" }}
                  >
                    Value Stream Description *
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    {...register("description")}
                    className="input-form resize-none"
                    placeholder="Enter Value Stream description"
                  />
                  {errors.description && (
                    <p
                      className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg"
                      style={{
                        color: "var(--destructive)",
                        backgroundColor: "var(--destructive)",
                        opacity: 0.1,
                      }}
                    >
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Category Selection - Visible to both ADMIN and CONTRIBUTOR */}
                <div>
                  <label
                    htmlFor="categoryId"
                    className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide"
                    style={{ color: "var(--foreground)" }}
                  >
                    Brand *
                  </label>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <select
                          id="categoryId"
                          {...register("categoryId")}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none transition-all duration-200 bg-white"
                          style={
                            {
                              borderColor: "var(--border)",
                              backgroundColor: "var(--card)",
                              color: "var(--foreground)",
                              "--tw-ring-color": "var(--ring)",
                            } as any
                          }
                          disabled={getAllCategoriesQuery.isLoading}
                        >
                          <option value="">Select a Brand</option>
                          {getAllCategoriesQuery.data?.data.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={20}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                          style={{ color: "var(--muted-foreground)" }}
                        />
                      </div>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowNewCategoryInput(!showNewCategoryInput)
                          }
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-lg transition-all duration-200 flex items-center gap-2"
                          style={{
                            background:
                              "linear-gradient(to right, var(--primary), var(--ring))",
                            color: "var(--primary-foreground)",
                          }}
                        >
                          <Plus size={18} />
                          New
                        </button>
                      )}
                    </div>

                    {showNewCategoryInput && isAdmin && (
                      <div
                        className="bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-xl p-6 border border-green-200 space-y-4 animate-in fade-in duration-200"
                        style={{
                          background:
                            "linear-gradient(to bottom right, var(--muted), var(--accent))",
                          borderColor: "var(--border)",
                        }}
                      >
                        <h4
                          className="font-semibold text-green-800 flex items-center gap-2"
                          style={{ color: "var(--foreground)" }}
                        >
                          <Plus size={16} />
                          Add New Brand
                        </h4>
                        <input
                          type="text"
                          placeholder="Brand name"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                          style={{
                            borderColor: "var(--border)",
                            backgroundColor: "var(--card)",
                            color: "var(--foreground)",
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Brand description"
                          value={newCategoryDescription}
                          onChange={(e) =>
                            setNewCategoryDescription(e.target.value)
                          }
                          className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                          style={{
                            borderColor: "var(--border)",
                            backgroundColor: "var(--card)",
                            color: "var(--foreground)",
                          }}
                        />
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={handleCreateNewCategory}
                            disabled={createCategory.isPending}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
                            style={{
                              backgroundColor: "var(--primary)",
                              color: "var(--primary-foreground)",
                            }}
                          >
                            {createCategory.isPending ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Plus size={14} />
                            )}
                            {createCategory.isPending
                              ? "Adding..."
                              : "Add Brand"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowNewCategoryInput(false);
                              setNewCategoryName("");
                              setNewCategoryDescription("");
                            }}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400 transition-all duration-200 flex items-center gap-2"
                            style={{
                              backgroundColor: "var(--muted)",
                              color: "var(--foreground)",
                            }}
                          >
                            <X size={14} />
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.categoryId && (
                    <p
                      className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg"
                      style={{
                        color: "var(--destructive)",
                        backgroundColor: "var(--destructive)",
                        opacity: 0.1,
                      }}
                    >
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>

                {/* Subcategory Selection - Visible to both ADMIN and CONTRIBUTOR */}
                <div>
                  <label
                    htmlFor="subCategoryId"
                    className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide"
                    style={{ color: "var(--foreground)" }}
                  >
                    Application *
                  </label>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <select
                          id="subCategoryId"
                          {...register("subCategoryId")}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none transition-all duration-200 bg-white"
                          style={{
                            borderColor: "var(--border)",
                            backgroundColor: "var(--card)",
                            color: "var(--foreground)",
                          }}
                          disabled={subCategoryQuery.isLoading}
                        >
                          <option value="">Select an Application</option>
                          {subCategoryQuery.data?.data.map((subcategory) => (
                            <option key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={20}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                          style={{ color: "var(--muted-foreground)" }}
                        />
                      </div>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowNewSubCategoryInput(!showNewSubCategoryInput)
                          }
                          disabled={!selectedCategoryId}
                          className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          style={{
                            background:
                              "linear-gradient(to right, var(--primary), var(--ring))",
                            color: "var(--primary-foreground)",
                          }}
                        >
                          <Plus size={18} />
                          New
                        </button>
                      )}
                    </div>

                    {showNewSubCategoryInput &&
                      selectedCategoryId &&
                      isAdmin && (
                        <div
                          className="bg-gradient-to-br from-blue-50 to-cyan-50/50 rounded-xl p-6 border border-blue-200 space-y-4 animate-in fade-in duration-200"
                          style={{
                            background:
                              "linear-gradient(to bottom right, var(--muted), var(--accent))",
                            borderColor: "var(--border)",
                          }}
                        >
                          <h4
                            className="font-semibold text-blue-800 flex items-center gap-2"
                            style={{ color: "var(--foreground)" }}
                          >
                            <Plus size={16} />
                            Add New Application
                          </h4>
                          <input
                            type="text"
                            placeholder="Application name"
                            value={newSubCategoryName}
                            onChange={(e) =>
                              setNewSubCategoryName(e.target.value)
                            }
                            className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            style={{
                              borderColor: "var(--border)",
                              backgroundColor: "var(--card)",
                              color: "var(--foreground)",
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Application description"
                            value={newSubCategoryDescription}
                            onChange={(e) =>
                              setNewSubCategoryDescription(e.target.value)
                            }
                            className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            style={{
                              borderColor: "var(--border)",
                              backgroundColor: "var(--card)",
                              color: "var(--foreground)",
                            }}
                          />
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={handleCreateNewSubCategory}
                              disabled={createSubCategory.isPending}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
                              style={{
                                backgroundColor: "var(--primary)",
                                color: "var(--primary-foreground)",
                              }}
                            >
                              {createSubCategory.isPending ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Plus size={14} />
                              )}
                              {createSubCategory.isPending
                                ? "Adding..."
                                : "Add Application"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowNewSubCategoryInput(false);
                                setNewSubCategoryName("");
                                setNewSubCategoryDescription("");
                              }}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400 transition-all duration-200 flex items-center gap-2"
                              style={{
                                backgroundColor: "var(--muted)",
                                color: "var(--foreground)",
                              }}
                            >
                              <X size={14} />
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                  </div>
                  {errors.subCategoryId && (
                    <p
                      className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg"
                      style={{
                        color: "var(--destructive)",
                        backgroundColor: "var(--destructive)",
                        opacity: 0.1,
                      }}
                    >
                      {errors.subCategoryId.message}
                    </p>
                  )}
                </div>

                {/* Publish Toggle */}
                <div>
                  <label
                    className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide"
                    style={{ color: "var(--foreground)" }}
                  >
                    Publish Status
                  </label>
                  <Controller
                    name="published"
                    control={control}
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
                  <p className="mt-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
                    When published, this Value Stream will be visible to users.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Submission Info */}
            <div
              className="mt-12 pt-8 border-t border-gray-200 text-center"
              style={{ borderTopColor: "var(--border)" }}
            >
              <p
                className="text-sm text-gray-500 flex items-center justify-center gap-2"
                style={{ color: "var(--muted-foreground)" }}
              >
                <CircleCheck
                  size={16}
                  className="text-green-500"
                  style={{ color: "var(--primary)" }}
                />
                Click the "Create" button in the top bar to submit the
                form
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
