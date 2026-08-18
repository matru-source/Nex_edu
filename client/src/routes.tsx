import type { JSX } from "react";
import Login from "./components/pages/Login";
import AppLayout from "./components/ui/Layout/AppLayout";
import Home from "./components/pages/Home";
import {
  Brain,
  HomeIcon,
  MessageCircle,
  FileText,
  DollarSign,
  Users,
  ShoppingCart,
  BookOpen,
  TrendingUp,
  PlusCircle,
  ImageIcon,
} from "lucide-react";
import Landing from "./components/pages/Landing";
import type { UserRole } from "./types";
import Dashboard from "./components/pages/admin/Dashboard";
import AdminCourses from "./components/pages/admin/AdminCourses";
import CreateCourses from "./components/pages/admin/CreateCourses";
import CreateSkillCategory from "./components/pages/admin/CreateSkillCategory";
import ViewSkillCategory from "./components/pages/admin/ViewSkillCategory";
import ViewExpertise from "./components/pages/admin/ViewExpertise";
import CreateExpertise from "./components/pages/admin/CreateExpertise";
import ViewModules from "./components/pages/admin/ViewModules";
import CreateModule from "./components/pages/admin/CreateModule";
import ViewChapters from "./components/pages/admin/ViewChapters";
import CreateChapters from "./components/pages/admin/CreateChapters";
import ViewLessons from "./components/pages/admin/ViewLessons";
import CreateLessons from "./components/pages/admin/CreateLessons";
import CourseDetails from "./components/pages/students/course/CourseDetails";
import Forum from "./components/pages/students/foroum/Forum";
// Quiz imports
import AdminQuizzes from "./components/pages/admin/quiz/AdminQuizzes";
import QuizDetails from "./components/pages/admin/quiz/QuizDetails";
import AdminQuizAttemptDetails from "./components/pages/admin/quiz/AdminQuizAttemptDetails";
import ViewLessonQuizzes from "./components/pages/admin/quiz/ViewLessonQuizzes";
import SelectQuizLocation from "./components/pages/admin/quiz/SelectQuizLocation";
import Courses from "./components/pages/students/course/Courses";
import Lessons from "./components/pages/students/course/Lessons";
import Question from "./components/pages/students/foroum/Qestion";
import PublicCourseDetails from "./components/pages/PublicCourseDetails";
import PurchaseHistory from "./components/pages/students/PurchaseHistory";
import Signup from "./components/pages/Signup";
import CareerPath from "./components/pages/CareerPath";
import AdminStudents from "./components/pages/admin/AdminStudents";
import StudentDetails from "./components/pages/admin/StudentDetails";
import AdminPurchases from "./components/pages/admin/AdminPurchases";
import CreateChapterQuiz from "./components/pages/admin/quiz/CreateChapterQuiz";
import SelectChapterForQuiz from "./components/pages/admin/quiz/SelectChapterForQuiz";
import SelectModuleForQuiz from "./components/pages/admin/quiz/SelectModuleForQuiz";
import ViewChapterQuizzes from "./components/pages/admin/quiz/ViewChapterQuizzes";
import SelectCourseForQuiz from "./components/pages/admin/quiz/SelectCourseForQuiz";
import MyQuizAttempts from "./components/pages/students/quiz/MyQuizAttempts";
import QuizResults from "./components/pages/students/quiz/QuizResults";
import TakeQuiz from "./components/pages/students/quiz/TakeQuiz";
import StudentQuizzes from "./components/pages/students/quiz/StudentQuizzes";
import Gateway360 from "./components/pages/skillgateway/Gtaeway360";
import Gateway180 from "./components/pages/skillgateway/Gateway180";
import Gateway90 from "./components/pages/skillgateway/Gateway90";
import ForgetPassword from "./components/pages/ForgetPassword";
import ViewSubCategories from "./components/pages/admin/ViewSubCategories";
import ViewCategories from "./components/pages/admin/ViewCategories";
import ViewBrandOEM from "./components/pages/admin/ViewBrandOEM";
import Profile from "./components/pages/profile";
import AdminUsers from "./components/pages/admin/AdminUser";
import Notifications from "./components/pages/Notification";
import CourseStatus from "./components/pages/moderator/CourseStatus";
import ReviewContents from "./components/pages/moderator/ReviewContents";
import Submissions from "./components/pages/moderator/Submissions";
import ContributionStatus from "./components/pages/contributor/ContributionStatus";
import WorkflowStats from "./components/pages/admin/WorkflowStats";
import WorkflowHistory from "./components/pages/admin/WorkFlowHistory";
import WorkflowTracker from "./components/pages/admin/WorkflowTracker";
import ContributorCourseDetails from "./components/pages/contributor/ContributorCourseDetails";
import ContributorCourses from "./components/pages/contributor/ContributorCourse";
import CreateCategory from "./components/pages/category/CreateCategory";
import CreateSubCategory from "./components/pages/category/CreateSubCategory";
import SubCategoryCourses from "./components/pages/SubCategoryCourses";
import SpecializationCourses from "./components/pages/SpecializationCourses";
import BrandCourses from "./components/pages/BrandCourses";
import ContactResponses from "./components/pages/admin/ContactResponses";
import AdminFaq from "./components/pages/admin/AdminFaq";
import PublicQuizzes from "./components/pages/PublicQuizzes";
import Cart from "./components/pages/students/Cart";
import ExploreLevels from "./components/pages/ExploreLevels";
import AdminMediaManagement from "./components/pages/admin/AdminMediaManagement";
import Corporate from "./components/pages/Corporate";

type Route = {
  path: string;
  element: JSX.Element;
  menu?: boolean;
  name?: string;
  icon?: JSX.Element;
  activeFor?: string[];
  role?: UserRole | "ALL";
}[];

export const routes: Route = [
  {
    path: "*",
    element: <div>Sorry not found</div>,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/forget-password",
    element: <ForgetPassword />,
  },
  {
    path: "/career-path",
    element: <CareerPath />,
  },
  {
    path: "/quizzes/explore",
    element: <PublicQuizzes />,
  },
  {
    path: "/gateway/360",
    element: <Gateway360 />,
  },
  {
    path: "/gateway/180",
    element: <Gateway180 />,
  },
  {
    path: "/gateway/90",
    element: <Gateway90 />,
  },
  {
    path: "/corporate",
    element: <Corporate />,
  },
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/explore/:levelType",
    element: <ExploreLevels />,
  },
  {
    path: "/catalog/category/:categoryId/sub/:subCategoryId",
    element: <SubCategoryCourses />,
  },
  {
    path: "/catalog/specialization/:categoryId",
    element: <SpecializationCourses />,
  },
  {
    path: "/catalog/brand/:subCategoryId",
    element: <BrandCourses />,
  },
  {
    path: "/dashboard",
    element: (
      <AppLayout>
        <Home />
      </AppLayout>
    ),
    menu: true,
    name: "Explore Value Streams",
    icon: <HomeIcon size={16} />,
    role: "STUDENT",
  },

  {
    path: "/contributor/courses",
    element: (
      <AppLayout>
        <ContributorCourses />
      </AppLayout>
    ),
    menu: true,
    name: "My Value Streams",
    icon: <BookOpen size={16} />,
    role: "CONTRIBUTOR",
  },
  {
    path: "/contributor/courses/:courseId",
    element: (
      <AppLayout>
        <ContributorCourseDetails />
      </AppLayout>
    ),
    role: "CONTRIBUTOR",
  },
  {
    path: "/contributor/status/:type/:id",
    element: (
      <AppLayout>
        <ContributionStatus />
      </AppLayout>
    ),
    role: "CONTRIBUTOR",
  },

  {
    path: "/admin/categories/create",
    element: (
      <AppLayout>
        <CreateCategory />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  {
    path: "/admin/subcategories/create",
    element: (
      <AppLayout>
        <CreateSubCategory />
      </AppLayout>
    ),
    role: "ADMIN",
  },

  // Moderator routes
  {
    path: "/moderator/submissions",
    element: (
      <AppLayout>
        <Submissions />
      </AppLayout>
    ),
    menu: true,
    name: "Submissions",
    icon: <FileText size={16} />,
    role: "MODERATOR",
  },
  {
    path: "/moderator/review/:courseId",
    element: (
      <AppLayout>
        <ReviewContents />
      </AppLayout>
    ),
    role: "MODERATOR",
  },
  {
    path: "/moderator/review/chapter/:chapterId",
    element: (
      <AppLayout>
        <ReviewContents />
      </AppLayout>
    ),
    role: "MODERATOR",
  },
  {
    path: "/moderator/review/lesson/:lessonId",
    element: (
      <AppLayout>
        <ReviewContents />
      </AppLayout>
    ),
    role: "MODERATOR",
  },
  {
    path: "/moderator/status",
    element: (
      <AppLayout>
        <CourseStatus />
      </AppLayout>
    ),
    menu: true,
    name: "Content Status",
    icon: <TrendingUp size={16} />,
    role: "MODERATOR",
  },

  {
    path: "/profile",
    element: (
      <AppLayout>
        <Profile />
      </AppLayout>
    ),
    menu: false, // Not in menu, accessed via sidebar profile circle
    role: "ALL", // Available to both ADMIN and STUDENT
  },
  {
    path: "/courses",
    element: (
      <AppLayout>
        <Courses />
      </AppLayout>
    ),
    menu: true,
    name: "My Value Streams",
    icon: <Brain size={16} />,
    role: "STUDENT",
    activeFor: ["/course/lessons"],
  },
  {
    path: "/course/:courseId",
    element: (
      <AppLayout>
        <CourseDetails />
      </AppLayout>
    ),
    role: "STUDENT",
  },
  {
    path: "/public/course/:courseId",
    element: <PublicCourseDetails />,
  },
  {
    path: "/course/lessons/:chapterId",
    element: (
      <AppLayout>
        <Lessons />
      </AppLayout>
    ),
    role: "STUDENT",
  },
  {
    path: "/cart",
    element: (
      <AppLayout>
        <Cart />
      </AppLayout>
    ),
    menu: false,
    name: "My Cart",
    icon: <ShoppingCart size={16} />,
    role: "STUDENT",
  },
  {
    path: "/purchases",
    element: (
      <AppLayout>
        <PurchaseHistory />
      </AppLayout>
    ),
    menu: true,
    name: "My Purchases",
    icon: <DollarSign size={16} />,
    role: "STUDENT",
  },
  {
    path: "/notifications",
    element: (
      <AppLayout>
        <Notifications />
      </AppLayout>
    ),
    menu: false,
    role: "ALL",
  },
  {
    path: "/forum",
    element: (
      <AppLayout>
        <Forum />
      </AppLayout>
    ),
    menu: true,
    name: "Forum Discussion",
    icon: <MessageCircle size={16} />,
    role: "STUDENT",
    activeFor: ["/question"],
  },
  {
    path: "/admin/categories",
    element: (
      <AppLayout>
        <ViewCategories />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  {
    path: "/admin/subcategories/:categoryId",
    element: (
      <AppLayout>
        <ViewSubCategories />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  {
    path: "/admin/brand-oem",
    element: (
      <AppLayout>
        <ViewBrandOEM />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  {
    path: "/admin/brand-oem/create",
    element: (
      <AppLayout>
        <CreateSubCategory />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  {
    path: "/question/:questionId",
    element: (
      <AppLayout>
        <Question />
      </AppLayout>
    ),
    role: "STUDENT",
  },
  {
    path: "/admin/dashboard",
    element: (
      <AppLayout>
        <Dashboard />
      </AppLayout>
    ),
    menu: true,
    name: "Dashboard",
    icon: <HomeIcon size={16} />,
    role: "ADMIN",
  },
  {
    path: "/admin/courses",
    element: (
      <AppLayout>
        <AdminCourses />
      </AppLayout>
    ),
    menu: true,
    name: "Value Streams",
    icon: <Brain size={16} />,
    role: "ADMIN",
    activeFor: [
      "admin/courses/create",
      "admin/courses/view",
      "admin/skill_category",
      "admin/expertise",
    ],
  },
  {
    path: "/admin/courses/create",
    element: (
      <AppLayout>
        <CreateCourses />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  {
    path: "/admin/skill_category/:courseId",
    element: (
      <AppLayout>
        <ViewSkillCategory />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  {
    path: "/admin/skill_category/create/:courseId",
    element: (
      <AppLayout>
        <CreateSkillCategory />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  {
    path: "/admin/expertise/:skillCategoryId",
    element: (
      <AppLayout>
        <ViewExpertise />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  {
    path: "/admin/expertise/create/:skillCategoryId",
    element: (
      <AppLayout>
        <CreateExpertise />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  {
    path: "/admin/module/:expertiseId",
    element: (
      <AppLayout>
        <ViewModules />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  {
    path: "/admin/module/create/:expertiseId",
    element: (
      <AppLayout>
        <CreateModule />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  {
    path: "/admin/chapters/:moduleId",
    element: (
      <AppLayout>
        <ViewChapters />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  {
    path: "/admin/chapters/create/:moduleId",
    element: (
      <AppLayout>
        <CreateChapters />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  {
    path: "/admin/lessons/:chapterId",
    element: (
      <AppLayout>
        <ViewLessons />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  {
    path: "/admin/lessons/create/:chapterId",
    element: (
      <AppLayout>
        <CreateLessons />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  // Contributor Course Creation Routes
  {
    path: "/contributor/courses/create",
    element: (
      <AppLayout>
        <CreateCourses />
      </AppLayout>
    ),
    menu: true,
    name: "Create Value Stream",
    icon: <PlusCircle size={16} />,
    role: "CONTRIBUTOR",
  },
  {
    path: "/contributor/skill_category/:courseId",
    element: (
      <AppLayout>
        <ViewSkillCategory />
      </AppLayout>
    ),
    role: "CONTRIBUTOR",
  },
  {
    path: "/contributor/skill_category/create/:courseId",
    element: (
      <AppLayout>
        <CreateSkillCategory />
      </AppLayout>
    ),
    role: "CONTRIBUTOR",
  },
  {
    path: "/contributor/expertise/:skillCategoryId",
    element: (
      <AppLayout>
        <ViewExpertise />
      </AppLayout>
    ),
    role: "CONTRIBUTOR",
  },
  {
    path: "/contributor/expertise/create/:skillCategoryId",
    element: (
      <AppLayout>
        <CreateExpertise />
      </AppLayout>
    ),
    role: "CONTRIBUTOR",
  },
  {
    path: "/contributor/module/:expertiseId",
    element: (
      <AppLayout>
        <ViewModules />
      </AppLayout>
    ),
    role: "CONTRIBUTOR",
  },
  {
    path: "/contributor/module/create/:expertiseId",
    element: (
      <AppLayout>
        <CreateModule />
      </AppLayout>
    ),
    role: "CONTRIBUTOR",
  },
  {
    path: "/contributor/chapters/:moduleId",
    element: (
      <AppLayout>
        <ViewChapters />
      </AppLayout>
    ),
    role: "CONTRIBUTOR",
  },
  {
    path: "/contributor/chapters/create/:moduleId",
    element: (
      <AppLayout>
        <CreateChapters />
      </AppLayout>
    ),
    role: "CONTRIBUTOR",
  },
  {
    path: "/contributor/lessons/:chapterId",
    element: (
      <AppLayout>
        <ViewLessons />
      </AppLayout>
    ),
    role: "CONTRIBUTOR",
  },
  {
    path: "/contributor/lessons/create/:chapterId",
    element: (
      <AppLayout>
        <CreateLessons />
      </AppLayout>
    ),
    role: "CONTRIBUTOR",
  },
  // Quiz routes
  {
    path: "/admin/quizzes",
    element: (
      <AppLayout>
        <AdminQuizzes />
      </AppLayout>
    ),
    menu: true,
    name: "Quizzes",
    icon: <FileText size={16} />,
    role: "ADMIN",
    activeFor: ["admin/quiz"],
  },
  // Lesson quiz routes (from lessons page)
  {
    path: "/admin/lesson/:lessonId/quizzes",
    element: (
      <AppLayout>
        <ViewLessonQuizzes />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  // General quiz creation (from main quiz page)
  {
    path: "/admin/quiz/create",
    element: (
      <AppLayout>
        <SelectQuizLocation />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  // {
  //   path: "/admin/quiz/create/chapter/:chapterId",
  //   element: (
  //     <AppLayout>
  //       <CreateChapterQuiz />
  //     </AppLayout>
  //   ),
  //   role: "ADMIN",
  // },
  {
    path: "/admin/quiz/:quizId/details",
    element: (
      <AppLayout>
        <QuizDetails />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  {
    path: "/admin/quiz/:quizId/attempts/:attemptId",
    element: (
      <AppLayout>
        <AdminQuizAttemptDetails />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  {
    path: "/admin/students",
    element: (
      <AppLayout>
        <AdminStudents />
      </AppLayout>
    ),
    menu: true,
    name: "Students",
    icon: <Users size={16} />,
    role: "ADMIN",
  },
  {
    path: "/admin/students/:id",
    element: (
      <AppLayout>
        <StudentDetails />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  {
    path: "/admin/purchases",
    element: (
      <AppLayout>
        <AdminPurchases />
      </AppLayout>
    ),
    menu: true,
    name: "Purchases",
    icon: <ShoppingCart size={16} />,
    role: "ADMIN",
  },
  {
    path: "/admin/quiz/create/select-course",
    element: (
      <AppLayout>
        <SelectCourseForQuiz />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  {
    path: "/admin/quiz/create/select-module/:courseId",
    element: (
      <AppLayout>
        <SelectModuleForQuiz />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  {
    path: "/admin/quiz/create/select-chapter/:moduleId",
    element: (
      <AppLayout>
        <SelectChapterForQuiz />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  {
    path: "/admin/chapter/:chapterId/quiz/create",
    element: (
      <AppLayout>
        <CreateChapterQuiz />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  {
    path: "/admin/chapter/:chapterId/quizzes",
    element: (
      <AppLayout>
        <ViewChapterQuizzes />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  {
    path: "/quizzes",
    element: (
      <AppLayout>
        <StudentQuizzes />
      </AppLayout>
    ),
    menu: true,
    name: "Quizzes",
    icon: <FileText size={16} />,
    role: "STUDENT",
    activeFor: ["/quiz/", "/quiz/attempts"],
  },
  {
    path: "/quiz/:quizId/take",
    element: (
      <AppLayout>
        <TakeQuiz />
      </AppLayout>
    ),
    role: "STUDENT",
  },
  {
    path: "/quiz/:quizId/results/:attemptId",
    element: (
      <AppLayout>
        <QuizResults />
      </AppLayout>
    ),
    role: "STUDENT",
  },
  {
    path: "/quiz/attempts",
    element: (
      <AppLayout>
        <MyQuizAttempts />
      </AppLayout>
    ),
    menu: true,
    name: "Quiz History",
    icon: <BookOpen size={16} />,
    role: "STUDENT",
  },
  {
    path: "/admin/users",
    element: (
      <AppLayout>
        <AdminUsers />
      </AppLayout>
    ),
    menu: true,
    name: "User Management",
    icon: <Users size={16} />,
    role: "ADMIN",
  },
  {
    path: "/admin/workflows",
    element: (
      <AppLayout>
        <WorkflowTracker />
      </AppLayout>
    ),
    menu: true,
    name: "Workflow Tracker",
    icon: <TrendingUp size={16} />,
    role: "ADMIN",
  },
  {
    path: "/admin/workflows/:entityType/:entityId",
    element: (
      <AppLayout>
        <WorkflowHistory />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  {
    path: "/admin/workflows/stats",
    element: (
      <AppLayout>
        <WorkflowStats />
      </AppLayout>
    ),
    role: "ADMIN",
  },
  {
    path: "/admin/contacts",
    element: (
      <AppLayout>
        <ContactResponses />
      </AppLayout>
    ),
    menu: true,
    name: "Contact Responses",
    icon: <MessageCircle size={16} />,
    role: "ADMIN",
  },
  {
    path: "/admin/faq",
    element: (
      <AppLayout>
        <AdminFaq />
      </AppLayout>
    ),
    menu: true,
    name: "FAQ Management",
    icon: <MessageCircle size={16} />,
    role: "ADMIN",
  },
  {
    path: "/admin/media",
    element: (
      <AppLayout>
        <AdminMediaManagement />
      </AppLayout>
    ),
    menu: true,
    name: "Media Management",
    icon: <ImageIcon size={16} />,
    role: "ADMIN",
  },
];

export function getDefaultRouteForRole(role: string | undefined): string {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "STUDENT":
      return "/dashboard";
    case "CONTRIBUTOR":
      return "/contributor/courses";
    case "MODERATOR":
      return "/moderator/submissions";
    default:
      return "/";
  }
}
