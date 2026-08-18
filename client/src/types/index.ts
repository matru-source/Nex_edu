export interface ErrorRes {
  status: number;
  response: {
    data: {
      message: string;
      log?: string[];
    }
  }
}

export interface Response {
  success: boolean;
  message: string;
}

export type UserRole = 'ADMIN' | 'STUDENT' | 'CONTRIBUTOR' | 'MODERATOR';


export type Course = {
  id: string;
  title: string;
  description: string;
  published: boolean;
  categoryId: string;
  subCategoryId: string;
  tumbnailUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  category: Category;
  subCategory: SubCategory;
  SkillCategory: SkillCategory[];
  totalPrice: number; // Add this
  totalDuration?: number;
};

export type Category = {
  name: string;
  description: string;
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
}

export type SubCategory = {
  name: string;
  description: string;
  categoryId: string;
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
}

export type SkillCategory = {
  tumbnailUrl: string | null;
  Expertise: any;
  name: string;
  description: string;
  id: string;
  isActive: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  courseId: string;
}

export type Expertise = {
  Module: any;
  name: string;
  description: string;
  id: string;
  isActive: boolean;
  isPublished: boolean;
  tumbnailUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  skillCategoryId: string;
}

export type Module = {
  Chapters: any;
  description: string;
  id: string;
  isActive: boolean;
  isPublished: boolean;
  tumbnailUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  title: string;
  expertiseId: string;
}

export type Chapters = {
  id: string;
  isActive: boolean;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  title: string;
  price: number;
  content: string;
  moduleId: string;
  tumbnailUrl: string | null;
}

export type Lessons = {
  id: string;
  title: string;
  content: string;
  chapterId: string;
  isActive: boolean;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  tumbnailUrl: string | null;
}

export type Video = {
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  url: string;
  duration: number;
  lessonId: string;
}

export type UserLessonNotes = {
  lessonId: string;
  userId: string;
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  content: string;
}

export interface CourseWithCategory extends Course {
  subCategory: SubCategory;
  category: Category;
  totalPrice: number; // ✅ Ensure this is included
  totalDuration?: number; // ✅ Add this
}
export type Quiz = {
  id: string;
  title: string;
  description: string | null;
  instruction: string | null;
  duration: number | null;
  maxAttempts: number;
  passingScore: number;
  allowReview: boolean;
  lessonId: string | null;
  chapterId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  questions?: QuizQuestion[];
  _count?: { attempts: number };
};

export type QuizQuestion = {
  id: string;
  quizId: string;
  questionText: string;
  questionType: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  points: number;
  order: number;
  explanation: string | null;
  options?: QuizOption[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type QuizOption = {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type QuizAttempt = {
  id: string;
  quizId: string;
  userId: string;
  startedAt: Date;
  completedAt: Date | null;
  score: number | null;
  totalPoints: number | null;
  percentage: number | null;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  quiz?: Quiz;
  answers?: QuizAnswer[];
};

export type QuizAnswer = {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptionId: string | null;
  textAnswer: string | null;
  points: number | null;
  isCorrect: boolean | null;
  gradedAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  question?: QuizQuestion;
};

export type MaterialType = 'PDF' | 'DOCUMENT' | 'PRESENTATION' | 'VIDEO' | 'AUDIO' | 'IMAGE' | 'CODE' | 'LINK' | 'OTHER';
export type MaterialLevel = 'COURSE' | 'SKILL_CATEGORY' | 'EXPERTISE' | 'MODULE' | 'CHAPTER' | 'LESSON';

export type Material = {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  materialType: MaterialType;
  materialLevel: MaterialLevel;

  // Level IDs
  courseId: string | null;
  skillCategoryId: string | null;
  expertiseId: string | null;
  moduleId: string | null;
  chapterId: string | null;
  lessonId: string | null;

  // Properties
  isRequired: boolean;
  isDownloadable: boolean;
  order: number;
  externalUrl: string | null;

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
};

export interface MaterialQueryResponse extends Response {
  data: Material[];
}