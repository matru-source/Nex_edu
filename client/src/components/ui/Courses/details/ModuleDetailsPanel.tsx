import { useQuery } from "@tanstack/react-query";
import api from "../../../../lib/axios/axios";
import { API_ROUTES } from "../../../../lib/api";
import SidePanel from "../../../lazy/SidePanel";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import useRouter from "../../../../hooks/useRouter";

interface ModuleDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  moduleId: string;
}

export default function ModuleDetailsPanel({
  isOpen,
  onClose,
  courseId,
  moduleId,
}: ModuleDetailsPanelProps) {
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const { data: courseData, isLoading } = useQuery({
    queryKey: ["course-full-structure", courseId],
    queryFn: async () => {
      const res = await api.get(
        API_ROUTES.COURSE.GET_COURSE_FULL_STRUCTURE(courseId)
      );
      return res.data.data;
    },
    enabled: isOpen && !!courseId && !!moduleId,
  });

  // Find the specific module from the course structure
  const module = courseData?.SkillCategory?.flatMap(
    (sc: any) => sc.Expertise?.flatMap((exp: any) => exp.Module || []) || []
  ).find((mod: any) => mod.id === moduleId);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <SidePanel
        isOpen={isOpen}
        onClose={onClose}
        title="Expertise Details"
        width="800px"
      >
        <div className="p-6">
          <div className="text-center text-[var(--muted-foreground)]">
            Loading...
          </div>
        </div>
      </SidePanel>
    );
  }

  if (!courseData || !module) {
    return (
      <SidePanel
        isOpen={isOpen}
        onClose={onClose}
        title="Expertise Details"
        width="800px"
      >
        <div className="p-6">
          <div className="text-center text-[var(--muted-foreground)]">
            No data found
          </div>
        </div>
      </SidePanel>
    );
  }

  const renderChapter = (chapter: any) => {
    const isExpanded = expandedItems.has(`ch-${chapter.id}`);
    const hasChildren = chapter.Lessons?.length > 0;

    return (
      <div
        key={chapter.id}
        className="border-b border-[var(--border)] last:border-b-0"
      >
        <div
          className="p-4 hover:bg-[var(--muted)]/30 transition-colors cursor-pointer"
          onClick={() => hasChildren && toggleExpand(`ch-${chapter.id}`)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              {hasChildren && (
                <button className="p-1 hover:bg-[var(--muted)] rounded">
                  {isExpanded ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
              )}
              <div className="flex-1">
                <h4 className="font-medium text-[var(--foreground)]">
                  {chapter.title}
                </h4>
                <p className="text-xs text-[var(--muted-foreground)] truncate">
                  Price: ${chapter.price}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/chapters/${moduleId}`, "Chapters");
              }}
              className="p-1.5 rounded-lg text-[var(--primary)] hover:bg-[var(--primary)]/10"
              title="View"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="pl-8 bg-[var(--muted)]/10">
            {chapter.Lessons?.map((lesson: any) => renderLesson(lesson))}
          </div>
        )}
      </div>
    );
  };

  const renderLesson = (lesson: any) => {
    return (
      <div
        key={lesson.id}
        className="p-4 border-b border-[var(--border)]/30 last:border-b-0 hover:bg-[var(--muted)]/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium text-[var(--foreground)] text-sm">
              {lesson.title}
            </p>
            {lesson.Video?.[0] && (
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Video: {Math.round(lesson.Video[0].duration / 60)} min
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={`${module.title} - Full Structure`}
      width="800px"
    >
      <div className="p-6">
        {/* Module Info */}
        <div className="mb-6 p-4 bg-[var(--muted)]/20 rounded-lg border border-[var(--border)]">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            {module.title}
          </h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            {module.description}
          </p>
        </div>

        {/* Chapters */}
        <div>
          <h3 className="text-md font-semibold text-[var(--foreground)] mb-4">
            Chapters ({module.Chapters?.length || 0})
          </h3>
          <div className="space-y-2">
            {module.Chapters?.map((chapter: any) => renderChapter(chapter))}
          </div>
        </div>
      </div>
    </SidePanel>
  );
}
