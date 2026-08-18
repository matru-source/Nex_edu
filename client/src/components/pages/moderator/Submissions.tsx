import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import TopBar from "../../lazy/TopBar";
import useInitNavStackOnce from "../../../hooks/useInitNavstack";
import {
  BookOpen,
  FileText,
  Video,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Clock,
  User,
} from "lucide-react";
import useRouter from "../../../hooks/useRouter";
import { useToast } from "../../../contexts/ToastContext";
import Modal from "../../lazy/Modal";

interface Submission {
  id: string;
  title: string;
  entityType: "COURSE" | "CHAPTER" | "LESSON";
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "PUBLISHED";
  submittedAt: string | null;
  submittedBy?: string | null;
  createdAt: string;
  description?: string;
  content?: string;
  [key: string]: any;
}

interface SubmissionsResponse {
  success: boolean;
  data: {
    submissions: Submission[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const entityTypeIcons = {
  COURSE: BookOpen,
  CHAPTER: FileText,
  LESSON: Video,
};

export default function Submissions() {
  useInitNavStackOnce([
    { title: "Submissions", path: "/moderator/submissions" },
  ]);
  const router = useRouter();
  const { success, error: showError } = useToast();
  const queryClient = useQueryClient();

  const [entityFilter, setEntityFilter] = useState<
    "COURSE" | "CHAPTER" | "LESSON" | undefined
  >(undefined);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["submissions", entityFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("status", "SUBMITTED");
      if (entityFilter) params.append("entityType", entityFilter);
      params.append("page", page.toString());
      params.append("limit", "10");

      const res = await api.get<SubmissionsResponse>(
        `${API_ROUTES.WORKFLOW.GET_SUBMISSIONS}?${params.toString()}`
      );
      return res.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (submission: Submission) => {
      let endpoint;
      if (submission.entityType === "COURSE") {
        endpoint = API_ROUTES.WORKFLOW.APPROVE_COURSE(submission.id);
      } else if (submission.entityType === "CHAPTER") {
        endpoint = API_ROUTES.WORKFLOW.APPROVE_CHAPTER(submission.id);
      } else {
        endpoint = API_ROUTES.WORKFLOW.APPROVE_LESSON(submission.id);
      }
      const res = await api.post(endpoint);
      return res.data;
    },
    onSuccess: () => {
      success("Approved successfully");
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      setReviewModalOpen(false);
      setSelectedSubmission(null);
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || "Failed to approve");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({
      submission,
      reason,
    }: {
      submission: Submission;
      reason: string;
    }) => {
      let endpoint;
      if (submission.entityType === "COURSE") {
        endpoint = API_ROUTES.WORKFLOW.REJECT_COURSE(submission.id);
      } else if (submission.entityType === "CHAPTER") {
        endpoint = API_ROUTES.WORKFLOW.REJECT_CHAPTER(submission.id);
      } else {
        endpoint = API_ROUTES.WORKFLOW.REJECT_LESSON(submission.id);
      }
      const res = await api.post(endpoint, { rejectionReason: reason });
      return res.data;
    },
    onSuccess: () => {
      success("Rejected successfully");
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      setShowRejectModal(false);
      setReviewModalOpen(false);
      setSelectedSubmission(null);
      setRejectionReason("");
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || "Failed to reject");
    },
  });

  const handleApprove = (submission: Submission) => {
    if (
      window.confirm(`Are you sure you want to approve "${submission.title}"?`)
    ) {
      approveMutation.mutate(submission);
    }
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      showError("Please provide a rejection reason");
      return;
    }
    if (selectedSubmission) {
      rejectMutation.mutate({
        submission: selectedSubmission,
        reason: rejectionReason,
      });
    }
  };

  const openReviewModal = (submission: Submission) => {
    setSelectedSubmission(submission);
    setReviewModalOpen(true);
  };

  const getEntityPath = (submission: Submission) => {
    if (submission.entityType === "COURSE") {
      return `/admin/courses/view?courseId=${submission.id}`;
    } else if (submission.entityType === "CHAPTER") {
      return `/admin/chapters/view?chapterId=${submission.id}`;
    } else {
      return `/admin/lessons/view?lessonId=${submission.id}`;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300 pb-8">
      <TopBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
            Submissions for Review
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Review and approve or reject submitted content
          </p>
        </div>

        {/* Filters */}
        <div className="bg-[var(--card)] rounded-lg p-4 mb-6 flex flex-wrap gap-4 shadow-sm border border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[var(--muted-foreground)]" />
            <label className="text-sm font-medium text-[var(--foreground)]">
              Type:
            </label>
            <select
              value={entityFilter || "ALL"}
              onChange={(e) =>
                setEntityFilter(
                  e.target.value === "ALL" ? undefined : (e.target.value as any)
                )
              }
              className="px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="ALL">All Types</option>
              <option value="COURSE">Courses</option>
              <option value="CHAPTER">Chapters</option>
              <option value="LESSON">Lessons</option>
            </select>
          </div>
        </div>

        {/* Submissions List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
            <p className="mt-4 text-[var(--muted-foreground)]">
              Loading submissions...
            </p>
          </div>
        ) : !data?.data?.submissions?.length ? (
          <div className="text-center py-12 bg-[var(--card)] rounded-lg border border-[var(--border)]">
            <BookOpen className="mx-auto h-12 w-12 text-[var(--muted-foreground)] mb-4" />
            <p className="text-[var(--muted-foreground)] text-lg">
              No submissions found
            </p>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">
              All caught up! There are no pending submissions to review.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {data.data.submissions.map((submission) => {
                const EntityIcon = entityTypeIcons[submission.entityType];

                return (
                  <div
                    key={submission.id}
                    className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={`p-3 rounded-lg bg-blue-500/10 flex-shrink-0`}
                        >
                          <EntityIcon className="h-6 w-6 text-blue-500" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-[var(--foreground)]">
                              {submission.title}
                            </h3>
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500 text-white flex-shrink-0">
                              {submission.status}
                            </span>
                          </div>

                          <p className="text-sm text-[var(--muted-foreground)] mb-3">
                            {submission.entityType} • Submitted{" "}
                            {submission.submittedAt
                              ? new Date(
                                  submission.submittedAt
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "N/A"}
                          </p>

                          {submission.description && (
                            <p className="text-sm text-[var(--muted-foreground)] mb-3 line-clamp-2">
                              {submission.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
                            {submission.submittedBy && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>
                                  Contributor ID: {submission.submittedBy}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {new Date(
                                  submission.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => router.push(getEntityPath(submission), submission.title)}
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-[var(--foreground)] rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        <button
                          onClick={() => openReviewModal(submission)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Review
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {data.data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--muted)]"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-[var(--muted-foreground)]">
                  Page {page} of {data.data.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(data.data.totalPages, p + 1))
                  }
                  disabled={page >= data.data.totalPages}
                  className="px-4 py-2 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--muted)]"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Review Modal */}
        <Modal
          open={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedSubmission(null);
            setRejectionReason("");
          }}
        >
          <div className="p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
              Review {selectedSubmission?.entityType}
            </h2>
            {selectedSubmission && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-[var(--foreground)] mb-2">
                    {selectedSubmission.title}
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)] mb-4">
                    {selectedSubmission.entityType} • Submitted{" "}
                    {selectedSubmission.submittedAt
                      ? new Date(
                          selectedSubmission.submittedAt
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                  {selectedSubmission.description && (
                    <p className="text-sm text-[var(--foreground)] mb-4">
                      {selectedSubmission.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
                  <button
                    onClick={() => handleApprove(selectedSubmission)}
                    disabled={approveMutation.isPending}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {approveMutation.isPending ? "Approving..." : "Approve"}
                  </button>

                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>

        {/* Reject Modal */}
        <Modal
          open={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setRejectionReason("");
          }}
        >
          <div className="p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
              Reject Submission
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a clear reason for rejection. This will be sent to the contributor..."
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)] min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  required
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleReject}
                  disabled={rejectMutation.isPending || !rejectionReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rejectMutation.isPending ? "Rejecting..." : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
