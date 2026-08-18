import { useParams } from "react-router-dom";
import TopBar from "../../../lazy/TopBar";
import useRouter from "../../../../hooks/useRouter";
import {
  Pencil,
  PlusCircle,
  Trash2,
  FileText,
  Clock,
  Target,
  Eye,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ROUTES } from "../../../../lib/api";
import api from "../../../../lib/axios/axios";
import type { Response } from "../../../../types";
import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { TanstackTable } from "../../../lazy/TanstackTable";
import ConfirmDialog from "../../../lazy/ConfirmDialog";
import type { Quiz } from "../../../../types";

interface QuizQueryResponse extends Response {
  data: Quiz[];
}

export default function ViewLessonQuizzes() {
  const { lessonId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Quiz | null>(null);

  if (!lessonId) {
    return <div>Lesson ID is required</div>;
  }

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(API_ROUTES.QUIZ.DELETE(id));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["quizzes", "lesson", lessonId],
      });
      setDeleteOpen(false);
      setSelected(null);
    },
  });

  const openDelete = (row: Quiz) => {
    setSelected(row);
    setDeleteOpen(true);
  };

  const getQuizzesQuery = useQuery({
    queryKey: ["quizzes", "lesson", lessonId],
    queryFn: async () => {
      const res = await api.get<QuizQueryResponse>(
        API_ROUTES.QUIZ.GET_BY_CHAPTER_ID(lessonId!)
      );
      return res.data;
    },
  });

  const [searchInput, setSearchInput] = useState<string>("");

  const data = useMemo(
    () => getQuizzesQuery.data?.data || [],
    [getQuizzesQuery]
  );

  const columns = useMemo<ColumnDef<Quiz>[]>(
    () => [
      {
        header: "#",
        cell: ({ row }) => row.index + 1,
      },
      {
        header: "Title",
        accessorKey: "title",
        cell: ({ row }) => (
          <div className="font-medium text-[var(--foreground)] flex items-center gap-2">
            <FileText size={16} className="text-[var(--primary)]" />
            {row.original.title}
          </div>
        ),
      },
      {
        header: "Questions",
        cell: ({ row }) => (
          <div className="text-sm text-[var(--muted-foreground)]">
            {row.original.questions?.length || 0} questions
          </div>
        ),
      },
      {
        header: "Duration",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
            <Clock size={14} />
            {row.original.duration || "Unlimited"} min
          </div>
        ),
      },
      {
        header: "Passing Score",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm">
            <Target size={14} className="text-[var(--primary)]" />
            <span className="font-medium text-[var(--primary)]">
              {row.original.passingScore}%
            </span>
          </div>
        ),
      },
      {
        header: "Attempts",
        cell: ({ row }) => (
          <div className="text-sm text-[var(--muted-foreground)]">
            {row.original._count?.attempts || 0} attempts
          </div>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <button
              className="text-[var(--primary)] hover:text-[var(--primary)]/80 flex items-center gap-1 text-sm transition-colors duration-300"
              onClick={() =>
                router.push(
                  `/admin/quiz/${row.original.id}/details`,
                  "Quiz Details"
                )
              }
            >
              <Eye size={14} /> Details
            </button>
            <button
              className="text-[var(--primary)] hover:text-[var(--primary)]/80 flex items-center gap-1 text-sm transition-colors duration-300"
              onClick={() =>
                router.push(`/admin/quiz/edit/${row.original.id}`, "Edit Quiz")
              }
            >
              <Pencil size={14} /> Edit
            </button>
            <button
              className="text-[var(--destructive)] hover:text-[var(--destructive)]/80 flex items-center gap-1 text-sm transition-colors duration-300"
              onClick={() => openDelete(row.original)}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        ),
      },
    ],
    [router]
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

  return (
    <div className="bg-[var(--background)] min-h-screen transition-colors duration-300">
      <TopBar>
        <button
          className="btn"
          onClick={() =>
            router.push(`/admin/lesson/${lessonId}/quiz/create`, "Create Quiz")
          }
        >
          <PlusCircle size={14} /> Create Quiz
        </button>
      </TopBar>

      <div className="mt-8 px-8">
        <div className="flex justify-between items-baseline mb-4">
          <input
            type="text"
            placeholder="Search quizzes..."
            className="input-form"
            onChange={(e) => setSearchInput(e.target.value)}
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
            isLoading={getQuizzesQuery.isLoading}
            isError={getQuizzesQuery.isError}
            isEmpty={
              !getQuizzesQuery.isLoading &&
              getQuizzesQuery.data?.data.length === 0
            }
          />
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Quiz"
        description={`Are you sure you want to delete "${selected?.title}"? This cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => selected && deleteMutation.mutate(selected.id)}
        onClose={() => setDeleteOpen(false)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
