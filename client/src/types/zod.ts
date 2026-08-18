import { z } from "zod";

export const LoginRequest = z.object({
  email: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})
export type LoginRequestParams = z.infer<typeof LoginRequest>;

export const SignupRequest = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  goal: z.string().optional(),
  currentStatus: z.string().optional(),
});
export type SignupRequestParams = z.infer<typeof SignupRequest>;

// ✅ Add VerifyOTPRequest
export const VerifyOTPRequest = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});
export type VerifyOTPRequestParams = z.infer<typeof VerifyOTPRequest>;

// ✅ Add ResendOTPRequest
export const ResendOTPRequest = z.object({
  email: z.string().email("Invalid email address"),
});
export type ResendOTPRequestParams = z.infer<typeof ResendOTPRequest>;

export const CreateCourseRequest = z.object({
  title: z.string().min(1, "Value Stream is required"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Brand ID is required"),
  subCategoryId: z.string().min(1, "Application ID is required"),
  tumbnailUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
  published: z.boolean(),
});
export type CreateCourseRequestParams = z.infer<typeof CreateCourseRequest>;

export const CreateCategoryRequest = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});
export type CreateCategoryServiceParams = z.infer<typeof CreateCategoryRequest>;

export const CreateSubCategoryRequest = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().optional(), // Now optional - Application independent of Brand
});
export type CreateSubCategoryServiceParams = z.infer<typeof CreateSubCategoryRequest>;

export const UpdateCourseRequest = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  categoryId: z.string().min(1, "Brand ID is required").optional(),
  subCategoryId: z.string().min(1, "Application ID is required").optional(),
  tumbnailUrl: z.string().url("Invalid URL format").optional(),
  published: z.boolean().optional(),
  // NEW FIELDS
  priceCategory: z.enum(['FREE', 'TRIAL', 'PAID']).optional(),
  trialDuration: z.number().min(1, "Trial duration must be at least 1 day").optional(),
  coursePrice: z.number().min(0, "Course price must be non-negative").optional(),
});
export type UpdateCourseRequestParams = z.infer<typeof UpdateCourseRequest>;

export const CreateSkillCategoryRequest = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  courseId: z.string().min(1, "Value Stream ID is required"),
  tumbnailUrl: z.string().url("Invalid URL format").optional(),
  isPublished: z.boolean(),
});
export type CreateSkillCategoryRequestParams = z.infer<typeof CreateSkillCategoryRequest>;


export const CreateBulkSkillCategoriesRequest = z.object({
  skillCategories: z.array(CreateSkillCategoryRequest).min(1, "At least one Module is required"),
});
export type CreateBulkSkillCategoriesRequestParams = z.infer<typeof CreateBulkSkillCategoriesRequest>;

export const CreateExpertiseRequest = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  skillCategoryId: z.string().min(1, "Expertise ID is required"),
  tumbnailUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
  levels: z.array(z.enum(['LEARNER', 'PRACTITIONER', 'PROFESSIONAL'])).optional(),
  isPublished: z.boolean(),
});
export type CreateExpertiseRequestParams = z.infer<typeof CreateExpertiseRequest>;

export const CreateBulkExpertiseRequest = z.object({
  expertise: z.array(CreateExpertiseRequest).min(1, "At least one expertise is required"),
});
export type CreateBulkExpertiseRequestParams = z.infer<typeof CreateBulkExpertiseRequest>;

export const CreateModuleRequest = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  expertiseId: z.string().min(1, "Domain ID is required"),
  tumbnailUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
  levels: z.array(z.enum(['LEARNER', 'PRACTITIONER', 'PROFESSIONAL'])).optional(),
  isPublished: z.boolean(),
});
export type CreateModuleRequestParams = z.infer<typeof CreateModuleRequest>;

export const CreateBulkModulesRequest = z.object({
  modules: z.array(CreateModuleRequest).min(1, "At least one expertise is required"),
});
export type CreateBulkModulesRequestParams = z.infer<typeof CreateBulkModulesRequest>;

export const CreateChapterRequest = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  price: z.number().min(0, "Price must be a non-negative number"),
  moduleId: z.string().min(1, "Module ID is required"),
  tumbnailUrl: z.string().url("Invalid URL format").optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
});
export type CreateChapterRequestParams = z.infer<typeof CreateChapterRequest>;

export const CreateBulkChaptersRequest = z.object({
  chapters: z.array(CreateChapterRequest).min(1, "At least one chapter is required"),
});
export type CreateBulkChaptersRequestParams = z.infer<typeof CreateBulkChaptersRequest>;

export const CreateVideoRequest = z.object({
  url: z.string().url("Invalid URL format"),
  duration: z.number().min(0)
});
export type CreateVideoRequestParams = z.infer<typeof CreateVideoRequest>;

export const CreateLessonRequest = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  chapterId: z.string().min(1, "Chapter ID is required"),
  video: CreateVideoRequest.optional(),
  tumbnailUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
  status: z.enum(['DRAFT', 'PUBLISHED']),
});
export type CreateLessonRequestParams = z.infer<typeof CreateLessonRequest>;
export const CreateBulkLessonsRequest = z.object({
  lessons: z.array(CreateLessonRequest).min(1, "At least one lesson is required"),
});
export type CreateBulkLessonsRequestParams = z.infer<typeof CreateBulkLessonsRequest>;

export const CreateLessonQuestionRequest = z.object({
  lessonId: z.string().min(1, "Lesson ID is required"),
  userId: z.string().min(1, "User ID is required"),
  question: z.string().min(1, "Question is required"),
})
export type CreateLessonQuestionRequestParams = z.infer<typeof CreateLessonQuestionRequest>;

export const CreateQuestionReplyRequest = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  userId: z.string().min(1, "User ID is required"),
  reply: z.string().min(1, "Reply is required"),
  parentId: z.string().optional(),
})
export type CreateQuestionReplyRequestParams = z.infer<typeof CreateQuestionReplyRequest>;

export const CreateUserLessonNotesRequest = z.object({
  content: z.string().min(1, "Content is required"),
  lessonId: z.string().min(1, "Lesson ID is required"),
})
export type CreateUserLessonNotesRequestParams = z.infer<typeof CreateUserLessonNotesRequest>;

export const CreateQuizOptionRequest = z.object({
  optionText: z.string().min(1, "Option text is required"),
  isCorrect: z.boolean(),
  order: z.number().min(0),
});
export type CreateQuizOptionRequestParams = z.infer<typeof CreateQuizOptionRequest>;

export const CreateQuizQuestionRequest = z.object({
  questionText: z.string().min(1, "Question text is required"),
  questionType: z.literal('MCQ'),
  points: z.number().min(0), // Remove .default() - handle in form
  order: z.number().min(0),
  explanation: z.string().optional(),
  allowMultipleCorrect: z.boolean().optional(),
  options: z.array(CreateQuizOptionRequest).min(2, "At least 2 options required").refine(
    (options) => options.filter(opt => opt.isCorrect).length >= 1,
    "At least one option must be correct"
  ),
});
export type CreateQuizQuestionRequestParams = z.infer<typeof CreateQuizQuestionRequest>;

export const CreateQuizRequest = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  instruction: z.string().optional(),
  duration: z.number().min(1).optional(),
  maxAttempts: z.number().min(1), // Remove .default() - handle in form
  passingScore: z.number().min(0).max(100), // Remove .default() - handle in form
  allowReview: z.boolean(), // Remove .default() - handle in form
  showResultsImmediately: z.boolean(), // Remove .default() - handle in form
  chapterId: z.string().min(1, "Chapter ID is required"),
  questions: z.array(CreateQuizQuestionRequest).min(1, "At least one question is required"),
});
export type CreateQuizRequestParams = z.infer<typeof CreateQuizRequest>;


export const SubmitQuizAnswerRequest = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  selectedOptionId: z.string().optional(), // For single-select
  selectedOptionIds: z.array(z.string()).optional(), // For multi-select
});
export type SubmitQuizAnswerRequestParams = z.infer<typeof SubmitQuizAnswerRequest>;

export const SubmitQuizAttemptRequest = z.object({
  answers: z.array(SubmitQuizAnswerRequest).min(1, "At least one answer is required"),
});
export type SubmitQuizAttemptRequestParams = z.infer<typeof SubmitQuizAttemptRequest>;


export const UpdateQuizRequest = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  instruction: z.string().optional(),
  duration: z.number().min(1).optional(),
  maxAttempts: z.number().min(1).optional(),
  passingScore: z.number().min(0).max(100).optional(),
  allowReview: z.boolean().optional(),
});
export type UpdateQuizRequestParams = z.infer<typeof UpdateQuizRequest>;