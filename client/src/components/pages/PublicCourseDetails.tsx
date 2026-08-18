import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import NavBar from "../ui/Landing/NavBar";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios/axios";
import { API_ROUTES } from "../../lib/api";
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
} from "../../types";
import {
  BookOpen,
  Folder,
  Award,
  Play,
  Users,
  Star,
  ArrowLeft,
  LogIn,
  UserPlus,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import useLogin from "../../hooks/useLogin";
import CourseMaterials from "../ui/Courses/CourseMaterials";
import CourseCurriculumSection, {
  type FocusedItem,
  type FocusType,
} from "../ui/Courses/CourseCurriculumSection";

// ============================================================
// TYPES
// ============================================================

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

// ============================================================
// COMPONENT
// ============================================================

export default function PublicCourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLogedIn } = useLogin();

  if (!courseId) {
    return <div className="w-full">Invalid Value Stream ID</div>;
  }

  // Parse focus from URL: e.g. ?focus=skillcategory:abc123
  const focusParam = searchParams.get("focus");
  let focusedItem: FocusedItem | null = null;
  if (focusParam) {
    const [type, id] = focusParam.split(":");
    if (type && id && ["skillcategory", "expertise", "module", "chapter"].includes(type)) {
      focusedItem = { type: type as FocusType, id };
    }
  }

  // --------------------------------------------------------
  // QUERIES
  // --------------------------------------------------------

  const courseDetailsQuery = useQuery({
    queryKey: ["public-course-details", courseId],
    queryFn: async () => {
      const res = await api.get<CourseDetailsResponse>(
        API_ROUTES.COURSE.GET_PUBLIC_COURSE_DETAILS(courseId)
      );
      return res.data;
    },
  });

  const purchaseStatusQuery = useQuery({
    queryKey: ["course-purchase-status", courseId],
    queryFn: async () => {
      const res = await api.get(
        API_ROUTES.PURCHASE.CHECK_COURSE_STATUS(courseId)
      );
      return res.data;
    },
    enabled: isLogedIn,
  });

  // --------------------------------------------------------
  // LOADING / ERROR STATES
  // --------------------------------------------------------

  if (courseDetailsQuery.isLoading) {
    return (
      <div className="w-full min-h-screen bg-background">
        <NavBar />
        <div className="p-8 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded-lg w-1/3" />
            <div className="h-4 bg-muted rounded-lg w-1/2" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-6 bg-muted rounded-lg" />
                ))}
              </div>
              <div className="h-56 bg-muted rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (courseDetailsQuery.error || !courseDetailsQuery.data) {
    return (
      <div className="w-full min-h-screen bg-background">
        <NavBar />
        <div className="p-8 max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-destructive text-lg mb-4">
              Failed to load Value Stream details
            </div>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const course = courseDetailsQuery.data?.data;
  if (!course) return null;

  const isCourseFree = course.totalPrice === 0;
  const isPurchased = purchaseStatusQuery.data?.data?.isPurchased || false;

  // --------------------------------------------------------
  // COUNTS
  // --------------------------------------------------------

  const totalChapters = course.SkillCategory.reduce(
    (total: number, skill: SkillCategory) =>
      total +
      skill.Expertise.reduce(
        (et: number, exp: Expertise) =>
          et +
          exp.Module.reduce(
            (mt: number, mod: Module) => mt + mod.Chapters.length,
            0
          ),
        0
      ),
    0
  );

  // --------------------------------------------------------
  // FOCUSED ITEM LABEL (for display in hero when focused)
  // --------------------------------------------------------
  const getFocusedLabel = (): string | null => {
    if (!focusedItem) return null;
    for (const skill of course.SkillCategory) {
      if (focusedItem.type === "skillcategory" && skill.id === focusedItem.id)
        return skill.name;
      for (const exp of skill.Expertise) {
        if (focusedItem.type === "expertise" && exp.id === focusedItem.id)
          return exp.name;
        for (const mod of exp.Module) {
          if (focusedItem.type === "module" && mod.id === focusedItem.id)
            return mod.title;
          for (const chap of mod.Chapters) {
            if (focusedItem.type === "chapter" && chap.id === focusedItem.id)
              return chap.title;
          }
        }
      }
    }
    return null;
  };

  const focusedLabel = getFocusedLabel();

  // --------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------

  const handleEnrollClick = () => {
    if (!isLogedIn) {
      const shouldLogin = confirm(
        "You need to login to enroll in this Value Stream. Click OK to login or Cancel to sign up."
      );
      if (shouldLogin) {
        navigate("/login", { state: { redirect: `/course/${courseId}` } });
      } else {
        navigate("/signup", { state: { redirect: `/course/${courseId}` } });
      }
      return;
    }
    navigate(`/course/${courseId}`);
  };

  // --------------------------------------------------------
  // RENDER
  // --------------------------------------------------------

  return (
    <div className="w-full min-h-screen bg-background">
      <NavBar />

      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12">

          {/* Back button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Home</span>
          </button>

          {/* Focused breadcrumb */}
          {focusedItem && focusedLabel && (
            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
              <button
                onClick={() => navigate(`/public/course/${courseId}`)}
                className="hover:text-primary transition-colors hover:underline underline-offset-2"
              >
                {course.title}
              </button>
              <span>/</span>
              <span className="text-foreground font-medium">{focusedLabel}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              {/* Category breadcrumb */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-semibold border border-primary/20">
                  <Folder size={14} />
                  {course.category.name}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="inline-flex items-center gap-2 bg-secondary/10 text-secondary-foreground px-4 py-2 rounded-full text-xs font-semibold border border-border/50">
                  {course.subCategory.name}
                </span>
              </div>

              {/* Price badge */}
              <div className="mb-4">
                {isCourseFree ? (
                  <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold border border-primary/20">
                    <CheckCircle2 size={16} />
                    Free Value Stream
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold border border-primary/20">
                    <CreditCard size={16} />
                    Paid Value Stream — ${course.totalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                {course.title}
              </h1>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed mb-6 text-lg max-w-2xl">
                {course.description}
              </p>

              {/* Meta stats */}
              <div className="flex flex-wrap gap-6 text-sm mb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span>
                    <span className="font-semibold text-foreground">
                      {totalChapters}
                    </span>{" "}
                    Chapters
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Award className="w-5 h-5 text-primary" />
                  <span>
                    <span className="font-semibold text-foreground">
                      {course.SkillCategory.length}
                    </span>{" "}
                    Modules
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-5 h-5 text-primary" />
                  <span>
                    <span className="font-semibold text-foreground">1,234</span>{" "}
                    Students
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Star className="w-5 h-5 fill-primary text-primary" />
                  <span>
                    <span className="font-semibold text-foreground">4.8</span>{" "}
                    Rating
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                {isPurchased ? (
                  <div className="flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-lg font-semibold border border-primary/20">
                    <CheckCircle2 size={18} />
                    Purchased
                  </div>
                ) : (
                  <button
                    onClick={handleEnrollClick}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                  >
                    {isLogedIn ? (
                      <>
                        <UserPlus size={18} />
                        Enroll Now
                      </>
                    ) : (
                      <>
                        <LogIn size={18} />
                        Login to Enroll
                      </>
                    )}
                  </button>
                )}
                {!isLogedIn && (
                  <button
                    onClick={() => navigate("/signup")}
                    className="flex items-center gap-2 px-6 py-3 bg-card border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all duration-200"
                  >
                    <UserPlus size={18} />
                    Sign Up
                  </button>
                )}
              </div>
            </div>

            {/* Course Thumbnail */}
            {course.tumbnailUrl && (
              <div className="flex justify-center lg:justify-end">
                <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-border bg-card hover:shadow-xl transition-shadow duration-300">
                  <div className="aspect-video w-full overflow-hidden bg-muted relative group">
                    <img
                      src={course.tumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-16 h-16 bg-card/90 rounded-full flex items-center justify-center">
                        <Play
                          size={24}
                          className="text-primary ml-1"
                          fill="currentColor"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-card border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Value Stream Preview
                      </span>
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
                        Published
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CURRICULUM SECTION ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <CourseCurriculumSection
          skillCategories={course.SkillCategory}
          focusedItem={focusedItem}
        />

        {/* Course Materials */}
        <div className="mt-8">
          <CourseMaterials courseId={courseId} />
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8 border border-primary/20">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Ready to Start Learning?
            </h3>
            <p className="text-muted-foreground mb-6">
              {isPurchased
                ? "You have access to this Value Stream"
                : "Join thousands of students already enrolled"}
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              {isPurchased ? (
                <button
                  onClick={() => navigate(`/course/${courseId}`)}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Go to Value Stream
                </button>
              ) : (
                <>
                  <button
                    onClick={handleEnrollClick}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                  >
                    {isLogedIn ? "Enroll Now" : "Login to Enroll"}
                  </button>
                  {!isLogedIn && (
                    <button
                      onClick={() => navigate("/signup")}
                      className="flex items-center gap-2 px-8 py-3 bg-card border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all duration-200"
                    >
                      <UserPlus size={18} />
                      Sign Up
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
