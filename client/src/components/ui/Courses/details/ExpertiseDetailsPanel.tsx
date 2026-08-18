import { useQuery } from "@tanstack/react-query";
import api from "../../../../lib/axios/axios";
import { API_ROUTES } from "../../../../lib/api";
import SidePanel from "../../../lazy/SidePanel";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import useRouter from "../../../../hooks/useRouter";

interface ExpertiseDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  expertiseId: string;
}

export default function ExpertiseDetailsPanel({
  isOpen,
  onClose,
  courseId,
  expertiseId,
}: ExpertiseDetailsPanelProps) {
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
   enabled: isOpen && !!courseId && !!expertiseId,
 });

 // Find the specific expertise from the course structure
 const expertise = courseData?.SkillCategory?.flatMap(
   (sc: any) => sc.Expertise || []
 ).find((exp: any) => exp.id === expertiseId);

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
       title="Domain Details"
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

 if (!courseData || !expertise) {
   return (
     <SidePanel
       isOpen={isOpen}
       onClose={onClose}
       title="Domain Details"
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

  const renderModule = (module: any) => {
    const isExpanded = expandedItems.has(`mod-${module.id}`);
    const hasChildren = module.Chapters?.length > 0;

    return (
      <div
        key={module.id}
        className="border-b border-[var(--border)] last:border-b-0"
      >
        <div
          className="p-4 hover:bg-[var(--muted)]/30 transition-colors cursor-pointer"
          onClick={() => hasChildren && toggleExpand(`mod-${module.id}`)}
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
                  {module.title}
                </h4>
                <p className="text-sm text-[var(--muted-foreground)] truncate">
                  {module.description}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/module/${expertiseId}`, "Module");
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
            {module.Chapters?.map((chapter: any) => renderChapter(chapter))}
          </div>
        )}
      </div>
    );
  };

  const renderChapter = (chapter: any) => {
    const isExpanded = expandedItems.has(`ch-${chapter.id}`);
    const hasChildren = chapter.Lessons?.length > 0;

    return (
      <div
        key={chapter.id}
        className="border-b border-[var(--border)]/50 last:border-b-0"
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
                <h5 className="font-medium text-[var(--foreground)]">
                  {chapter.title}
                </h5>
                <p className="text-xs text-[var(--muted-foreground)] truncate">
                  Price: ${chapter.price}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/chapters/${chapter.moduleId}`, "Chapters");
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
      title={`${expertise.name} - Full Structure`}
      width="800px"
    >
      <div className="p-6">
        {/* Expertise Info */}
        <div className="mb-6 p-4 bg-[var(--muted)]/20 rounded-lg border border-[var(--border)]">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            {expertise.name}
          </h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            {expertise.description}
          </p>
        </div>

        {/* Modules */}
        <div>
          <h3 className="text-md font-semibold text-[var(--foreground)] mb-4">
            Expertise ({expertise.Module?.length || 0})
          </h3>
          <div className="space-y-2">
            {expertise.Module?.map((mod: any) => renderModule(mod))}
          </div>
        </div>
      </div>
    </SidePanel>
  );
}
