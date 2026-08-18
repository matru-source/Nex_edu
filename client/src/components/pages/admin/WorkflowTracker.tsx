import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import TopBar from "../../lazy/TopBar";
import useInitNavStackOnce from "../../../hooks/useInitNavstack";
import {
  BookOpen,
  FileText,
  Video,
  Filter,
  Search,
  User,
  RefreshCw,
  Eye,
  TrendingUp,
} from "lucide-react";
import useRouter from "../../../hooks/useRouter";

interface WorkflowItem {
  id: string;
  entityType: string;
  entityId: string;
  entityTitle?: string;
  statusFrom?: string;
  statusTo?: string;
  action: string;
  performedBy?: string;
  performedByName?: string;
  createdAt: string;
  metadata?: any;
}

interface WorkflowResponse {
  success: boolean;
  data: {
    workflows: WorkflowItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const entityIcons = {
  COURSE: BookOpen,
  CHAPTER: FileText,
  LESSON: Video,
};

const statusColors = {
  DRAFT: "bg-gray-500",
  SUBMITTED: "bg-blue-500",
  APPROVED: "bg-green-500",
  REJECTED: "bg-red-500",
  PUBLISHED: "bg-purple-500",
};

export default function WorkflowTracker() {
  useInitNavStackOnce([
    { title: "Workflow Tracker", path: "/admin/workflows" },
  ]);
  const router = useRouter();

  const [filters, setFilters] = useState({
    entityType: "" as string,
    status: "" as string,
    contributorId: "" as string,
    startDate: "" as string,
    endDate: "" as string,
    search: "" as string,
  });
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Auto-refresh every 30 seconds
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["workflows", filters, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.entityType) params.append("entityType", filters.entityType);
      if (filters.status) params.append("status", filters.status);
      if (filters.contributorId)
        params.append("contributorId", filters.contributorId);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      params.append("page", page.toString());
      params.append("limit", "20");

      const res = await api.get<WorkflowResponse>(
        `${API_ROUTES.WORKFLOW_TRACKING.GET_ALL_WORKFLOWS}?${params.toString()}`
      );
      return res.data;
    },
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const filteredWorkflows =
    data?.data?.workflows?.filter((workflow) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          workflow.entityTitle?.toLowerCase().includes(searchLower) ||
          workflow.action.toLowerCase().includes(searchLower) ||
          workflow.performedByName?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    }) || [];

  const getEntityPath = (workflow: WorkflowItem) => {
    return `/admin/workflows/${workflow.entityType}/${workflow.entityId}`;
  };

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300 pb-8">
      <TopBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
              Workflow Tracker
            </h1>
            <p className="text-[var(--muted-foreground)]">
              Monitor all content workflow activities in real-time
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/workflows/stats", "Workflow Statistics")}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            View Statistics
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-[var(--card)] rounded-lg p-4 mb-6 flex flex-wrap gap-4 shadow-sm border border-[var(--border)]">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search by title, action, or contributor..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
          </div>

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="px-4 py-2 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>

          <button
            onClick={() => refetch()}
            className="px-4 py-2 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Advanced Filters */}
        {isFilterOpen && (
          <div className="bg-[var(--card)] rounded-lg p-4 mb-6 border border-[var(--border)] shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Entity Type
                </label>
                <select
                  value={filters.entityType}
                  onChange={(e) =>
                    setFilters({ ...filters, entityType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)]"
                >
                  <option value="">All Types</option>
                  <option value="COURSE">Course</option>
                  <option value="CHAPTER">Chapter</option>
                  <option value="LESSON">Lesson</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)]"
                >
                  <option value="">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setFilters({
                    entityType: "",
                    status: "",
                    contributorId: "",
                    startDate: "",
                    endDate: "",
                    search: "",
                  });
                  setPage(1);
                }}
                className="px-4 py-2 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Workflows List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
            <p className="mt-4 text-[var(--muted-foreground)]">
              Loading workflows...
            </p>
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="text-center py-12 bg-[var(--card)] rounded-lg border border-[var(--border)]">
            <BookOpen className="mx-auto h-12 w-12 text-[var(--muted-foreground)] mb-4" />
            <p className="text-[var(--muted-foreground)] text-lg">
              No workflows found
            </p>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">
              {filters.search || filters.entityType || filters.status
                ? "Try adjusting your filters"
                : "No workflow activities yet"}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {filteredWorkflows.map((workflow) => {
                const EntityIcon =
                  entityIcons[
                    workflow.entityType as keyof typeof entityIcons
                  ] || BookOpen;

                return (
                  <div
                    key={workflow.id}
                    className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 rounded-lg bg-blue-500/10 flex-shrink-0">
                          <EntityIcon className="h-6 w-6 text-blue-500" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-[var(--foreground)]">
                              {workflow.entityTitle || workflow.entityId}
                            </h3>
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500 text-white flex-shrink-0">
                              {workflow.action.replace(/_/g, " ")}
                            </span>
                            {workflow.statusTo && (
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-medium text-white flex-shrink-0 ${
                                  statusColors[
                                    workflow.statusTo as keyof typeof statusColors
                                  ] || "bg-gray-500"
                                }`}
                              >
                                {workflow.statusTo}
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-[var(--muted-foreground)] mb-3">
                            {workflow.entityType} •{" "}
                            {new Date(workflow.createdAt).toLocaleString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>

                          {workflow.statusFrom && workflow.statusTo && (
                            <p className="text-xs text-[var(--muted-foreground)] mb-2">
                              Status: {workflow.statusFrom} →{" "}
                              {workflow.statusTo}
                            </p>
                          )}

                          {workflow.performedByName && (
                            <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                              <User className="h-3 w-3" />
                              <span>By: {workflow.performedByName}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => router.push(getEntityPath(workflow), workflow.entityTitle || workflow.entityId)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 flex-shrink-0"
                      >
                        <Eye className="h-4 w-4" />
                        View History
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {data?.data?.totalPages && data.data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--muted)]"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-[var(--muted-foreground)]">
                  Page {page} of {data.data.totalPages} ({data.data.total}{" "}
                  total)
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(data.data.totalPages || 1, p + 1))
                  }
                  disabled={page >= (data.data.totalPages || 1)}
                  className="px-4 py-2 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--muted)]"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
