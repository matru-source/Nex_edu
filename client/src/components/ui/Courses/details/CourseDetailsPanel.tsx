import { useQuery } from "@tanstack/react-query";
import api from "../../../../lib/axios/axios";
import { API_ROUTES } from "../../../../lib/api";
import SidePanel from "../../../lazy/SidePanel";
import {
  ChevronRight,
  ChevronDown,
  Play,
  Clock,
  BookOpen,
  Layers,
  FileText,
  Video as VideoIcon,
} from "lucide-react";
import { useState } from "react";

interface CourseDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  level?: "course" | "skillCategory" | "expertise" | "module" | "chapter";
  levelId?: string;
}

export default function CourseDetailsPanel({
  isOpen,
  onClose,
  courseId,
}: CourseDetailsPanelProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ["course-full-structure", courseId],
    queryFn: async () => {
      const res = await api.get(
        API_ROUTES.COURSE.GET_COURSE_FULL_STRUCTURE(courseId)
      );
      return res.data.data;
    },
    enabled: isOpen && !!courseId,
  });

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
        title="Value Stream Details"
        width="900px"
      >
        <div className="p-6 flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
            <p className="text-[var(--muted-foreground)]">
              Loading course structure...
            </p>
          </div>
        </div>
      </SidePanel>
    );
  }

  if (!data) {
    return (
      <SidePanel
        isOpen={isOpen}
        onClose={onClose}
        title="Value Stream Details"
        width="900px"
      >
        <div className="p-6 flex items-center justify-center h-full">
          <div className="text-center text-[var(--muted-foreground)]">
            No course structure found
          </div>
        </div>
      </SidePanel>
    );
  }

  const renderSkillCategory = (skillCategory: any, index: number) => {
    const isExpanded = expandedItems.has(`sc-${skillCategory.id}`);
    const hasChildren = skillCategory.Expertise?.length > 0;

    return (
      <div key={skillCategory.id} className="mb-6">
        <div className="relative">
          {/* Level Badge */}
          <div className="mb-2 ml-0">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--primary)]/15 text-[var(--primary)] rounded-full text-xs font-bold uppercase tracking-wider border border-[var(--primary)]/30">
              <Layers size={12} />
              Module
            </span>
          </div>

          {/* Skill Category Card */}
          <div
            className="relative bg-gradient-to-r from-[var(--primary)]/12 to-transparent border-l-4 border-[var(--primary)] rounded-r-xl overflow-hidden cursor-pointer hover:from-[var(--primary)]/18 transition-all duration-200 shadow-sm hover:shadow-md"
            onClick={() =>
              hasChildren && toggleExpand(`sc-${skillCategory.id}`)
            }
          >
            <div className="flex items-start gap-4 p-5">
              {/* Thumbnail */}
              {skillCategory.tumbnailUrl && (
                <div className="flex-shrink-0">
                  <img
                    src={skillCategory.tumbnailUrl}
                    alt={skillCategory.name}
                    className="w-28 h-28 rounded-xl object-cover border border-[var(--border)] shadow-md"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  {hasChildren && (
                    <button className="flex-shrink-0 p-1 hover:bg-[var(--primary)]/20 rounded-lg transition-colors mt-1">
                      {isExpanded ? (
                        <ChevronDown
                          size={22}
                          className="text-[var(--primary)]"
                        />
                      ) : (
                        <ChevronRight
                          size={22}
                          className="text-[var(--primary)]"
                        />
                      )}
                    </button>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">
                      {index + 1}. {skillCategory.name}
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-3">
                      {skillCategory.description}
                    </p>
                    {hasChildren && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-[var(--primary)]">
                        <BookOpen size={14} />
                        <span>
                          {skillCategory.Expertise?.length} Domain path
                          {skillCategory.Expertise?.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && hasChildren && (
            <div className="mt-4 ml-6 space-y-4 border-l-3 border-[var(--primary)]/40 pl-6 py-2">
              {skillCategory.Expertise?.map((expertise: any) =>
                renderExpertise(expertise)
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderExpertise = (expertise: any) => {
    const isExpanded = expandedItems.has(`exp-${expertise.id}`);
    const hasChildren = expertise.Module?.length > 0;

    return (
      <div key={expertise.id} className="relative mb-4">
        {/* Level Badge */}
        <div className="mb-2 ml-0">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[var(--muted)]/40 text-[var(--foreground)]/70 rounded-full text-xs font-bold uppercase tracking-wide border border-[var(--border)]/50">
            <Layers size={11} />
            Domain
          </span>
        </div>

        {/* Expertise Card */}
        <div
          className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 shadow-sm"
          onClick={() => hasChildren && toggleExpand(`exp-${expertise.id}`)}
        >
          <div className="flex items-start gap-4 p-4">
            {/* Thumbnail */}
            {expertise.tumbnailUrl && (
              <div className="flex-shrink-0">
                <img
                  src={expertise.tumbnailUrl}
                  alt={expertise.name}
                  className="w-20 h-20 rounded-lg object-cover border border-[var(--border)]"
                />
              </div>
            )}

            {/* Content */}
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
                    {expertise.name}
                  </h4>
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 mb-2">
                    {expertise.description}
                  </p>
                  {hasChildren && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--primary)]">
                      <FileText size={12} />
                      <span>
                        {expertise.Module?.length} Expertise
                        {expertise.Module?.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Modules */}
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
      <div key={module.id} className="relative mb-3">
        {/* Level Badge */}
        <div className="mb-2 ml-0">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[var(--muted)]/30 text-[var(--foreground)]/60 rounded-lg text-xs font-bold uppercase tracking-wide border border-[var(--border)]/40">
            <VideoIcon size={11} />
            Expertise
          </span>
        </div>

        {/* Module Card */}
        <div
          className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 shadow-sm"
          onClick={() => hasChildren && toggleExpand(`mod-${module.id}`)}
        >
          <div className="flex items-start gap-3 p-4">
            {/* Thumbnail */}
            {module.tumbnailUrl && (
              <div className="flex-shrink-0">
                <img
                  src={module.tumbnailUrl}
                  alt={module.title}
                  className="w-16 h-16 rounded-lg object-cover border border-[var(--border)]"
                />
              </div>
            )}

            {/* Content */}
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
                    Expertise {moduleIndex + 1}: {module.title}
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

        {/* Expanded Chapters */}
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
      <div key={chapter.id} className="relative mb-2">
        {/* Level Badge */}
        <div className="mb-1.5 ml-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--muted)]/25 text-[var(--foreground)]/50 rounded text-xs font-bold uppercase tracking-wide border border-[var(--border)]/30">
            📄 Chapter
          </span>
        </div>

        {/* Chapter Card */}
        <div
          className="bg-[var(--card)] border border-[var(--border)] rounded overflow-hidden cursor-pointer hover:shadow-sm transition-all duration-200 shadow-xs"
          onClick={() => hasChildren && toggleExpand(`ch-${chapter.id}`)}
        >
          <div className="flex items-start gap-3 p-3">
            {/* Thumbnail */}
            {chapter.tumbnailUrl && (
              <div className="flex-shrink-0">
                <img
                  src={chapter.tumbnailUrl}
                  alt={chapter.title}
                  className="w-14 h-14 rounded object-cover border border-[var(--border)]"
                />
              </div>
            )}

            {/* Content */}
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
                    {chapter.content}
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

        {/* Expanded Lessons */}
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
          {/* Thumbnail */}
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

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h6 className="text-xs font-semibold text-[var(--foreground)] line-clamp-2 mb-0.5">
              L{lessonIndex + 1}: {lesson.title}
            </h6>
            <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">
              {lesson.content}
            </p>
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
      title={`${data.title}`}
      width="900px"
    >
      <div className="overflow-y-auto h-full bg-[var(--background)]">
        {/* Course Header with Thumbnail */}
        <div className="relative pt-6">
          {data.tumbnailUrl && (
            <div className="relative w-full h-56 overflow-hidden">
              <img
                src={data.tumbnailUrl}
                alt={data.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--foreground)]/40 to-transparent"></div>
            </div>
          )}

          {/* Course Info Card */}
          <div className="relative px-6 py-6 -mt-12 mx-6 bg-[var(--card)] rounded-xl shadow-lg border border-[var(--border)] z-10">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              {data.title}
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-4 leading-relaxed">
              {data.description}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-4 py-2 bg-[var(--primary)]/15 text-[var(--primary)] rounded-full text-xs font-bold border border-[var(--primary)]/30 inline-flex items-center gap-1">
                <span>📂</span> {data.category.name}
              </span>
              <span className="px-4 py-2 bg-[var(--muted)]/30 text-[var(--foreground)]/70 rounded-full text-xs font-bold border border-[var(--border)] inline-flex items-center gap-1">
                <span>🏷️</span> {data.subCategory.name}
              </span>
              
              {/* Flags */}
              {data.flags && data.flags.length > 0 && (
                <>
                  {data.flags.map((flag: string) => (
                    <span 
                      key={flag} 
                      className="px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold border border-purple-500/20 inline-flex items-center gap-1 shadow-sm"
                      title={flag}
                    >
                      <span>🚩</span> {flag.replace(/_/g, " ")}
                    </span>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-8 mt-8">
          {/* Skill Categories */}
          {data.SkillCategory && data.SkillCategory.length > 0 && (
            <div>
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-[var(--foreground)]">
                    📖 Learning Paths
                  </h3>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Explore {data.SkillCategory.length} structured Module
                  categories designed for different Expertise levels
                </p>
              </div>

              <div className="space-y-6">
                {data.SkillCategory.map((sc: any, index: number) =>
                  renderSkillCategory(sc, index)
                )}
              </div>
            </div>
          )}

          {(!data.SkillCategory || data.SkillCategory.length === 0) && (
            <div className="text-center py-16 bg-[var(--muted)]/10 rounded-xl border-2 border-[var(--border)] border-dashed">
              <BookOpen
                size={48}
                className="mx-auto text-[var(--muted-foreground)] opacity-40 mb-3"
              />
              <p className="text-[var(--muted-foreground)] font-medium">
                No Modules available yet
              </p>
              <p className="text-xs text-[var(--muted-foreground)] opacity-70 mt-1">
                Check back soon for learning content
              </p>
            </div>
          )}
        </div>
      </div>
    </SidePanel>
  );
}
