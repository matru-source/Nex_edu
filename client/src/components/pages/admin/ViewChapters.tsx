import {
  ArrowRight,
  PlusCircle,
  Pencil,
  Trash2,
  FileText,
  ArrowUp,
  ArrowDown,
  X,
  FileStack,
} from "lucide-react";
import TopBar from "../../lazy/TopBar";
import { useParams, useLocation } from "react-router-dom";
import useRouter from "../../../hooks/useRouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import type { Response } from "../../../types";
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
import { formatDuration } from "../../../utils/formatDuration";
import { useToast } from "../../../contexts/ToastContext";
import UploadImage from "../../lazy/UploadImage";
import MaterialManager from "../../ui/Courses/Material";

interface ChapterQueryResponse extends Response {
  data: {
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
    title: string;
    content: string;
    price: number;
    moduleId: string;
    order: number;
    status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED' | 'REJECTED';
    tumbnailUrl?: string;
    Lessons?: {
      Video?: { duration: number }[];
    }[];
  }[];
}

type Chapter = ChapterQueryResponse["data"][0];

export default function ViewChapters() {
  const { moduleId } = useParams();
  const router = useRouter();
  const location = useLocation();
  const user = userStore((state) => state.user);
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Chapter | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    content: string;
    price: number;
    tumbnailUrl: string;
    status: 'DRAFT' | 'PUBLISHED';
  }>({ title: "", content: "", price: 0, tumbnailUrl: "", status: "PUBLISHED" });
  const [materialManagerOpen, setMaterialManagerOpen] = useState(false);
  const [selectedForMaterials, setSelectedForMaterials] = useState<Chapter | null>(null);

  // Fetch parent hierarchy for MaterialManager
  const moduleQuery = useQuery({
    queryKey: ["module-by-id", moduleId],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.COURSE.GET_BY_ID.MODULE(moduleId!));
      return res.data.data;
    },
    enabled: !!moduleId,
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
        API_ROUTES.COURSE.UPDATE.CHAPTER(payload.id),
        payload.data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters", moduleId] });
      setEditOpen(false);
      setSelected(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(API_ROUTES.COURSE.DELETE.CHAPTER(id));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters", moduleId] });
      setDeleteOpen(false);
      setSelected(null);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (payload: { id: string; direction: "up" | "down" }) => {
      setReorderingId(payload.id);
      const res = await api.put(
        API_ROUTES.COURSE.UPDATE.REORDER_CHAPTER(payload.id),
        { direction: payload.direction }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters", moduleId] });
      setReorderingId(null);
      success("Chapter reordered successfully");
    },
    onError: (err: any) => {
      setReorderingId(null);
      showError(err.response?.data?.message || "Failed to reorder chapter");
    },
  });

  const openEdit = (row: Chapter) => {
    setSelected(row);
    setEditForm({
      title: row.title,
      content: row.content,
      price: row.price ?? 0,
      tumbnailUrl: row.tumbnailUrl ?? "",
      status: row.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
    });
    setEditOpen(true);
  };

  const openDelete = (row: Chapter) => {
    setSelected(row);
    setDeleteOpen(true);
  };

  if (!moduleId) {
    return <div>Module ID is required</div>;
  }

  const getChaptersQuery = useQuery({
    queryKey: ["chapters", moduleId],
    queryFn: async () => {
      const res = await api.get<ChapterQueryResponse>(
        API_ROUTES.CHAPTER.GET_CHAPTERS_BY_MODULE_ID(moduleId!)
      );
      return res.data;
    },
  });

  const [searchInput, setSearchInput] = useState<string>("");

  const data = useMemo(
    () => getChaptersQuery.data?.data || [],
    [getChaptersQuery]
  );

  const columns = useMemo<ColumnDef<Chapter>[]>(
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
        header: "Price",
        accessorKey: "price",
        cell: ({ row }) => (
          <div className="text-sm text-[var(--muted-foreground)]">
            ${row.original.price}
          </div>
        ),
      },
      {
        header: "Duration",
        cell: ({ row }) => {
          const lessons = row.original.Lessons || [];
          const totalDuration = lessons.reduce((total, lesson) => {
            const video = lesson.Video?.[0];
            return total + (video?.duration || 0);
          }, 0);

          return (
            <div className="text-sm text-[var(--muted-foreground)]">
              {totalDuration > 0 ? formatDuration(totalDuration) : "N/A"}
            </div>
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
        header: "Quiz",
        size: 80,
        cell: ({ row }) => {
          const quizPath =
            isContributorRoute || isContributor
              ? `/contributor/chapter/${row.original.id}/quizzes`
              : `/admin/chapter/${row.original.id}/quizzes`;

          return (
            <button
              className="p-1.5 rounded-lg text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all duration-300"
              onClick={() => router.push(quizPath, "Chapter Quizzes")}
              title="Manage Quizzes"
            >
              <FileText size={16} />
            </button>
          );
        },
      },
      {
        header: "Actions",
        size: 200,
        cell: ({ row, table }) => {
          const chapters = table.getRowModel().rows.map((r) => r.original);
          const currentIndex = chapters.findIndex(
            (c) => c.id === row.original.id
          );
          const canMoveUp = currentIndex > 0;
          const canMoveDown = currentIndex < chapters.length - 1;
          const isReordering = reorderingId === row.original.id;

          return (
            <div className="flex items-center gap-1.5 flex-wrap">
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
      {
        header: "Navigate",
        size: 80,
        cell: ({ row }) => {
          const lessonsPath =
            isContributorRoute || isContributor
              ? `/contributor/lessons/${row.original.id}`
              : `/admin/lessons/${row.original.id}`;

          return (
            <div className="flex items-center justify-center">
              <button
                onClick={() => router.push(lessonsPath, "Lessons")}
                className="p-2 rounded-lg text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all duration-300 hover:scale-110 active:scale-95"
                title="View Lessons"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          );
        },
      },
    ],
    [reorderMutation, reorderingId, isContributorRoute, isContributor]
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
                ? `/contributor/chapters/create/${moduleId}`
                : `/admin/chapters/create/${moduleId}`;
            router.push(createPath, "Create Chapters");
          }}
        >
          <PlusCircle size={14} /> Create
        </button>
      </TopBar>

      <div className="mt-8 px-8 pb-8">
        <div className="flex justify-between items-baseline mb-4">
          <input
            type="text"
            placeholder="Search chapters..."
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
            isLoading={getChaptersQuery.isLoading}
            isError={getChaptersQuery.isError}
            isEmpty={
              !getChaptersQuery.isLoading &&
              getChaptersQuery.data?.data.length === 0
            }
          />
        </div>
      </div>
      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
        <div className="w-[560px] max-h-[90vh] flex flex-col">
          {/* Header with close button */}
          <div className="p-6 border-b border-[var(--border)] flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  Edit Chapter
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  {selected?.title}
                </p>
              </div>
              <button
                onClick={() => setEditOpen(false)}
                className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Scrollable content area */}
          <div className="p-6 flex flex-col gap-4 overflow-y-auto flex-1">
            <div>
              <label className="text-sm font-semibold text-[var(--foreground)] mb-2 block">
                Title
              </label>
              <input
                className="input-form"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[var(--foreground)] mb-2 block">
                Content
              </label>
              <textarea
                className="input-form h-28 resize-none"
                value={editForm.content}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, content: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[var(--foreground)] mb-2 block">
                Price
              </label>
              <input
                type="number"
                className="input-form"
                value={editForm.price}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    price: Number(e.target.value),
                  }))
                }
                min={0}
              />
            </div>
            {/* Thumbnail Upload */}
            <div>
              <label className="text-sm font-semibold text-[var(--foreground)] mb-2 block">
                Thumbnail Image
              </label>
              <div className="w-full">
                <UploadImage
                  imageUrl={editForm.tumbnailUrl || null}
                  setImageUrl={(url: string) =>
                    setEditForm((prev) => ({ ...prev, tumbnailUrl: url }))
                  }
                  width="full"
                  height={200}
                  text="Click to upload thumbnail image"
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

          {/* Footer - fixed at bottom */}
          <div className="p-6 border-t border-[var(--border)] flex justify-end gap-2 flex-shrink-0">
            <button
              className="px-4 py-2 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)]/30 transition-all duration-300 font-medium"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </button>
            <button
              className="btn disabled:opacity-50"
              onClick={() =>
                selected &&
                updateMutation.mutate({ id: selected.id, data: editForm })
              }
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Chapter"
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
            type: "chapter",
            id: selectedForMaterials.id,
            title: selectedForMaterials.title,
            parentIds: {
              courseId: skillCategoryQuery.data?.courseId,
              skillCategoryId: expertiseQuery.data?.skillCategoryId,
              expertiseId: moduleQuery.data?.expertiseId,
              moduleId: moduleId,
            },
          }}
        />
      )}
    </div>
  );
}
