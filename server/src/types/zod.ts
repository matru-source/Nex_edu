import { z } from "zod";

export const CourseFlagEnum = z.enum([
  "DEMO",
  "FREE",
  "PAID",
  "COMING_SOON",
  "FREE_TRIAL",
  "ON_DEMAND",
]);

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

export const VerifyOTPRequest = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});
export type VerifyOTPRequestParams = z.infer<typeof VerifyOTPRequest>;

export const ResendOTPRequest = z.object({
  email: z.string().email("Invalid email address"),
});
export type ResendOTPRequestParams = z.infer<typeof ResendOTPRequest>;


export const CreateCourseRequest = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category ID is required"),
  subCategoryId: z.string().min(1, "Sub-category ID is required"),
  tumbnailUrl: z.string().url("Invalid URL format").optional().or(z.literal("")).transform(val => val === "" ? undefined : val),
  published: z.boolean().optional().default(false),
});
export type CreateCourseRequestParams = z.infer<typeof CreateCourseRequest>;

export const CreateCategoryRequest = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  tumbnailUrl: z.string().url("Invalid URL format").optional()
});
export type CreateCategoryServiceParams = z.infer<typeof CreateCategoryRequest>;

export const CreateSubCategoryRequest = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().optional(), // Now optional - Brand/OEM independent of Specialization/Domain
  tumbnailUrl: z.string().url("Invalid URL format").optional()
});
export type CreateSubCategoryServiceParams = z.infer<typeof CreateSubCategoryRequest>;

export const UpdateCourseRequest = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  categoryId: z.string().min(1, "Category ID is required").optional(),
  subCategoryId: z.string().min(1, "Sub-category ID is required").optional(),
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
  courseId: z.string().min(1, "Course ID is required"),
  tumbnailUrl: z.string().url("Invalid URL format").optional(),
  isPublished: z.boolean().optional().default(false),
});
export type CreateSkillCategoryRequestParams = z.infer<typeof CreateSkillCategoryRequest>;

export const CreateBulkSkillCategoriesRequest = z.object({
  skillCategories: z.array(CreateSkillCategoryRequest).min(1, "At least one skill category is required"),
});
export type CreateBulkSkillCategoriesRequestParams = z.infer<typeof CreateBulkSkillCategoriesRequest>;

export const CreateExpertiseRequest = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  skillCategoryId: z.string().min(1, "Skill Category ID is required"),
  tumbnailUrl: z.union([z.string().url("Invalid URL format"), z.literal("")]).optional().transform(val => val === "" ? undefined : val),
  levels: z.array(z.enum(['LEARNER', 'PRACTITIONER', 'PROFESSIONAL'])).optional(),
  isPublished: z.boolean().optional().default(false),
});
export type CreateExpertiseRequestParams = z.infer<typeof CreateExpertiseRequest>;

export const CreateBulkExpertiseRequest = z.object({
  expertise: z.array(CreateExpertiseRequest).min(1, "At least one expertise is required"),
});
export type CreateBulkExpertiseRequestParams = z.infer<typeof CreateBulkExpertiseRequest>;

export const ModuleLevelEnum = z.enum(['LEARNER', 'PRACTITIONER', 'PROFESSIONAL']);

export const CreateModuleRequest = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  expertiseId: z.string().min(1, "Expertise ID is required"),
  tumbnailUrl: z.union([z.string().url("Invalid URL format"), z.literal("")]).optional().transform(val => val === "" ? undefined : val),
  levels: z.array(ModuleLevelEnum).optional(),
  isPublished: z.boolean().optional().default(false),
});
export type CreateModuleRequestParams = z.infer<typeof CreateModuleRequest>;

export const CreateBulkModulesRequest = z.object({
  modules: z.array(CreateModuleRequest).min(1, "At least one module is required"),
});
export type CreateBulkModulesRequestParams = z.infer<typeof CreateBulkModulesRequest>;

export const CreateChapterRequest = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  price: z.number().min(0, "Price must be a non-negative number"),
  moduleId: z.string().min(1, "Module ID is required"),
  tumbnailUrl: z.string().url("Invalid URL format").optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional().default('DRAFT'),
});
export type CreateChapterRequestParams = z.infer<typeof CreateChapterRequest>;

export const CreateBulkChaptersRequest = z.object({
  chapters: z.array(CreateChapterRequest).min(1, "At least one chapter is required"),
});
export type CreateBulkChaptersRequestParams = z.infer<typeof CreateBulkChaptersRequest>;

export const CreateVideoRequest = z.object({
  url: z.string().url("Invalid URL format"),
  duration: z.number().min(1, "Duration must be greater than 0"),
});
export type CreateVideoRequestParams = z.infer<typeof CreateVideoRequest>;

export const CreateLessonRequest = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  chapterId: z.string().min(1, "Chapter ID is required"),
  video: CreateVideoRequest.optional(),
  tumbnailUrl: z.string().url("Invalid URL format").optional().or(z.literal("")).transform(val => val === "" ? undefined : val),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional().default('DRAFT'),
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

export const UpdateCategoryRequest = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  tumbnailUrl: z.string().url("Invalid URL format").optional()
});
export type UpdateCategoryRequestParams = z.infer<typeof UpdateCategoryRequest>;

export const UpdateSubCategoryRequest = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  categoryId: z.string().min(1, "Category ID is required").optional(),
  tumbnailUrl: z.string().url("Invalid URL format").optional()
});
export type UpdateSubCategoryRequestParams = z.infer<typeof UpdateSubCategoryRequest>;

export const UpdateSkillCategoryRequest = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  tumbnailUrl: z.string().url("Invalid URL format").optional().or(z.literal("")).transform(val => val === "" ? undefined : val),
  isPublished: z.boolean().optional(),
});
export type UpdateSkillCategoryRequestParams = z.infer<typeof UpdateSkillCategoryRequest>;

export const UpdateExpertiseRequest = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  tumbnailUrl: z.union([z.string().url("Invalid URL format"), z.literal("")]).optional().transform(val => val === "" ? undefined : val),
  levels: z.array(z.enum(['LEARNER', 'PRACTITIONER', 'PROFESSIONAL'])).optional(),
  isPublished: z.boolean().optional(),
});
export type UpdateExpertiseRequestParams = z.infer<typeof UpdateExpertiseRequest>;

export const UpdateModuleRequest = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  tumbnailUrl: z.union([z.string().url("Invalid URL format"), z.literal("")]).optional().transform(val => val === "" ? undefined : val),
  isPublished: z.boolean().optional(),
});
export type UpdateModuleRequestParams = z.infer<typeof UpdateModuleRequest>;

export const UpdateChapterRequest = z.object({
  title: z.string().min(1, "Title is required").optional(),
  content: z.string().min(1, "Content is required").optional(),
  price: z.number().min(0, "Price must be a non-negative number").optional(),
  tumbnailUrl: z.union([z.string().url("Invalid URL format"), z.literal("")]).optional().transform(val => val === "" ? undefined : val),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'REJECTED']).optional(),
});
export type UpdateChapterRequestParams = z.infer<typeof UpdateChapterRequest>;


export const UpdateLessonRequest = z.object({
  title: z.string().min(1, "Title is required").optional(),
  content: z.string().min(1, "Content is required").optional(),
  video: z.object({
    url: z.string().url("Invalid URL format"),
    duration: z.number().min(0)
  }).nullable().optional(), // Allow null to delete video
  tumbnailUrl: z.union([z.string().url("Invalid URL format"), z.literal("")]).optional().transform(val => val === "" ? undefined : val),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'REJECTED']).optional(),
});
export type UpdateLessonRequestParams = z.infer<typeof UpdateLessonRequest>;

export const UpdateVideoRequest = z.object({
  url: z.string().min(1, "Video URL is required").url("Invalid URL format").optional(),
  duration: z.number().min(1, "Duration must be greater than 0").optional(),
});
export type UpdateVideoRequestParams = z.infer<typeof UpdateVideoRequest>;

export const CreateQuizOptionRequest = z.object({
  optionText: z.string().min(1, "Option text is required"),
  isCorrect: z.boolean(),
  order: z.number().min(0),
});
export type CreateQuizOptionRequestParams = z.infer<typeof CreateQuizOptionRequest>;

export const CreateQuizQuestionRequest = z.object({
  questionText: z.string().min(1, "Question text is required"),
  questionType: z.literal('MCQ'), // Only MCQ allowed
  points: z.number().min(0).default(1.0),
  order: z.number().min(0),
  explanation: z.string().optional(),
  allowMultipleCorrect: z.boolean().default(false),
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
  maxAttempts: z.number().min(1).default(3),
  passingScore: z.number().min(0).max(100).default(60.0),
  allowReview: z.boolean().default(true),
  showResultsImmediately: z.boolean().default(true),
  chapterId: z.string().min(1, "Chapter ID is required"), // Required, not optional
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

export const UpdateQuizOptionRequest = z.object({
  id: z.string().optional(),
  optionText: z.string().min(1, "Option text is required"),
  isCorrect: z.boolean(),
  order: z.number().min(0).optional(),
});

export const UpdateQuizQuestionRequest = z.object({
  id: z.string().optional(),
  questionText: z.string().min(1, "Question text is required"),
  questionType: z.string(), // Relaxed from literal 'MCQ' to allow others if DB has them, or keep 'MCQ'
  points: z.number().min(0).default(1.0),
  order: z.number().min(0).optional(),
  explanation: z.string().optional(),
  allowMultipleCorrect: z.boolean().default(false),
  options: z.array(UpdateQuizOptionRequest).min(2, "At least 2 options required"),
});

export const UpdateQuizRequest = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  instruction: z.string().optional(),
  duration: z.number().min(1).optional(),
  maxAttempts: z.number().min(1).optional(),
  passingScore: z.number().min(0).max(100).optional(),
  allowReview: z.boolean().optional(),
  showResultsImmediately: z.boolean().optional(),
  questions: z.array(UpdateQuizQuestionRequest).optional(),
});
export type UpdateQuizRequestParams = z.infer<typeof UpdateQuizRequest>;



export const MaterialTypeEnum = z.enum(['PDF', 'DOCUMENT', 'PRESENTATION', 'VIDEO', 'AUDIO', 'IMAGE', 'CODE', 'LINK', 'OTHER']);
export const MaterialLevelEnum = z.enum(['COURSE', 'SKILL_CATEGORY', 'EXPERTISE', 'MODULE', 'CHAPTER', 'LESSON']);

export const CreateMaterialRequest = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  fileUrl: z.string().url("Invalid URL format").optional(),
  fileName: z.string().optional(),
  fileType: z.string().optional(),
  fileSize: z.number().min(0).optional(),
  materialType: MaterialTypeEnum,
  materialLevel: MaterialLevelEnum,

  // At least one level must be specified
  courseId: z.string().optional(),
  skillCategoryId: z.string().optional(),
  expertiseId: z.string().optional(),
  moduleId: z.string().optional(),
  chapterId: z.string().optional(),
  lessonId: z.string().optional(),

  isRequired: z.boolean().default(false),
  isDownloadable: z.boolean().default(true),
  order: z.number().min(0).default(0),
  // Fix: Allow empty string or valid URL, then transform empty to undefined
  externalUrl: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().url("Invalid URL format").optional()
  ),
}).refine((data) => {
  // At least one level ID must be provided
  return data.courseId || data.skillCategoryId || data.expertiseId || data.moduleId || data.chapterId || data.lessonId;
}, {
  message: "At least one level (course, skillCategory, expertise, module, chapter, or lesson) must be specified",
  path: ["courseId", "skillCategoryId", "expertiseId", "moduleId", "chapterId", "lessonId"]
}).refine((data) => {
  // For LINK type, externalUrl is required
  if (data.materialType === 'LINK') {
    return data.externalUrl;
  }
  return true;
}, {
  message: "External URL is required for LINK type materials",
  path: ["externalUrl"]
}).refine((data) => {
  // For non-LINK types, fileUrl is required
  if (data.materialType !== 'LINK') {
    return data.fileUrl;
  }
  return true;
}, {
  message: "File URL is required for non-LINK type materials",
  path: ["fileUrl"]
});
export type CreateMaterialRequestParams = z.infer<typeof CreateMaterialRequest>;

export const UpdateMaterialRequest = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  fileUrl: z.string().url("Invalid URL format").optional(),
  fileName: z.string().optional(),
  fileType: z.string().optional(),
  fileSize: z.number().min(0).optional(),
  materialType: MaterialTypeEnum.optional(),
  materialLevel: MaterialLevelEnum.optional(),

  isRequired: z.boolean().optional(),
  isDownloadable: z.boolean().optional(),
  order: z.number().min(0).optional(),
  // Fix: Allow empty string or valid URL, then transform empty to undefined
  externalUrl: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().url("Invalid URL format").optional()
  ),
});

export type UpdateMaterialRequestParams = z.infer<typeof UpdateMaterialRequest>;

export const GetMaterialsByLevelRequest = z.object({
  courseId: z.string().optional(),
  skillCategoryId: z.string().optional(),
  expertiseId: z.string().optional(),
  moduleId: z.string().optional(),
  chapterId: z.string().optional(),
  lessonId: z.string().optional(),
  materialType: MaterialTypeEnum.optional(),
  materialLevel: MaterialLevelEnum.optional(),
});

export type GetMaterialsByLevelRequestParams = z.infer<typeof GetMaterialsByLevelRequest>;

export const ForgetPasswordRequest = z.object({
  email: z.string().email("Invalid email address"),
});
export type ForgetPasswordRequestParams = z.infer<typeof ForgetPasswordRequest>;

export const VerifyForgetPasswordOTPRequest = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});
export type VerifyForgetPasswordOTPRequestParams = z.infer<typeof VerifyForgetPasswordOTPRequest>;

export const ResetPasswordRequest = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z.string().min(6, "Password must be at least 6 characters long"),
});
export type ResetPasswordRequestParams = z.infer<typeof ResetPasswordRequest>;

export const UpdateProfileRequest = z.object({
  name: z.string().min(1, "Name is required").optional(),
  phone: z.string().optional().nullable(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  // Fix: Preprocess empty strings to undefined before URL validation
  website: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().url("Invalid URL format").optional().nullable()
  ),
  linkedinUrl: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().url("Invalid URL format").optional().nullable()
  ),
  twitterUrl: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().url("Invalid URL format").optional().nullable()
  ),
  goal: z.string().optional().nullable(),
  currentStatus: z.string().optional().nullable(),
});
export type UpdateProfileRequestParams = z.infer<typeof UpdateProfileRequest>;

export const ChangeEmailRequestSchema = z.object({
  newEmail: z.string().email("Invalid email address"),
});
export type ChangeEmailRequestParams = z.infer<typeof ChangeEmailRequestSchema>;

export const VerifyEmailChangeOTPRequest = z.object({
  newEmail: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});
export type VerifyEmailChangeOTPRequestParams = z.infer<typeof VerifyEmailChangeOTPRequest>;

export const ChangePasswordRequest = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});
export type ChangePasswordRequestParams = z.infer<typeof ChangePasswordRequest>;

export const CreateBillingInfoRequest = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().nullable(),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional().nullable(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional().nullable(),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  cardLast4: z.string().optional().nullable(),
  cardBrand: z.string().optional().nullable(),
  cardExpiryMonth: z.number().min(1).max(12).optional().nullable(),
  cardExpiryYear: z.number().min(new Date().getFullYear()).optional().nullable(),
  isDefault: z.boolean().optional(),
});
export type CreateBillingInfoRequestParams = z.infer<typeof CreateBillingInfoRequest>;

export const UpdateBillingInfoRequest = z.object({
  fullName: z.string().min(1, "Full name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional().nullable(),
  addressLine1: z.string().min(1, "Address line 1 is required").optional(),
  addressLine2: z.string().optional().nullable(),
  city: z.string().min(1, "City is required").optional(),
  state: z.string().optional().nullable(),
  postalCode: z.string().min(1, "Postal code is required").optional(),
  country: z.string().min(1, "Country is required").optional(),
  cardLast4: z.string().optional().nullable(),
  cardBrand: z.string().optional().nullable(),
  cardExpiryMonth: z.number().min(1).max(12).optional().nullable(),
  cardExpiryYear: z.number().min(new Date().getFullYear()).optional().nullable(),
  isDefault: z.boolean().optional(),
});
export type UpdateBillingInfoRequestParams = z.infer<typeof UpdateBillingInfoRequest>;

export const ReorderChapterRequest = z.object({
  direction: z.enum(["up", "down"]),
});

export const ReorderLessonRequest = z.object({
  direction: z.enum(["up", "down"]),
});

export const CreateUserRequest = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.enum(['CONTRIBUTOR', 'MODERATOR', 'STUDENT'])
    .refine(val => ['CONTRIBUTOR', 'MODERATOR', 'STUDENT'].includes(val), {
      message: "Role must be CONTRIBUTOR, MODERATOR, or STUDENT"
    }),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
});
export type CreateUserRequestParams = z.infer<typeof CreateUserRequest>;

export const UpdateUserRequest = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  role: z.enum(['CONTRIBUTOR', 'MODERATOR', 'STUDENT', 'ADMIN']).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});
export type UpdateUserRequestParams = z.infer<typeof UpdateUserRequest>;

export const GetUsersQueryParams = z.object({
  role: z.enum(['ADMIN', 'STUDENT', 'CONTRIBUTOR', 'MODERATOR']).optional(),
  isActive: z.string().transform(val => val === 'true').optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 10).optional(),
});
export type GetUsersQueryParamsType = z.infer<typeof GetUsersQueryParams>;

export const SubmitCourseRequest = z.object({
  // No body needed, just courseId in params
});
export type SubmitCourseRequestParams = z.infer<typeof SubmitCourseRequest>;

export const ApproveCourseRequest = z.object({
  // No body needed, just courseId in params
});
export type ApproveCourseRequestParams = z.infer<typeof ApproveCourseRequest>;

export const RejectCourseRequest = z.object({
  rejectionReason: z.string().min(1, "Rejection reason is required"),
});
export type RejectCourseRequestParams = z.infer<typeof RejectCourseRequest>;

export const PublishCourseRequest = z.object({
  flags: z.array(CourseFlagEnum).optional(),
});
export type PublishCourseRequestParams = z.infer<typeof PublishCourseRequest>;

export const GetSubmissionsQueryParams = z.object({
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'REJECTED']).optional(),
  entityType: z.enum(['COURSE', 'CHAPTER', 'LESSON']).optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 10).optional(),
});
export type GetSubmissionsQueryParamsType = z.infer<typeof GetSubmissionsQueryParams>;

export const UpdateCourseFlagsRequest = z.object({
  flags: z.array(CourseFlagEnum).min(0, "Flags array is required"),
});
export type UpdateCourseFlagsRequestParams = z.infer<typeof UpdateCourseFlagsRequest>;

export const GetCoursesByFlagQueryParams = z.object({
  flag: CourseFlagEnum.optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 10).optional(),
  categoryId: z.string().optional(),
  subCategoryId: z.string().optional(),
});
export type GetCoursesByFlagQueryParamsType = z.infer<typeof GetCoursesByFlagQueryParams>;

// Contact Form Submission
export const CreateContactSubmissionRequest = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
export type CreateContactSubmissionRequestParams = z.infer<typeof CreateContactSubmissionRequest>;