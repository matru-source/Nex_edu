import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import TopBar from "../../lazy/TopBar";
import useInitNavStackOnce from "../../../hooks/useInitNavstack";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  FolderPlus,
  Layers,
  Box,
  FileText,
  Video,
  Tag,
} from "lucide-react";
import useRouter from "../../../hooks/useRouter";

interface CourseDetails {
  id: string;
  title: string;
  description: string;
  status: string;
  category?: { name: string };
  subCategory?: { name: string };
  tumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  flags?: string[];
  totalPrice?: number;
}

interface ActivityEvent {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  entityTitle: string;
  statusFrom?: string;
  statusTo?: string;
  performedBy?: string;
  performedByName?: string;
  createdAt: string;
  metadata?: any;
}

const getActivityIcon = (action: string) => {
  switch (action) {
    case "COURSE_CREATED":
      return BookOpen;
    case "SKILL_CATEGORY_ADDED":
      return FolderPlus;
    case "EXPERTISE_ADDED":
      return Layers;
    case "MODULE_ADDED":
      return Box;
    case "CHAPTER_ADDED":
      return FileText;
    case "LESSON_ADDED":
      return Video;
    case "SUBMITTED":
      return Send;
    case "APPROVED":
    case "PUBLISHED":
      return CheckCircle;
    case "REJECTED":
      return XCircle;
    case "FLAG_CHANGED":
      return Tag;
    default:
      return Clock;
  }
};

const getActivityColor = (action: string) => {
  switch (action) {
    case "COURSE_CREATED":
      return "bg-indigo-500";
    case "SKILL_CATEGORY_ADDED":
      return "bg-cyan-500";
    case "EXPERTISE_ADDED":
      return "bg-teal-500";
    case "MODULE_ADDED":
      return "bg-emerald-500";
    case "CHAPTER_ADDED":
      return "bg-amber-500";
    case "LESSON_ADDED":
      return "bg-orange-500";
    case "SUBMITTED":
      return "bg-blue-500";
    case "APPROVED":
      return "bg-green-500";
    case "REJECTED":
      return "bg-red-500";
    case "PUBLISHED":
      return "bg-purple-500";
    case "FLAG_CHANGED":
      return "bg-yellow-500";
    default:
      return "bg-gray-400";
  }
};

const getActionLabel = (action: string) => {
  switch (action) {
    case "COURSE_CREATED":
      return "Value Stream Created";
    case "SKILL_CATEGORY_ADDED":
      return "Expertise Added";
    case "EXPERTISE_ADDED":
      return "Domain Added";
    case "MODULE_ADDED":
      return "Module Added";
    case "CHAPTER_ADDED":
      return "Chapter Added";
    case "LESSON_ADDED":
      return "Lesson Added";
    case "SUBMITTED":
      return "Submitted for Review";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    case "PUBLISHED":
      return "Published";
    case "FLAG_CHANGED":
      return "Flags Updated";
    default:
      return action.replace(/_/g, " ");
  }
};

export default function ContributorCourseDetails() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();

  useInitNavStackOnce([
    {
      title: "Value Stream Details",
      path: `/contributor/courses/${courseId}`,
    },
  ]);

  // Fetch course details (contributor-specific endpoint)
  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ["contributor-course-details", courseId],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: CourseDetails }>(
        API_ROUTES.COURSE.GET_CONTRIBUTOR.COURSE_DETAILS(courseId!)
      );
      return res.data;
    },
    enabled: !!courseId,
  });

  // Fetch complete activity timeline
  const { data: timelineData, isLoading: timelineLoading } = useQuery({
    queryKey: ["contributor-course-timeline", courseId],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: ActivityEvent[] }>(
        API_ROUTES.COURSE.GET_CONTRIBUTOR.COURSE_TIMELINE(courseId!)
      );
      return res.data;
    },
    enabled: !!courseId,
  });

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <TopBar />
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
        </div>
      </div>
    );
  }

  const course = courseData?.data;
  const activities = timelineData?.data || [];

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-500",
    SUBMITTED: "bg-blue-500",
    APPROVED: "bg-green-500",
    REJECTED: "bg-red-500",
    PUBLISHED: "bg-purple-500",
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-8">
      <TopBar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Value Streams
        </button>

        {course ? (
          <>
            {/* Course Header */}
            <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] shadow-sm mb-6">
              <div className="flex items-start gap-6">
                {course.tumbnailUrl ? (
                  <img
                    src={course.tumbnailUrl}
                    alt={course.title}
                    className="w-40 h-28 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-40 h-28 bg-[var(--muted)] rounded-lg flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-[var(--muted-foreground)]" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                        {course.title}
                      </h1>
                      <div className="flex items-center gap-3 text-sm">
                        <span
                          className={`px-2.5 py-1 rounded-full text-white text-xs font-medium ${
                            statusColors[course.status] || "bg-gray-500"
                          }`}
                        >
                          {course.status}
                        </span>
                        {course.category && (
                          <span className="text-[var(--muted-foreground)]">
                            {course.category.name}
                          </span>
                        )}
                        {course.subCategory && (
                          <span className="text-[var(--muted-foreground)]">
                            • {course.subCategory.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        router.push(
                          `/contributor/skill_category/${course.id}`,
                          course.title
                        )
                      }
                      className="px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary)]/90 transition-colors"
                    >
                      Manage Value Stream
                    </button>
                  </div>
                  <p className="text-[var(--foreground)] text-sm mb-4">
                    {course.description}
                  </p>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-6 pt-4 border-t border-[var(--border)]">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-[var(--muted-foreground)]" />
                      <span className="text-[var(--muted-foreground)]">
                        Created:
                      </span>
                      <span className="text-[var(--foreground)]">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {course.totalPrice !== undefined && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-[var(--muted-foreground)]">
                          Total Price:
                        </span>
                        <span className="text-[var(--foreground)] font-medium">
                          ${course.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Flags */}
                  {course.flags && course.flags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {course.flags.map((flag) => (
                        <span
                          key={flag}
                          className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                        >
                          {flag.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {course.rejectionReason && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                      <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                        Rejection Reason:
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {course.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Complete Activity Timeline */}
            <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] shadow-sm">
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-6 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Complete Activity Timeline
              </h2>

              {timelineLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary)]"></div>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-[var(--muted-foreground)] mb-4" />
                  <p className="text-[var(--muted-foreground)]">
                    No activity recorded yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity, index) => {
                    const ActivityIcon = getActivityIcon(activity.action);
                    const isLast = index === activities.length - 1;

                    return (
                      <div key={activity.id} className="flex gap-4 relative">
                        {/* Timeline line */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full ${getActivityColor(
                              activity.action
                            )} flex items-center justify-center z-10 shadow-sm`}
                          >
                            <ActivityIcon className="h-4 w-4 text-white" />
                          </div>
                          {!isLast && (
                            <div className="w-0.5 flex-1 bg-[var(--border)] mt-2 min-h-[40px]" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-6">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-[var(--foreground)]">
                              {getActionLabel(activity.action)}
                            </span>
                            <span className="text-xs text-[var(--muted-foreground)]">
                              {new Date(activity.createdAt).toLocaleString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>

                          {/* Entity title */}
                          <p className="text-sm text-[var(--muted-foreground)] mb-1">
                            {activity.entityTitle}
                          </p>

                          {/* Status change */}
                          {activity.statusFrom && activity.statusTo && (
                            <p className="text-xs text-[var(--muted-foreground)]">
                              Status: {activity.statusFrom} →{" "}
                              {activity.statusTo}
                            </p>
                          )}

                          {/* Performed by */}
                          {activity.performedByName && (
                            <p className="text-xs text-[var(--muted-foreground)] mt-1">
                              By: {activity.performedByName}
                            </p>
                          )}

                          {/* Metadata */}
                          {activity.metadata?.rejectionReason && (
                            <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                              <p className="text-xs font-medium text-red-800 dark:text-red-200 mb-1">
                                Rejection Reason:
                              </p>
                              <p className="text-xs text-red-700 dark:text-red-300">
                                {activity.metadata.rejectionReason}
                              </p>
                            </div>
                          )}

                          {activity.metadata?.flags &&
                            activity.metadata.flags.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                <span className="text-xs text-[var(--muted-foreground)]">
                                  Flags:
                                </span>
                                {activity.metadata.flags.map((flag: string) => (
                                  <span
                                    key={flag}
                                    className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                                  >
                                    {flag.replace(/_/g, " ")}
                                  </span>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] text-center">
            <BookOpen className="mx-auto h-12 w-12 text-[var(--muted-foreground)] mb-4" />
            <p className="text-[var(--muted-foreground)]">Value Stream not found</p>
          </div>
        )}
      </div>
    </div>
  );
}
