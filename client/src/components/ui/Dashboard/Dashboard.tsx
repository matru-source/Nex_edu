import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import useRouter from "../../../hooks/useRouter";
import {
  CourseCard,
  SkillCategoryCard,
  ExpertiseCard,
  ModuleCard,
  ChapterCardVertical,
  LessonCardVertical,
  SectionHeader,
  HorizontalScrollContainer,
  CourseCardSkeleton,
  SkillCategoryCardSkeleton,
} from "../../pages/students/course/CourseCard";
import HeroSection from "./Hero";

// ============================================
// TYPE DEFINITIONS
// ============================================

interface Course {
  id: string;
  title: string;
  description: string;
  tumbnailUrl?: string | null;
  category: {
    name: string;
  };
  subCategory: {
    name: string;
  };
  published: boolean;
  priceCategory?: "FREE" | "TRIAL" | "PAID";
  coursePrice?: number;
  totalChapters?: number;
  totalLessons?: number;
  totalDuration?: number;
}

interface SkillCategory {
  id: string;
  name: string;
  description: string;
  tumbnailUrl?: string | null;
  courseId: string;
  course?: {
    title: string;
    id: string;
    category: { name: string };
  };
}

interface Expertise {
  id: string;
  name: string;
  description: string;
  tumbnailUrl?: string | null;
  skillCategoryId: string;
  skillCategoryName?: string;
  skillCategory?: {
    name: string;
    id: string;
    course?: {
      id: string;
      title: string;
    };
  };
}

interface Module {
  id: string;
  title: string;
  description: string;
  tumbnailUrl?: string | null;
  expertiseId: string;
  expertiseName?: string;
  expertise?: {
    name: string;
    id: string;
    skillCategory?: {
      name: string;
      id: string;
      course?: {
        id: string;
        title: string;
      };
    };
  };
}

interface Chapter {
  id: string;
  title: string;
  content: string;
  tumbnailUrl?: string | null;
  price?: number;
  moduleId: string;
  lessonCount?: number;
  module?: {
    name: string;
    id: string;
    expertise?: {
      name: string;
      id: string;
      skillCategory?: {
        name: string;
        id: string;
        course?: {
          id: string;
          title: string;
        };
      };
    };
  };
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  tumbnailUrl?: string | null;
  chapterId: string;
  chapterName?: string;
  chapter?: {
    title: string;
    id: string;
    module?: {
      name: string;
      id: string;
      expertise?: {
        name: string;
        id: string;
        skillCategory?: {
          name: string;
          id: string;
          course?: {
            id: string;
            title: string;
          };
        };
      };
    };
  };
  video?: {
    duration: number;
  }[];
}

interface FilterState {
  category: string;
  price: string;
  status: string;
  searchQuery: string;
}

// ============================================
// DASHBOARD COMPONENT
// ============================================

export default function Dashboard() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>({
    category: "",
    price: "",
    status: "",
    searchQuery: "",
  });

  // Check if any filter is active
  const hasActiveFilters = filters.category || filters.price || 
    filters.status || filters.searchQuery;

  // ============================================
  // API QUERIES
  // ============================================

  // Get Top Courses
  const { data: topCoursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ["top-courses"],
    queryFn: async () => {
      const res = await api.get<{ data: Course[] }>(
        API_ROUTES.COURSE.GET_TOP_COURSES
      );
      return res.data.data;
    },
  });

  const { data: skillCategoriesData, isLoading: skillCategoriesLoading } =
    useQuery({
      queryKey: ["skill-categories-all"],
      queryFn: async () => {
        const res = await api.get<{
          data: (SkillCategory & {
            course: { title: string; id: string; category: { name: string } };
            expertiseCount: number;
          })[];
        }>(API_ROUTES.COURSE.GET_PUBLIC_SKILL_CATEGORIES_ALL);
        return res.data.data;
      },
    });

  const { data: expertiseData, isLoading: expertiseLoading } = useQuery({
    queryKey: ["expertise-all"],
    queryFn: async () => {
      const res = await api.get<{
        data: (Expertise & {
          moduleCount: number;
        })[];
      }>(API_ROUTES.COURSE.GET_PUBLIC_EXPERTISE_ALL);
      return res.data.data;
    },
  });

  const { data: modulesData, isLoading: modulesLoading } = useQuery({
    queryKey: ["modules-all"],
    queryFn: async () => {
      const res = await api.get<{
        data: (Module & {
          chapterCount: number;
        })[];
      }>(API_ROUTES.COURSE.GET_PUBLIC_MODULES_ALL);
      return res.data.data;
    },
  });

  const { data: chaptersData, isLoading: chaptersLoading } = useQuery({
    queryKey: ["chapters-all"],
    queryFn: async () => {
      const res = await api.get<{
        data: (Chapter & {
          lessonCount: number;
        })[];
      }>(API_ROUTES.COURSE.GET_PUBLIC_CHAPTERS_ALL);
      return res.data.data;
    },
  });

  const { data: lessonsData, isLoading: lessonsLoading } = useQuery({
    queryKey: ["lessons-all"],
    queryFn: async () => {
      const res = await api.get<{
        data: (Lesson & {
          chapter: {
            module: any;
            title: string;
            id: string;
          };
          video: { duration: number }[];
        })[];
      }>(API_ROUTES.COURSE.GET_PUBLIC_LESSONS_ALL);
      return res.data.data;
    },
    staleTime: 0,
  });

  // ============================================
  // FILTER LOGIC
  // ============================================

  const filteredCourses = useMemo(() => {
    if (!topCoursesData) return [];
    
    return topCoursesData.filter((course) => {
      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase().trim();
        if (query) {
          const matchesTitle = (course.title || '').toLowerCase().includes(query);
          const matchesDesc = (course.description || '').toLowerCase().includes(query);
          if (!matchesTitle && !matchesDesc) return false;
        }
      }

      // Category filter
      if (filters.category && course.category?.name !== filters.category) {
        return false;
      }

      // Price filter
      if (filters.price) {
        const priceCategory = course.priceCategory?.toUpperCase();
        if (filters.price === "Free" && priceCategory !== "FREE") return false;
        if (filters.price === "Paid" && priceCategory !== "PAID") return false;
        if (filters.price === "Trial" && priceCategory !== "TRIAL") return false;
      }

      return true;
    });
  }, [topCoursesData, filters]);

  const filteredSkillCategories = useMemo(() => {
    if (!skillCategoriesData) return [];
    if (!filters.searchQuery?.trim() && !filters.category) return skillCategoriesData;

    return skillCategoriesData.filter((skill) => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase().trim();
        if (query) {
          const matchesName = (skill.name || '').toLowerCase().includes(query);
          const matchesDesc = (skill.description || '').toLowerCase().includes(query);
          if (!matchesName && !matchesDesc) return false;
        }
      }
      if (filters.category && skill.course?.category?.name !== filters.category) {
        return false;
      }
      return true;
    });
  }, [skillCategoriesData, filters]);

  const filteredExpertise = useMemo(() => {
    if (!expertiseData) return [];
    if (!filters.searchQuery?.trim()) return expertiseData;

    const query = filters.searchQuery.toLowerCase().trim();
    return expertiseData.filter((exp) => {
      const matchesName = (exp.name || '').toLowerCase().includes(query);
      const matchesDesc = (exp.description || '').toLowerCase().includes(query);
      return matchesName || matchesDesc;
    });
  }, [expertiseData, filters.searchQuery]);

  const filteredModules = useMemo(() => {
    if (!modulesData) return [];
    if (!filters.searchQuery?.trim()) return modulesData;

    const query = filters.searchQuery.toLowerCase().trim();
    return modulesData.filter((mod) => {
      const matchesTitle = (mod.title || '').toLowerCase().includes(query);
      const matchesDesc = (mod.description || '').toLowerCase().includes(query);
      return matchesTitle || matchesDesc;
    });
  }, [modulesData, filters.searchQuery]);

  const filteredChapters = useMemo(() => {
    if (!chaptersData) return [];
    if (!filters.searchQuery?.trim()) return chaptersData;

    const query = filters.searchQuery.toLowerCase().trim();
    return chaptersData.filter((chapter) => {
      const matchesTitle = (chapter.title || '').toLowerCase().includes(query);
      const matchesContent = (chapter.content || '').toLowerCase().includes(query);
      return matchesTitle || matchesContent;
    });
  }, [chaptersData, filters.searchQuery]);

  const filteredLessons = useMemo(() => {
    if (!lessonsData) return [];
    if (!filters.searchQuery?.trim()) return lessonsData;

    const query = filters.searchQuery.toLowerCase().trim();
    return lessonsData.filter((lesson) => {
      const matchesTitle = (lesson.title || '').toLowerCase().includes(query);
      return matchesTitle;
    });
  }, [lessonsData, filters.searchQuery]);

  // ============================================
  // EVENT HANDLERS
  // ============================================

  const handleCourseClick = (courseId: string, courseTitle: string) => {
    router.push(`/course/${courseId}`, courseTitle);
  };

  const handleSkillCategoryClick = (courseId: string, name: string) => {
    router.push(`/course/${courseId}`, name);
  };

  const handleExpertiseClick = (courseId: string, name: string) => {
    router.push(`/course/${courseId}`, name);
  };

  const handleModuleClick = (courseId: string, title: string) => {
    router.push(`/course/${courseId}`, title);
  };

  const handleChapterClick = (courseId: string, title: string) => {
    router.push(`/course/${courseId}`, title);
  };

  const handleLessonClick = (
    courseId: string,
    title: string
  ) => {
    router.push(`/course/${courseId}`, title);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-2">
        {/* Hero Section */}
        <HeroSection onFilterChange={setFilters} activeFilters={filters} />

        {/* Results Summary when filtering */}
        {hasActiveFilters && (
          <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Search Results
                </h3>
                <p className="text-sm text-muted-foreground">
                  Found {filteredCourses.length} courses
                  {filteredSkillCategories.length > 0 && `, ${filteredSkillCategories.length} skill categories`}
                  {filteredExpertise.length > 0 && `, ${filteredExpertise.length} expertise tracks`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section 1: Top Courses */}
        <section className="mb-16">
          <SectionHeader
            title={hasActiveFilters ? "Matching Courses" : "Featured Courses"}
            subtitle={hasActiveFilters 
              ? `${filteredCourses.length} courses match your filters`
              : "Start your learning journey with our most popular courses"
            }
          />
          {coursesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  thumbnailUrl={course.tumbnailUrl}
                  categoryName={course.category?.name}
                  subCategoryName={course.subCategory?.name}
                  totalChapters={course.totalChapters}
                  totalLessons={course.totalLessons}
                  totalDuration={course.totalDuration}
                  priceCategory={course.priceCategory as any}
                  price={course.coursePrice}
                  onClick={() => handleCourseClick(course.id, course.title)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-lg border border-border/50">
              <p className="text-muted-foreground">No courses match your current filters.</p>
              <button
                onClick={() => setFilters({ category: "", price: "", status: "", searchQuery: "" })}
                className="mt-2 text-primary hover:underline text-sm"
              >
                Clear filters to see all courses
              </button>
            </div>
          )}
        </section>

        {filteredSkillCategories && filteredSkillCategories.length > 0 && (
          <section className="mb-16">
            <SectionHeader
              title="All Skill Categories"
              subtitle="Browse skill categories from all courses"
            />
            <HorizontalScrollContainer>
              {skillCategoriesLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-96 flex-shrink-0 h-96">
                      <CourseCardSkeleton />
                    </div>
                  ))
                : filteredSkillCategories?.map((skillCat) => (
                    <SkillCategoryCard
                      key={skillCat.id}
                      id={skillCat.id}
                      name={skillCat.name}
                      description={skillCat.description}
                      thumbnailUrl={skillCat.tumbnailUrl}
                      expertiseCount={(skillCat as any).expertiseCount}
                      progress={0}
                      onClick={() =>
                        handleSkillCategoryClick(skillCat.course?.id || "", skillCat.name)
                      }
                    />
                  ))}
            </HorizontalScrollContainer>
          </section>
        )}

        {filteredExpertise && filteredExpertise.length > 0 && (
          <section className="mb-16">
            <SectionHeader
              title="All Expertise Tracks"
              subtitle="Browse expertise paths from all skill categories"
            />
            <HorizontalScrollContainer>
              {expertiseLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-96 flex-shrink-0 h-96">
                      <CourseCardSkeleton />
                    </div>
                  ))
                : filteredExpertise?.map((exp) => (
                    <ExpertiseCard
                      key={exp.id}
                      id={exp.id}
                      name={exp.name}
                      description={exp.description}
                      thumbnailUrl={exp.tumbnailUrl}
                      skillCategoryName={exp.skillCategory?.name}
                      moduleCount={(exp as any).moduleCount}
                      totalDuration={14400}
                      onClick={() => handleExpertiseClick(exp.skillCategory?.course?.id || "", exp.name)}
                    />
                  ))}
            </HorizontalScrollContainer>
          </section>
        )}

        {filteredModules && filteredModules.length > 0 && (
          <section className="mb-16">
            <SectionHeader
              title="All Learning Modules"
              subtitle="Browse modules from all expertise tracks"
            />
            <HorizontalScrollContainer>
              {modulesLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-96 flex-shrink-0 h-96">
                      <CourseCardSkeleton />
                    </div>
                  ))
                : filteredModules?.map((mod) => (
                    <ModuleCard
                      key={mod.id}
                      id={mod.id}
                      title={mod.title}
                      description={mod.description}
                      thumbnailUrl={mod.tumbnailUrl}
                      expertiseName={mod.expertise?.name}
                      chapterCount={(mod as any).chapterCount}
                      estimatedTime={7200}
                      onClick={() => handleModuleClick(mod.expertise?.skillCategory?.course?.id || "", mod.title)}
                    />
                  ))}
            </HorizontalScrollContainer>
          </section>
        )}

        {filteredChapters && filteredChapters.length > 0 && (
          <section className="mb-16">
            <SectionHeader
              title="All Course Chapters"
              subtitle="Explore chapters from all modules"
            />
            <HorizontalScrollContainer>
              {chaptersLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-96 flex-shrink-0 h-96">
                      <SkillCategoryCardSkeleton />
                    </div>
                  ))
                : filteredChapters?.map((chapter) => (
                    <ChapterCardVertical
                      key={chapter.id}
                      id={chapter.id}
                      title={chapter.title}
                      content={chapter.content}
                      thumbnailUrl={chapter.tumbnailUrl}
                      price={chapter.price}
                      lessonCount={chapter.lessonCount}
                      completionPercentage={0}
                      isPurchased={chapter.price === 0}
                      onClick={() =>
                        handleChapterClick(chapter.module?.expertise?.skillCategory?.course?.id || "", chapter.title)
                      }
                    />
                  ))}
            </HorizontalScrollContainer>
          </section>
        )}

        {filteredLessons && filteredLessons.length > 0 && (
          <section className="mb-16">
            <SectionHeader
              title="Latest Lessons"
              subtitle="Start learning with newly added lessons"
            />
            <HorizontalScrollContainer>
              {lessonsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-96 flex-shrink-0 h-96">
                      <SkillCategoryCardSkeleton />
                    </div>
                  ))
                : filteredLessons?.map((lesson) => (
                    <LessonCardVertical
                      key={lesson.id}
                      id={lesson.id}
                      title={lesson.title}
                      thumbnailUrl={lesson.tumbnailUrl}
                      chapterName={lesson.chapter?.title}
                      duration={lesson.video?.[0]?.duration}
                      isCompleted={false}
                      onClick={() =>
                        handleLessonClick(
                          lesson.chapter?.module?.expertise?.skillCategory
                            ?.course?.id || "",
                          lesson.title
                        )
                      }
                    />
                  ))}
            </HorizontalScrollContainer>
          </section>
        )}
      </div>
    </div>
  );
}
