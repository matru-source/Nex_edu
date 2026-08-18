import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios/axios";
import { API_ROUTES } from "../../lib/api";
import {
  SkillCategoryCard,
  ExpertiseCard,
  ModuleCard,
  ChapterCardVertical,
  LessonCardVertical,
  CourseCardSkeleton,
} from "../pages/students/course/CourseCard";
import NavBar from "../ui/Landing/NavBar";
import Footer from "../ui/Landing/Footer";
import { Search, ArrowLeft, Grid3X3, Layers, BookOpen, FileText, Video } from "lucide-react";

// Level type configuration
const LEVEL_CONFIG: Record<string, { title: string; subtitle: string; icon: React.ReactNode; apiRoute: string }> = {
  "skill-categories": {
    title: "All Modules",
    subtitle: "Explore all available skill modules to start your learning journey",
    icon: <Grid3X3 className="w-6 h-6" />,
    apiRoute: API_ROUTES.COURSE.GET_PUBLIC_SKILL_CATEGORIES_ALL,
  },
  expertise: {
    title: "All Domains",
    subtitle: "Browse through specialized domains to deepen your expertise",
    icon: <Layers className="w-6 h-6" />,
    apiRoute: API_ROUTES.COURSE.GET_PUBLIC_EXPERTISE_ALL,
  },
  modules: {
    title: "All Expertise",
    subtitle: "Discover expertise tracks with step-by-step learning paths",
    icon: <BookOpen className="w-6 h-6" />,
    apiRoute: API_ROUTES.COURSE.GET_PUBLIC_MODULES_ALL,
  },
  chapters: {
    title: "All Chapters",
    subtitle: "Explore focused chapters for targeted skill development",
    icon: <FileText className="w-6 h-6" />,
    apiRoute: API_ROUTES.COURSE.GET_PUBLIC_CHAPTERS_ALL,
  },
  lessons: {
    title: "All Lessons",
    subtitle: "Jump into individual lessons and start learning immediately",
    icon: <Video className="w-6 h-6" />,
    apiRoute: API_ROUTES.COURSE.GET_PUBLIC_LESSONS_ALL,
  },
};

export default function ExploreLevels() {
  const { levelType } = useParams<{ levelType: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const config = LEVEL_CONFIG[levelType || ""] || LEVEL_CONFIG["skill-categories"];

  // Fetch data based on level type
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["explore-levels", levelType],
    queryFn: async () => {
      const res = await api.get(config.apiRoute);
      return res.data.data ?? [];
    },
    enabled: !!levelType && !!config,
  });

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase().trim();
    return items.filter((item: any) => {
      const title = (item.title || item.name || "").toLowerCase();
      const description = (item.description || item.content || "").toLowerCase();
      return title.includes(query) || description.includes(query);
    });
  }, [items, searchQuery]);

  // Helper to get courseId from item
  const getCourseId = (item: any): string | undefined => {
    if (item.course?.id) return item.course.id;
    if (item.skillCategory?.course?.id) return item.skillCategory.course.id;
    if (item.expertise?.skillCategory?.course?.id) return item.expertise.skillCategory.course.id;
    if (item.module?.expertise?.skillCategory?.course?.id) return item.module.expertise.skillCategory.course.id;
    if (item.chapter?.module?.expertise?.skillCategory?.course?.id) return item.chapter.module.expertise.skillCategory.course.id;
    if (item.courseId) return item.courseId;
    return undefined;
  };

  const handleItemClick = (item: any) => {
    const courseId = getCourseId(item);
    if (courseId) {
      navigate(`/public/course/${courseId}`);
    }
  };

  // Render card based on level type
  const renderCard = (item: any) => {
    switch (levelType) {
      case "skill-categories":
        return (
          <SkillCategoryCard
            key={item.id}
            id={item.id}
            name={item.name}
            description={item.description}
            thumbnailUrl={item.tumbnailUrl}
            expertiseCount={item.expertiseCount}
            onClick={() => handleItemClick(item)}
          />
        );
      case "expertise":
        return (
          <ExpertiseCard
            key={item.id}
            id={item.id}
            name={item.name}
            description={item.description}
            thumbnailUrl={item.tumbnailUrl}
            skillCategoryName={item.skillCategory?.name}
            moduleCount={item.moduleCount}
            onClick={() => handleItemClick(item)}
          />
        );
      case "modules":
        return (
          <ModuleCard
            key={item.id}
            id={item.id}
            title={item.title}
            description={item.description}
            thumbnailUrl={item.tumbnailUrl}
            expertiseName={item.expertise?.name}
            chapterCount={item.chapterCount}
            estimatedTime={item.estimatedTime ?? 120}
            onClick={() => handleItemClick(item)}
          />
        );
      case "chapters":
        return (
          <ChapterCardVertical
            key={item.id}
            id={item.id}
            title={item.title}
            content={item.content || item.description || ""}
            thumbnailUrl={item.tumbnailUrl}
            lessonCount={item._count?.lessons || item.lessonCount || 0}
            price={item.price || 0}
            onClick={() => handleItemClick(item)}
          />
        );
      case "lessons":
        return (
          <LessonCardVertical
            key={item.id}
            id={item.id}
            title={item.title}
            thumbnailUrl={item.tumbnailUrl}
            chapterName={item.chapter?.title}
            duration={item.video?.[0]?.duration}
            onClick={() => handleItemClick(item)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <NavBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Home</span>
        </button>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-[var(--primary)]/10 rounded-xl text-[var(--primary)]">
              {config.icon}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
                {config.title}
              </h1>
              <p className="text-[var(--muted-foreground)] mt-1">
                {config.subtitle}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md mt-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[var(--muted-foreground)]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${config.title.toLowerCase()}...`}
              className="w-full pl-12 pr-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all"
            />
          </div>

          {/* Results count */}
          <p className="text-sm text-[var(--muted-foreground)] mt-4">
            Showing {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item: any) => (
              <div key={item.id} className="flex justify-center">
                {renderCard(item)}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-[var(--muted-foreground)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
              No results found
            </h3>
            <p className="text-[var(--muted-foreground)]">
              Try adjusting your search or browse all items
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 px-4 py-2 text-sm font-medium text-[var(--primary)] hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
