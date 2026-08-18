import { useMemo, useState, type JSX } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import {
  SkillCategoryCard,
  ExpertiseCard,
  ModuleCard,
  ChapterCardVertical,
  CourseCardSkeleton,
} from "../../pages/students/course/CourseCard";
import { ChevronRight } from "lucide-react";

const MAX_VISIBLE = 3;
const MAX_ITEMS = 12;

type CarouselProps = {
  items: any[];
  loading: boolean;
  index: number;
  setIndex: (v: number) => void;
  renderCard: (item: any) => JSX.Element;
  skeletonHeight?: string;
  viewAllLink?: string;
  totalCount?: number;
};

const Carousel = ({
  items,
  loading,
  index,
  setIndex,
  renderCard,
  skeletonHeight = "h-96",
  viewAllLink,
  totalCount = 0,
}: CarouselProps) => {
  const navigate = useNavigate();
  const totalPages = Math.max(1, Math.ceil(items.length / MAX_VISIBLE));
  const pageStart = index * MAX_VISIBLE;
  const pageItems = items.slice(pageStart, pageStart + MAX_VISIBLE);
  const hasMore = totalCount > MAX_ITEMS;

  return (
    <div className="relative w-full pt-2 pb-20">
      {/* Cards Grid with proper spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
        {loading
          ? Array.from({ length: MAX_VISIBLE }).map((_, i) => (
            <div
              key={i}
              className={`${skeletonHeight} rounded-2xl flex-shrink-0`}
            >
              <CourseCardSkeleton />
            </div>
          ))
          : pageItems.map((item) => (
            <div key={item.id || item.title} className="flex justify-center">
              <div className="w-full max-w-sm">{renderCard(item)}</div>
            </div>
          ))}
      </div>

      {/* Navigation Controls - Carousel Indicators */}
      {!loading && totalPages > 1 && (
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-6 mt-8">
          {/* Left Arrow Button */}
          <button
            onClick={() => setIndex((index - 1 + totalPages) % totalPages)}
            className="w-10 h-10 rounded-full bg-[var(--card)] border border-[var(--border)] shadow hover:shadow-lg hover:border-[var(--primary)] transition-all duration-300 flex items-center justify-center text-[var(--foreground)] hover:text-[var(--primary)]"
            aria-label="Previous"
          >
            ←
          </button>

          {/* Dot Indicators - Sliding Window */}
          <div className="flex items-center gap-2.5 overflow-hidden">
            {(() => {
              const maxDots = 7;
              let start = 0;
              let end = totalPages;

              if (totalPages > maxDots) {
                start = Math.max(0, Math.min(index - 3, totalPages - maxDots));
                end = start + maxDots;
              }

              return Array.from({ length: end - start }).map((_, i) => {
                const pageIndex = start + i;
                return (
                  <button
                    key={pageIndex}
                    onClick={() => setIndex(pageIndex)}
                    className={`transition-all duration-300 rounded-full flex-shrink-0 ${pageIndex === index
                      ? "w-8 h-3 bg-[var(--primary)]"
                      : "w-3 h-3 bg-[var(--muted-foreground)]/30 hover:bg-[var(--muted-foreground)]/60"
                      }`}
                    aria-label={`Page ${pageIndex + 1}`}
                  />
                );
              });
            })()}
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={() => setIndex((index + 1) % totalPages)}
            className="w-10 h-10 rounded-full bg-[var(--card)] border border-[var(--border)] shadow hover:shadow-lg hover:border-[var(--primary)] transition-all duration-300 flex items-center justify-center text-[var(--foreground)] hover:text-[var(--primary)]"
            aria-label="Next"
          >
            →
          </button>
        </div>
      )}

      {/* View All Button */}
      {!loading && viewAllLink && hasMore && (
        <div className="absolute -bottom-16 right-0">
          <button
            onClick={() => navigate(viewAllLink)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary)]/80 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 rounded-lg transition-all duration-300 group"
          >
            View All
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};

export default function CourseLevelsSection() {
  const navigate = useNavigate();

  const { data: skillCategories = [], isLoading: loadingSkills } = useQuery({
    queryKey: ["landing-skill-categories"],
    queryFn: async () => {
      const res = await api.get(
        API_ROUTES.COURSE.GET_PUBLIC_SKILL_CATEGORIES_ALL
      );
      return res.data.data ?? [];
    },
  });

  const { data: expertise = [], isLoading: loadingExpertise } = useQuery({
    queryKey: ["landing-expertise"],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.COURSE.GET_PUBLIC_EXPERTISE_ALL);
      return res.data.data ?? [];
    },
  });

  const { data: modules = [], isLoading: loadingModules } = useQuery({
    queryKey: ["landing-modules"],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.COURSE.GET_PUBLIC_MODULES_ALL);
      return res.data.data ?? [];
    },
  });

  const { data: chapters = [], isLoading: loadingChapters } = useQuery({
    queryKey: ["landing-chapters"],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.COURSE.GET_PUBLIC_CHAPTERS_ALL);
      return res.data.data ?? [];
    },
  });

  // Limit to top 12 items for homepage display
  const visibleSkills = useMemo(() => skillCategories.slice(0, MAX_ITEMS), [skillCategories]);
  const visibleExpertise = useMemo(() => expertise.slice(0, MAX_ITEMS), [expertise]);
  const visibleModules = useMemo(() => modules.slice(0, MAX_ITEMS), [modules]);
  const visibleChapters = useMemo(() => chapters.slice(0, MAX_ITEMS), [chapters]);

  const [skillIndex, setSkillIndex] = useState(0);
  const [expertiseIndex, setExpertiseIndex] = useState(0);
  const [moduleIndex, setModuleIndex] = useState(0);
  const [chapterIndex, setChapterIndex] = useState(0);

  // Helper to extract courseId from any item
  function getCourseId(item: any): string | undefined {
    // SkillCategory: item.course?.id
    if (item.course?.id) return item.course.id;
    // Expertise: item.skillCategory?.course?.id
    if (item.skillCategory?.course?.id) return item.skillCategory.course.id;
    // Module: item.expertise?.skillCategory?.course?.id
    if (item.expertise?.skillCategory?.course?.id)
      return item.expertise.skillCategory.course.id;
    // Chapter: item.module?.expertise?.skillCategory?.course?.id
    if (item.module?.expertise?.skillCategory?.course?.id)
      return item.module.expertise.skillCategory.course.id;
    // Fallback: item.courseId
    if (item.courseId) return item.courseId;
    return undefined;
  }

  return (
    <div className="w-full flex flex-col gap-32 my-20 px-4">
      {/* Skill Categories Section (Expertise) */}
      {visibleSkills.length > 0 && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-12 items-start">
          <div className="space-y-6 lg:pr-8">
            <div>

              <h2 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] leading-tight mt-3">
                Learn essential career and life skills
              </h2>
            </div>
            <p className="text-[var(--muted-foreground)] text-lg leading-relaxed">
              Discover in-demand skills and start building expertise with
              curated paths designed for fast, real-world impact.
            </p>
          </div>

          <div className="lg:col-span-2">
            <Carousel
              items={visibleSkills}
              loading={loadingSkills}
              index={skillIndex}
              setIndex={setSkillIndex}
              skeletonHeight="h-96"
              viewAllLink="/explore/skill-categories"
              totalCount={skillCategories.length}
              renderCard={(item) => (
                <SkillCategoryCard
                  id={item.id}
                  name={item.name}
                  description={item.description}
                  thumbnailUrl={item.tumbnailUrl}
                  expertiseCount={item.expertiseCount}
                  onClick={() => {
                    const courseId = getCourseId(item);
                    if (courseId) navigate(`/public/course/${courseId}?focus=skillcategory:${item.id}`);
                  }}
                />
              )}
            />
          </div>
        </section>
      )}

      {/* Expertise Section (Domain) */}
      {visibleExpertise.length > 0 && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-12 items-start">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Carousel
              items={visibleExpertise}
              loading={loadingExpertise}
              index={expertiseIndex}
              setIndex={setExpertiseIndex}
              skeletonHeight="h-96"
              viewAllLink="/explore/expertise"
              totalCount={expertise.length}
              renderCard={(item) => (
                <ExpertiseCard
                  id={item.id}
                  name={item.name}
                  description={item.description}
                  thumbnailUrl={item.tumbnailUrl}
                  skillCategoryName={item.skillCategory?.name}
                  moduleCount={item.moduleCount}
                  onClick={() => {
                    const courseId = getCourseId(item);
                    if (courseId) navigate(`/public/course/${courseId}?focus=expertise:${item.id}`);
                  }}
                />
              )}
            />
          </div>

          <div className="space-y-6 lg:pl-8 order-1 lg:order-2">
            <div>

              <h2 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] leading-tight mt-3">
                Go deeper with curated expertise paths
              </h2>
            </div>
            <p className="text-[var(--muted-foreground)] text-lg leading-relaxed">
              Advance through structured tracks that build mastery step by step,
              guided by industry experts.
            </p>
          </div>
        </section>
      )}

      {/* Modules Section */}
      {visibleModules.length > 0 && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-12 items-start">
          <div className="space-y-6 lg:pr-8">
            <div>

              <h2 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] leading-tight mt-3">
                Step-by-step expertise inside each track
              </h2>
            </div>
            <p className="text-[var(--muted-foreground)] text-lg leading-relaxed">
              Build momentum with concise expertise that focus on the skills and
              context you need to progress.
            </p>
          </div>

          <div className="lg:col-span-2">
            <Carousel
              items={visibleModules}
              loading={loadingModules}
              index={moduleIndex}
              setIndex={setModuleIndex}
              skeletonHeight="h-96"
              viewAllLink="/explore/modules"
              totalCount={modules.length}
              renderCard={(item) => (
                <ModuleCard
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  thumbnailUrl={item.tumbnailUrl}
                  expertiseName={item.expertise?.name}
                  chapterCount={item.chapterCount}
                  estimatedTime={item.estimatedTime ?? 120}
                  onClick={() => {
                    const courseId = getCourseId(item);
                    if (courseId) navigate(`/public/course/${courseId}?focus=module:${item.id}`);
                  }}
                />
              )}
            />
          </div>
        </section>
      )}

      {/* Chapters Section */}
      {visibleChapters.length > 0 && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-12 items-start">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Carousel
              items={visibleChapters}
              loading={loadingChapters}
              index={chapterIndex}
              setIndex={setChapterIndex}
              skeletonHeight="h-96"
              viewAllLink="/explore/chapters"
              totalCount={chapters.length}
              renderCard={(item) => (
                <ChapterCardVertical
                  id={item.id}
                  title={item.title}
                  content={item.content || item.description || ""}
                  thumbnailUrl={item.tumbnailUrl}
                  lessonCount={item._count?.lessons || item.lessonCount || 0}
                  price={item.price || 0}
                  onClick={() => {
                    const courseId = getCourseId(item);
                    if (courseId) navigate(`/public/course/${courseId}?focus=chapter:${item.id}`);
                  }}
                />
              )}
            />
          </div>

          <div className="space-y-6 lg:pl-8 order-1 lg:order-2">
            <div>

              <h2 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] leading-tight mt-3">
                Dive into focused chapters
              </h2>
            </div>
            <p className="text-[var(--muted-foreground)] text-lg leading-relaxed">
              Each chapter is a self-contained unit of learning designed to help
              you master specific topics.
            </p>
          </div>
        </section>
      )}


    </div>
  );
}
