import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import TopBar from "../../lazy/TopBar";
import useInitNavStackOnce from "../../../hooks/useInitNavstack";
import {
  ArrowLeft,
  TrendingUp,
  CheckCircle,
  XCircle,
  Send,
  Clock,
  Users,
  BarChart3,
} from "lucide-react";
import useRouter from "../../../hooks/useRouter";

interface WorkflowStats {
  totalSubmissions: number;
  totalApprovals: number;
  totalRejections: number;
  totalPublications: number;
  averageTimePerStage: {
    draftToSubmitted: number;
    submittedToApproved: number;
    approvedToPublished: number;
  };
  contributorMetrics: Array<{
    contributorId: string;
    contributorName: string;
    totalSubmissions: number;
    totalApprovals: number;
    totalRejections: number;
    approvalRate: number;
  }>;
  statusBreakdown: {
    DRAFT: number;
    SUBMITTED: number;
    APPROVED: number;
    REJECTED: number;
    PUBLISHED: number;
  };
}

export default function WorkflowStats() {
  useInitNavStackOnce([
    { title: "Workflow Statistics", path: "/admin/workflows/stats" },
  ]);
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["workflow-stats"],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: WorkflowStats }>(
        API_ROUTES.WORKFLOW_TRACKING.GET_WORKFLOW_STATS
      );
      return res.data;
    },
  });

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <TopBar />
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
          <p className="mt-4 text-[var(--muted-foreground)]">
            Loading statistics...
          </p>
        </div>
      </div>
    );
  }

  const stats = data?.data;

  return (
    <div className="min-h-screen bg-[var(--background)] pb-8">
      <TopBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
            Workflow Statistics
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Comprehensive analytics and performance metrics
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Send className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {stats?.totalSubmissions || 0}
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Total Submissions
            </p>
          </div>

          <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {stats?.totalApprovals || 0}
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Total Approvals
            </p>
          </div>

          <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {stats?.totalRejections || 0}
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Total Rejections
            </p>
          </div>

          <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {stats?.totalPublications || 0}
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Total Publications
            </p>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Status Breakdown
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats?.statusBreakdown &&
              Object.entries(stats.statusBreakdown).map(([status, count]) => (
                <div
                  key={status}
                  className="text-center p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]"
                >
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    {count}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    {status}
                  </p>
                </div>
              ))}
          </div>
        </div>

        {/* Average Time Per Stage */}
        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Average Time Per Stage
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <p className="text-sm text-[var(--muted-foreground)] mb-1">
                Draft → Submitted
              </p>
              <p className="text-xl font-bold text-[var(--foreground)]">
                {stats?.averageTimePerStage?.draftToSubmitted
                  ? formatTime(stats.averageTimePerStage.draftToSubmitted)
                  : "N/A"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <p className="text-sm text-[var(--muted-foreground)] mb-1">
                Submitted → Approved
              </p>
              <p className="text-xl font-bold text-[var(--foreground)]">
                {stats?.averageTimePerStage?.submittedToApproved
                  ? formatTime(stats.averageTimePerStage.submittedToApproved)
                  : "N/A"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <p className="text-sm text-[var(--muted-foreground)] mb-1">
                Approved → Published
              </p>
              <p className="text-xl font-bold text-[var(--foreground)]">
                {stats?.averageTimePerStage?.approvedToPublished
                  ? formatTime(stats.averageTimePerStage.approvedToPublished)
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Contributor Metrics */}
        {stats?.contributorMetrics && stats.contributorMetrics.length > 0 && (
          <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Contributor Performance
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--foreground)]">
                      Contributor
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-[var(--foreground)]">
                      Submissions
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-[var(--foreground)]">
                      Approvals
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-[var(--foreground)]">
                      Rejections
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-[var(--foreground)]">
                      Approval Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.contributorMetrics.map((contributor) => (
                    <tr
                      key={contributor.contributorId}
                      className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30"
                    >
                      <td className="py-3 px-4 text-sm text-[var(--foreground)]">
                        {contributor.contributorName}
                      </td>
                      <td className="py-3 px-4 text-sm text-[var(--foreground)] text-right">
                        {contributor.totalSubmissions}
                      </td>
                      <td className="py-3 px-4 text-sm text-green-600 dark:text-green-400 text-right">
                        {contributor.totalApprovals}
                      </td>
                      <td className="py-3 px-4 text-sm text-red-600 dark:text-red-400 text-right">
                        {contributor.totalRejections}
                      </td>
                      <td className="py-3 px-4 text-sm text-[var(--foreground)] text-right font-semibold">
                        {contributor.approvalRate.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
