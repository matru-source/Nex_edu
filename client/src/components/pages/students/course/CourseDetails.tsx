import { useParams } from "react-router-dom";
import TopBar from "../../../lazy/TopBar";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../lib/axios/axios";
import { API_ROUTES } from "../../../../lib/api";
import type {
  Category,
  Chapters,
  Course,
  Expertise,
  Lessons,
  Module,
  Response,
  SkillCategory,
  SubCategory,
  Video,
} from "../../../../types";
import {
  BookIcon,
  Bookmark,
  CalendarIcon,
  ChevronDown,
  Folder,
  Video as VideoIcon,
  Award,
  Clock,
  CheckCircle2,
  Play,
  ShoppingCart,
  Check,
} from "lucide-react";
import useRouter from "../../../../hooks/useRouter";
import { useState, useEffect } from "react";
import useLogin from "../../../../hooks/useLogin";
import { formatDuration } from "../../../../utils/formatDuration";
import { useCartStore } from "../../../../state/cart";
import CourseMaterials from "../../../ui/Courses/CourseMaterials";

interface CourseDetailsResponse extends Response {
  data: Course & {
    category: Category;
    subCategory: SubCategory;
    SkillCategory: (SkillCategory & {
      Expertise: (Expertise & {
        Module: (Module & {
          Chapters: (Chapters & {
            Lessons?: (Lessons & {
              Video?: Video[];
            })[];
          })[];
        })[];
      })[];
    })[];
  };
}

export default function CourseDetails() {
  const { courseId } = useParams();
  const router = useRouter();

  const { isLogedIn } = useLogin();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const [expandedExpertise, setExpandedExpertise] = useState<Set<string>>(
    new Set()
  );
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set()
  );
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(
    new Set()
  );
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  // Cart store
  const { fetchCart, addToCart, isInCart } = useCartStore();

  // Fetch cart on mount
  useEffect(() => {
    if (isLogedIn) {
      fetchCart();
    }
  }, [isLogedIn, fetchCart]);

  if (!courseId) {
    return <div className="w-full">Invalid Value Stream ID</div>;
  }

  const courseDetailsQuery = useQuery({
    queryKey: ["course-details", courseId],
    queryFn: async () => {
      const res = await api.get<CourseDetailsResponse>(
        API_ROUTES.COURSE.GET_COURSE_DETAILS_BY_COURSE_ID(courseId)
      );
      return res.data;
    },
  });

  const purchasedChaptersQuery = useQuery({
    queryKey: ["purchased-chapters", courseId],
    queryFn: async () => {
      const res = await api.get(
        API_ROUTES.PURCHASE.CHECK_COURSE_STATUS(courseId!)
      );
      return res.data;
    },
    enabled: !!courseId && isLogedIn,
  });

  const purchasedChapters = new Set(
    purchasedChaptersQuery.data?.data?.purchasedChapters || []
  );



  if (courseDetailsQuery.isLoading) {
    return (
      <div className="w-full min-h-screen bg-background">
        <TopBar />
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (courseDetailsQuery.error || !courseDetailsQuery.data) {
    return (
      <div className="w-full min-h-screen bg-background">
        <TopBar />
        <div className="p-8">
          <div className="text-center py-12">
            <div className="text-destructive text-lg">
              Failed to load Value Stream details
            </div>
            <button
              onClick={() => courseDetailsQuery.refetch()}
              className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const course = courseDetailsQuery.data.data;

  const toggleModuleExpanded = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const toggleExpertiseExpanded = (expertiseId: string) => {
    const newExpanded = new Set(expandedExpertise);
    if (newExpanded.has(expertiseId)) {
      newExpanded.delete(expertiseId);
    } else {
      newExpanded.add(expertiseId);
    }
    setExpandedExpertise(newExpanded);
  };

  const toggleChapterExpanded = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const calculateChapterDuration = (
    chapter: Chapters & {
      Lessons?: (Lessons & { Video?: Video[] })[];
    }
  ): number => {
    if (!chapter.Lessons || chapter.Lessons.length === 0) return 0;

    return chapter.Lessons.reduce((total, lesson) => {
      const video = lesson.Video?.[0];
      return total + (video?.duration || 0);
    }, 0);
  };


  const calculateTotalChapters = () => {
    return course.SkillCategory.reduce(
      (total: number, skill: SkillCategory) => {
        return (
          total +
          skill.Expertise.reduce((expertiseTotal: number, exp: Expertise) => {
            return (
              expertiseTotal +
              exp.Module.reduce((moduleTotal: number, mod: Module) => {
                return moduleTotal + mod.Chapters.length;
              }, 0)
            );
          }, 0)
        );
      },
      0
    );
  };

  const toggleDescriptionExpanded = (id: string) => {
    const newExpanded = new Set(expandedDescriptions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedDescriptions(newExpanded);
  };

  return (
    <div className="w-full min-h-screen bg-background">
      <TopBar />

      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-10 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              {/* Breadcrumb/Category */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-semibold border border-primary/20 hover:bg-primary/15 transition-colors">
                  <Folder size={14} />
                  {course.category.name}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="inline-flex items-center gap-2 bg-secondary/10 text-secondary-foreground px-4 py-2 rounded-full text-xs font-semibold border border-secondary/30">
                  {course.subCategory.name}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight">
                {course.title}
              </h1>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed mb-6 text-base max-w-2xl">
                {course.description}
              </p>

              {/* Course Meta Info */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <BookIcon className="w-4 h-4" />
                  <span>
                    <span className="font-semibold">
                      {calculateTotalChapters()}
                    </span>{" "}
                    Chapters
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Award className="w-4 h-4" />
                  <span>
                    <span className="font-semibold">
                      {course.SkillCategory.length}
                    </span>{" "}
                    Expertise
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <CalendarIcon className="w-4 h-4" />
                  <span>
                    Created {new Date(course.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {course.updatedAt && (
                  <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Clock className="w-4 h-4" />
                    <span>
                      Updated {new Date(course.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="mt-6">
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border ${
                    course.published
                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                      : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  {course.published ? "Published" : "Draft"}
                </span>
              </div>
            </div>

            {/* Course Thumbnail */}
            {course.tumbnailUrl && (
              <div className="flex justify-center lg:justify-end">
                <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-lg border border-border bg-card hover:shadow-xl transition-shadow duration-300">
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img
                      src={course.tumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 bg-card border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      Value Stream Preview
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Syllabus Section */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Syllabus Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <BookIcon className="w-8 h-8 text-primary" />
                Value Stream Curriculum
              </h2>
            </div>
            <button className="flex items-center gap-2 p-3 hover:bg-muted rounded-lg transition-colors group">
              <Bookmark
                size={20}
                className="text-muted-foreground group-hover:text-foreground transition-colors"
              />
            </button>
          </div>
          <p className="text-muted-foreground text-sm ml-11">
            Structured learning path with {calculateTotalChapters()} chapters
            across {course.SkillCategory.length} Modules
          </p>
        </div>

        {/* Skill Categories */}
        <div className="space-y-6">
          {course.SkillCategory.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20 bg-card rounded-2xl shadow-sm border border-border/60">
              <div className="text-muted-foreground mb-4">
                <BookIcon className="w-20 h-20 mx-auto opacity-50" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Curriculum Available
              </h3>
              <p className="text-muted-foreground">
                The Value Stream curriculum will be available soon.
              </p>
            </div>
          ) : (
            course.SkillCategory.map(
              (skillCategory: SkillCategory, skillIndex: number) => (
                <div
                  key={skillCategory.id}
                  className="bg-card rounded-2xl shadow-md border border-border/60 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                >
                  {/* Skill Category Header */}
                  <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 px-6 py-6 border-b border-border/50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-xl text-lg font-bold shadow-lg flex-shrink-0">
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
                              <BookIcon size={14} className="text-secondary" />
                              <span className="font-medium">
                                {skillCategory.Expertise.reduce(
                                  (total: number, exp: Expertise) => {
                                    return (
                                      total +
                                      exp.Module.reduce(
                                        (modTotal: number, mod: Module) =>
                                          modTotal + mod.Chapters.length,
                                        0
                                      )
                                    );
                                  },
                                  0
                                )}{" "}
                                chapters
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expertise Sections */}
                  <div className="divide-y divide-border/40">
                    {skillCategory.Expertise.map(
                      (expertise: Expertise, expIndex: number) => (
                        <div key={expertise.id} className="last:border-b-0">
                          {/* Expertise Header - Collapsible */}
                          <button
                            onClick={() =>
                              toggleExpertiseExpanded(expertise.id)
                            }
                            className="w-full px-6 py-5 hover:bg-muted/40 transition-all duration-200 text-left group"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-start gap-4 flex-1 min-w-0">
                                <div className="flex items-center justify-center w-10 h-10 bg-secondary/20 text-secondary-foreground rounded-xl text-sm font-bold flex-shrink-0 group-hover:bg-secondary/30 group-hover:scale-105 transition-all duration-200 border border-secondary/30">
                                  {skillIndex + 1}.{expIndex + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                                    {expertise.name}
                                  </h4>
                                  <div className="space-y-2">
                                    <p
                                      className={`text-muted-foreground text-sm leading-relaxed ${
                                        expandedDescriptions.has(expertise.id)
                                          ? ""
                                          : "line-clamp-2"
                                      }`}
                                    >
                                      {expertise.description}
                                    </p>
                                    {expertise.description.length > 150 && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleDescriptionExpanded(
                                            expertise.id
                                          );
                                        }}
                                        className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                                      >
                                        {expandedDescriptions.has(expertise.id)
                                          ? "Show less"
                                          : "Show more"}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border/50">
                                  {expertise.Module.reduce(
                                    (total: number, mod: Module) =>
                                      total + mod.Chapters.length,
                                    0
                                  )}
                                </span>
                                <ChevronDown
                                  size={20}
                                  className={`text-muted-foreground group-hover:text-foreground flex-shrink-0 transition-all duration-300 ${
                                    expandedExpertise.has(expertise.id)
                                      ? "rotate-180 text-primary"
                                      : ""
                                  }`}
                                />
                              </div>
                            </div>
                          </button>

                          {/* Modules - Collapsible Content */}
                          {expandedExpertise.has(expertise.id) && (
                            <div className="bg-muted/20 px-6 py-5 border-t border-border/40 space-y-3">
                              {expertise.Module.map(
                                (module: Module, modIndex: number) => (
                                  <div key={module.id}>
                                    {/* Module Header - Collapsible */}
                                    <button
                                      onClick={() =>
                                        toggleModuleExpanded(module.id)
                                      }
                                      className="w-full group text-left mb-3 flex items-center justify-between gap-4 p-4 bg-card rounded-xl border border-border/60 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md transition-all duration-200"
                                    >
                                      <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="flex items-center justify-center w-9 h-9 bg-primary/10 text-primary rounded-lg text-xs font-bold flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105 transition-all duration-200 border border-primary/20">
                                          <Folder size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h5 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors mb-1">
                                            Module {modIndex + 1}:{" "}
                                            {module.title}
                                          </h5>
                                          <div className="space-y-2">
                                            <p
                                              className={`text-muted-foreground text-xs leading-relaxed ${
                                                expandedDescriptions.has(
                                                  module.id
                                                )
                                                  ? ""
                                                  : "line-clamp-1"
                                              }`}
                                            >
                                              {module.description}
                                            </p>
                                            {module.description.length >
                                              100 && (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  toggleDescriptionExpanded(
                                                    module.id
                                                  );
                                                }}
                                                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                                              >
                                                {expandedDescriptions.has(
                                                  module.id
                                                )
                                                  ? "Show less"
                                                  : "Show more"}
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className="text-xs font-bold text-foreground bg-primary/10 px-3 py-1.5 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all border border-primary/20">
                                          {module.Chapters.length}
                                        </span>
                                        <ChevronDown
                                          size={18}
                                          className={`text-muted-foreground group-hover:text-primary transition-all duration-300 ${
                                            expandedModules.has(module.id)
                                              ? "rotate-180 text-primary"
                                              : ""
                                          }`}
                                        />
                                      </div>
                                    </button>

                                    {/* Chapters - Collapsible Content */}
                                    {expandedModules.has(module.id) && (
                                      <div className="space-y-2 ml-4 animate-in slide-in-from-top-2 duration-300">
                                        {module.Chapters.map(
                                          (
                                            chapter: Chapters,
                                            chapterIndex: number
                                          ) => {
                                            const isPurchased =
                                              purchasedChapters.has(chapter.id);

                                            return (
                                              <div
                                                key={chapter.id}
                                                className="group/chapter flex items-center justify-between p-4 bg-card rounded-xl border border-border/60 hover:border-secondary/60 hover:bg-secondary/5 hover:shadow-md transition-all duration-200"
                                              >
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                  <div className="flex items-center justify-center w-8 h-8 bg-secondary/15 text-secondary-foreground rounded-lg text-xs font-bold flex-shrink-0 group-hover/chapter:bg-secondary group-hover/chapter:text-secondary-foreground group-hover/chapter:scale-105 transition-all duration-200 border border-secondary/30">
                                                    <VideoIcon size={14} />
                                                  </div>
                                                  <div className="flex-1 min-w-0">
                                                    <h6 className="text-sm font-bold text-foreground group-hover/chapter:text-primary transition-colors mb-1">
                                                      Chapter {chapterIndex + 1}
                                                      : {chapter.title}
                                                    </h6>
                                                    {/* Add duration display */}
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                                      <Clock size={12} />
                                                      <span>
                                                        {formatDuration(
                                                          calculateChapterDuration(
                                                            chapter
                                                          )
                                                        )}
                                                      </span>
                                                    </div>
                                                    {chapter.content && (
                                                      <div className="space-y-2">
                                                        <p
                                                          className={`text-xs text-muted-foreground leading-relaxed group-hover/chapter:text-foreground/80 transition-colors ${
                                                            expandedChapters.has(
                                                              chapter.id
                                                            )
                                                              ? ""
                                                              : "line-clamp-2"
                                                          }`}
                                                        >
                                                          {chapter.content}
                                                        </p>
                                                        {chapter.content
                                                          .length > 150 && (
                                                          <button
                                                            onClick={() =>
                                                              toggleChapterExpanded(
                                                                chapter.id
                                                              )
                                                            }
                                                            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                                                          >
                                                            {expandedChapters.has(
                                                              chapter.id
                                                            )
                                                              ? "Show less"
                                                              : "Show more"}
                                                          </button>
                                                        )}
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>

                                                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                                                  {isPurchased ? (
                                                    <div className="flex items-center gap-2">
                                                      <span className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-lg text-sm font-semibold">
                                                        <CheckCircle2
                                                          size={16}
                                                        />
                                                        Purchased
                                                      </span>
                                                      <button
                                                        onClick={() => {
                                                          router.push(
                                                            `/course/lessons/${chapter.id}`,
                                                            chapter.title
                                                          );
                                                        }}
                                                        className="flex gap-2 items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 hover:shadow-lg transition-all duration-200"
                                                      >
                                                        <Play size={16} />
                                                        Go to Lessons
                                                      </button>
                                                    </div>
                                                  ) : chapter.price > 0 ? (
                                                    isInCart(chapter.id) ? (
                                                      <button
                                                        onClick={() => router.push("/cart", "My Cart")}
                                                        className="flex gap-2 items-center px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-bold hover:bg-secondary/90 hover:shadow-lg transition-all duration-200"
                                                      >
                                                        <Check size={16} />
                                                        In Cart
                                                      </button>
                                                    ) : (
                                                      <button
                                                        onClick={async () => {
                                                          setAddingToCart(chapter.id);
                                                          await addToCart(chapter.id);
                                                          setAddingToCart(null);
                                                        }}
                                                        disabled={addingToCart === chapter.id}
                                                        className="flex gap-2 items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                                                      >
                                                        <ShoppingCart size={16} />
                                                        {addingToCart === chapter.id ? "Adding..." : `Add to Cart • $${chapter.price}`}
                                                      </button>
                                                    )
                                                  ) : (
                                                    <button
                                                      onClick={() => {
                                                        router.push(
                                                          `/course/lessons/${chapter.id}`,
                                                          chapter.title
                                                        );
                                                      }}
                                                      className="flex gap-2 items-center px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-lg text-sm font-bold hover:bg-green-200 dark:hover:bg-green-900/30 transition-all duration-200"
                                                    >
                                                      <Play size={16} />
                                                      Free
                                                    </button>
                                                  )}
                                                  <ChevronDown
                                                    size={16}
                                                    className="text-muted-foreground opacity-0 group-hover/chapter:opacity-100 group-hover/chapter:text-secondary transition-all duration-200 -rotate-90"
                                                  />
                                                </div>
                                              </div>
                                            );
                                          }
                                        )}

                                        {/* Payment Modal */}

                                      </div>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )
            )
          )}
        </div>

        {/* Course Materials Section */}
        <div className="mt-8 max-w-7xl mx-auto px-6">
          <CourseMaterials courseId={courseId} />
        </div>
      </div>
    </div>
  );
}
