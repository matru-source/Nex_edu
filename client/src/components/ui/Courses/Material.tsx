import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import {
  X,
  Plus,
  FileText,
  Video,
  Image,
  Code,
  Link,
  Eye,
  Edit,
  Trash2,
  Search,
} from "lucide-react";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import type {
  Material,
  MaterialType,
  MaterialLevel,
  MaterialQueryResponse,
} from "../../../types";
import UploadImage from "../../lazy/UploadImage";
import UploadVideo from "../../lazy/UploadVedio";
import UploadFile from "../../lazy/UploadFile";

interface MaterialManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: {
    type:
      | "course"
      | "skillCategory"
      | "expertise"
      | "module"
      | "chapter"
      | "lesson";
    id: string;
    title: string;
    parentIds?: {
      courseId?: string;
      skillCategoryId?: string;
      expertiseId?: string;
      moduleId?: string;
      chapterId?: string;
      lessonId?: string;
    };
  };
}

const MATERIAL_TYPES: {
  value: MaterialType;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    value: "PDF",
    label: "PDF Document",
    icon: <FileText size={16} />,
    color: "text-red-500",
  },
  {
    value: "DOCUMENT",
    label: "Document",
    icon: <FileText size={16} />,
    color: "text-blue-500",
  },
  {
    value: "PRESENTATION",
    label: "Presentation",
    icon: <FileText size={16} />,
    color: "text-orange-500",
  },
  {
    value: "VIDEO",
    label: "Video",
    icon: <Video size={16} />,
    color: "text-purple-500",
  },
  {
    value: "AUDIO",
    label: "Audio",
    icon: <FileText size={16} />,
    color: "text-green-500",
  },
  {
    value: "IMAGE",
    label: "Image",
    icon: <Image size={16} />,
    color: "text-pink-500",
  },
  {
    value: "CODE",
    label: "Code",
    icon: <Code size={16} />,
    color: "text-indigo-500",
  },
  {
    value: "LINK",
    label: "External Link",
    icon: <Link size={16} />,
    color: "text-yellow-500",
  },
  {
    value: "OTHER",
    label: "Other",
    icon: <FileText size={16} />,
    color: "text-gray-500",
  },
];

const MATERIAL_LEVELS: { value: MaterialLevel; label: string }[] = [
  { value: "COURSE", label: "Course Level" },
  { value: "SKILL_CATEGORY", label: "Expertise Level" },
  { value: "EXPERTISE", label: "Domain Level" },
  { value: "MODULE", label: "Module Level" },
  { value: "CHAPTER", label: "Chapter Level" },
  { value: "LESSON", label: "Lesson Level" },
];

export default function MaterialManager({
  isOpen,
  onClose,
  currentLevel,
}: MaterialManagerProps) {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [filters, setFilters] = useState({
    materialType: "" as MaterialType | "",
    search: "",
  });

  // Get the materialLevel based on currentLevel.type
  const getCurrentMaterialLevel = (): MaterialLevel => {
    switch (currentLevel.type) {
      case "course":
        return "COURSE";
      case "skillCategory":
        return "SKILL_CATEGORY";
      case "expertise":
        return "EXPERTISE";
      case "module":
        return "MODULE";
      case "chapter":
        return "CHAPTER";
      case "lesson":
        return "LESSON";
      default:
        return "LESSON";
    }
  };

  // Get the level label for display
  const getCurrentLevelLabel = (): string => {
    const level = getCurrentMaterialLevel();
    return MATERIAL_LEVELS.find((l) => l.value === level)?.label || "This Level";
  };

  // Fetch materials - only for current level
  const materialsQuery = useQuery({
    queryKey: ["materials", currentLevel.type, currentLevel.id, filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      // Only add current level param - no parent IDs
      switch (currentLevel.type) {
        case "course":
          params.append("courseId", currentLevel.id);
          break;
        case "skillCategory":
          params.append("skillCategoryId", currentLevel.id);
          break;
        case "expertise":
          params.append("expertiseId", currentLevel.id);
          break;
        case "module":
          params.append("moduleId", currentLevel.id);
          break;
        case "chapter":
          params.append("chapterId", currentLevel.id);
          break;
        case "lesson":
          params.append("lessonId", currentLevel.id);
          break;
      }

      // Add type filter only
      if (filters.materialType)
        params.append("materialType", filters.materialType);

      const res = await api.get<MaterialQueryResponse>(
        `${API_ROUTES.MATERIAL.GET_BY_LEVEL}?${params}`
      );
      return res.data;
    },
    enabled: isOpen,
  });

  // Create material mutation
  const createMaterialMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post(API_ROUTES.MATERIAL.CREATE, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      setShowAddForm(false);
      form.reset();
    },
  });

  // Update material mutation
  const updateMaterialMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(API_ROUTES.MATERIAL.UPDATE(id), data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      setEditingMaterial(null);
      form.reset();
    },
  });

  // Delete material mutation
  const deleteMaterialMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(API_ROUTES.MATERIAL.DELETE(id));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
  });

  // Form setup
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      materialType: "PDF" as MaterialType,
      fileUrl: "",
      fileName: "",
      fileType: "",
      fileSize: 0,
      isRequired: false,
      isDownloadable: true,
      order: 0,
      externalUrl: "",
    },
  });

  const watchedMaterialType = form.watch("materialType");

  const onSubmit = (data: any) => {
    // Clean up empty strings - convert to undefined
    const cleanedData = {
      ...data,
      externalUrl:
        data.externalUrl && data.externalUrl.trim() !== ""
          ? data.externalUrl
          : undefined,
      fileUrl:
        data.fileUrl && data.fileUrl.trim() !== "" ? data.fileUrl : undefined,
      description:
        data.description && data.description.trim() !== ""
          ? data.description
          : undefined,
      fileName:
        data.fileName && data.fileName.trim() !== ""
          ? data.fileName
          : undefined,
      fileType:
        data.fileType && data.fileType.trim() !== ""
          ? data.fileType
          : undefined,
    };

    // Material is attached to current level only
    const materialData: any = {
      ...cleanedData,
      materialLevel: getCurrentMaterialLevel(),
    };

    // Set only the current level's ID
    switch (currentLevel.type) {
      case "course":
        materialData.courseId = currentLevel.id;
        break;
      case "skillCategory":
        materialData.skillCategoryId = currentLevel.id;
        break;
      case "expertise":
        materialData.expertiseId = currentLevel.id;
        break;
      case "module":
        materialData.moduleId = currentLevel.id;
        break;
      case "chapter":
        materialData.chapterId = currentLevel.id;
        break;
      case "lesson":
        materialData.lessonId = currentLevel.id;
        break;
    }

    if (editingMaterial) {
      updateMaterialMutation.mutate({
        id: editingMaterial.id,
        data: materialData,
      });
    } else {
      createMaterialMutation.mutate(materialData);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const getMaterialIcon = (type: MaterialType) => {
    const materialType = MATERIAL_TYPES.find((t) => t.value === type);
    return materialType?.icon || <FileText size={16} />;
  };

  const getMaterialColor = (type: MaterialType) => {
    const materialType = MATERIAL_TYPES.find((t) => t.value === type);
    return materialType?.color || "text-gray-500";
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingMaterial(null);
    form.reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--background)] rounded-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <div>
            <h2 className="text-2xl font-bold text-[var(--foreground)]">
              Material Manager
            </h2>
            <p className="text-[var(--muted-foreground)]">
              Managing materials for:{" "}
              <span className="font-medium">{currentLevel.title}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters and Actions - Hidden when adding/editing */}
        {!showAddForm && !editingMaterial && (
          <div className="p-6 border-b border-[var(--border)]">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted-foreground)]"
                  />
                  <input
                    type="text"
                    placeholder="Search materials..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                    className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>
              <select
                value={filters.materialType}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    materialType: e.target.value as MaterialType | "",
                  }))
                }
                className="px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="">All Types</option>
                {MATERIAL_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
              >
                <Plus size={16} />
                Add Material
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {showAddForm || editingMaterial ? (
            /* Add/Edit Form */
            <div className="h-full overflow-y-auto p-6">
              <div className="max-w-7xl mx-auto">
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-6">
                  {editingMaterial ? "Edit Material" : "Add New Material"}
                </h3>

                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                  {/* Left Column - Form Fields */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                          Title *
                        </label>
                        <input
                          {...form.register("title")}
                          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          placeholder="Material title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                          Level
                        </label>
                        <div className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--muted)] text-[var(--foreground)]">
                          {getCurrentLevelLabel()}
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          Material will be attached to: {currentLevel.title}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                        Description
                      </label>
                      <textarea
                        {...form.register("description")}
                        rows={4}
                        className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        placeholder="Material description"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                          Material Type *
                        </label>
                        <select
                          {...form.register("materialType")}
                          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        >
                          {MATERIAL_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                          Order
                        </label>
                        <input
                          type="number"
                          {...form.register("order", { valueAsNumber: true })}
                          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          placeholder="Display order"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-6 p-4 bg-[var(--muted)]/50 rounded-lg">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          {...form.register("isRequired")}
                          className="w-4 h-4 rounded border-[var(--border)]"
                        />
                        <span className="text-sm font-medium text-[var(--foreground)]">
                          Required Material
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          {...form.register("isDownloadable")}
                          className="w-4 h-4 rounded border-[var(--border)]"
                        />
                        <span className="text-sm font-medium text-[var(--foreground)]">
                          Downloadable
                        </span>
                      </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 pt-6 border-t border-[var(--border)]">
                      <button
                        type="submit"
                        disabled={
                          createMaterialMutation.isPending ||
                          updateMaterialMutation.isPending
                        }
                        className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50 font-medium"
                      >
                        {editingMaterial
                          ? "Update Material"
                          : "Create Material"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-6 py-2 border border-[var(--border)] text-[var(--foreground)] rounded-lg hover:bg-[var(--muted)] transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Right Column - File Upload */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-6 space-y-6">
                      <div className="p-6 border border-[var(--border)] rounded-lg bg-[var(--muted)]/30">
                        <h4 className="text-sm font-semibold text-[var(--foreground)] mb-4">
                          File Upload
                        </h4>

                        {watchedMaterialType === "LINK" ? (
                          <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                              External URL *
                            </label>
                            <input
                              {...form.register("externalUrl")}
                              type="url"
                              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                              placeholder="https://example.com"
                            />
                          </div>
                        ) : watchedMaterialType === "VIDEO" ? (
                          <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                              Video File *
                            </label>
                            <Controller
                              name="fileUrl"
                              control={form.control}
                              render={({ field: { value, onChange } }) => (
                                <UploadVideo
                                  videoUrl={value}
                                  setVideoUrl={onChange}
                                  setVideoDuration={() => {}}
                                  width="full"
                                  text="Upload video file"
                                />
                              )}
                            />
                          </div>
                        ) : watchedMaterialType === "IMAGE" ? (
                          <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                              Image File *
                            </label>
                            <Controller
                              name="fileUrl"
                              control={form.control}
                              render={({ field: { value, onChange } }) => (
                                <UploadImage
                                  imageUrl={value}
                                  setImageUrl={onChange}
                                  width="full"
                                  text="Upload image file"
                                />
                              )}
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                              File Upload *
                            </label>
                            <Controller
                              name="fileUrl"
                              control={form.control}
                              render={({ field: { value, onChange } }) => (
                                <UploadFile
                                  fileUrl={value}
                                  setFileUrl={onChange}
                                  setFileName={(name) =>
                                    form.setValue("fileName", name)
                                  }
                                  setFileType={(type) =>
                                    form.setValue("fileType", type)
                                  }
                                  setFileSize={(size) =>
                                    form.setValue("fileSize", size)
                                  }
                                  width="full"
                                  height={200}
                                  text={`Click to upload ${
                                    MATERIAL_TYPES.find(
                                      (t) => t.value === watchedMaterialType
                                    )?.label.toLowerCase() || "file"
                                  }`}
                                  accept={
                                    watchedMaterialType === "PDF"
                                      ? ".pdf"
                                      : watchedMaterialType === "DOCUMENT"
                                      ? ".doc,.docx,.txt"
                                      : watchedMaterialType === "PRESENTATION"
                                      ? ".ppt,.pptx"
                                      : watchedMaterialType === "AUDIO"
                                      ? "audio/*"
                                      : watchedMaterialType === "CODE"
                                      ? ".js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.html,.css"
                                      : "*/*"
                                  }
                                />
                              )}
                            />
                            {/* Fallback URL input */}
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Or enter file URL
                              </label>
                              <input
                                {...form.register("fileUrl")}
                                type="url"
                                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                placeholder="https://example.com/file.pdf"
                              />
                            </div>
                          </div>
                        )}

                        <div className="mt-4 p-3 bg-[var(--background)] rounded text-xs text-[var(--muted-foreground)]">
                          <p className="font-medium text-[var(--foreground)] mb-1">
                            Current Type:
                          </p>
                          <p>
                            {MATERIAL_TYPES.find(
                              (t) => t.value === watchedMaterialType
                            )?.label || "Unknown"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* Materials List */
            <div className="h-full overflow-y-auto p-6">
              {materialsQuery.isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
                </div>
              ) : materialsQuery.data?.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-[var(--muted-foreground)]">
                  <FileText size={48} className="mb-4 opacity-50" />
                  <p className="text-lg font-medium">No materials found</p>
                  <p className="text-sm">
                    Add your first material to get started
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {materialsQuery.data?.data
                    .filter(
                      (material) =>
                        !filters.search ||
                        material.title
                          .toLowerCase()
                          .includes(filters.search.toLowerCase()) ||
                        material.description
                          ?.toLowerCase()
                          .includes(filters.search.toLowerCase())
                    )
                    .map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)]/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-2 rounded-lg bg-[var(--muted)] ${getMaterialColor(
                              material.materialType
                            )}`}
                          >
                            {getMaterialIcon(material.materialType)}
                          </div>
                          <div>
                            <h4 className="font-medium text-[var(--foreground)]">
                              {material.title}
                            </h4>
                            <p className="text-sm text-[var(--muted-foreground)]">
                              {material.description || "No description"}
                            </p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-[var(--muted-foreground)]">
                                {material.fileSize
                                  ? formatFileSize(material.fileSize)
                                  : "Unknown size"}
                              </span>
                              {material.isRequired && (
                                <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                                  Required
                                </span>
                              )}
                              <span className="text-xs text-[var(--muted-foreground)] ml-auto">
                                {new Date(material.createdAt).toLocaleDateString()}
                                {new Date(material.updatedAt).getTime() > new Date(material.createdAt).getTime() && (
                                  <span className="ml-1" title={`Modified: ${new Date(material.updatedAt).toLocaleDateString()}`}>
                                    (Modified)
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {material.fileUrl && (
                            <button
                              onClick={() =>
                                window.open(material.fileUrl!, "_blank")
                              }
                              className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
                              title="View/Download"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingMaterial(material);
                              form.reset({
                                title: material.title ?? "",
                                description: material.description ?? "",
                                materialType: material.materialType,
                                fileUrl: material.fileUrl ?? "",
                                fileName: material.fileName ?? "",
                                fileType: material.fileType ?? "",
                                fileSize: material.fileSize ?? 0,
                                isRequired: material.isRequired ?? false,
                                isDownloadable: material.isDownloadable ?? true,
                                order: material.order ?? 0,
                                externalUrl: material.externalUrl ?? "",
                              });
                            }}
                            className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() =>
                              deleteMaterialMutation.mutate(material.id)
                            }
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
