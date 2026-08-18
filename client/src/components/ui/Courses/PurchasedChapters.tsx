import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "../../../lib/axios/axios";
import { API_ROUTES } from "../../../lib/api";
import type {
  Category,
  Chapters,
  Expertise,
  Lessons,
  Module,
  Response,
  SkillCategory,
  SubCategory,
  Video,
} from "../../../types";
import {
  BookOpen,
  LayoutGrid,
  List,
  ChevronDown,
  Play,
  Clock,
  Award,
  Folder,
  Video as VideoIcon,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDuration } from "../../../utils/formatDuration";

// Simple flat purchase
interface Purchase {
  id: string;
  amount: number;
  purchaseAt: string;
  chapter: {
    id: string;
    title: string;
    order: number;
    Lessons?: (Lessons & { Video?: Video[] })[];
    module: {
      id: string;
      title: string;
      expertise: {
        id: string;
        name: string;
        skillCategory: {
          id: string;
          name: string;
          course: {
            id: string;
            title: string;
            category: { name: string };
            subCategory: { name: string };
          };
        };
      };
    };
  };
}

// Hierarchical data structure
interface HierarchyChapter extends Chapters {
  Lessons?: (Lessons & { Video?: Video[] })[];
}

interface HierarchyModule extends Module {
  Chapters: HierarchyChapter[];
}

interface HierarchyExpertise extends Expertise {
  Module: HierarchyModule[];
}

interface HierarchySkillCategory extends SkillCategory {
  Expertise: HierarchyExpertise[];
}

interface HierarchyCourse {
  id: string;
  title: string;
  description: string;
  tumbnailUrl: string;
  category: Category;
  subCategory: SubCategory;
  purchasedAt: string;
  totalPurchasedChapters: number;
  SkillCategory: HierarchySkillCategory[];
}

interface PurchaseHistoryResponse extends Response {
  data: Purchase[];
}

interface HierarchyResponse extends Response {
  data: HierarchyCourse[];
}

type ViewMode = "list" | "hierarchy";

export default function PurchasedChapters() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(
    new Set()
  );
  const [expandedSkillCategories, setExpandedSkillCategories] = useState<
    Set<string>
  >(new Set());
  const [expandedExpertise, setExpandedExpertise] = useState<Set<string>>(
    new Set()
  );
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );

  // Fetch flat purchases
  const { data: flatData, isLoading: flatLoading } = useQuery({
    queryKey: ["my-purchases"],
    queryFn: async () => {
      const res = await api.get<PurchaseHistoryResponse>(
        API_ROUTES.PURCHASE.GET_MY_PURCHASES
      );
      return res.data;
    },
  });

  // Fetch hierarchical data
  const { data: hierarchyData, isLoading: hierarchyLoading } = useQuery({
    queryKey: ["my-purchases-hierarchy"],
    queryFn: async () => {
      const res = await api.get<HierarchyResponse>(
        API_ROUTES.PURCHASE.GET_MY_PURCHASES_WITH_HIERARCHY
      );
      return res.data;
    },
  });

  const purchases = flatData?.data || [];
  const courses = hierarchyData?.data || [];
  const isLoading = flatLoading || hierarchyLoading;

  const toggleCourse = (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  const toggleSkillCategory = (id: string) => {
    const newExpanded = new Set(expandedSkillCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSkillCategories(newExpanded);
  };

  const toggleExpertise = (id: string) => {
    const newExpanded = new Set(expandedExpertise);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedExpertise(newExpanded);
  };

  const toggleModule = (id: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedModules(newExpanded);
  };

  const calculateChapterDuration = (chapter: HierarchyChapter): number => {
    if (!chapter.Lessons || chapter.Lessons.length === 0) return 0;
    return chapter.Lessons.reduce((total, lesson) => {
      const video = lesson.Video?.[0];
      return total + (video?.duration || 0);
    }, 0);
  };

  const goToLessons = (chapterId: string, chapterTitle: string) => {
    navigate(`/course/lessons/${chapterId}`, { state: { title: chapterTitle } });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-[var(--muted)] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-4 px-4">
        <div className="relative mb-2 w-full max-w-xs">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-[var(--primary)]/30 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="relative">
            <svg
              viewBox="0 0 400 300"
              className="w-full h-auto drop-shadow-lg"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="100"
                y="80"
                width="200"
                height="140"
                rx="24"
                className="fill-[var(--card)] stroke-[var(--border)] stroke-2"
              />
              <rect
                x="120"
                y="100"
                width="160"
                height="100"
                rx="16"
                fill="url(#bookGradient)"
              />
              <defs>
                <linearGradient
                  id="bookGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--primary)"
                    stopOpacity="0.12"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--primary)"
                    stopOpacity="0.05"
                  />
                </linearGradient>
              </defs>
              <rect
                x="140"
                y="120"
                width="120"
                height="10"
                rx="5"
                className="fill-[var(--primary)] opacity-40"
              />
              <rect
                x="140"
                y="140"
                width="80"
                height="8"
                rx="4"
                className="fill-[var(--primary)] opacity-30"
              />
              <rect
                x="140"
                y="160"
                width="100"
                height="8"
                rx="4"
                className="fill-[var(--muted-foreground)] opacity-30"
              />
              <rect
                x="110"
                y="90"
                width="10"
                height="120"
                rx="5"
                className="fill-[var(--border)]"
              />
            </svg>
            <div className="absolute -top-8 -right-8 animate-bounce">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)]/80 to-[var(--primary)]/40 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-[var(--foreground)] mb-3">
            No Chapters Purchased Yet
          </h3>
          <p className="text-[var(--muted-foreground)] text-lg max-w-md mx-auto leading-relaxed">
            Start exploring our courses and purchase chapters to learn!
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="group relative px-8 py-4 bg-gradient-to-r from-[var(--primary)] to-blue-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <span>Explore Courses</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Toggle & Stats */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <BookOpen size={16} />
            <span>
              <span className="font-bold text-[var(--foreground)]">{purchases.length}</span> chapters
            </span>
          </div>
          <div className="h-4 w-px bg-[var(--border)]" />
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Folder size={16} />
            <span>
              <span className="font-bold text-[var(--foreground)]">{courses.length}</span> courses
            </span>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-[var(--muted)] p-1 rounded-lg">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === "list"
                ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <List size={16} />
            <span className="hidden sm:inline">Chapters</span>
          </button>
          <button
            onClick={() => setViewMode("hierarchy")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === "hierarchy"
                ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <LayoutGrid size={16} />
            <span className="hidden sm:inline">By Course</span>
          </button>
        </div>
      </div>

      {/* List View - Simple Chapters */}
      {viewMode === "list" && (
        <div className="grid gap-4">
          {purchases.map((purchase) => (
            <div
              key={purchase.id}
              className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-5 hover:shadow-lg hover:border-[var(--primary)]/30 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <h3 className="text-lg font-semibold text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition-colors">
                      {purchase.chapter.title}
                    </h3>
                  </div>

                  {/* Breadcrumb */}
                  <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-3 flex-wrap">
                    <span className="font-medium text-[var(--foreground)]/80">
                      {purchase.chapter.module.expertise.skillCategory.course.title}
                    </span>
                    <ChevronRight size={14} />
                    <span>{purchase.chapter.module.expertise.skillCategory.name}</span>
                    <ChevronRight size={14} />
                    <span>{purchase.chapter.module.expertise.name}</span>
                    <ChevronRight size={14} />
                    <span>{purchase.chapter.module.title}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)] flex-wrap">
                    <span className="text-xs bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-1 rounded font-medium">
                      {purchase.chapter.module.expertise.skillCategory.course.category.name}
                    </span>
                    <span className="text-xs bg-[var(--muted)] text-[var(--muted-foreground)] px-2 py-1 rounded">
                      {purchase.chapter.module.expertise.skillCategory.course.subCategory.name}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => goToLessons(purchase.chapter.id, purchase.chapter.title)}
                  className="flex gap-2 items-center px-5 py-2.5 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg text-sm font-bold hover:opacity-90 hover:shadow-md transition-all duration-200 flex-shrink-0"
                >
                  <Play size={16} />
                  Go to Lessons
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hierarchy View - By Course */}
      {viewMode === "hierarchy" && (
        <div className="space-y-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Course Header */}
              <button
                onClick={() => toggleCourse(course.id)}
                className="w-full bg-gradient-to-r from-[var(--primary)]/10 via-[var(--primary)]/5 to-[var(--secondary)]/10 px-6 py-5 border-b border-[var(--border)]/50 text-left hover:from-[var(--primary)]/15 hover:via-[var(--primary)]/10 hover:to-[var(--secondary)]/15 transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {course.tumbnailUrl && (
                      <img
                        src={course.tumbnailUrl}
                        alt={course.title}
                        className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-[var(--foreground)] mb-1 truncate">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)] flex-wrap">
                        <span className="flex items-center gap-1.5 bg-[var(--primary)]/10 text-[var(--primary)] px-2.5 py-1 rounded-full text-xs font-medium">
                          <Folder size={12} />
                          {course.category.name}
                        </span>
                        <span className="flex items-center gap-1.5 bg-[var(--muted)] text-[var(--muted-foreground)] px-2.5 py-1 rounded-full text-xs font-medium">
                          {course.subCategory.name}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BookOpen size={14} />
                          {course.totalPurchasedChapters} chapters
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    size={24}
                    className={`text-[var(--muted-foreground)] transition-transform duration-300 flex-shrink-0 ${
                      expandedCourses.has(course.id) ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Course Content */}
              {expandedCourses.has(course.id) && (
                <div className="divide-y divide-[var(--border)]/40">
                  {course.SkillCategory.map((skillCategory, scIndex) => (
                    <div key={skillCategory.id}>
                      {/* Skill Category Header */}
                      <button
                        onClick={() => toggleSkillCategory(skillCategory.id)}
                        className="w-full px-6 py-4 hover:bg-[var(--muted)]/40 transition-colors text-left"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/80 text-[var(--primary-foreground)] rounded-xl text-sm font-bold shadow flex-shrink-0">
                              {scIndex + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-[var(--foreground)]">
                                {skillCategory.name}
                              </h4>
                              <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">
                                {skillCategory.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-1 rounded-full">
                              {skillCategory.Expertise.reduce(
                                (acc, exp) =>
                                  acc +
                                  exp.Module.reduce(
                                    (a, m) => a + m.Chapters.length,
                                    0
                                  ),
                                0
                              )}{" "}
                              chapters
                            </span>
                            <ChevronDown
                              size={18}
                              className={`text-[var(--muted-foreground)] transition-transform duration-300 ${
                                expandedSkillCategories.has(skillCategory.id)
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </div>
                        </div>
                      </button>

                      {/* Expertise List */}
                      {expandedSkillCategories.has(skillCategory.id) && (
                        <div className="bg-[var(--muted)]/20 px-6 py-3 space-y-2">
                          {skillCategory.Expertise.map((expertise, expIndex) => (
                            <div key={expertise.id} className="space-y-2">
                              {/* Expertise Header */}
                              <button
                                onClick={() => toggleExpertise(expertise.id)}
                                className="w-full p-3 bg-[var(--card)] rounded-lg border border-[var(--border)]/60 hover:border-[var(--primary)]/40 transition-all text-left"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="flex items-center justify-center w-8 h-8 bg-[var(--secondary)]/20 text-[var(--secondary-foreground)] rounded-lg text-xs font-bold flex-shrink-0">
                                      <Award size={14} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-semibold text-[var(--foreground)] text-sm">
                                        {scIndex + 1}.{expIndex + 1} {expertise.name}
                                      </h5>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-[var(--foreground)] bg-[var(--primary)]/10 px-2 py-1 rounded-full">
                                      {expertise.Module.reduce(
                                        (a, m) => a + m.Chapters.length,
                                        0
                                      )}
                                    </span>
                                    <ChevronDown
                                      size={16}
                                      className={`text-[var(--muted-foreground)] transition-transform duration-300 ${
                                        expandedExpertise.has(expertise.id)
                                          ? "rotate-180"
                                          : ""
                                      }`}
                                    />
                                  </div>
                                </div>
                              </button>

                              {/* Modules */}
                              {expandedExpertise.has(expertise.id) && (
                                <div className="ml-4 space-y-2">
                                  {expertise.Module.map((module, modIndex) => (
                                    <div key={module.id} className="space-y-2">
                                      {/* Module Header */}
                                      <button
                                        onClick={() => toggleModule(module.id)}
                                        className="w-full p-3 bg-[var(--background)] rounded-lg border border-[var(--border)]/60 hover:border-[var(--secondary)]/60 transition-all text-left"
                                      >
                                        <div className="flex items-center justify-between gap-3">
                                          <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="flex items-center justify-center w-7 h-7 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg flex-shrink-0">
                                              <Folder size={12} />
                                            </div>
                                            <span className="font-medium text-[var(--foreground)] text-sm">
                                              Expertise {modIndex + 1}: {module.title}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-[var(--foreground)] bg-[var(--primary)]/10 px-2 py-1 rounded-full">
                                              {module.Chapters.length}
                                            </span>
                                            <ChevronDown
                                              size={14}
                                              className={`text-[var(--muted-foreground)] transition-transform duration-300 ${
                                                expandedModules.has(module.id)
                                                  ? "rotate-180"
                                                  : ""
                                              }`}
                                            />
                                          </div>
                                        </div>
                                      </button>

                                      {/* Chapters */}
                                      {expandedModules.has(module.id) && (
                                        <div className="ml-4 space-y-2">
                                          {module.Chapters.map((chapter, chapterIndex) => (
                                            <div
                                              key={chapter.id}
                                              className="group flex items-center justify-between p-4 bg-[var(--card)] rounded-xl border border-[var(--border)]/60 hover:border-green-500/60 hover:bg-green-50/30 dark:hover:bg-green-900/10 transition-all"
                                            >
                                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg flex-shrink-0">
                                                  <VideoIcon size={14} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <h6 className="text-sm font-bold text-[var(--foreground)] group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                                                    Chapter {chapterIndex + 1}: {chapter.title}
                                                  </h6>
                                                  <div className="flex items-center gap-3 mt-1 text-xs text-[var(--muted-foreground)]">
                                                    <span className="flex items-center gap-1">
                                                      <Clock size={12} />
                                                      {formatDuration(calculateChapterDuration(chapter))}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                      <VideoIcon size={12} />
                                                      {chapter.Lessons?.length || 0} lessons
                                                    </span>
                                                    <span className="flex items-center gap-1 text-green-600">
                                                      <CheckCircle2 size={12} />
                                                      Purchased
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                              <button
                                                onClick={() => goToLessons(chapter.id, chapter.title)}
                                                className="flex gap-2 items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold hover:shadow-md transition-all duration-200 flex-shrink-0"
                                              >
                                                <Play size={14} />
                                                Start
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Explore More Courses Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="group relative px-8 py-4 bg-gradient-to-r from-[var(--primary)] to-blue-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <span>Explore Courses</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
