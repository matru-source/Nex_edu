import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  Folder,
  Video as VideoIcon,
  Award,
  Clock,
  Eye,
  Layers,
} from "lucide-react";
import type {
  Chapters,
  Expertise,
  Lessons,
  Module,
  SkillCategory,
  Video,
} from "../../../types";
import { formatDuration } from "../../../utils/formatDuration";

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export type FocusType = "course" | "skillcategory" | "expertise" | "module" | "chapter";

export interface FocusedItem {
  type: FocusType;
  id: string;
}

interface SkillCategoryWithNested extends SkillCategory {
  Expertise: (Expertise & {
    Module: (Module & {
      Chapters: (Chapters & {
        Lessons?: (Lessons & { Video?: Video[] })[];
      })[];
    })[];
  })[];
}

interface CourseCurriculumSectionProps {
  skillCategories: SkillCategoryWithNested[];
  focusedItem?: FocusedItem | null;
}

// ============================================================
// UTILITY HELPERS
// ============================================================

const calculateChapterDuration = (
  chapter: Chapters & { Lessons?: (Lessons & { Video?: Video[] })[] }
): number => {
  if (!chapter.Lessons || chapter.Lessons.length === 0) return 0;
  return chapter.Lessons.reduce((total, lesson) => {
    const video = lesson.Video?.[0];
    return total + (video?.duration || 0);
  }, 0);
};

const countChaptersInSkill = (skill: SkillCategoryWithNested): number =>
  skill.Expertise.reduce(
    (t: number, exp: Expertise & { Module: (Module & { Chapters: Chapters[] })[] }) =>
      t + exp.Module.reduce((mt: number, mod: Module & { Chapters: Chapters[] }) => mt + mod.Chapters.length, 0),
    0
  );

// ============================================================
// SUB-COMPONENTS
// ============================================================

function ChapterItem({
  chapter,
  chapterIndex,
}: {
  chapter: Chapters & { Lessons?: (Lessons & { Video?: Video[] })[] };
  chapterIndex: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const duration = calculateChapterDuration(chapter);

  return (
    <div className="group/chapter flex items-center justify-between p-4 bg-card rounded-xl border border-border/60 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="flex items-center justify-center w-8 h-8 bg-muted text-muted-foreground rounded-lg text-xs font-bold flex-shrink-0 group-hover/chapter:bg-primary group-hover/chapter:text-primary-foreground group-hover/chapter:scale-105 transition-all duration-200 border border-border/50">
          <VideoIcon size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <h6 className="text-sm font-semibold text-foreground group-hover/chapter:text-primary transition-colors mb-1">
            Chapter {chapterIndex + 1}: {chapter.title}
          </h6>
          {duration > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Clock size={11} />
              <span>{formatDuration(duration)}</span>
            </div>
          )}
          {chapter.content && (
            <div>
              <p
                className={`text-xs text-muted-foreground leading-relaxed transition-colors ${
                  expanded ? "" : "line-clamp-2"
                }`}
              >
                {chapter.content}
              </p>
              {chapter.content.length > 150 && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors mt-1"
                >
                  {expanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
        {chapter.price != null && chapter.price > 0 ? (
          <span className="text-sm font-bold text-primary">${chapter.price}</span>
        ) : (
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
            Free
          </span>
        )}
      </div>
    </div>
  );
}

function ModuleBlock({
  module,
  modIndex,
  defaultExpanded = false,
}: {
  module: Module & {
    Chapters: (Chapters & { Lessons?: (Lessons & { Video?: Video[] })[] })[];
  };
  modIndex: number;
  defaultExpanded?: boolean;
}) {
  const [open, setOpen] = useState(defaultExpanded);
  const [descExpanded, setDescExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full group text-left mb-3 flex items-center justify-between gap-4 p-4 bg-card rounded-xl border border-border/60 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex items-center justify-center w-9 h-9 bg-primary/10 text-primary rounded-lg text-xs font-bold flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105 transition-all duration-200 border border-primary/20">
            <Folder size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors mb-1">
              Module {modIndex + 1}: {module.title}
            </h5>
            <div>
              <p
                className={`text-muted-foreground text-xs leading-relaxed ${
                  descExpanded ? "" : "line-clamp-1"
                }`}
              >
                {module.description}
              </p>
              {module.description.length > 100 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDescExpanded((v) => !v);
                  }}
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  {descExpanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
            {module.Chapters.length} ch
          </span>
          <ChevronDown
            size={18}
            className={`text-muted-foreground group-hover:text-primary transition-all duration-300 ${
              open ? "rotate-180 text-primary" : ""
            }`}
          />
        </div>
      </button>

      {open && (
        <div className="space-y-2 ml-4 animate-in slide-in-from-top-2 duration-300 mb-3">
          {module.Chapters.map((chapter: Chapters & { Lessons?: (Lessons & { Video?: Video[] })[] }, chapterIndex: number) => (
            <ChapterItem
              key={chapter.id}
              chapter={chapter}
              chapterIndex={chapterIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ExpertiseBlock({
  expertise,
  expIndex,
  skillIndex,
  defaultExpanded = false,
}: {
  expertise: Expertise & {
    Module: (Module & {
      Chapters: (Chapters & { Lessons?: (Lessons & { Video?: Video[] })[] })[];
    })[];
  };
  expIndex: number;
  skillIndex: number;
  defaultExpanded?: boolean;
}) {
  const [open, setOpen] = useState(defaultExpanded);
  const [descExpanded, setDescExpanded] = useState(false);
  const totalChapters = expertise.Module.reduce(
    (t: number, mod: Module & { Chapters: Chapters[] }) => t + mod.Chapters.length,
    0
  );

  return (
    <div className="last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-6 py-5 hover:bg-muted/40 transition-all duration-200 text-left group"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 bg-muted text-muted-foreground rounded-xl text-sm font-bold flex-shrink-0 group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-105 transition-all duration-200 border border-border/50">
              {skillIndex + 1}.{expIndex + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                {expertise.name}
              </h4>
              <div>
                <p
                  className={`text-muted-foreground text-sm leading-relaxed ${
                    descExpanded ? "" : "line-clamp-2"
                  }`}
                >
                  {expertise.description}
                </p>
                {expertise.description.length > 150 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDescExpanded((v) => !v);
                    }}
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors mt-1"
                  >
                    {descExpanded ? "Show less" : "Show more"}
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border/50">
              {totalChapters} ch
            </span>
            <ChevronDown
              size={20}
              className={`text-muted-foreground group-hover:text-primary flex-shrink-0 transition-all duration-300 ${
                open ? "rotate-180 text-primary" : ""
              }`}
            />
          </div>
        </div>
      </button>

      {open && (
        <div className="bg-muted/20 px-6 py-5 border-t border-border/40 space-y-3">
          {expertise.Module.map((module: Module & { Chapters: (Chapters & { Lessons?: (Lessons & { Video?: Video[] })[] })[] }, modIndex: number) => (
            <ModuleBlock
              key={module.id}
              module={module}
              modIndex={modIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// FOCUSED VIEWS
// ============================================================

/** Show a single SkillCategory with its full nested content */
function FocusedSkillCategoryView({
  skillCategory,
  skillIndex,
}: {
  skillCategory: SkillCategoryWithNested;
  skillIndex: number;
}) {
  return (
    <div className="bg-card rounded-2xl shadow-md border border-border/60 overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-muted/30 px-6 py-6 border-b border-border/50">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-xl text-lg font-bold shadow-lg flex-shrink-0">
            {skillIndex + 1}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-foreground mb-2">
              {skillCategory.name}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {skillCategory.description}
            </p>
            <div className="flex gap-4 mt-3 flex-wrap text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 bg-background/50 px-2.5 py-1 rounded-full">
                <Award size={14} className="text-primary" />
                <span className="font-medium">
                  {skillCategory.Expertise.length} Domains
                </span>
              </span>
              <span className="flex items-center gap-1.5 bg-background/50 px-2.5 py-1 rounded-full">
                <BookOpen size={14} className="text-primary" />
                <span className="font-medium">
                  {countChaptersInSkill(skillCategory)} Chapters
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="divide-y divide-border/40">
        {skillCategory.Expertise.map((exp, expIndex) => (
          <ExpertiseBlock
            key={exp.id}
            expertise={exp}
            expIndex={expIndex}
            skillIndex={skillIndex}
          />
        ))}
      </div>
    </div>
  );
}

/** Show a single Expertise with its modules */
function FocusedExpertiseView({
  expertise,
  skillIndex,
  expIndex,
}: {
  expertise: Expertise & {
    Module: (Module & {
      Chapters: (Chapters & { Lessons?: (Lessons & { Video?: Video[] })[] })[];
    })[];
  };
  skillIndex: number;
  expIndex: number;
}) {
  const totalChapters = expertise.Module.reduce(
    (t: number, mod: Module & { Chapters: Chapters[] }) => t + mod.Chapters.length,
    0
  );
  return (
    <div className="bg-card rounded-2xl shadow-md border border-border/60 overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-muted/30 px-6 py-6 border-b border-border/50">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-primary/20 text-primary rounded-xl text-sm font-bold flex-shrink-0 border border-primary/30">
            {skillIndex + 1}.{expIndex + 1}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-foreground mb-2">
              {expertise.name}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {expertise.description}
            </p>
            <div className="flex gap-4 mt-3 flex-wrap text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 bg-background/50 px-2.5 py-1 rounded-full">
                <Layers size={14} className="text-primary" />
                <span className="font-medium">
                  {expertise.Module.length} Modules
                </span>
              </span>
              <span className="flex items-center gap-1.5 bg-background/50 px-2.5 py-1 rounded-full">
                <BookOpen size={14} className="text-primary" />
                <span className="font-medium">{totalChapters} Chapters</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 py-5 space-y-3">
        {expertise.Module.map((module: Module & { Chapters: (Chapters & { Lessons?: (Lessons & { Video?: Video[] })[] })[] }, modIndex: number) => (
          <ModuleBlock
            key={module.id}
            module={module}
            modIndex={modIndex}
            defaultExpanded={expertise.Module.length === 1}
          />
        ))}
      </div>
    </div>
  );
}

/** Show a single Module with its chapters */
function FocusedModuleView({
  module,
  modIndex,
}: {
  module: Module & {
    Chapters: (Chapters & { Lessons?: (Lessons & { Video?: Video[] })[] })[];
  };
  modIndex: number;
}) {
  return (
    <div className="bg-card rounded-2xl shadow-md border border-border/60 overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-muted/30 px-6 py-6 border-b border-border/50">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-primary/15 text-primary rounded-xl flex-shrink-0 border border-primary/25">
            <Folder size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-foreground mb-2">
              Module {modIndex + 1}: {module.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {module.description}
            </p>
            <div className="flex gap-4 mt-3 flex-wrap text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 bg-background/50 px-2.5 py-1 rounded-full">
                <BookOpen size={14} className="text-primary" />
                <span className="font-medium">
                  {module.Chapters.length} Chapters
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 py-5 space-y-3">
        {module.Chapters.map((chapter: Chapters & { Lessons?: (Lessons & { Video?: Video[] })[] }, chapterIndex: number) => (
          <ChapterItem
            key={chapter.id}
            chapter={chapter}
            chapterIndex={chapterIndex}
          />
        ))}
      </div>
    </div>
  );
}

/** Show a single Chapter's details */
function FocusedChapterView({
  chapter,
  chapterIndex,
}: {
  chapter: Chapters & { Lessons?: (Lessons & { Video?: Video[] })[] };
  chapterIndex: number;
}) {
  const duration = calculateChapterDuration(chapter);
  return (
    <div className="bg-card rounded-2xl shadow-md border border-border/60 overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-muted/30 px-6 py-6 border-b border-border/50">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-primary/15 text-primary rounded-xl flex-shrink-0 border border-primary/25">
            <VideoIcon size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-foreground mb-2">
              Chapter {chapterIndex + 1}: {chapter.title}
            </h3>
            {chapter.content && (
              <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                {chapter.content}
              </p>
            )}
            <div className="flex gap-4 flex-wrap text-xs text-muted-foreground">
              {duration > 0 && (
                <span className="flex items-center gap-1.5 bg-background/50 px-2.5 py-1 rounded-full">
                  <Clock size={14} className="text-primary" />
                  <span className="font-medium">{formatDuration(duration)}</span>
                </span>
              )}
              {chapter.price != null && chapter.price > 0 ? (
                <span className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20 font-medium">
                  ${chapter.price}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20 font-medium">
                  Free
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      {chapter.Lessons && chapter.Lessons.length > 0 && (
        <div className="px-6 py-5">
          <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Lessons in this chapter
          </h4>
          <div className="space-y-2">
            {chapter.Lessons.map((lesson, lessonIndex) => {
              const lessonDuration = lesson.Video?.[0]?.duration;
              return (
                <div
                  key={lesson.id}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50"
                >
                  <div className="flex items-center justify-center w-7 h-7 bg-primary/10 text-primary rounded-md text-xs font-bold flex-shrink-0 border border-primary/20">
                    {lessonIndex + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {lesson.title}
                    </p>
                  </div>
                  {lessonDuration && lessonDuration > 0 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
                      <Clock size={11} />
                      {formatDuration(lessonDuration)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// FULL CURRICULUM VIEW (all skill categories)
// ============================================================

function FullCurriculumView({
  skillCategories,
}: {
  skillCategories: SkillCategoryWithNested[];
}) {
  if (skillCategories.length === 0) {
    return (
      <div className="text-center py-20 bg-card rounded-2xl shadow-sm border border-border/60">
        <div className="text-muted-foreground mb-4">
          <BookOpen className="w-20 h-20 mx-auto opacity-50" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No Curriculum Available
        </h3>
        <p className="text-muted-foreground">
          The Value Stream curriculum will be available soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {skillCategories.map((skillCategory, skillIndex) => (
        <div
          key={skillCategory.id}
          className="bg-card rounded-2xl shadow-md border border-border/60 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300"
        >
          {/* Skill Category Header */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-muted/20 px-6 py-6 border-b border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-xl text-lg font-bold shadow-lg flex-shrink-0">
                {skillIndex + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {skillCategory.name}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                  {skillCategory.description}
                </p>
                <div className="flex gap-4 mt-3 flex-wrap text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 bg-background/50 px-2.5 py-1 rounded-full">
                    <Award size={14} className="text-primary" />
                    <span className="font-medium">
                      {skillCategory.Expertise.length} Domains
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 bg-background/50 px-2.5 py-1 rounded-full">
                    <BookOpen size={14} className="text-primary" />
                    <span className="font-medium">
                      {countChaptersInSkill(skillCategory)} Chapters
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Expertise Sections */}
          <div className="divide-y divide-border/40">
            {skillCategory.Expertise.map((expertise, expIndex) => (
              <ExpertiseBlock
                key={expertise.id}
                expertise={expertise}
                expIndex={expIndex}
                skillIndex={skillIndex}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// MAIN EXPORT — CourseCurriculumSection
// ============================================================

export default function CourseCurriculumSection({
  skillCategories,
  focusedItem,
}: CourseCurriculumSectionProps) {
  const [showAll, setShowAll] = useState(false);

  // Determine if we are in focused mode
  const isFocused = focusedItem != null && focusedItem.type !== "course";

  // Helper: find the focused node within the tree
  const findFocusedNodes = () => {
    for (
      let skillIndex = 0;
      skillIndex < skillCategories.length;
      skillIndex++
    ) {
      const skill = skillCategories[skillIndex];
      if (focusedItem?.type === "skillcategory" && skill.id === focusedItem.id) {
        return { skill, skillIndex, expertise: null, module: null, chapter: null, expertiseIndex: -1, moduleIndex: -1, chapterIndex: -1 };
      }
      for (let expIndex = 0; expIndex < skill.Expertise.length; expIndex++) {
        const exp = skill.Expertise[expIndex];
        if (focusedItem?.type === "expertise" && exp.id === focusedItem.id) {
          return { skill, skillIndex, expertise: exp, expertiseIndex: expIndex, module: null, moduleIndex: -1, chapter: null, chapterIndex: -1 };
        }
        for (let modIndex = 0; modIndex < exp.Module.length; modIndex++) {
          const mod = exp.Module[modIndex];
          if (focusedItem?.type === "module" && mod.id === focusedItem.id) {
            return { skill, skillIndex, expertise: exp, expertiseIndex: expIndex, module: mod, moduleIndex: modIndex, chapter: null, chapterIndex: -1 };
          }
          for (let chapIndex = 0; chapIndex < mod.Chapters.length; chapIndex++) {
            const chap = mod.Chapters[chapIndex];
            if (focusedItem?.type === "chapter" && chap.id === focusedItem.id) {
              return { skill, skillIndex, expertise: exp, expertiseIndex: expIndex, module: mod, moduleIndex: modIndex, chapter: chap, chapterIndex: chapIndex };
            }
          }
        }
      }
    }
    return null;
  };

  const focused = isFocused ? findFocusedNodes() : null;

  const totalChapters = skillCategories.reduce(
    (t, skill) => t + countChaptersInSkill(skill),
    0
  );

  // --------------------------------------------------------
  // RENDER
  // --------------------------------------------------------
  return (
    <div>
      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
          <div>
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary" />
              {isFocused && !showAll ? (
                <>
                  {focusedItem?.type === "skillcategory" && "Module Details"}
                  {focusedItem?.type === "expertise" && "Domain Details"}
                  {focusedItem?.type === "module" && "Module Details"}
                  {focusedItem?.type === "chapter" && "Chapter Details"}
                </>
              ) : (
                "Value Stream Curriculum"
              )}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-4 ml-11 flex-wrap">
          <p className="text-muted-foreground text-sm">
            {isFocused && !showAll
              ? "Viewing focused content below"
              : `Structured learning path with ${totalChapters} chapters across ${skillCategories.length} Modules`}
          </p>
          {/* Toggle — only show when focused */}
          {isFocused && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
            >
              <Eye
                size={13}
                className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0"
              />
              <span className="underline underline-offset-2 decoration-dotted">
                {showAll
                  ? "show focused view only"
                  : "see all content of this value stream"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isFocused && !showAll ? (
        <div className="space-y-6">
          {focused ? (
            <>
              {focusedItem?.type === "skillcategory" && focused.skill && (
                <FocusedSkillCategoryView
                  skillCategory={focused.skill}
                  skillIndex={focused.skillIndex}
                />
              )}
              {focusedItem?.type === "expertise" && focused.expertise && (
                <FocusedExpertiseView
                  expertise={focused.expertise}
                  skillIndex={focused.skillIndex}
                  expIndex={focused.expertiseIndex}
                />
              )}
              {focusedItem?.type === "module" && focused.module && (
                <FocusedModuleView
                  module={focused.module}
                  modIndex={focused.moduleIndex}
                />
              )}
              {focusedItem?.type === "chapter" && focused.chapter && (
                <FocusedChapterView
                  chapter={focused.chapter}
                  chapterIndex={focused.chapterIndex}
                />
              )}
            </>
          ) : (
            // Focused item not found — fall back to full view
            <FullCurriculumView skillCategories={skillCategories} />
          )}
        </div>
      ) : (
        <FullCurriculumView skillCategories={skillCategories} />
      )}
    </div>
  );
}
