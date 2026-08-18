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

export default function ViewQuizzes() {
  const { lessonId, chapterId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Quiz | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(API_ROUTES.QUIZ.DELETE(id));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: lessonId
          ? ["quizzes", "lesson", lessonId]
          : ["quizzes", "chapter", chapterId],
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
    queryKey: lessonId
      ? ["quizzes", "lesson", lessonId]
      : ["quizzes", "chapter", chapterId],
    queryFn: async () => {
      const endpoint = lessonId
        ? API_ROUTES.QUIZ.GET_BY_COURSE_ID(lessonId!)
        : API_ROUTES.QUIZ.GET_BY_CHAPTER_ID(chapterId!);
      const res = await api.get<QuizQueryResponse>(endpoint);
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
            <FileText size={16} className="text-cyan-600" />
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
            <Target size={14} className="text-green-600" />
            <span className="font-medium text-green-700">
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
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
              onClick={() =>
                router.push(`/admin/quiz/edit/${row.original.id}`, "Edit Quiz")
              }
            >
              <Pencil size={14} /> Edit
            </button>
            <button
              className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
              onClick={() => openDelete(row.original)}
            >
              <Trash2 size={14} /> Delete
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

  return (
    <div className="bg-[var(--background)] min-h-screen">
      <TopBar>
        <button
          className="btn"
          onClick={() => {
            const path = lessonId
              ? `/admin/quiz/create/${lessonId}`
              : `/admin/quiz/create/chapter/${chapterId}`;
            router.push(path, "Create Quiz");
          }}
        >
          <PlusCircle size={14} /> Create Quiz
        </button>
      </TopBar>

      <div className="mt-8 px-8">
        <div className="bg-[var(--card)] rounded-xl shadow-sm border border-[var(--border)] p-6 mb-6">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
            Quizzes
          </h2>
          <p className="text-[var(--muted-foreground)]">
            {lessonId
              ? "Manage quizzes for this lesson"
              : "Manage quizzes for this chapter"}
          </p>
        </div>

        <div className="flex justify-between items-baseline mb-4">
          <input
            type="text"
            placeholder="Search quizzes..."
            className="border border-gray-300 rounded-lg px-4 py-2"
            onChange={(e) => setSearchInput(e.target.value)}
            value={searchInput}
          />
        </div>

        <div className="mt-4">
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
