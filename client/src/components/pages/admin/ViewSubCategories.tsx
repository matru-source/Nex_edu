import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../../lazy/TopBar";
import { Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import type { Response } from "../../../types";
import { useMemo, useState } from "react";
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
import useInitNavStackOnce from "../../../hooks/useInitNavstack";

interface SubCategoryQueryResponse extends Response {
  data: {
    id: string;
    name: string;
    description: string;
    categoryId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
  }[];
}

type SubCategory = SubCategoryQueryResponse["data"][0];

export default function ViewSubCategories() {
  const { categoryId } = useParams();
  useInitNavStackOnce([
    { title: "Applications", path: `/admin/subcategories/${categoryId}` },
  ]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<SubCategory | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
  }>({ name: "", description: "" });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: string; data: any }) => {
      const res = await api.put(
        API_ROUTES.COURSE.UPDATE.SUBCATEGORY(payload.id),
        payload.data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subcategories", categoryId],
      });
      setEditOpen(false);
      setSelected(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(API_ROUTES.COURSE.DELETE.SUBCATEGORY(id));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subcategories", categoryId],
      });
      setDeleteOpen(false);
      setSelected(null);
    },
  });

  const openEdit = (row: SubCategory) => {
    setSelected(row);
    setEditForm({ name: row.name, description: row.description });
    setEditOpen(true);
  };

  const openDelete = (row: SubCategory) => {
    setSelected(row);
    setDeleteOpen(true);
  };

  if (!categoryId) {
    return <div>Category ID is required</div>;
  }

  const subCategoriesQuery = useQuery({
    queryKey: ["subcategories", categoryId],
    queryFn: async () => {
      const res = await api.get<SubCategoryQueryResponse>(
        API_ROUTES.COURSE.GET_SUBCATEGORIES_BY_CATEGORY_ID(categoryId!)
      );
      return res.data;
    },
  });

  const [searchInput, setSearchInput] = useState<string>("");

  const data = useMemo(
    () => subCategoriesQuery.data?.data || [],
    [subCategoriesQuery]
  );

  const columns = useMemo<ColumnDef<SubCategory>[]>(
    () => [
      {
        header: "#",
        cell: ({ row }) => row.index + 1,
      },
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) => (
          <div className="font-medium text-[var(--foreground)]">
            {row.original.name}
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
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <button
              className="p-1.5 rounded-lg text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all duration-300"
              onClick={() => openEdit(row.original)}
              title="Edit"
            >
              <Pencil size={16} />
            </button>
            <button
              className="p-1.5 rounded-lg text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-all duration-300"
              onClick={() => openDelete(row.original)}
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    []
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
          className="btn flex items-center gap-2"
          onClick={() => navigate("/admin/subcategories/create")}
        >
          <span className="font-medium">Create Application</span>
        </button>
      </TopBar>

      <div className="mt-8 px-8 pb-8">
        <div className="flex justify-between items-baseline mb-4">
          <input
            type="text"
            placeholder="Search Applications..."
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
            isLoading={subCategoriesQuery.isLoading}
            isError={subCategoriesQuery.isError}
            isEmpty={
              !subCategoriesQuery.isLoading &&
              subCategoriesQuery.data?.data.length === 0
            }
          />
        </div>
        <Modal open={editOpen}>
          <div className="w-[520px]">
            <div className="p-4 border-b border-[var(--border)]">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                Edit Application
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                {selected?.name}
              </p>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <label className="text-sm font-medium text-[var(--foreground)]">
                Name
              </label>
              <input
                className="input-form"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <label className="text-sm font-medium text-[var(--foreground)]">
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
            <div className="p-4 border-t border-[var(--border)] flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)]/30 transition-all duration-300 font-medium"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn disabled:opacity-70"
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
          title="Delete Application"
          description={`Are you sure you want to delete "${selected?.name}"? This will also delete all associated courses. This action cannot be undone.`}
          confirmText="Delete"
          onConfirm={() => selected && deleteMutation.mutate(selected.id)}
          onClose={() => setDeleteOpen(false)}
          loading={deleteMutation.isPending}
        />
      </div>
    </div>
  );
}
