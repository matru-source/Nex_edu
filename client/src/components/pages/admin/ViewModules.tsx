import { ArrowRight, PlusCircle, Pencil, Trash2, X, Info, ArrowUp, ArrowDown, FileStack } from "lucide-react";
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
import { useToast } from "../../../contexts/ToastContext";
import UploadImage from "../../lazy/UploadImage";
import ModuleDetailsPanel from "../../ui/Courses/details/ModuleDetailsPanel";
import MaterialManager from "../../ui/Courses/Material";

interface ModuleQueryResponse extends Response {
  data: {
    id: string;
    description: string;
    isActive: boolean;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
    title: string;
    expertiseId: string;
    tumbnailUrl?: string;
  }[];
}

type Module = ModuleQueryResponse["data"][0];

export default function ViewModules() {
  const { expertiseId } = useParams();
  const router = useRouter();
  const location = useLocation();
  const user = userStore((state) => state.user);
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);
  const [selectedModuleForDetails, setSelectedModuleForDetails] =
    useState<Module | null>(null);

  const [selected, setSelected] = useState<Module | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    tumbnailUrl: string;
    isPublished: boolean;
  }>({ title: "", description: "", tumbnailUrl: "", isPublished: true });
  const [materialManagerOpen, setMaterialManagerOpen] = useState(false);
  const [selectedForMaterials, setSelectedForMaterials] = useState<Module | null>(null);

  // Detect if we're on contributor route
  const isContributorRoute = location.pathname.includes("/contributor/");
  const isContributor = user?.role === "CONTRIBUTOR";

  const { success, error: showError } = useToast();
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const reorderMutation = useMutation({
    mutationFn: async (payload: { id: string; direction: "up" | "down" }) => {
      setReorderingId(payload.id);
      const res = await api.put(
        API_ROUTES.COURSE.UPDATE.REORDER_MODULE(payload.id),
        { direction: payload.direction }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules", expertiseId] });
      setReorderingId(null);
      success("Reordered successfully");
    },
    onError: (err: any) => {
      setReorderingId(null);
      showError(err.response?.data?.message || "Failed to reorder");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: string; data: any }) => {
      const res = await api.put(
        API_ROUTES.COURSE.UPDATE.MODULE(payload.id),
        payload.data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules", expertiseId] });
      setEditOpen(false);
      setSelected(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(API_ROUTES.COURSE.DELETE.MODULE(id));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules", expertiseId] });
      setDeleteOpen(false);
      setSelected(null);
    },
  });

  const expertiseQuery = useQuery({
    queryKey: ["expertise-by-id", expertiseId],
    queryFn: async () => {
      const res = await api.get(
        API_ROUTES.COURSE.GET_BY_ID.EXPERTISE(expertiseId!)
      );
      return res.data.data;
    },
    enabled: !!expertiseId,
  });

  const skillCategoryQuery = useQuery({
    queryKey: ["skill-category", expertiseQuery.data?.skillCategoryId],
    queryFn: async () => {
      const res = await api.get(
        API_ROUTES.COURSE.GET_BY_ID.SKILL_CATEGORY(
          expertiseQuery.data!.skillCategoryId
        )
      );
      return res.data.data;
    },
    enabled: !!expertiseQuery.data?.skillCategoryId,
  });

  const courseId = skillCategoryQuery.data?.courseId;


  const openEdit = (row: Module) => {
    setSelected(row);
    setEditForm({
      title: row.title,
      description: row.description,
      tumbnailUrl: row.tumbnailUrl ?? "",
      isPublished: row.isPublished ?? true,
    });
    setEditOpen(true);
  };

  const openDelete = (row: Module) => {
    setSelected(row);
    setDeleteOpen(true);
  };

  if (!expertiseId) {
    return <div>Domain id is required</div>;
  }

  const getModuleQuery = useQuery({
    queryKey: ["modules", expertiseId],
    queryFn: async () => {
      const res = await api.get<ModuleQueryResponse>(
        API_ROUTES.MODULE.GET_MODULES_BY_EXPERTISE_ID(expertiseId!)
      );
      return res.data;
    },
  });

  const [searchInput, setSearchInput] = useState<string>("");

  const data = useMemo(() => getModuleQuery.data?.data || [], [getModuleQuery]);

  const columns = useMemo<ColumnDef<Module>[]>(
    () => [
      {
        header: "#",
        cell: ({ row }) => row.index + 1,
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
        header: "Description",
        accessorKey: "description",
        cell: ({ row }) => (
          <div className="max-w-xs truncate text-[var(--muted-foreground)]">
            {row.original.description}
          </div>
        ),
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
        size: 220,
        cell: ({ row, table }) => {
          const items = table.getRowModel().rows.map((r) => r.original);
          const currentIndex = items.findIndex((item) => item.id === row.original.id);
          const canMoveUp = currentIndex > 0;
          const canMoveDown = currentIndex < items.length - 1;
          const isReordering = reorderingId === row.original.id;

          return (
          <div className="flex items-center gap-1.5 flex-wrap">
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
                disabled={!canMoveUp || isReordering || reorderMutation.isPending}
                title="Move Up"
              >
                <ArrowUp size={16} className={isReordering ? "animate-pulse" : ""} />
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
                disabled={!canMoveDown || isReordering || reorderMutation.isPending}
                title="Move Down"
              >
                <ArrowDown size={16} className={isReordering ? "animate-pulse" : ""} />
              </button>
            <button
              className="p-1.5 rounded-lg text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all duration-300"
              onClick={() => openEdit(row.original)}
              title="Edit"
              disabled={isReordering}
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => {
                setSelectedModuleForDetails(row.original);
                setDetailsPanelOpen(true);
              }}
              className="p-1.5 hover:bg-[var(--muted)] rounded-lg transition-colors text-[var(--primary)]"
              title="View Details"
              disabled={isReordering}
            >
              <Info size={14} />
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
            <button
              className="p-1.5 rounded-lg text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-all duration-300"
              onClick={() => openDelete(row.original)}
              title="Delete"
              disabled={isReordering}
            >
              <Trash2 size={16} />
            </button>
          </div>
          );
        },
      },
      {
        header: "Navigate",
        size: 80,
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <button
              onClick={() => {
                const chapterPath =
                  isContributorRoute || isContributor
                    ? `/contributor/chapters/${row.original.id}`
                    : `/admin/chapters/${row.original.id}`;
                router.push(chapterPath, "Chapters");
              }}
              className="p-2 rounded-lg text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all duration-300 hover:scale-110 active:scale-95"
              title="View Chapters"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        ),
      },
    ],
    [isContributorRoute, isContributor]
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
                ? `/contributor/module/create/${expertiseId}`
                : `/admin/module/create/${expertiseId}`;
            router.push(createPath, "Create Expertise");
          }}
        >
          <PlusCircle size={14} /> Create
        </button>
      </TopBar>

      <div className="mt-8 px-8 pb-8">
        <div className="flex justify-between items-baseline mb-4">
          <input
            type="text"
            placeholder="Search Expertise..."
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
            isLoading={getModuleQuery.isLoading}
            isError={getModuleQuery.isError}
            isEmpty={
              !getModuleQuery.isLoading &&
              getModuleQuery.data?.data.length === 0
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
                  Edit Expertise
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
                Description
              </label>
              <textarea
                className="input-form h-28 resize-none"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
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
                borderColor: editForm.isPublished ? "var(--primary)" : "var(--border)",
                backgroundColor: editForm.isPublished
                  ? "color-mix(in srgb, var(--primary) 10%, transparent)"
                  : "var(--muted)",
              }}
            >
              <span
                className="text-sm font-semibold"
                style={{ color: editForm.isPublished ? "var(--primary)" : "var(--muted-foreground)" }}
              >
                {editForm.isPublished ? "Publish" : "Unpublish"}
              </span>
              <button
                type="button"
                onClick={() =>
                  setEditForm((prev) => ({
                    ...prev,
                    isPublished: !prev.isPublished,
                  }))
                }
                className="w-10 h-6 rounded-full relative transition-colors duration-200 flex-shrink-0"
                style={{ backgroundColor: editForm.isPublished ? "var(--primary)" : "var(--muted-foreground)" }}
              >
                <div
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
                  style={{ transform: editForm.isPublished ? "translateX(20px)" : "translateX(4px)" }}
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
                updateMutation.mutate({ 
                  id: selected.id, 
                  data: {
                    title: editForm.title,
                    description: editForm.description,
                    tumbnailUrl: editForm.tumbnailUrl || undefined,
                    isPublished: editForm.isPublished,
                  }
                })
              }
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Expertise"
        description={`Are you sure you want to delete "${selected?.title}"? This cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => selected && deleteMutation.mutate(selected.id)}
        onClose={() => setDeleteOpen(false)}
        loading={deleteMutation.isPending}
      />
      {detailsPanelOpen && selectedModuleForDetails && (
        <ModuleDetailsPanel
          isOpen={detailsPanelOpen}
          onClose={() => {
            setDetailsPanelOpen(false);
            setSelectedModuleForDetails(null);
          }}
          moduleId={selectedModuleForDetails.id}
          courseId={courseId}
        />
      )}

      {/* Material Manager Modal */}
      {materialManagerOpen && selectedForMaterials && (
        <MaterialManager
          isOpen={materialManagerOpen}
          onClose={() => {
            setMaterialManagerOpen(false);
            setSelectedForMaterials(null);
          }}
          currentLevel={{
            type: "module",
            id: selectedForMaterials.id,
            title: selectedForMaterials.title,
            parentIds: {
              courseId: courseId,
              skillCategoryId: expertiseQuery.data?.skillCategoryId,
              expertiseId: expertiseId,
            },
          }}
        />
      )}
    </div>
  );
}
