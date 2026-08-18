const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && envUrl.includes("localhost")) {
    return envUrl.replace("localhost", window.location.hostname);
  }
  return envUrl;
};

const BASE_URL = `${getApiBaseUrl()}/api/v1`;

// Define the API routes in a structured way
export const API_ROUTES = {
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    SIGNUP: `${BASE_URL}/auth/signup`,
    VERIFY_OTP: `${BASE_URL}/auth/verify-otp`,
    RESEND_OTP: `${BASE_URL}/auth/resend-otp`,
    FORGET_PASSWORD: `${BASE_URL}/auth/forget-password`,
    VERIFY_FORGET_PASSWORD_OTP: `${BASE_URL}/auth/verify-forget-password-otp`,
    RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
    ME: `${BASE_URL}/auth/me`,
  },
  ADMIN: {
    CREATE_CATEGORY: `${BASE_URL}/course/create/category`,
    CREATE_SUBCATEGORY: `${BASE_URL}/course/create/subcategory`,
    GET_ALL_STUDENTS: `${BASE_URL}/admin/students`,
    GET_ALL_PURCHASES: `${BASE_URL}/admin/purchases`,
    CREATE_USER: `${BASE_URL}/admin/users/create`,
    GET_ALL_USERS: `${BASE_URL}/admin/users`,
    GET_USER_BY_ID: (userId: string) => `${BASE_URL}/admin/users/${userId}`,
    UPDATE_USER: (userId: string) => `${BASE_URL}/admin/users/${userId}`,
    DELETE_USER: (userId: string) => `${BASE_URL}/admin/users/${userId}`,
    GET_STUDENT_DETAILS: (userId: string) => `${BASE_URL}/admin/students/${userId}`,
    TOGGLE_BLOCK_USER: (userId: string) => `${BASE_URL}/admin/students/${userId}/block`,
  },
  USER: {
    GET_PROFILE: `${BASE_URL}/user/profile`,
    UPDATE_PROFILE: `${BASE_URL}/user/profile`,
    UPDATE_PROFILE_PHOTO: `${BASE_URL}/user/profile/photo`,
    REMOVE_PROFILE_PHOTO: `${BASE_URL}/user/profile/photo`,
    REQUEST_EMAIL_CHANGE: `${BASE_URL}/user/email/change-request`,
    VERIFY_EMAIL_CHANGE: `${BASE_URL}/user/email/verify-otp`,
    CHANGE_PASSWORD: `${BASE_URL}/user/password/change`,
    GET_STATS: `${BASE_URL}/user/stats`,
    GET_BILLING: `${BASE_URL}/user/billing`,
    CREATE_BILLING: `${BASE_URL}/user/billing`,
    UPDATE_BILLING: (id: string) => `${BASE_URL}/user/billing/${id}`,
    DELETE_BILLING: (id: string) => `${BASE_URL}/user/billing/${id}`,
    SET_DEFAULT_BILLING: (id: string) => `${BASE_URL}/user/billing/${id}/set-default`,
  },
  COURSE: {
    CREATE_COURSE: `${BASE_URL}/course/create/course`,
    GET_COURSES: `${BASE_URL}/course/courses`,
    SEARCH: `${BASE_URL}/course/search`,
    GET_CATEGORIES: `${BASE_URL}/course/categories`,
    GET_SUBCATEGORIES_BY_CATEGORY_ID: (categoryId: string) => `${BASE_URL}/course/subcategories/${categoryId}`,
    GET_ALL_SUBCATEGORIES: `${BASE_URL}/course/subcategories-all`,
    UPDATE_COURSE: (courseId: string) => `${BASE_URL}/course/course/${courseId}`,
    GET_TOP_COURSES: `${BASE_URL}/course/top-courses`,
    GET_COURSE_DETAILS_BY_COURSE_ID: (courseId: string) => `${BASE_URL}/course/course/${courseId}`,
    GET_FREE_COURSES: `${BASE_URL}/course/courses/free`,
    GET_TRIAL_COURSES: `${BASE_URL}/course/courses/trial`,
    GET_PAID_COURSES: `${BASE_URL}/course/courses/paid`,
    GET_PUBLIC_COURSE_DETAILS: (courseId: string) => `${BASE_URL}/course/public/course/${courseId}`,
    GET_PUBLIC_CATEGORIES: `${BASE_URL}/course/public/categories`,
    GET_PUBLIC_SUBCATEGORIES: (categoryId: string) => `${BASE_URL}/course/public/subcategories/${categoryId}`,

    // Individual endpoints (filtered by specific ID)
    GET_PUBLIC_SKILL_CATEGORIES: (courseId: string) => `${BASE_URL}/course/public/skillcategories/${courseId}`,
    GET_PUBLIC_EXPERTISE: (skillCategoryId: string) => `${BASE_URL}/course/public/expertise/${skillCategoryId}`,
    GET_PUBLIC_MODULES: (expertiseId: string) => `${BASE_URL}/course/public/modules/${expertiseId}`,
    GET_PUBLIC_CHAPTERS: (moduleId: string) => `${BASE_URL}/course/public/chapters/${moduleId}`,
    GET_PUBLIC_LESSONS: (chapterId: string) => `${BASE_URL}/course/public/lessons/${chapterId}`,

    // Global endpoints (all items across all courses/categories)
    PUBLIC_SKILL_CATEGORIES_ALL: `${BASE_URL}/course/public/skillcategories-all`,
    PUBLIC_EXPERTISE_ALL: `${BASE_URL}/course/public/expertise-all`,
    PUBLIC_MODULES_ALL: `${BASE_URL}/course/public/modules-all`,
    PUBLIC_CHAPTERS_ALL: `${BASE_URL}/course/public/chapters-all`,
    PUBLIC_LESSONS_ALL: `${BASE_URL}/course/public/lessons-all`,
    GET_PUBLIC_SKILL_CATEGORIES_ALL: `${BASE_URL}/course/public/skillcategories-all`,
    GET_PUBLIC_EXPERTISE_ALL: `${BASE_URL}/course/public/expertise-all`,
    GET_PUBLIC_MODULES_ALL: `${BASE_URL}/course/public/modules-all`,
    GET_PUBLIC_CHAPTERS_ALL: `${BASE_URL}/course/public/chapters-all`,
    GET_PUBLIC_LESSONS_ALL: `${BASE_URL}/course/public/lessons-all`,
    GET_PUBLIC_FREE_LESSONS: `${BASE_URL}/course/public/free-lessons`,

    GET_COURSE_FULL_STRUCTURE: (courseId: string) => `${BASE_URL}/course/course/${courseId}/full-structure`,

    UPDATE: {
      COURSE: (courseId: string) => `${BASE_URL}/course/course/${courseId}`,
      CATEGORY: (categoryId: string) => `${BASE_URL}/course/category/${categoryId}`,
      SUBCATEGORY: (subCategoryId: string) => `${BASE_URL}/course/subcategory/${subCategoryId}`,
      SKILL_CATEGORY: (skillCategoryId: string) => `${BASE_URL}/course/skillcategory/${skillCategoryId}`,
      EXPERTISE: (expertiseId: string) => `${BASE_URL}/course/expertise/${expertiseId}`,
      MODULE: (moduleId: string) => `${BASE_URL}/course/module/${moduleId}`,
      CHAPTER: (chapterId: string) => `${BASE_URL}/course/chapter/${chapterId}`,
      LESSON: (lessonId: string) => `${BASE_URL}/course/lesson/${lessonId}`,
      REORDER_CHAPTER: (chapterId: string) => `${BASE_URL}/course/chapter/${chapterId}/reorder`,
      REORDER_LESSON: (lessonId: string) => `${BASE_URL}/course/lesson/${lessonId}/reorder`,
      REORDER_SKILL_CATEGORY: (skillCategoryId: string) => `${BASE_URL}/course/skillcategory/${skillCategoryId}/reorder`,
      REORDER_EXPERTISE: (expertiseId: string) => `${BASE_URL}/course/expertise/${expertiseId}/reorder`,
      REORDER_MODULE: (moduleId: string) => `${BASE_URL}/course/module/${moduleId}/reorder`,
    },
    DELETE: {
      COURSE: (courseId: string) => `${BASE_URL}/course/course/${courseId}`,
      CATEGORY: (categoryId: string) => `${BASE_URL}/course/category/${categoryId}`,
      SUBCATEGORY: (subCategoryId: string) => `${BASE_URL}/course/subcategory/${subCategoryId}`,
      SKILL_CATEGORY: (skillCategoryId: string) => `${BASE_URL}/course/skillcategory/${skillCategoryId}`,
      EXPERTISE: (expertiseId: string) => `${BASE_URL}/course/expertise/${expertiseId}`,
      MODULE: (moduleId: string) => `${BASE_URL}/course/module/${moduleId}`,
      CHAPTER: (chapterId: string) => `${BASE_URL}/course/chapter/${chapterId}`,
      LESSON: (lessonId: string) => `${BASE_URL}/course/lesson/${lessonId}`,
    },
    GET_BY_ID: {
      CATEGORY: (categoryId: string) => `${BASE_URL}/course/category/${categoryId}`,
      SUBCATEGORY: (subCategoryId: string) => `${BASE_URL}/course/subcategory/${subCategoryId}`,
      SKILL_CATEGORY: (skillCategoryId: string) => `${BASE_URL}/course/skillcategory/${skillCategoryId}`,
      EXPERTISE: (expertiseId: string) => `${BASE_URL}/course/expertise/${expertiseId}`,
      MODULE: (moduleId: string) => `${BASE_URL}/course/module/${moduleId}`,
      CHAPTER: (chapterId: string) => `${BASE_URL}/course/chapter/${chapterId}`,
      LESSON: (lessonId: string) => `${BASE_URL}/course/lesson/${lessonId}`,
    },
    GET_CONTRIBUTOR: {
      COURSES: `${BASE_URL}/course/contributor/courses`,
      COURSE_DETAILS: (courseId: string) => `${BASE_URL}/course/contributor/course/${courseId}`,
      COURSE_TIMELINE: (courseId: string) => `${BASE_URL}/course/contributor/course/${courseId}/timeline`,
    },
  },
  SKILL_CATEGORY: {
    CREATE_BULK_SKILL_CATEGORIES: `${BASE_URL}/course/create/skillcategories/bulk`,
    GET_SKILL_CATEGORIES_BY_COURSE_ID: (courseId: string) => `${BASE_URL}/course/skillcategories/${courseId}`,
    GET_ALL_SKILL_CATEGORIES: `${BASE_URL}/course/skillcategories-all`,
  },
  EXPERTISE: {
    CREATE_BULK_EXPERTISE: `${BASE_URL}/course/create/expertise/bulk`,
    GET_EXPERTISE_BY_SKILL_CATEGORY_ID: (skillCategoryId: string) => `${BASE_URL}/course/expertise/${skillCategoryId}`,
    GET_ALL_EXPERTISE: `${BASE_URL}/course/expertise-all`,
  },
  MODULE: {
    CREATE_MODULES: `${BASE_URL}/course/create/modules/bulk`,
    GET_MODULES_BY_EXPERTISE_ID: (expertiseId: string) => `${BASE_URL}/course/modules/${expertiseId}`,
    GET_ALL_MODULES: `${BASE_URL}/course/modules-all`,
  },
  CHAPTER: {
    CREATE_CHAPTERS: `${BASE_URL}/course/create/chapters/bulk`,
    GET_CHAPTERS_BY_MODULE_ID: (moduleId: string) => `${BASE_URL}/course/chapters/${moduleId}`,
    GET_ALL_CHAPTERS: `${BASE_URL}/course/chapters-all`,
  },
  LESSON: {
    CREATE_LESSONS: `${BASE_URL}/course/create/lessons/bulk`,
    GET_LESSONS_BY_CHAPTER_ID: (chapterId: string) => `${BASE_URL}/course/lessons/${chapterId}`,
    GET_LESSONS_BY_CHAPTER_ID_WITH_AUTH: (chapterId: string) => `${BASE_URL}/course/auth/lessons/${chapterId}`,
    GET_ALL_LESSONS: `${BASE_URL}/course/lessons-all`,
  },
  QUIZ: {
    CREATE: `${BASE_URL}/quiz/create`,
    GET_ALL: `${BASE_URL}/quiz/all`,
    GET_BY_ID: (quizId: string) => `${BASE_URL}/quiz/${quizId}`,
    UPDATE: (quizId: string) => `${BASE_URL}/quiz/${quizId}`,
    DELETE: (quizId: string) => `${BASE_URL}/quiz/${quizId}`,
    GET_BY_CHAPTER: (chapterId: string) => `${BASE_URL}/quiz/chapter/${chapterId}`,
    GET_BY_COURSE: (courseId: string) => `${BASE_URL}/quiz/course/${courseId}`,
    GET_BY_CHAPTER_ID: (chapterId: string) => `${BASE_URL}/quiz/chapter/${chapterId}`,
    GET_BY_COURSE_ID: (courseId: string) => `${BASE_URL}/quiz/course/${courseId}`,
    PUBLIC_EXPLORE: `${BASE_URL}/quiz/public/explore`,
    // Attempt routes
    CREATE_ATTEMPT: (quizId: string) => `${BASE_URL}/quiz/${quizId}/attempt`,
    SUBMIT_ATTEMPT: (attemptId: string) => `${BASE_URL}/quiz/attempt/${attemptId}/submit`,
    ABANDON_ATTEMPT: (attemptId: string) => `${BASE_URL}/quiz/attempt/${attemptId}/abandon`,
    GET_ATTEMPT: (attemptId: string) => `${BASE_URL}/quiz/attempt/${attemptId}`,
    GET_ATTEMPT_DETAILS: (attemptId: string) => `${BASE_URL}/quiz/attempt/${attemptId}/details`,
    GET_MY_ATTEMPTS: `${BASE_URL}/quiz/attempts/my`,
    GET_EXISTING_ATTEMPT: (quizId: string) => `${BASE_URL}/quiz/${quizId}/existing-attempt`,
    GET_ATTEMPTS_BY_QUIZ_ID: (quizId: string) => `${BASE_URL}/quiz/${quizId}/attempts`,
    GET_STATISTICS: (quizId: string) => `${BASE_URL}/quiz/${quizId}/statistics`,
  },
  UPLOAD: {
    PRE_SIGNED_URL: `${BASE_URL}/upload/presigned`,
  },
  FORUM: {
    CREATE_LESSON_QUESTION: `${BASE_URL}/forum/lesson-question`,
    CREATE_QUESTION_REPLY: `${BASE_URL}/forum/question-reply`,
    GET_QUESTION_TREE: (questionId: string) => `${BASE_URL}/forum/question-tree/${questionId}`,
    GET_FAQ_BY_LESSON_ID: (lessonId: string) => `${BASE_URL}/forum/faq/${lessonId}`,
    GET_ALL_QUESTIONS: `${BASE_URL}/forum/questions`,
  },
  FAQ_ADMIN: {
    GET_ALL_QUESTIONS: `${BASE_URL}/faq-admin/questions`,
    GET_STATS: `${BASE_URL}/faq-admin/stats`,
    DELETE_QUESTION: (id: string) => `${BASE_URL}/faq-admin/question/${id}`,
    DELETE_REPLY: (id: string) => `${BASE_URL}/faq-admin/reply/${id}`,
    CREATE_ADMIN_REPLY: `${BASE_URL}/faq-admin/reply`,
    BLOCK_USER: `${BASE_URL}/faq-admin/block`,
    UNBLOCK_USER: (id: string) => `${BASE_URL}/faq-admin/block/${id}`,
    GET_BLOCKS: `${BASE_URL}/faq-admin/blocks`,
    GET_USER_BLOCKS: (userId: string) => `${BASE_URL}/faq-admin/blocks/user/${userId}`,
    CHECK_BLOCKED: `${BASE_URL}/faq-admin/check-blocked`,
  },
  USER_LESSON_NOTES: {
    CREATE_NOTES: `${BASE_URL}/course/notes`,
    GET_NOTES_BY_LESSON_ID: (lessonId: string) => `${BASE_URL}/course/notes/${lessonId}`,
  },
  MATERIAL: {
    CREATE: `${BASE_URL}/material/create`,
    GET_BY_LEVEL: `${BASE_URL}/material/level`,
    GET_BY_COURSE_PATH: (courseId: string) => `${BASE_URL}/material/course/${courseId}/path`,
    GET_BY_ID: (materialId: string) => `${BASE_URL}/material/${materialId}`,
    UPDATE: (materialId: string) => `${BASE_URL}/material/${materialId}`,
    DELETE: (materialId: string) => `${BASE_URL}/material/${materialId}`,
    GET_BY_TYPE: (materialType: string) => `${BASE_URL}/material/type/${materialType}`,
    GET_REQUIRED: `${BASE_URL}/material/required`,
  },
  PURCHASE: {
    CREATE: `${BASE_URL}/purchase/create`,
    GET_MY_PURCHASES: `${BASE_URL}/purchase/my-purchases`,
    GET_MY_PURCHASES_WITH_HIERARCHY: `${BASE_URL}/purchase/my-purchases/hierarchy`,
    GET_MY_CHAPTERS: `${BASE_URL}/purchase/my-chapters`,
    GET_PURCHASED_COURSES: `${BASE_URL}/purchase/courses`,
    CHECK_STATUS: (chapterId: string) => `${BASE_URL}/purchase/check/${chapterId}`,
    CHECK_COURSE_STATUS: (courseId: string) => `${BASE_URL}/purchase/check/course/${courseId}`,
  },
  CART: {
    ADD: `${BASE_URL}/cart/add`,
    REMOVE: (chapterId: string) => `${BASE_URL}/cart/remove/${chapterId}`,
    GET: `${BASE_URL}/cart`,
    COUNT: `${BASE_URL}/cart/count`,
    CLEAR: `${BASE_URL}/cart/clear`,
    CHECKOUT: `${BASE_URL}/cart/checkout`,
    CHECK: (chapterId: string) => `${BASE_URL}/cart/check/${chapterId}`,
  },
  VIEWING_HISTORY: {
    UPDATE: `${BASE_URL}/viewing-history/update`,
    GET_LESSON: (lessonId: string) => `${BASE_URL}/viewing-history/lesson/${lessonId}`,
    GET_CONTINUE_WATCHING: `${BASE_URL}/viewing-history/continue-watching`,
    GET_COURSES: `${BASE_URL}/viewing-history/courses`,
  },
  STATISTICS: {
    GET_DASHBOARD: `${BASE_URL}/statistics/dashboard`,
  },
  NOTIFICATION: {
    GET_ALL: `${BASE_URL}/notifications`,
    GET_RECENT: `${BASE_URL}/notifications/recent`,
    GET_UNREAD_COUNT: `${BASE_URL}/notifications/unread-count`,
    MARK_AS_READ: (id: string) => `${BASE_URL}/notifications/${id}/read`,
    MARK_ALL_AS_READ: `${BASE_URL}/notifications/read-all`,
    DELETE: (id: string) => `${BASE_URL}/notifications/${id}`,
  },

  WORKFLOW: {
    // Submit for review
    SUBMIT_COURSE: (courseId: string) => `${BASE_URL}/course/course/${courseId}/submit`,
    SUBMIT_CHAPTER: (chapterId: string) => `${BASE_URL}/course/chapter/${chapterId}/submit`,
    SUBMIT_LESSON: (lessonId: string) => `${BASE_URL}/course/lesson/${lessonId}/submit`,

    // Approve
    APPROVE_COURSE: (courseId: string) => `${BASE_URL}/course/course/${courseId}/approve`,
    APPROVE_CHAPTER: (chapterId: string) => `${BASE_URL}/course/chapter/${chapterId}/approve`,
    APPROVE_LESSON: (lessonId: string) => `${BASE_URL}/course/lesson/${lessonId}/approve`,

    // Reject
    REJECT_COURSE: (courseId: string) => `${BASE_URL}/course/course/${courseId}/reject`,
    REJECT_CHAPTER: (chapterId: string) => `${BASE_URL}/course/chapter/${chapterId}/reject`,
    REJECT_LESSON: (lessonId: string) => `${BASE_URL}/course/lesson/${lessonId}/reject`,

    // Publish
    PUBLISH_COURSE: (courseId: string) => `${BASE_URL}/course/course/${courseId}/publish`,
    PUBLISH_CHAPTER: (chapterId: string) => `${BASE_URL}/course/chapter/${chapterId}/publish`,
    PUBLISH_LESSON: (lessonId: string) => `${BASE_URL}/course/lesson/${lessonId}/publish`,

    // Get submissions
    GET_SUBMISSIONS: `${BASE_URL}/course/admin/submissions`,

    // Get user contributions
    GET_MY_CONTRIBUTIONS: `${BASE_URL}/course/contributor/contributions`,

    // Update course flags
    UPDATE_COURSE_FLAGS: (courseId: string) => `${BASE_URL}/course/course/${courseId}/flags`,
    UPDATE_CHAPTER_FLAGS: (chapterId: string) => `${BASE_URL}/course/chapter/${chapterId}/flags`,
    UPDATE_LESSON_FLAGS: (lessonId: string) => `${BASE_URL}/course/lesson/${lessonId}/flags`,
  },
  WORKFLOW_TRACKING: {
    // Get all workflows with filters
    GET_ALL_WORKFLOWS: `${BASE_URL}/wt/workflows`,
    // Get workflow history for specific entity
    GET_WORKFLOW_HISTORY: (entityType: string, entityId: string) => `${BASE_URL}/wt/workflows/${entityType}/${entityId}`,
    // Get workflow statistics
    GET_WORKFLOW_STATS: `${BASE_URL}/wt/workflows/stats`,
    // Get entity details
    GET_ENTITY_DETAILS: (entityType: string, entityId: string) => `${BASE_URL}/wt/entity/${entityType}/${entityId}`,
  },
  CONTACT: {
    CREATE: `${BASE_URL}/contact`,
    GET_ALL: `${BASE_URL}/contact`,
    MARK_READ: (id: string) => `${BASE_URL}/contact/${id}/read`,
    DELETE: (id: string) => `${BASE_URL}/contact/${id}`,
  },
  BANNER: {
    LIST: `${BASE_URL}/banner/list`,
    ALL: `${BASE_URL}/banner/all`,
    CREATE: `${BASE_URL}/banner/create`,
    UPDATE: (id: string) => `${BASE_URL}/banner/${id}`,
    DELETE: (id: string) => `${BASE_URL}/banner/${id}`,
    REORDER: `${BASE_URL}/banner/reorder`,
    STANDARD_SIZE: `${BASE_URL}/banner/standard-size`,
  },
  CLIENT_LOGO: {
    LIST: `${BASE_URL}/client-logo/list`,
    ALL: `${BASE_URL}/client-logo/all`,
    CREATE: `${BASE_URL}/client-logo/create`,
    UPDATE: (id: string) => `${BASE_URL}/client-logo/${id}`,
    DELETE: (id: string) => `${BASE_URL}/client-logo/${id}`,
    REORDER: `${BASE_URL}/client-logo/reorder`,
  },
  STUDENT_STORIES: {
    LIST: `${BASE_URL}/student-stories/list`,
  },
} as const;

export const localKey = {
  token: `erpbugs-auth-jwt-token`,
  user: 'erpbugs-user-client'
}