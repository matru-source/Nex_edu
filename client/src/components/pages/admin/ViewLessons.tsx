import { useParams, useLocation } from "react-router-dom";
import TopBar from "../../lazy/TopBar";
import useRouter from "../../../hooks/useRouter";
import {
  Pencil,
  Play,
  PlusCircle,
  Trash2,
  X,
  ArrowUp,
  ArrowDown,
  FileStack,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ROUTES } from "../../../lib/api";
import api from "../../../lib/axios/axios";
import type { Response, Video } from "../../../types";
import { useMemo, useState } from "react";
import { userStore } from "../../../state/global";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { TanstackTable } from "../../lazy/TanstackTable";
import Modal from "../../lazy/Modal";
import ConfirmDialog from "../../lazy/ConfirmDialog";
import UploadVideo from "../../lazy/UploadVedio";
import UploadImage from "../../lazy/UploadImage";
import { formatDuration } from "../../../utils/formatDuration";
import { useToast } from "../../../contexts/ToastContext";
import MaterialManager from "../../ui/Courses/Material";

interface LessonQueryResponse extends Response {
  data: {
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
    title: string;
    content: string;
    chapterId: string;
    order: number;
    status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED' | 'REJECTED';
    Video?: Video[];
    tumbnailUrl?: string;
  }[];
}

type Lesson = LessonQueryResponse["data"][0];

export default function ViewLessons() {
  const { chapterId } = useParams();
  const router = useRouter();
  const location = useLocation();
  const user = userStore((state) => state.user);
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Lesson | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    content: string;
    video?: {
      url: string;
      duration: number;
    };
    tumbnailUrl: string;
    status: 'DRAFT' | 'PUBLISHED';
  }>({
    title: "",
    content: "",
    tumbnailUrl: "",
    status: "PUBLISHED",
  });
  const [materialManagerOpen, setMaterialManagerOpen] = useState(false);
  const [selectedForMaterials, setSelectedForMaterials] = useState<Lesson | null>(null);

  // Fetch parent hierarchy for MaterialManager
  const chapterQuery = useQuery({
    queryKey: ["chapter-by-id", chapterId],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.COURSE.GET_BY_ID.CHAPTER(chapterId!));
      return res.data.data;
    },
    enabled: !!chapterId,
  });

  const moduleQuery = useQuery({
    queryKey: ["module-by-id", chapterQuery.data?.moduleId],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.COURSE.GET_BY_ID.MODULE(chapterQuery.data!.moduleId));
      return res.data.data;
    },
    enabled: !!chapterQuery.data?.moduleId,
  });

  const expertiseQuery = useQuery({
    queryKey: ["expertise-by-id", moduleQuery.data?.expertiseId],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.COURSE.GET_BY_ID.EXPERTISE(moduleQuery.data!.expertiseId));
      return res.data.data;
    },
    enabled: !!moduleQuery.data?.expertiseId,
  });

  const skillCategoryQuery = useQuery({
    queryKey: ["skill-category", expertiseQuery.data?.skillCategoryId],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.COURSE.GET_BY_ID.SKILL_CATEGORY(expertiseQuery.data!.skillCategoryId));
      return res.data.data;
    },
    enabled: !!expertiseQuery.data?.skillCategoryId,
  });

  // Detect if we're on contributor route
  const isContributorRoute = location.pathname.includes("/contributor/");
  const isContributor = user?.role === "CONTRIBUTOR";

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: string; data: any }) => {
      const res = await api.put(
        API_ROUTES.COURSE.UPDATE.LESSON(payload.id),
        payload.data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", chapterId] });
      setEditOpen(false);
      setSelected(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(API_ROUTES.COURSE.DELETE.LESSON(id));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", chapterId] });
      setDeleteOpen(false);
      setSelected(null);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (payload: { id: string; direction: "up" | "down" }) => {
      setReorderingId(payload.id);
      const res = await api.put(
        API_ROUTES.COURSE.UPDATE.REORDER_LESSON(payload.id),
        { direction: payload.direction }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", chapterId] });
      setReorderingId(null);
      success("Lesson reordered successfully");
    },
    onError: (err: any) => {
      setReorderingId(null);
      showError(err.response?.data?.message || "Failed to reorder lesson");
    },
  });

  const openEdit = (row: Lesson) => {
    setSelected(row);
    const video = row.Video?.[0];
    setEditForm({
      title: row.title,
      content: row.content,
      video: video
        ? {
            url: video.url,
            duration: video.duration,
          }
        : undefined,
      tumbnailUrl: row.tumbnailUrl ?? "",
      status: row.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
    });
    setEditOpen(true);
  };

  const openDelete = (row: Lesson) => {
    setSelected(row);
    setDeleteOpen(true);
  };

  if (!chapterId) {
    return <div>Chapter ID is required</div>;
  }

  const getLessonsQuery = useQuery({
    queryKey: ["lessons", chapterId],
    queryFn: async () => {
      const res = await api.get<LessonQueryResponse>(
        API_ROUTES.LESSON.GET_LESSONS_BY_CHAPTER_ID(chapterId!)
      );
      return res.data;
    },
  });

  const [searchInput, setSearchInput] = useState<string>("");

  const data = useMemo(
    () => getLessonsQuery.data?.data || [],
    [getLessonsQuery]
  );

  const columns = useMemo<ColumnDef<Lesson>[]>(
    () => [
      {
        header: "#",
        cell: ({ row }) => (
          <div className="font-medium text-[var(--foreground)]">
            {row.index + 1}
          </div>
        ),
      },
      {
        header: "Title",
        accessorKey: "title",
        cell: ({ row }) => (
          <div className="font-medium text-[var(--foreground)]">
            {row.original.title}
          </div>
        ),
      },
      {
        header: "Content",
        accessorKey: "content",
        cell: ({ row }) => (
          <div className="max-w-xs truncate text-[var(--muted-foreground)]">
            {row.original.content}
          </div>
        ),
      },
      {
        header: "Video",
        cell: ({ row }) => {
          const video = row.original.Video?.[0];
          return video ? (
            <div className="flex items-center gap-2 text-sm">
              <Play size={14} className="text-green-500" />
              <span className="text-[var(--muted-foreground)]">
                {formatDuration(video.duration)}
              </span>
            </div>
          ) : (
            <span className="text-xs text-[var(--muted-foreground)]">
              No video
            </span>
          );
        },
      },
      {
        header: "Created At",
        accessorKey: "createdAt",
        cell: ({ row }) => (
          <div className="text-sm text-[var(--muted-foreground)]">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </div>
        ),
      },
      {
        header: "Updated At",
        accessorKey: "updatedAt",
        cell: ({ row }) => (
          <div className="text-sm text-[var(--muted-foreground)]">
            {new Date(row.original.updatedAt).toLocaleDateString()}
          </div>
        ),
      },
      {
        header: "Actions",
        cell: ({ row, table }) => {
          const lessons = table.getRowModel().rows.map((r) => r.original);
          const currentIndex = lessons.findIndex(
            (l) => l.id === row.original.id
          );
          const canMoveUp = currentIndex > 0;
          const canMoveDown = currentIndex < lessons.length - 1;
          const isReordering = reorderingId === row.original.id;

          return (
            <div className="flex items-center gap-2">
              {/* Reorder Buttons */}
              <button
                className={`p-1.5 rounded-lg transition-all duration-300 ${
                  canMoveUp && !isReordering
                    ? "text-[var(--primary)] hover:bg-[var(--primary)]/10 hover:scale-110 active:scale-95"
                    : "text-[var(--muted-foreground)] opacity-50 cursor-not-allowed"
                }`}
                onClick={() => {
                  if (canMoveUp && !isReordering) {
                    reorderMutation.mutate({
                      id: row.original.id,
                      direction: "up",
                    });
                  }
                }}
                disabled={
                  !canMoveUp || isReordering || reorderMutation.isPending
                }
                title="Move Up"
              >
                <ArrowUp
                  size={16}
                  className={isReordering ? "animate-pulse" : ""}
                />
              </button>
              <button
                className={`p-1.5 rounded-lg transition-all duration-300 ${
                  canMoveDown && !isReordering
                    ? "text-[var(--primary)] hover:bg-[var(--primary)]/10 hover:scale-110 active:scale-95"
                    : "text-[var(--muted-foreground)] opacity-50 cursor-not-allowed"
                }`}
                onClick={() => {
                  if (canMoveDown && !isReordering) {
                    reorderMutation.mutate({
                      id: row.original.id,
                      direction: "down",
                    });
                  }
                }}
                disabled={
                  !canMoveDown || isReordering || reorderMutation.isPending
                }
                title="Move Down"
              >
                <ArrowDown
                  size={16}
                  className={isReordering ? "animate-pulse" : ""}
                />
              </button>

              {/* Edit and Delete buttons */}
              <button
                className="p-1.5 rounded-lg text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all duration-300"
                onClick={() => openEdit(row.original)}
                title="Edit"
                disabled={isReordering}
              >
                <Pencil size={16} />
              </button>
              <button
                className="p-1.5 rounded-lg text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-all duration-300"
                onClick={() => openDelete(row.original)}
                title="Delete"
                disabled={isReordering}
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => {
                  setSelectedForMaterials(row.original);
                  setMaterialManagerOpen(true);
                }}
                className="p-1.5 hover:bg-[var(--muted)] rounded-lg transition-colors text-[var(--primary)]"
                title="Materials"
                disabled={isReordering}
              >
                <FileStack size={14} />
              </button>
            </div>
          );
        },
      },
    ],
    [reorderMutation, reorderingId]
  );

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 30,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter: searchInput,
      pagination,
    },
    onGlobalFilterChange: setSearchInput,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
  };

  return (
    <div className="bg-[var(--background)] min-h-screen transition-colors duration-300">
      <TopBar>
        <button
          className="btn"
          onClick={() => {
            const createPath =
              isContributorRoute || isContributor
                ? `/contributor/lessons/create/${chapterId}`
                : `/admin/lessons/create/${chapterId}`;
            router.push(createPath, "Create Lessons");
          }}
        >
          <PlusCircle size={14} /> Create
        </button>
      </TopBar>

      <div className="mt-8 px-8 pb-8">
        <div className="flex justify-between items-baseline mb-4">
          <input
            type="text"
            placeholder="Search lessons..."
            className="w-full px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted-foreground)] placeholder:font-normal placeholder:opacity-80 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all duration-300"
            onChange={handleSearchChange}
            value={searchInput}
          />
        </div>

        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm">
          <TanstackTable
            table={table}
            paginatedRows={table.getPaginationRowModel().rows}
            pageIndex={table.getState().pagination.pageIndex}
            pageSize={table.getState().pagination.pageSize}
            onPageChange={(pageIndex) =>
              setPagination((prev) => ({ ...prev, pageIndex }))
            }
            onPageSizeChange={(pageSize) =>
              setPagination((prev) => ({ ...prev, pageSize }))
            }
            height="calc(100vh - 330px)"
            isLoading={getLessonsQuery.isLoading}
            isError={getLessonsQuery.isError}
            isEmpty={
              !getLessonsQuery.isLoading &&
              getLessonsQuery.data?.data.length === 0
            }
          />
        </div>
      </div>
      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
        <div className="w-[560px] max-h-[90vh] flex flex-col">
          <div className="p-4 border-b border-[var(--border)] flex-shrink-0">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              Edit Lesson
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              {selected?.title}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-sm p-4 flex flex-col gap-3">
            <label className="text-sm font-medium text-[var(--foreground)]">
              Title
            </label>
            <input
              className="input-form"
              value={editForm.title}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, title: e.target.value }))
              }
            />

            <label className="text-sm font-medium text-[var(--foreground)]">
              Content
            </label>
            <textarea
              className="input-form min-h-[112px] resize-y"
              value={editForm.content}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, content: e.target.value }))
              }
              style={{ height: "auto" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.max(112, target.scrollHeight)}px`;
              }}
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Video
                </label>
                {editForm.video?.url && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditForm((prev) => ({
                        ...prev,
                        video: undefined,
                      }));
                    }}
                    className="text-xs text-[var(--destructive)] hover:text-[var(--destructive)]/80 flex items-center gap-1 px-2 py-1 rounded hover:bg-[var(--destructive)]/10 transition-colors"
                    title="Remove Video"
                  >
                    <X size={14} />
                    Remove Video
                  </button>
                )}
              </div>

              {editForm.video?.url ? (
                <div className="relative">
                  <video
                    src={editForm.video.url}
                    controls
                    className="w-full rounded-lg border border-[var(--border)]"
                  />
                  <div className="mt-2 text-xs text-[var(--muted-foreground)]">
                    Duration: {formatDuration(editForm.video.duration || 0)}
                  </div>
                </div>
              ) : (
                <UploadVideo
                  videoUrl={undefined}
                  setVideoUrl={(url: string) => {
                    setEditForm((prev) => ({
                      ...prev,
                      video: {
                        url: url,
                        duration: prev.video?.duration || 0,
                      },
                    }));
                  }}
                  setVideoDuration={(durationSec: number) => {
                    setEditForm((prev) => ({
                      ...prev,
                      video: {
                        url: prev.video?.url || "",
                        duration: durationSec,
                      },
                    }));
                  }}
                  width="full"
                  height="full"
                />
              )}
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="text-sm font-semibold text-[var(--foreground)] mb-2 block">
                Lesson Thumbnail
              </label>
              <div className="w-full">
                <UploadImage
                  imageUrl={editForm.tumbnailUrl || null}
                  setImageUrl={(url: string) =>
                    setEditForm((prev) => ({ ...prev, tumbnailUrl: url }))
                  }
                  width="full"
                  height={200}
                  text="Click to upload lesson image"
                />
              </div>
              {editForm.tumbnailUrl && (
                <button
                  type="button"
                  onClick={() =>
                    setEditForm((prev) => ({ ...prev, tumbnailUrl: "" }))
                  }
                  className="mt-2 text-sm text-[var(--destructive)] hover:underline"
                >
                  Remove image
                </button>
              )}
            </div>
            {/* Publish Toggle */}
            <div
              className="flex items-center justify-between p-3 rounded-lg border transition-all duration-200"
              style={{
                borderColor: editForm.status === 'PUBLISHED' ? "var(--primary)" : "var(--border)",
                backgroundColor: editForm.status === 'PUBLISHED'
                  ? "color-mix(in srgb, var(--primary) 10%, transparent)"
                  : "var(--muted)",
              }}
            >
              <span
                className="text-sm font-semibold"
                style={{ color: editForm.status === 'PUBLISHED' ? "var(--primary)" : "var(--muted-foreground)" }}
              >
                {editForm.status === 'PUBLISHED' ? "Publish" : "Unpublish"}
              </span>
              <button
                type="button"
                onClick={() =>
                  setEditForm((prev) => ({
                    ...prev,
                    status: prev.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED',
                  }))
                }
                className="w-10 h-6 rounded-full relative transition-colors duration-200 flex-shrink-0"
                style={{ backgroundColor: editForm.status === 'PUBLISHED' ? "var(--primary)" : "var(--muted-foreground)" }}
              >
                <div
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
                  style={{ transform: editForm.status === 'PUBLISHED' ? "translateX(20px)" : "translateX(4px)" }}
                />
              </button>
            </div>
          </div>

          <div className="p-4 border-t border-[var(--border)] flex justify-end gap-2 flex-shrink-0">
            <button
              className="px-4 py-2 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)]/30 transition-all duration-300 font-medium"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </button>
            <button
              className="btn disabled:opacity-70"
              onClick={() => {
                if (selected) {
                  const updateData: any = {
                    title: editForm.title,
                    content: editForm.content,
                    tumbnailUrl: editForm.tumbnailUrl,
                    status: editForm.status,
                  };

                  if (editForm.video === null) {
                    updateData.video = null;
                  } else if (editForm.video?.url) {
                    updateData.video = editForm.video;
                  }

                  updateMutation.mutate({ id: selected.id, data: updateData });
                }
              }}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Lesson"
        description={`Are you sure you want to delete "${selected?.title}"? This cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => selected && deleteMutation.mutate(selected.id)}
        onClose={() => setDeleteOpen(false)}
        loading={deleteMutation.isPending}
      />

      {/* Material Manager Modal */}
      {materialManagerOpen && selectedForMaterials && (
        <MaterialManager
          isOpen={materialManagerOpen}
          onClose={() => {
            setMaterialManagerOpen(false);
            setSelectedForMaterials(null);
          }}
          currentLevel={{
            type: "lesson",
            id: selectedForMaterials.id,
            title: selectedForMaterials.title,
            parentIds: {
              courseId: skillCategoryQuery.data?.courseId,
              skillCategoryId: expertiseQuery.data?.skillCategoryId,
              expertiseId: moduleQuery.data?.expertiseId,
              moduleId: chapterQuery.data?.moduleId,
              chapterId: chapterId,
            },
          }}
        />
      )}
    </div>
  );
}
