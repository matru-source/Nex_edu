import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import TopBar from "../../lazy/TopBar";
import useInitNavStackOnce from "../../../hooks/useInitNavstack";
import {
  BookOpen,
  FileText,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import useRouter from "../../../hooks/useRouter";

interface StatusCount {
  DRAFT: number;
  SUBMITTED: number;
  APPROVED: number;
  REJECTED: number;
  PUBLISHED: number;
}

export default function CourseStatus() {
  useInitNavStackOnce([{ title: "Content Status", path: "/moderator/status" }]);
  const router = useRouter();
  const [entityFilter, setEntityFilter] = useState<
    "COURSE" | "CHAPTER" | "LESSON" | "ALL"
  >("ALL");

  const { data, isLoading } = useQuery({
    queryKey: ["content-status", entityFilter],
    queryFn: async () => {
      // Fetch submissions for each status
      const statuses = [
        "DRAFT",
        "SUBMITTED",
        "APPROVED",
        "REJECTED",
        "PUBLISHED",
      ];
      const counts: StatusCount = {
        DRAFT: 0,
        SUBMITTED: 0,
        APPROVED: 0,
        REJECTED: 0,
        PUBLISHED: 0,
      };

      for (const status of statuses) {
        try {
          const params = new URLSearchParams();
          params.append("status", status);
          if (entityFilter !== "ALL") {
            params.append("entityType", entityFilter);
          }
          params.append("limit", "1");

          const res = await api.get(
            `${API_ROUTES.WORKFLOW.GET_SUBMISSIONS}?${params.toString()}`
          );
          counts[status as keyof StatusCount] = res.data.data?.total || 0;
        } catch (err) {
          console.error(`Error fetching ${status}:`, err);
        }
      }

      return counts;
    },
  });

  const statusCards = [
    {
      label: "Draft",
      count: data?.DRAFT || 0,
      color: "bg-gray-500",
      icon: FileText,
    },
    {
      label: "Submitted",
      count: data?.SUBMITTED || 0,
      color: "bg-blue-500",
      icon: Clock,
    },
    {
      label: "Approved",
      count: data?.APPROVED || 0,
      color: "bg-green-500",
      icon: CheckCircle,
    },
    {
      label: "Rejected",
      count: data?.REJECTED || 0,
      color: "bg-red-500",
      icon: XCircle,
    },
    {
      label: "Published",
      count: data?.PUBLISHED || 0,
      color: "bg-purple-500",
      icon: CheckCircle,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300 pb-8">
      <TopBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
            Content Status Overview
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Monitor the status of all course content
          </p>
        </div>

        {/* Filter */}
        <div className="bg-[var(--card)] rounded-lg p-4 mb-6 flex flex-wrap gap-4 shadow-sm border border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[var(--muted-foreground)]" />
            <label className="text-sm font-medium text-[var(--foreground)]">
              Content Type:
            </label>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="ALL">All Types</option>
              <option value="COURSE">Courses</option>
              <option value="CHAPTER">Chapters</option>
              <option value="LESSON">Lessons</option>
            </select>
          </div>
        </div>

        {/* Status Cards */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
            <p className="mt-4 text-[var(--muted-foreground)]">
              Loading status...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {statusCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${card.color}/10`}>
                      <Icon
                        className={`h-5 w-5 ${card.color.replace(
                          "bg-",
                          "text-"
                        )}`}
                      />
                    </div>
                    <span className="text-2xl font-bold text-[var(--foreground)]">
                      {card.count}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {card.label}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/moderator/submissions", "Submissions")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Review Submissions
            </button>
            <button
              onClick={() => router.push("/moderator/status", "Content Status")}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-[var(--foreground)] rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              View Statistics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
