import { useQuery } from "@tanstack/react-query";
import api from "../../../../lib/axios/axios";
import { API_ROUTES } from "../../../../lib/api";
import SidePanel from "../../../lazy/SidePanel";
import {
  ChevronRight,
  ChevronDown,
  Layers,
  FileText,
  Video as VideoIcon,
  Play,
  Clock,
} from "lucide-react";
import { useState } from "react";

interface SkillCategoryDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  skillCategoryId: string;
}

export default function SkillCategoryDetailsPanel({
  isOpen,
  onClose,
  courseId,
  skillCategoryId,
}: SkillCategoryDetailsPanelProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const { data: courseData, isLoading } = useQuery({
    queryKey: ["course-full-structure", courseId],
    queryFn: async () => {
      const res = await api.get(
        API_ROUTES.COURSE.GET_COURSE_FULL_STRUCTURE(courseId)
      );
      return res.data.data;
    },
    enabled: isOpen && !!courseId && !!skillCategoryId,
  });

  const skillCategory = courseData?.SkillCategory?.find(
    (sc: any) => sc.id === skillCategoryId
  );

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
        title="Module Details"
        width="800px"
      >
        <div className="p-6 flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
            <p className="text-[var(--muted-foreground)]">Loading...</p>
          </div>
        </div>
      </SidePanel>
    );
  }

  if (!courseData || !skillCategory) {
    return (
      <SidePanel
        isOpen={isOpen}
        onClose={onClose}
        title="Module Details"
        width="800px"
      >
        <div className="p-6 flex items-center justify-center h-full">
          <div className="text-center text-[var(--muted-foreground)]">
            No data found
          </div>
        </div>
      </SidePanel>
    );
  }

  const renderExpertise = (expertise: any, idx: number) => {
    const isExpanded = expandedItems.has(`exp-${expertise.id}`);
    const hasChildren = expertise.Module?.length > 0;

    return (
      <div key={expertise.id} className="mb-4">
        {/* Level Badge */}
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[var(--muted)]/40 text-[var(--foreground)]/70 rounded-full text-xs font-bold uppercase tracking-wide border border-[var(--border)]/50">
            <Layers size={11} />
            Domain
          </span>
        </div>
        <div
          className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 shadow-sm"
          onClick={() => hasChildren && toggleExpand(`exp-${expertise.id}`)}
        >
          <div className="flex items-start gap-4 p-4">
            {expertise.tumbnailUrl && (
              <div className="flex-shrink-0">
                <img
                  src={expertise.tumbnailUrl}
                  alt={expertise.name}
                  className="w-20 h-20 rounded-lg object-cover border border-[var(--border)]"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3">
                {hasChildren && (
                  <button className="flex-shrink-0 p-0.5 hover:bg-[var(--muted)] rounded-lg transition-colors mt-0.5">
                    {isExpanded ? (
                      <ChevronDown
                        size={18}
                        className="text-[var(--primary)]"
                      />
                    ) : (
                      <ChevronRight
                        size={18}
                        className="text-[var(--primary)]"
                      />
                    )}
                  </button>
                )}
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-[var(--foreground)] mb-0.5">
                    {idx + 1}. {expertise.name}
                  </h4>
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 mb-2">
                    {expertise.description}
                  </p>
                  {hasChildren && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--primary)]">
                      <FileText size={12} />
                      <span>
                        {expertise.Module?.length} Modules
                        {expertise.Module?.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div className="mt-4 ml-6 space-y-3 border-l-3 border-[var(--primary)]/30 pl-6 py-2">
            {expertise.Module?.map((module: any, moduleIndex: number) =>
              renderModule(module, moduleIndex)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderModule = (module: any, moduleIndex: number) => {
    const isExpanded = expandedItems.has(`mod-${module.id}`);
    const hasChildren = module.Chapters?.length > 0;

    return (
      <div key={module.id} className="mb-3">
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[var(--muted)]/30 text-[var(--foreground)]/60 rounded-lg text-xs font-bold uppercase tracking-wide border border-[var(--border)]/40">
            <VideoIcon size={11} />
            Modules
          </span>
        </div>
        <div
          className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 shadow-sm"
          onClick={() => hasChildren && toggleExpand(`mod-${module.id}`)}
        >
          <div className="flex items-start gap-3 p-4">
            {module.tumbnailUrl && (
              <div className="flex-shrink-0">
                <img
                  src={module.tumbnailUrl}
                  alt={module.title}
                  className="w-16 h-16 rounded-lg object-cover border border-[var(--border)]"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                {hasChildren && (
                  <button className="flex-shrink-0 p-0.5 hover:bg-[var(--muted)] rounded transition-colors mt-0.5">
                    {isExpanded ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                )}
                <div className="flex-1">
                  <h5 className="text-sm font-semibold text-[var(--foreground)] mb-0.5">
                    Module {moduleIndex + 1}: {module.title}
                  </h5>
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 mb-2">
                    {module.description}
                  </p>
                  {hasChildren && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--primary)]">
                      <FileText size={11} />
                      <span>
                        {module.Chapters?.length} chapter
                        {module.Chapters?.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div className="mt-3 ml-6 space-y-2 border-l-2 border-[var(--border)]/50 pl-4 py-2">
            {module.Chapters?.map((chapter: any, chapterIndex: number) =>
              renderChapter(chapter, chapterIndex)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderChapter = (chapter: any, chapterIndex: number) => {
    const isExpanded = expandedItems.has(`ch-${chapter.id}`);
    const hasChildren = chapter.Lessons?.length > 0;

    return (
      <div key={chapter.id} className="mb-2">
        <div className="mb-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--muted)]/25 text-[var(--foreground)]/50 rounded text-xs font-bold uppercase tracking-wide border border-[var(--border)]/30">
            📄 Chapter
          </span>
        </div>
        <div
          className="bg-[var(--card)] border border-[var(--border)] rounded overflow-hidden cursor-pointer hover:shadow-sm transition-all duration-200 shadow-xs"
          onClick={() => hasChildren && toggleExpand(`ch-${chapter.id}`)}
        >
          <div className="flex items-start gap-3 p-3">
            {chapter.tumbnailUrl && (
              <div className="flex-shrink-0">
                <img
                  src={chapter.tumbnailUrl}
                  alt={chapter.title}
                  className="w-14 h-14 rounded object-cover border border-[var(--border)]"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                {hasChildren && (
                  <button className="flex-shrink-0 p-0.5 hover:bg-[var(--muted)] rounded transition-colors mt-0.5">
                    {isExpanded ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>
                )}
                <div className="flex-1">
                  <h6 className="text-sm font-semibold text-[var(--foreground)] mb-0.5">
                    Ch {chapterIndex + 1}: {chapter.title}
                  </h6>
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 mb-1">
                    Price: ${chapter.price}
                  </p>
                  {hasChildren && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--primary)]">
                      <VideoIcon size={11} />
                      <span>
                        {chapter.Lessons?.length} lesson
                        {chapter.Lessons?.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div className="mt-2 ml-5 space-y-1.5 border-l border-[var(--border)]/40 pl-3 py-1">
            {chapter.Lessons?.map((lesson: any, lessonIndex: number) =>
              renderLesson(lesson, lessonIndex)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderLesson = (lesson: any, lessonIndex: number) => {
    const videoDuration = lesson.Video?.[0]?.duration
      ? Math.floor(lesson.Video[0].duration / 60)
      : 0;

    return (
      <div
        key={lesson.id}
        className="bg-[var(--card)] border border-[var(--border)] rounded overflow-hidden hover:shadow-sm transition-all duration-200 shadow-xs"
      >
        <div className="flex items-start gap-2.5 p-2.5">
          {lesson.tumbnailUrl && (
            <div className="flex-shrink-0">
              <div className="relative w-12 h-12 rounded overflow-hidden border border-[var(--border)]">
                <img
                  src={lesson.tumbnailUrl}
                  alt={lesson.title}
                  className="w-full h-full object-cover"
                />
                {lesson.Video?.[0] && (
                  <div className="absolute inset-0 bg-[var(--foreground)]/20 flex items-center justify-center">
                    <Play
                      size={14}
                      className="text-[var(--primary)] fill-[var(--primary)]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h6 className="text-xs font-semibold text-[var(--foreground)] line-clamp-2 mb-0.5">
              L{lessonIndex + 1}: {lesson.title}
            </h6>
            {lesson.Video?.[0] && (
              <div className="flex items-center gap-1.5 mt-1 text-xs text-[var(--primary)] font-semibold">
                <Clock size={11} />
                <span>{videoDuration} min</span>
              </div>
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
       title={`${skillCategory.name} - Full Structure`}
       width="800px"
     >
       <div className="overflow-y-auto h-full bg-[var(--background)]">
         {/* Skill Category Header with Thumbnail */}
         <div className="relative pt-6">
           {skillCategory.tumbnailUrl && (
             <div className="relative w-full h-48 overflow-hidden">
               <img
                 src={skillCategory.tumbnailUrl}
                 alt={skillCategory.name}
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[var(--foreground)]/40 to-transparent"></div>
             </div>
           )}

           {/* Skill Category Info Card */}
           <div className="relative px-6 py-6 -mt-12 mx-6 bg-[var(--card)] rounded-xl shadow-lg border border-[var(--border)] z-10 mb-6">
             <div className="mb-2">
               <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--primary)]/15 text-[var(--primary)] rounded-full text-xs font-bold border border-[var(--primary)]/30">
                 <Layers size={12} />
                  Module
               </span>
             </div>
             <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">
               {skillCategory.name}
             </h2>
             <p className="text-sm text-[var(--muted-foreground)]">
               {skillCategory.description}
             </p>
           </div>
         </div>
         {/* Expertise */}
         <div className="px-6">
           <h3 className="text-md font-semibold text-[var(--foreground)] mb-4">
              Domain ({skillCategory.Expertise?.length || 0})
           </h3>
           <div className="space-y-2">
             {skillCategory.Expertise?.map((exp: any, idx: number) =>
               renderExpertise(exp, idx)
             )}
           </div>
         </div>
       </div>
     </SidePanel>
   );
}
