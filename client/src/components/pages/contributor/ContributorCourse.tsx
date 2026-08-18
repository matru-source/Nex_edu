import {
  PlusCircle,
  Trash2,
  Send,
  Eye,
  BookOpen,
  Settings,
} from "lucide-react";
import TopBar from "../../lazy/TopBar";
import useRouter from "../../../hooks/useRouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
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
import type { CourseWithCategory } from "../../../types";
import useInitNavStackOnce from "../../../hooks/useInitNavstack";
import ConfirmDialog from "../../lazy/ConfirmDialog";
import { useToast } from "../../../contexts/ToastContext";

interface CourseQuery extends Response {
  data: {
    courses: CourseWithCategory[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface CourseWithStatus extends CourseWithCategory {
  status?: string;
  flags?: string[];
}

export default function ContributorCourses() {
  useInitNavStackOnce([{ title: "My Courses", path: "/contributor/courses" }]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<CourseWithStatus | null>(null);
  const [statusFilter] = useState<string>("");

  const coursesQuery = useQuery({
    queryKey: ["contributor-courses", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      params.append("page", "1");
      params.append("limit", "100");

      const res = await api.get<CourseQuery>(
        `${API_ROUTES.COURSE.GET_CONTRIBUTOR.COURSES}?${params.toString()}`
      );
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(API_ROUTES.COURSE.DELETE.COURSE(id));
      return res.data;
    },
    onSuccess: () => {
      success("Course deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["contributor-courses"] });
      setDeleteOpen(false);
      setSelected(null);
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || "Failed to delete course");
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await api.post(API_ROUTES.WORKFLOW.SUBMIT_COURSE(courseId));
      return res.data;
    },
    onSuccess: () => {
      success("Course submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["contributor-courses"] });
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || "Failed to submit course");
    },
  });

  const handleSubmit = (course: CourseWithStatus) => {
    if (window.confirm(`Submit "${course.title}" for review?`)) {
      submitMutation.mutate(course.id);
    }
  };

  const handleDelete = (course: CourseWithStatus) => {
    setSelected(course);
    setDeleteOpen(true);
  };

  const handleView = (course: CourseWithStatus) => {
    router.push(`/contributor/courses/${course.id}`, course.title);
  };

  const handleManage = (course: CourseWithStatus) => {
    router.push(`/contributor/skill_category/${course.id}`, course.title);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const courses = coursesQuery.data?.data?.courses || [];
    return {
      total: courses.length,
      draft: courses.filter((c: CourseWithStatus) => c.status === "DRAFT")
        .length,
      submitted: courses.filter(
        (c: CourseWithStatus) => c.status === "SUBMITTED"
      ).length,
      approved: courses.filter((c: CourseWithStatus) => c.status === "APPROVED")
        .length,
      published: courses.filter(
        (c: CourseWithStatus) => c.status === "PUBLISHED"
      ).length,
      rejected: courses.filter((c: CourseWithStatus) => c.status === "REJECTED")
        .length,
    };
  }, [coursesQuery.data]);

  const columns: ColumnDef<CourseWithStatus>[] = useMemo(
    () => [
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
        header: "Category",
        accessorKey: "category",
        cell: ({ row }) => (
          <span className="text-[var(--muted-foreground)]">
            {row.original.category?.name || "—"}
          </span>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => {
          const status = row.original.status || "DRAFT";
          const statusColors: Record<string, string> = {
            DRAFT: "bg-gray-500",
            SUBMITTED: "bg-blue-500",
            APPROVED: "bg-green-500",
            REJECTED: "bg-red-500",
            PUBLISHED: "bg-purple-500",
          };
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                statusColors[status] || "bg-gray-500"
              }`}
            >
              {status}
            </span>
          );
        },
      },
      {
        header: "Created",
        accessorKey: "createdAt",
        cell: ({ row }) => (
          <span className="text-sm text-[var(--muted-foreground)]">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      // ✅ View Column
      {
        header: "View",
        size: 60,
        cell: ({ row }) => (
          <button
            onClick={() => handleView(row.original)}
            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye size={16} />
          </button>
        ),
      },
      // ✅ Manage Column (with skills under it)
      {
        header: "Manage",
        size: 60,
        cell: ({ row }) => (
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => handleManage(row.original)}
              className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg transition-colors"
              title="Manage Skills"
            >
              <Settings size={16} />
            </button>
            <span className="text-xs text-[var(--muted-foreground)]">
              Skills
            </span>
          </div>
        ),
      },
      // ✅ Submit Column (only for DRAFT status)
      {
        header: "Submit",
        size: 80,
        cell: ({ row }) => (
          <>
            {row.original.status === "DRAFT" ? (
              <button
                onClick={() => handleSubmit(row.original)}
                disabled={submitMutation.isPending}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap"
                title="Submit for Review"
              >
                <Send size={14} />
                Submit
              </button>
            ) : (
              <span className="text-xs text-[var(--muted-foreground)]">—</span>
            )}
          </>
        ),
      },
      // ✅ Delete Column
      {
        header: "Delete",
        size: 60,
        cell: ({ row }) => (
          <button
            onClick={() => handleDelete(row.original)}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
            title="Delete"
            disabled={deleteMutation.isPending}
          >
            <Trash2 size={16} />
          </button>
        ),
      },
    ],
    [submitMutation.isPending, deleteMutation.isPending]
  );

  const table = useReactTable({
    data: coursesQuery.data?.data?.courses || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="min-h-screen bg-[var(--background)] pb-8">
      <TopBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
              My Courses
            </h1>
            <p className="text-[var(--muted-foreground)]">
              Manage and track your course contributions
            </p>
          </div>
          <button
            onClick={() =>
              router.push("/contributor/courses/create", "Create Course")
            }
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary)]/90 transition-colors flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Create Course
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-[var(--card)] rounded-lg p-4 border border-[var(--border)]">
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {stats.total}
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">Total</p>
          </div>
          <div className="bg-[var(--card)] rounded-lg p-4 border border-[var(--border)]">
            <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
            <p className="text-sm text-[var(--muted-foreground)]">Draft</p>
          </div>
          <div className="bg-[var(--card)] rounded-lg p-4 border border-[var(--border)]">
            <p className="text-2xl font-bold text-blue-600">
              {stats.submitted}
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">Submitted</p>
          </div>
          <div className="bg-[var(--card)] rounded-lg p-4 border border-[var(--border)]">
            <p className="text-2xl font-bold text-green-600">
              {stats.approved}
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">Approved</p>
          </div>
          <div className="bg-[var(--card)] rounded-lg p-4 border border-[var(--border)]">
            <p className="text-2xl font-bold text-purple-600">
              {stats.published}
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">Published</p>
          </div>
          <div className="bg-[var(--card)] rounded-lg p-4 border border-[var(--border)]">
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-sm text-[var(--muted-foreground)]">Rejected</p>
          </div>
        </div>

        {/* Table */}
        {coursesQuery.isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
          </div>
        ) : coursesQuery.data?.data?.courses.length === 0 ? (
          <div className="text-center py-12 bg-[var(--card)] rounded-lg border border-[var(--border)]">
            <BookOpen className="mx-auto h-12 w-12 text-[var(--muted-foreground)] mb-4" />
            <p className="text-[var(--muted-foreground)]">No courses found</p>
          </div>
        ) : (
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-x-auto">
            <TanstackTable
              table={table}
              paginatedRows={table.getRowModel().rows}
              pageIndex={table.getState().pagination.pageIndex}
              pageSize={table.getState().pagination.pageSize}
              onPageChange={table.setPageIndex}
            />
          </div>
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={deleteOpen}
          onClose={() => {
            setDeleteOpen(false);
            setSelected(null);
          }}
          onConfirm={() => {
            if (selected) deleteMutation.mutate(selected.id);
          }}
          title="Delete Course"
          description={`Are you sure you want to delete "${selected?.title}"? This action cannot be undone.`}
          loading={deleteMutation.isPending}
        />
      </div>
    </div>
  );
}
