import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import TopBar from "../../lazy/TopBar";
import useInitNavStackOnce from "../../../hooks/useInitNavstack";
import { ArrowLeft, BookOpen, FileText, Video } from "lucide-react";
import useRouter from "../../../hooks/useRouter";
import WorkflowTimeline from "../../../components/ui/workflow/WorkFlowTimeline";

interface WorkflowEvent {
  id: string;
  action: string;
  statusFrom?: string;
  statusTo?: string;
  performedBy?: string;
  performedByName?: string;
  createdAt: string;
  metadata?: any;
}

interface EntityDetails {
  id: string;
  title: string;
  description?: string;
  status?: string;
}

const entityIcons = {
  COURSE: BookOpen,
  CHAPTER: FileText,
  LESSON: Video,
};

export default function WorkflowHistory() {
  const { entityType, entityId } = useParams<{
    entityType: string;
    entityId: string;
  }>();
  const router = useRouter();

  useInitNavStackOnce([
    {
      title: "Workflow History",
      path: `/admin/workflows/${entityType}/${entityId}`,
    },
  ]);

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["workflow-history", entityType, entityId],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: WorkflowEvent[] }>(
        API_ROUTES.WORKFLOW_TRACKING.GET_WORKFLOW_HISTORY(
          entityType!,
          entityId!
        )
      );
      return res.data;
    },
    enabled: !!entityType && !!entityId,
  });

  const { data: entityData, isLoading: entityLoading } = useQuery({
    queryKey: ["entity-details", entityType, entityId],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: EntityDetails }>(
        API_ROUTES.WORKFLOW_TRACKING.GET_ENTITY_DETAILS(entityType!, entityId!)
      );
      return res.data;
    },
    enabled: !!entityType && !!entityId,
  });

  const EntityIcon = entityType
    ? entityIcons[entityType as keyof typeof entityIcons] || BookOpen
    : BookOpen;

  if (historyLoading || entityLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <TopBar />
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
          <p className="mt-4 text-[var(--muted-foreground)]">
            Loading workflow history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-8">
      <TopBar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] shadow-sm mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <EntityIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                {entityData?.data?.title || "Workflow History"}
              </h1>
              <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                <span className="uppercase">{entityType}</span>
                {entityData?.data?.status && (
                  <>
                    <span>•</span>
                    <span className="px-2.5 py-1 rounded-full bg-blue-500 text-white text-xs font-medium">
                      {entityData.data.status}
                    </span>
                  </>
                )}
              </div>
              {entityData?.data?.description && (
                <p className="text-sm text-[var(--foreground)] mt-3">
                  {entityData.data.description}
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Timeline
            </h2>
            <WorkflowTimeline events={historyData?.data || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
