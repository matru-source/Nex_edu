import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import TopBar from "../../lazy/TopBar";
import useInitNavStackOnce from "../../../hooks/useInitNavstack";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Edit,
  User,
} from "lucide-react";
import useRouter from "../../../hooks/useRouter";

interface StatusTimeline {
  status: string;
  timestamp: string;
  performedBy?: string;
  performedByName?: string;
  rejectionReason?: string;
  metadata?: any;
}

interface StatusResponse {
  success: boolean;
  data: {
    title: string;
    entityType: string;
    currentStatus: string;
    timeline: StatusTimeline[];
  };
}

export default function ContributionStatus() {
  const { id, type } = useParams<{
    id: string;
    type: "course" | "chapter" | "lesson";
  }>();
  const router = useRouter();

  useInitNavStackOnce([
    { title: "Contribution Status", path: `/contributor/status/${type}/${id}` },
  ]);

  const { data, isLoading } = useQuery({
    queryKey: ["contribution-status", id, type],
    queryFn: async () => {
      try {
        // Try to get status from workflow history endpoint
        // This endpoint should be: GET /api/v1/workflow/:entityType/:entityId/history
        // For now, we'll construct a basic response
        let endpoint;
        if (type === "course") {
          endpoint = API_ROUTES.COURSE.GET_BY_ID.CATEGORY(id!);
        } else if (type === "chapter") {
          endpoint = API_ROUTES.COURSE.GET_BY_ID.CHAPTER(id!);
        } else {
          endpoint = API_ROUTES.COURSE.GET_BY_ID.LESSON(id!);
        }

        const res = await api.get(endpoint);
        const item = res.data.data;

        // Construct timeline from item data
        const timeline: StatusTimeline[] = [];

        if (item.createdAt) {
          timeline.push({
            status: "CREATED",
            timestamp: item.createdAt,
            performedBy: item.createdBy,
          });
        }

        if (item.submittedAt) {
          timeline.push({
            status: "SUBMITTED",
            timestamp: item.submittedAt,
            performedBy: item.submittedBy,
          });
        }

        if (item.approvedAt) {
          timeline.push({
            status: "APPROVED",
            timestamp: item.approvedAt,
            performedBy: item.approvedBy,
          });
        }

        if (item.rejectedAt) {
          timeline.push({
            status: "REJECTED",
            timestamp: item.rejectedAt,
            performedBy: item.rejectedBy,
            rejectionReason: item.rejectionReason,
          });
        }

        if (item.status === "PUBLISHED") {
          timeline.push({
            status: "PUBLISHED",
            timestamp: item.updatedAt || item.createdAt,
          });
        }

        return {
          success: true,
          data: {
            title: item.title,
            entityType: (type ?? "").toUpperCase(),
            currentStatus: item.status || "DRAFT",
            timeline: timeline.sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
            ),
          },
        } as StatusResponse;
      } catch (err: any) {
        console.error("Error fetching status:", err);
        return {
          success: true,
          data: {
            title: "",
            entityType: type?.toUpperCase() || "",
            currentStatus: "DRAFT",
            timeline: [],
          },
        } as StatusResponse;
      }
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "PUBLISHED":
        return CheckCircle;
      case "REJECTED":
        return XCircle;
      case "SUBMITTED":
        return Send;
      case "CREATED":
        return Edit;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "PUBLISHED":
        return "bg-green-500";
      case "REJECTED":
        return "bg-red-500";
      case "SUBMITTED":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <TopBar />
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
          <p className="mt-4 text-[var(--muted-foreground)]">
            Loading status...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-8">
      <TopBar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] shadow-sm">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            {data?.data?.title || "Contribution Status"}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mb-6">
            {data?.data?.entityType} • Current Status:{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {data?.data?.currentStatus}
            </span>
          </p>

          {data?.data?.timeline?.length ? (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Status Timeline
              </h2>
              <div className="relative">
                {data.data.timeline.map((item, index) => {
                  const StatusIcon = getStatusIcon(item.status);
                  const isLast = index === data.data.timeline.length - 1;

                  return (
                    <div key={index} className="flex gap-4 relative">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-4 h-4 rounded-full ${getStatusColor(
                            item.status
                          )} flex items-center justify-center z-10`}
                        >
                          <StatusIcon className="h-2.5 w-2.5 text-white" />
                        </div>
                        {!isLast && (
                          <div className="w-0.5 h-full bg-[var(--border)] mt-2 min-h-[60px]" />
                        )}
                      </div>

                      <div className="flex-1 pb-6">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-[var(--foreground)]">
                            {item.status}
                          </span>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {new Date(item.timestamp).toLocaleString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {item.performedBy && (
                          <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-1 mb-2">
                            <User className="h-3 w-3" />
                            By: {item.performedByName || item.performedBy}
                          </p>
                        )}
                        {item.rejectionReason && (
                          <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                            <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                              Rejection Reason:
                            </p>
                            <p className="text-sm text-red-700 dark:text-red-300">
                              {item.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-[var(--muted-foreground)] mb-4" />
              <p className="text-[var(--muted-foreground)]">
                No status history available
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
