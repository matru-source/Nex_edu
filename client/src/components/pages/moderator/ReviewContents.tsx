import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import TopBar from "../../lazy/TopBar";
import useInitNavStackOnce from "../../../hooks/useInitNavstack";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Video,
  Clock,
  User,
} from "lucide-react";
import useRouter from "../../../hooks/useRouter";

export default function ReviewContents() {
  const { courseId, chapterId, lessonId } = useParams();
  const router = useRouter();

  const entityType = courseId
    ? "COURSE"
    : chapterId
    ? "CHAPTER"
    : lessonId
    ? "LESSON"
    : null;
  const entityId = courseId || chapterId || lessonId;

  useInitNavStackOnce([
    { title: "Review Content", path: `/moderator/review/${entityId}` },
  ]);

  const { data, isLoading } = useQuery({
    queryKey: ["review-content", entityType, entityId],
    queryFn: async () => {
      let endpoint;
      if (courseId) {
        endpoint = API_ROUTES.COURSE.GET_BY_ID.CATEGORY(courseId);
      } else if (chapterId) {
        endpoint = API_ROUTES.COURSE.GET_BY_ID.CHAPTER(chapterId);
      } else if (lessonId) {
        endpoint = API_ROUTES.COURSE.GET_BY_ID.LESSON(lessonId);
      } else {
        throw new Error("Invalid entity ID");
      }

      const res = await api.get(endpoint);
      return res.data;
    },
    enabled: !!entityId,
  });

  const EntityIcon = courseId
    ? BookOpen
    : chapterId
    ? FileText
    : lessonId
    ? Video
    : BookOpen;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <TopBar />
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
          <p className="mt-4 text-[var(--muted-foreground)]">
            Loading content...
          </p>
        </div>
      </div>
    );
  }

  const content = data?.data;

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

        {content ? (
          <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <EntityIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                  {content.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                  <span className="px-2.5 py-1 rounded-full bg-blue-500 text-white text-xs font-medium">
                    {content.status || "DRAFT"}
                  </span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {content.submittedAt
                        ? `Submitted ${new Date(
                            content.submittedAt
                          ).toLocaleDateString()}`
                        : `Created ${new Date(
                            content.createdAt
                          ).toLocaleDateString()}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {content.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  Description
                </h2>
                <p className="text-[var(--foreground)] whitespace-pre-wrap">
                  {content.description}
                </p>
              </div>
            )}

            {content.content && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  Content
                </h2>
                <div className="text-[var(--foreground)] whitespace-pre-wrap bg-[var(--background)] p-4 rounded-md border border-[var(--border)]">
                  {content.content}
                </div>
              </div>
            )}

            <div className="border-t border-[var(--border)] pt-4 mt-6">
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
                Submission Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {content.submittedAt && (
                  <div>
                    <span className="text-[var(--muted-foreground)]">
                      Submitted At:
                    </span>
                    <span className="ml-2 text-[var(--foreground)]">
                      {new Date(content.submittedAt).toLocaleString()}
                    </span>
                  </div>
                )}
                {content.submittedBy && (
                  <div>
                    <span className="text-[var(--muted-foreground)]">
                      Submitted By:
                    </span>
                    <span className="ml-2 text-[var(--foreground)] flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {content.submittedBy}
                    </span>
                  </div>
                )}
                {content.createdAt && (
                  <div>
                    <span className="text-[var(--muted-foreground)]">
                      Created At:
                    </span>
                    <span className="ml-2 text-[var(--foreground)]">
                      {new Date(content.createdAt).toLocaleString()}
                    </span>
                  </div>
                )}
                {content.createdBy && (
                  <div>
                    <span className="text-[var(--muted-foreground)]">
                      Created By:
                    </span>
                    <span className="ml-2 text-[var(--foreground)] flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {content.createdBy}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] text-center">
            <EntityIcon className="mx-auto h-12 w-12 text-[var(--muted-foreground)] mb-4" />
            <p className="text-[var(--muted-foreground)]">Content not found</p>
          </div>
        )}
      </div>
    </div>
  );
}
