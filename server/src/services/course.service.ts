import { AppError } from "@/utils/error/errors";
import { prisma } from "@/utils/prisma";
import { Prisma, WorkflowAction } from "@prisma/client";
import { Category, Course, SubCategory, Module, SkillCategory, Expertise, Chapters, Lessons, Video, UserLessonNotes } from "@prisma/client";
import { createNotificationService } from "@/services/notification.service";
import {
  sendCourseSubmittedEmail,
  sendCourseSubmittedNotificationEmail,
  sendCourseApprovedEmail,
  sendCourseRejectedEmail,
  sendCoursePublishedEmail,
  sendChapterSubmittedEmail,
  sendChapterSubmittedNotificationEmail,
  sendChapterApprovedEmail,
  sendChapterRejectedEmail,
  sendLessonSubmittedEmail,
  sendLessonSubmittedNotificationEmail,
  sendLessonApprovedEmail,
  sendLessonRejectedEmail
} from "@/utils/email/email";
import { CourseStatus, CourseFlag, EntityType, NotificationType } from "@prisma/client";
import { logWorkflowEventService } from "./workflowTracking.service";

export async function createCategoryService(name: string, description: string, tumbnailUrl?: string): Promise<Category> {
  const category = await prisma.category.create({
    data: {
      name,
      description,
      tumbnailUrl
    }
  });
  return category;
}

export async function getAllCategoriesService(): Promise<Category[]> {
  const categories = await prisma.category.findMany();
  return categories;
}

export async function createSubCategoryService(name: string, description: string, categoryId?: string, tumbnailUrl?: string): Promise<SubCategory> {
  const subCategory = await prisma.subCategory.create({
    data: {
      name,
      description,
      categoryId: categoryId || null, // Optional - can be null for independent Brand/OEM
      tumbnailUrl
    }
  });
  return subCategory;
}

export async function getSubCategoriesByCategoryIdService(categoryId: string): Promise<SubCategory[]> {
  const subCategories = await prisma.subCategory.findMany({
    where: {
      categoryId: categoryId
    }
  });
  return subCategories;
}

export async function getAllSubCategoriesService(): Promise<SubCategory[]> {
  const subCategories = await prisma.subCategory.findMany({
    include: {
      category: true
    },
    orderBy: {
      name: 'asc'
    }
  });
  return subCategories;
}

export async function createCourseService(
  title: string,
  description: string,
  categoryId: string,
  subCategoryId: string,
  tumbnailUrl: string,
  createdBy?: string,
  published: boolean = false
): Promise<Course> {
  // Determine the creator's role
  let isAdmin = false;
  if (createdBy) {
    const user = await prisma.user.findUnique({
      where: { id: createdBy },
      select: { role: true }
    });
    isAdmin = user?.role === 'ADMIN';
  }

  // Admin: respect the published toggle for status
  // Non-admin (contributor): always DRAFT status
  const status = isAdmin && published ? CourseStatus.PUBLISHED : CourseStatus.DRAFT;

  const course = await prisma.course.create({
    data: {
      title,
      description,
      categoryId,
      subCategoryId,
      tumbnailUrl,
      createdBy,
      published,
      status,
      flags: [],
    },
  });
  return course;
}

export async function getAllCoursesService(filters?: {
  flag?: CourseFlag;
  page?: number;
  limit?: number;
  categoryId?: string;
  subCategoryId?: string;
  publishedOnly?: boolean;
}): Promise<{
  courses: Course[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const page = filters?.page || 1;
  const limit = filters?.limit || 100;
  const skip = (page - 1) * limit;

  const where: any = { isActive: true, ...(filters?.publishedOnly !== false ? { published: true, status: CourseStatus.PUBLISHED } : {}) };

  if (filters?.flag) {
    where.flags = { has: filters.flag };
  }
  if (filters?.categoryId) {
    where.categoryId = filters.categoryId;
  }
  if (filters?.subCategoryId) {
    where.subCategoryId = filters.subCategoryId;
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        category: true,
        subCategory: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.course.count({ where }),
  ]);

  return {
    courses,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateCourseService(
  courseId: string,
  data: {
    title?: string;
    description?: string;
    categoryId?: string;
    subCategoryId?: string;
    tumbnailUrl?: string;
    published?: boolean;
    // NEW FIELDS
    priceCategory?: 'FREE' | 'TRIAL' | 'PAID';
    trialDuration?: number;
    coursePrice?: number;
  }
): Promise<Course> {
  const course = await prisma.course.update({
    where: { id: courseId },
    data: data
  });
  return course;
}

export async function updateModuleService(
  moduleId: string,
  data: {
    title?: string;
    description?: string;
    tumbnailUrl?: string;
    isPublished?: boolean;
  }
): Promise<Module> {
  const module = await prisma.module.update({
    where: {
      id: moduleId
    },
    data: data
  });
  return module;
}

// ... existing imports

export async function createBulkSkillCategoriesService(
  skillCategories: { name: string; description: string; courseId: string; tumbnailUrl?: string; isPublished?: boolean }[],
  createdBy?: string
): Promise<SkillCategory[]> {
  // Get existing items to determine start order
  const existingItems = await prisma.skillCategory.findMany({
    where: { courseId: skillCategories[0].courseId },
    orderBy: { order: "desc" },
    take: 1
  });

  const startOrder = existingItems.length > 0 ? existingItems[0].order + 1 : 0;

  // Determine the creator's role
  let isAdmin = false;
  if (createdBy) {
    const user = await prisma.user.findUnique({
      where: { id: createdBy },
      select: { role: true }
    });
    isAdmin = user?.role === 'ADMIN';
  }

  const createdSkillCategories = await prisma.$transaction(
    skillCategories.map((sc, index) =>
      prisma.skillCategory.create({
        data: {
          name: sc.name,
          description: sc.description,
          courseId: sc.courseId,
          tumbnailUrl: sc.tumbnailUrl,
          // Admin: respect the toggle. Non-admin: always unpublished (draft)
          isPublished: isAdmin ? (sc.isPublished ?? true) : false,
          order: startOrder + index,
          createdBy
        }
      })
    )
  );

  const result = await prisma.skillCategory.findMany({
    where: {
      courseId: skillCategories[0].courseId
    },
    orderBy: {
      order: 'desc'
    },
    take: skillCategories.length
  });

  return result.reverse();
}

export async function getSkillCategoriesByCourseIdService(courseId: string, publishedOnly = true): Promise<SkillCategory[]> {
  const skillCategories = await prisma.skillCategory.findMany({
    where: {
      courseId: courseId,
      ...(publishedOnly ? { isPublished: true } : {})
    },
    orderBy: {
      order: 'asc' // Added ordering
    }
  });
  return skillCategories;
}

export async function createBulkExpertiseService(
  expertise: { name: string; description: string; skillCategoryId: string; tumbnailUrl?: string; isPublished?: boolean; levels?: import('@prisma/client').ModuleLevel[] }[],
  createdBy?: string
): Promise<Expertise[]> {
  // Get existing items to determine start order
  const existingItems = await prisma.expertise.findMany({
    where: { skillCategoryId: expertise[0].skillCategoryId },
    orderBy: { order: "desc" },
    take: 1
  });

  const startOrder = existingItems.length > 0 ? existingItems[0].order + 1 : 0;

  // Determine the creator's role
  let isAdmin = false;
  if (createdBy) {
    const user = await prisma.user.findUnique({
      where: { id: createdBy },
      select: { role: true }
    });
    isAdmin = user?.role === 'ADMIN';
  }

  const createdExpertise = await prisma.$transaction(
    expertise.map((e, index) =>
      prisma.expertise.create({
        data: {
          name: e.name,
          description: e.description,
          skillCategoryId: e.skillCategoryId,
          tumbnailUrl: e.tumbnailUrl,
          // Admin: respect the toggle. Non-admin: always unpublished (draft)
          isPublished: isAdmin ? (e.isPublished ?? true) : false,
          levels: e.levels || [],
          order: startOrder + index,
          createdBy
        }
      })
    )
  );

  const result = await prisma.expertise.findMany({
    where: {
      skillCategoryId: expertise[0].skillCategoryId
    },
    orderBy: {
      order: 'desc'
    },
    take: expertise.length
  });

  return result.reverse();
}

export async function getExpertiseBySkillCategoryIdService(skillCategoryId: string, publishedOnly = true): Promise<Expertise[]> {
  const expertise = await prisma.expertise.findMany({
    where: {
      skillCategoryId: skillCategoryId,
      ...(publishedOnly ? { isPublished: true } : {})
    },
    orderBy: {
      order: 'asc' // Added ordering
    }
  });
  return expertise;
}

export async function createBulkModulesService(
  modules: { title: string; description: string; expertiseId: string; tumbnailUrl?: string; levels?: ('LEARNER' | 'PRACTITIONER' | 'PROFESSIONAL')[]; isPublished?: boolean }[],
  createdBy?: string
): Promise<Module[]> {
  // Get existing items to determine start order
  const existingItems = await prisma.module.findMany({
    where: { expertiseId: modules[0].expertiseId },
    orderBy: { order: "desc" },
    take: 1
  });

  const startOrder = existingItems.length > 0 ? existingItems[0].order + 1 : 0;

  // Determine the creator's role
  let isAdmin = false;
  if (createdBy) {
    const user = await prisma.user.findUnique({
      where: { id: createdBy },
      select: { role: true }
    });
    isAdmin = user?.role === 'ADMIN';
  }

  const createdModules = await prisma.$transaction(
    modules.map((m, index) =>
      prisma.module.create({
        data: {
          title: m.title,
          description: m.description,
          expertiseId: m.expertiseId,
          tumbnailUrl: m.tumbnailUrl,
          levels: m.levels || [],
          // Admin: respect the toggle. Non-admin: always unpublished (draft)
          isPublished: isAdmin ? (m.isPublished ?? true) : false,
          order: startOrder + index,
          createdBy
        }
      })
    )
  );

  const result = await prisma.module.findMany({
    where: {
      expertiseId: modules[0].expertiseId
    },
    orderBy: {
      order: 'desc'
    },
    take: modules.length
  });

  return result.reverse();
}

export async function getModulesByExpertiseIdService(expertiseId: string, publishedOnly = true): Promise<Module[]> {
  const modules = await prisma.module.findMany({
    where: {
      expertiseId: expertiseId,
      ...(publishedOnly ? { isPublished: true } : {})
    },
    include: {
      expertise: true
    },
    orderBy: {
      order: 'asc' // Added ordering
    }
  });
  return modules;
}

// ... existing code ...

export async function reorderSkillCategoryService(skillCategoryId: string, direction: "up" | "down"): Promise<void> {
  const currentItem = await prisma.skillCategory.findUnique({ where: { id: skillCategoryId } });
  if (!currentItem) throw new AppError("Skill Category not found", 404);

  const swapItem = await prisma.skillCategory.findFirst({
    where: {
      courseId: currentItem.courseId,
      order: direction === "up" ? { lt: currentItem.order } : { gt: currentItem.order }
    },
    orderBy: { order: direction === "up" ? "desc" : "asc" }
  });

  if (!swapItem) return; // Cannot move further

  await prisma.$transaction([
    prisma.skillCategory.update({ where: { id: currentItem.id }, data: { order: swapItem.order } }),
    prisma.skillCategory.update({ where: { id: swapItem.id }, data: { order: currentItem.order } })
  ]);
}

export async function reorderExpertiseService(expertiseId: string, direction: "up" | "down"): Promise<void> {
  const currentItem = await prisma.expertise.findUnique({ where: { id: expertiseId } });
  if (!currentItem) throw new AppError("Expertise not found", 404);

  const swapItem = await prisma.expertise.findFirst({
    where: {
      skillCategoryId: currentItem.skillCategoryId,
      order: direction === "up" ? { lt: currentItem.order } : { gt: currentItem.order }
    },
    orderBy: { order: direction === "up" ? "desc" : "asc" }
  });

  if (!swapItem) return;

  await prisma.$transaction([
    prisma.expertise.update({ where: { id: currentItem.id }, data: { order: swapItem.order } }),
    prisma.expertise.update({ where: { id: swapItem.id }, data: { order: currentItem.order } })
  ]);
}

export async function reorderModuleService(moduleId: string, direction: "up" | "down"): Promise<void> {
  const currentItem = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!currentItem) throw new AppError("Module not found", 404);

  const swapItem = await prisma.module.findFirst({
    where: {
      expertiseId: currentItem.expertiseId,
      order: direction === "up" ? { lt: currentItem.order } : { gt: currentItem.order }
    },
    orderBy: { order: direction === "up" ? "desc" : "asc" }
  });

  if (!swapItem) return;

  await prisma.$transaction([
    prisma.module.update({ where: { id: currentItem.id }, data: { order: swapItem.order } }),
    prisma.module.update({ where: { id: swapItem.id }, data: { order: currentItem.order } })
  ]);
}

export async function reorderChapterService(chapterId: string, direction: "up" | "down"): Promise<void> {
  const chapter = await prisma.chapters.findUnique({
    where: { id: chapterId },
  });

  if (!chapter) {
    throw new AppError("Chapter not found", 404);
  }

  const adjacentChapter = await prisma.chapters.findFirst({
    where: {
      moduleId: chapter.moduleId,
      order: direction === "up" ? { lt: chapter.order } : { gt: chapter.order },
    },
    orderBy: {
      order: direction === "up" ? "desc" : "asc",
    },
  });

  if (!adjacentChapter) {
    throw new AppError("Cannot move chapter further", 400);
  }

  // Swap orders
  await prisma.$transaction([
    prisma.chapters.update({
      where: { id: chapter.id },
      data: { order: adjacentChapter.order },
    }),
    prisma.chapters.update({
      where: { id: adjacentChapter.id },
      data: { order: chapter.order },
    }),
  ]);
}

export async function reorderLessonService(lessonId: string, direction: "up" | "down"): Promise<void> {
  const lesson = await prisma.lessons.findUnique({
    where: { id: lessonId },
  });

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  const adjacentLesson = await prisma.lessons.findFirst({
    where: {
      chapterId: lesson.chapterId,
      order: direction === "up" ? { lt: lesson.order } : { gt: lesson.order },
    },
    orderBy: {
      order: direction === "up" ? "desc" : "asc",
    },
  });

  if (!adjacentLesson) {
    throw new AppError("Cannot move lesson further", 400);
  }

  // Swap orders
  await prisma.$transaction([
    prisma.lessons.update({
      where: { id: lesson.id },
      data: { order: adjacentLesson.order },
    }),
    prisma.lessons.update({
      where: { id: adjacentLesson.id },
      data: { order: lesson.order },
    }),
  ]);
}

export async function createBulkChaptersService(
  chapters: { title: string; content: string; price: number; moduleId: string; tumbnailUrl?: string; status?: 'DRAFT' | 'PUBLISHED' }[],
  createdBy?: string
): Promise<Chapters[]> {
  const existingChapters = await prisma.chapters.findMany({
    where: { moduleId: chapters[0].moduleId },
    orderBy: { order: "desc" },
    take: 1,
  });

  const startOrder = existingChapters.length > 0 ? existingChapters[0].order + 1 : 0;

  // Determine the creator's role
  let isAdmin = false;
  if (createdBy) {
    const user = await prisma.user.findUnique({
      where: { id: createdBy },
      select: { role: true }
    });
    isAdmin = user?.role === 'ADMIN';
  }

  const createdChapters = await prisma.$transaction(
    chapters.map((chapter, index) => {
      // Admin: respect the status from the request (default DRAFT if not provided)
      // Non-admin (contributor): always DRAFT
      const chapterStatus = isAdmin
        ? (chapter.status === 'PUBLISHED' ? CourseStatus.PUBLISHED : CourseStatus.DRAFT)
        : CourseStatus.DRAFT;

      return prisma.chapters.create({
        data: {
          title: chapter.title,
          content: chapter.content,
          price: chapter.price,
          moduleId: chapter.moduleId,
          tumbnailUrl: chapter.tumbnailUrl,
          order: startOrder + index,
          createdBy,
          status: chapterStatus
        },
      });
    })
  );



  // Get the courseId from the first chapter's module
  const firstChapter = await prisma.chapters.findUnique({
    where: { id: createdChapters[0].id },
    include: {
      module: {
        include: {
          expertise: {
            include: {
              skillCategory: {
                include: {
                  course: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (firstChapter?.module.expertise.skillCategory.course.id) {
    await updateCourseFlagsBasedOnPrice(firstChapter.module.expertise.skillCategory.course.id);
  }

  return createdChapters;
}

export async function getChaptersByModuleIdService(moduleId: string, publishedOnly = true): Promise<Chapters[]> {
  const chapters = await prisma.chapters.findMany({
    where: {
      moduleId: moduleId,
      ...(publishedOnly ? { status: CourseStatus.PUBLISHED } : {})
    },
    include: {
      module: true,
      Lessons: {
        where: publishedOnly ? { status: CourseStatus.PUBLISHED } : undefined,
        include: {
          Video: true
        },
        orderBy: { order: "asc" } // ✅ Add ordering
      }
    },
    orderBy: { order: "asc" } // ✅ Add ordering
  });
  return chapters;
}

export async function createBulkLessonsService(
  lessons: { title: string; content: string; chapterId: string; tumbnailUrl?: string; video?: { url: string; duration: number }; status?: 'DRAFT' | 'PUBLISHED' }[],
  createdBy?: string
): Promise<Lessons[]> {
  const existingLessons = await prisma.lessons.findMany({
    where: { chapterId: lessons[0].chapterId },
    orderBy: { order: "desc" },
    take: 1,
  });

  const startOrder = existingLessons.length > 0 ? existingLessons[0].order + 1 : 0;

  // Determine the creator's role
  let isAdmin = false;
  if (createdBy) {
    const user = await prisma.user.findUnique({
      where: { id: createdBy },
      select: { role: true }
    });
    isAdmin = user?.role === 'ADMIN';
  }

  const createdLessons = await prisma.$transaction(
    lessons.map((lesson, index) => {
      // Admin: respect the status from the request (default DRAFT if not provided)
      // Non-admin (contributor): always DRAFT
      const lessonStatus = isAdmin
        ? (lesson.status === 'PUBLISHED' ? CourseStatus.PUBLISHED : CourseStatus.DRAFT)
        : CourseStatus.DRAFT;

      return prisma.lessons.create({
        data: {
          title: lesson.title,
          content: lesson.content,
          chapterId: lesson.chapterId,
          tumbnailUrl: lesson.tumbnailUrl,
          order: startOrder + index,
          createdBy,
          status: lessonStatus,
          Video: lesson.video ? {
            create: {
              url: lesson.video.url,
              duration: lesson.video.duration,
            }
          } : undefined,
        },
        include: {
          Video: true,
        },
      });
    })
  );

  // After creating lessons, get the courseId and update flags
  const firstLesson = await prisma.lessons.findUnique({
    where: { id: createdLessons[0].id },
    include: {
      chapter: {
        include: {
          module: {
            include: {
              expertise: {
                include: {
                  skillCategory: {
                    include: {
                      course: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (firstLesson?.chapter.module.expertise.skillCategory.course.id) {
    await updateCourseFlagsBasedOnVideos(firstLesson.chapter.module.expertise.skillCategory.course.id);
  }

  return createdLessons;
}

export async function getLessonsByChapterIdService(chapterId: string, publishedOnly = true): Promise<Lessons[]> {
  const lessons = await prisma.lessons.findMany({
    where: {
      chapterId: chapterId,
      ...(publishedOnly ? { status: CourseStatus.PUBLISHED } : {})
    },
    include: {
      Video: true
    },
    orderBy: { order: "asc" } // ✅ Add ordering
  });
  return lessons;
}

export async function getTopCoursesService(): Promise<(Course & { category: Category; subCategory: SubCategory; totalPrice: number; totalDuration: number })[]> {
  const courses = await prisma.course.findMany({
    where: {
      published: true,
      status: CourseStatus.PUBLISHED,
      isActive: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      category: true,
      subCategory: true
    }
  });

  // Calculate total price and duration for each course
  const coursesWithPriceAndDuration = await Promise.all(
    courses.map(async (course) => {
      const totalPrice = await calculateCourseTotalPrice(course.id);
      const totalDuration = await calculateCourseTotalDuration(course.id);
      return { ...course, totalPrice, totalDuration };
    })
  );

  return coursesWithPriceAndDuration;
}

async function updateCourseFlagsBasedOnPrice(courseId: string): Promise<void> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      SkillCategory: {
        include: {
          Expertise: {
            include: {
              Module: {
                include: {
                  Chapters: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!course) return;

  // Check if any chapter has price > 0
  let hasPaidChapter = false;
  course.SkillCategory.forEach(skillCategory => {
    skillCategory.Expertise.forEach(expertise => {
      expertise.Module.forEach(module => {
        module.Chapters.forEach(chapter => {
          if (chapter.price > 0) {
            hasPaidChapter = true;
          }
        });
      });
    });
  });

  // Update course flags
  const flags: CourseFlag[] = hasPaidChapter ? ['PAID'] : ['FREE'];

  await prisma.course.update({
    where: { id: courseId },
    data: { flags }
  });
}

export async function getCourseDetailsByCourseIdService(courseId: string): Promise<
  Course & {
    category: Category;
    subCategory: SubCategory;
    totalPrice: number;
    SkillCategory: (SkillCategory & {
      Expertise: (Expertise & {
        Module: (Module & {
          Chapters: (Chapters & {
            Lessons: (Lessons & {
              Video: Video[];
            })[];
          })[];
        })[];
      })[];
    })[];
  }
> {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
      published: true,
      status: CourseStatus.PUBLISHED,
      isActive: true
    },
    include: {
      category: true,
      subCategory: true,
      SkillCategory: {
        where: { isPublished: true, isActive: true },
        include: {
          Expertise: {
            where: { isPublished: true, isActive: true },
            include: {
              Module: {
                where: { isPublished: true, isActive: true },
                include: {
                  Chapters: {
                    where: { status: CourseStatus.PUBLISHED, isActive: true },
                    include: {
                      Lessons: {
                        where: { status: CourseStatus.PUBLISHED, isActive: true },
                        include: {
                          Video: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  // Calculate total price
  const totalPrice = await calculateCourseTotalPrice(courseId);

  return {
    ...course,
    totalPrice
  };
}

export async function getLessonsByChapterIdWithAuthService(
  chapterId: string,
  userId: string
): Promise<(Lessons & { Video: Video[]; isCompleted?: boolean })[]> {
  const lessons = await prisma.lessons.findMany({
    where: {
      chapterId: chapterId,
      status: CourseStatus.PUBLISHED
    },
    include: {
      Video: true,
    },
    orderBy: { order: "asc" } // ✅ Add ordering
  });

  // Get viewing history for all lessons in this chapter
  const viewingHistories = await prisma.viewingHistory.findMany({
    where: {
      userId,
      lessonId: { in: lessons.map(l => l.id) },
      isActive: true,
    },
    select: {
      lessonId: true,
      isCompleted: true,
    },
  });

  // Create a map of lessonId -> isCompleted
  const completionMap = new Map(
    viewingHistories.map(vh => [vh.lessonId, vh.isCompleted])
  );

  // Add completion status to each lesson
  return lessons.map(lesson => ({
    ...lesson,
    isCompleted: completionMap.get(lesson.id) || false,
  }));
}

export async function createUserLessonNotesService(content: string, lessonId: string, userId: string): Promise<UserLessonNotes> {
  const note = await prisma.userLessonNotes.create({
    data: {
      content,
      lessonId,
      userId
    }
  });
  return note;
}

export async function getUserLessonNotesByLessonIdService(lessonId: string, userId: string): Promise<UserLessonNotes[]> {
  const notes = await prisma.userLessonNotes.findMany({
    where: {
      lessonId: lessonId,
      userId: userId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  return notes;
}

export async function deleteCourseService(courseId: string): Promise<void> {
  await prisma.course.delete({
    where: {
      id: courseId
    }
  });
}

export async function deleteCategoryService(categoryId: string): Promise<void> {
  await prisma.category.delete({
    where: {
      id: categoryId
    }
  });
}

export async function deleteSubCategoryService(subCategoryId: string): Promise<void> {
  await prisma.subCategory.delete({
    where: {
      id: subCategoryId
    }
  });
}

export async function deleteSkillCategoryService(skillCategoryId: string): Promise<void> {
  await prisma.skillCategory.delete({
    where: {
      id: skillCategoryId
    }
  });
}

export async function deleteExpertiseService(expertiseId: string): Promise<void> {
  await prisma.expertise.delete({
    where: {
      id: expertiseId
    }
  });
}

export async function deleteModuleService(moduleId: string): Promise<void> {
  await prisma.module.delete({
    where: {
      id: moduleId
    }
  });
}

export async function deleteChapterService(chapterId: string): Promise<void> {
  await prisma.chapters.delete({
    where: {
      id: chapterId
    }
  });
}

export async function deleteLessonService(lessonId: string): Promise<void> {
  await prisma.lessons.delete({
    where: {
      id: lessonId
    }
  });
}

export async function updateCategoryService(
  categoryId: string,
  data: {
    name?: string;
    description?: string;
    tumbnailUrl?: string;
  }
): Promise<Category> {
  const category = await prisma.category.update({
    where: {
      id: categoryId
    },
    data: data
  });
  return category;
}

export async function updateSubCategoryService(
  subCategoryId: string,
  data: {
    name?: string;
    description?: string;
    categoryId?: string;
    tumbnailUrl?: string;
  }
): Promise<SubCategory> {
  const subCategory = await prisma.subCategory.update({
    where: {
      id: subCategoryId
    },
    data: data
  });
  return subCategory;
}

export async function updateSkillCategoryService(
  skillCategoryId: string,
  data: {
    name?: string;
    description?: string;
    tumbnailUrl?: string;
    isPublished?: boolean;
  }
): Promise<SkillCategory> {
  const skillCategory = await prisma.skillCategory.update({
    where: {
      id: skillCategoryId
    },
    data: data
  });
  return skillCategory;
}

export async function updateExpertiseService(
  expertiseId: string,
  data: {
    name?: string;
    description?: string;
    tumbnailUrl?: string;
    isPublished?: boolean;
    levels?: import('@prisma/client').ModuleLevel[];
  }
): Promise<Expertise> {
  const expertise = await prisma.expertise.update({
    where: {
      id: expertiseId
    },
    data: data
  });
  return expertise;
}

export async function updateChapterService(
  chapterId: string,
  data: {
    title?: string;
    content?: string;
    price?: number;
    tumbnailUrl?: string;
    status?: CourseStatus;
  }
): Promise<Chapters> {
  const chapter = await prisma.chapters.update({
    where: {
      id: chapterId
    },
    data: data
  });

  // Get courseId and update flags if price changed
  if (data.price !== undefined) {
    const chapterWithCourse = await prisma.chapters.findUnique({
      where: { id: chapterId },
      include: {
        module: {
          include: {
            expertise: {
              include: {
                skillCategory: {
                  include: {
                    course: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (chapterWithCourse?.module.expertise.skillCategory.course.id) {
      await updateCourseFlagsBasedOnPrice(chapterWithCourse.module.expertise.skillCategory.course.id);
    }
  }

  return chapter;
}

export async function updateLessonService(
  lessonId: string,
  data: {
    title?: string;
    content?: string;
    tumbnailUrl?: string;
    video?: { url: string; duration: number } | null;
    status?: CourseStatus;
  }
): Promise<Lessons> {
  const lesson = await prisma.lessons.findUnique({
    where: { id: lessonId },
    include: { Video: true }
  });

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  if (data.video === null && lesson.Video.length > 0) {
    await prisma.video.deleteMany({
      where: { lessonId: lessonId }
    });
  } else if (data.video && data.video.url) {
    if (lesson.Video.length > 0) {
      await prisma.video.update({
        where: { id: lesson.Video[0].id },
        data: {
          url: data.video.url,
          duration: data.video.duration
        }
      });
    } else {
      await prisma.video.create({
        data: {
          url: data.video.url,
          duration: data.video.duration,
          lessonId: lessonId
        }
      });
    }
  }

  const { video, ...lessonData } = data;
  const updatedLesson = await prisma.lessons.update({
    where: { id: lessonId },
    data: lessonData
  });

  // After updating, get courseId and update flags
  const lessonWithCourse = await prisma.lessons.findUnique({
    where: { id: lessonId },
    include: {
      chapter: {
        include: {
          module: {
            include: {
              expertise: {
                include: {
                  skillCategory: {
                    include: {
                      course: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (lessonWithCourse?.chapter.module.expertise.skillCategory.course.id) {
    await updateCourseFlagsBasedOnVideos(lessonWithCourse.chapter.module.expertise.skillCategory.course.id);
  }

  return updatedLesson;
}

export async function updateVideoService(
  videoId: string,
  data: {
    url?: string;
    duration?: number;
  }
): Promise<Video> {
  const video = await prisma.video.update({
    where: {
      id: videoId
    },
    data: data
  });
  return video;
}

export async function getCategoryByIdService(categoryId: string): Promise<Category> {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId
    }
  });
  if (!category) {
    throw new AppError("Category not found", 404);
  }
  return category;
}

export async function getSubCategoryByIdService(subCategoryId: string): Promise<SubCategory> {
  const subCategory = await prisma.subCategory.findUnique({
    where: {
      id: subCategoryId
    }
  });
  if (!subCategory) {
    throw new AppError("Sub-category not found", 404);
  }
  return subCategory;
}

export async function getSkillCategoryByIdService(skillCategoryId: string): Promise<SkillCategory> {
  const skillCategory = await prisma.skillCategory.findUnique({
    where: {
      id: skillCategoryId
    }
  });
  if (!skillCategory) {
    throw new AppError("Skill category not found", 404);
  }
  return skillCategory;
}

export async function getExpertiseByIdService(expertiseId: string): Promise<Expertise> {
  const expertise = await prisma.expertise.findUnique({
    where: {
      id: expertiseId
    }
  });
  if (!expertise) {
    throw new AppError("Expertise not found", 404);
  }
  return expertise;
}

export async function getModuleByIdService(moduleId: string): Promise<Module> {
  const module = await prisma.module.findUnique({
    where: {
      id: moduleId
    }
  });
  if (!module) {
    throw new AppError("Module not found", 404);
  }
  return module;
}

export async function getChapterByIdService(chapterId: string): Promise<Chapters> {
  const chapter = await prisma.chapters.findUnique({
    where: {
      id: chapterId
    }
  });
  if (!chapter) {
    throw new AppError("Chapter not found", 404);
  }
  return chapter;
}

export async function getLessonByIdService(lessonId: string): Promise<Lessons> {
  const lesson = await prisma.lessons.findUnique({
    where: {
      id: lessonId
    },
    include: {
      Video: true
    }
  });
  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }
  return lesson;
}

export async function getCoursesByPriceCategoryService(priceCategory: 'FREE' | 'TRIAL' | 'PAID'): Promise<(Course & { category: Category; subCategory: SubCategory; totalPrice: number })[]> {
  const courses = await prisma.course.findMany({
    where: { published: true, status: CourseStatus.PUBLISHED, isActive: true },
    include: {
      category: true,
      subCategory: true
    }
  });

  // Calculate total price for each course
  const coursesWithPrice = await Promise.all(
    courses.map(async (course) => {
      const totalPrice = await calculateCourseTotalPrice(course.id);
      return { ...course, totalPrice };
    })
  );

  return coursesWithPrice;
}

export async function getFreeCoursesService(): Promise<(Course & { category: Category; subCategory: SubCategory; totalPrice: number })[]> {
  return getCoursesByPriceCategoryService('FREE');
}

export async function getTrialCoursesService(): Promise<(Course & { category: Category; subCategory: SubCategory; totalPrice: number })[]> {
  return getCoursesByPriceCategoryService('TRIAL');
}

export async function getPaidCoursesService(): Promise<(Course & { category: Category; subCategory: SubCategory; totalPrice: number })[]> {
  return getCoursesByPriceCategoryService('PAID');
}

export async function searchCoursesService(
  filters: {
    searchTerm: string;
    category?: string;
    sortBy?: "relevance" | "newest" | "mostPopular";
  },
  page: number,
  limit: number
) {
  const skip = (page - 1) * limit;

  // Build Prisma where clause - only search title and description
  const whereClause: Prisma.CourseWhereInput = {
    AND: [
      { published: true, status: CourseStatus.PUBLISHED, isActive: true },
      {
        OR: [
          { title: { contains: filters.searchTerm, mode: "insensitive" } },
          { description: { contains: filters.searchTerm, mode: "insensitive" } },
          { category: { name: { contains: filters.searchTerm, mode: "insensitive" } } },
          { subCategory: { name: { contains: filters.searchTerm, mode: "insensitive" } } }
        ]
      },
      filters.category
        ? { category: { name: { equals: filters.category, mode: "insensitive" } } }
        : {}
    ]
  };

  // Define sort order
  const orderByClause: Prisma.CourseOrderByWithRelationInput = getSortOrder(filters.sortBy || "relevance");

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where: whereClause,
      include: {
        category: true,
        subCategory: true
      },
      orderBy: orderByClause,
      skip,
      take: limit
    }),
    prisma.course.count({ where: whereClause })
  ]);

  // Calculate total price for each course
  const coursesWithPrice = await Promise.all(
    courses.map(async (course) => {
      const totalPrice = await calculateCourseTotalPrice(course.id);
      return { ...course, totalPrice };
    })
  );

  return {
    courses: coursesWithPrice,
    total
  };
}

// Helper function for sorting
function getSortOrder(sortBy: string): Prisma.CourseOrderByWithRelationInput {
  switch (sortBy) {
    case "newest":
      return { createdAt: "desc" };
    case "mostPopular":
      return { updatedAt: "desc" };
    case "relevance":
    default:
      return { title: "asc" };
  }
}

export async function calculateCourseTotalPrice(courseId: string): Promise<number> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      SkillCategory: {
        where: { isPublished: true, isActive: true },
        include: {
          Expertise: {
            where: { isPublished: true, isActive: true },
            include: {
              Module: {
                where: { isPublished: true, isActive: true },
                include: {
                  Chapters: {
                    where: { status: CourseStatus.PUBLISHED, isActive: true }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  let totalPrice = 0;
  course.SkillCategory.forEach(skillCategory => {
    skillCategory.Expertise.forEach(expertise => {
      expertise.Module.forEach(module => {
        module.Chapters.forEach(chapter => {
          totalPrice += chapter.price;
        });
      });
    });
  });

  return totalPrice;
}

export async function calculateCourseTotalDuration(courseId: string): Promise<number> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      SkillCategory: {
        where: { isPublished: true, isActive: true },
        include: {
          Expertise: {
            where: { isPublished: true, isActive: true },
            include: {
              Module: {
                where: { isPublished: true, isActive: true },
                include: {
                  Chapters: {
                    where: { status: CourseStatus.PUBLISHED, isActive: true },
                    include: {
                      Lessons: {
                        where: { status: CourseStatus.PUBLISHED, isActive: true },
                        include: {
                          Video: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!course) return 0;

  let totalDuration = 0; // in seconds
  course.SkillCategory.forEach(skillCategory => {
    skillCategory.Expertise.forEach(expertise => {
      expertise.Module.forEach(module => {
        module.Chapters.forEach(chapter => {
          chapter.Lessons.forEach(lesson => {
            lesson.Video.forEach(video => {
              totalDuration += video.duration;
            });
          });
        });
      });
    });
  });

  return totalDuration; // Returns total duration in seconds
}



export async function submitCourseService(
  courseId: string,
  userId: string
): Promise<Course> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { category: true }
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (course.status !== CourseStatus.DRAFT) {
    throw new AppError("Only courses in DRAFT status can be submitted", 400);
  }

  if (course.createdBy !== userId) {
    throw new AppError("You can only submit your own courses", 403);
  }

  const updatedCourse = await prisma.course.update({
    where: { id: courseId },
    data: {
      status: CourseStatus.SUBMITTED,
      submittedAt: new Date(),
      submittedBy: userId,
    },
  });

  // Get contributor info
  const contributor = await prisma.user.findUnique({
    where: { id: userId },
  });

  await logWorkflowEventService({
    entityType: EntityType.COURSE,
    entityId: courseId,
    statusFrom: CourseStatus.DRAFT,
    statusTo: CourseStatus.SUBMITTED,
    action: WorkflowAction.SUBMITTED,
    performedBy: userId,
    performedByName: contributor?.name || 'Unknown',
    metadata: {
      courseTitle: course.title,
    },
  });

  // Get all moderators and admins for notification
  const moderatorsAndAdmins = await prisma.user.findMany({
    where: {
      role: { in: ['MODERATOR', 'ADMIN'] },
      isActive: true,
    },
  });

  // Create notifications and send emails
  await Promise.all([
    // Notify contributor
    createNotificationService({
      userId,
      type: NotificationType.COURSE_SUBMITTED,
      title: "Course Submitted",
      message: `Your course "${course.title}" has been submitted for review.`,
      relatedEntityType: EntityType.COURSE,
      relatedEntityId: courseId,
    }),
    // Send email to contributor
    contributor ? sendCourseSubmittedEmail(
      contributor.email,
      contributor.name,
      course.title,
      courseId
    ) : Promise.resolve(),
    // Notify and email moderators/admins
    ...moderatorsAndAdmins.map(async (moderator) => {
      await createNotificationService({
        userId: moderator.id,
        type: NotificationType.COURSE_SUBMITTED,
        title: "New Course Submission",
        message: `Course "${course.title}" has been submitted by ${contributor?.name || 'Unknown'}.`,
        relatedEntityType: EntityType.COURSE,
        relatedEntityId: courseId,
      });
      if (contributor) {
        await sendCourseSubmittedNotificationEmail(
          moderator.email,
          moderator.name,
          course.title,
          contributor.name,
          courseId
        );
      }
    }),
  ]);

  return updatedCourse;
}

export async function submitChapterService(
  chapterId: string,
  userId: string
): Promise<Chapters> {
  const chapter = await prisma.chapters.findUnique({
    where: { id: chapterId },
    include: { module: { include: { expertise: { include: { skillCategory: { include: { course: true } } } } } } },
  });

  if (!chapter) {
    throw new AppError("Chapter not found", 404);
  }

  if (chapter.status !== CourseStatus.DRAFT) {
    throw new AppError("Only chapters in DRAFT status can be submitted", 400);
  }

  if (chapter.createdBy !== userId) {
    throw new AppError("You can only submit your own chapters", 403);
  }

  const updatedChapter = await prisma.chapters.update({
    where: { id: chapterId },
    data: {
      status: CourseStatus.SUBMITTED,
      submittedAt: new Date(),
      submittedBy: userId,
    },
  });

  const contributor = await prisma.user.findUnique({
    where: { id: userId },
  });

  const course = chapter.module.expertise.skillCategory.course;
  const moderatorsAndAdmins = await prisma.user.findMany({
    where: {
      role: { in: ['MODERATOR', 'ADMIN'] },
      isActive: true,
    },
  });

  await Promise.all([
    createNotificationService({
      userId,
      type: NotificationType.CHAPTER_SUBMITTED,
      title: "Chapter Submitted",
      message: `Your chapter "${chapter.title}" has been submitted for review.`,
      relatedEntityType: EntityType.CHAPTER,
      relatedEntityId: chapterId,
    }),
    contributor ? sendChapterSubmittedEmail(
      contributor.email,
      contributor.name,
      chapter.title,
      course.title,
      chapterId
    ) : Promise.resolve(),
    ...moderatorsAndAdmins.map(async (moderator) => {
      await createNotificationService({
        userId: moderator.id,
        type: NotificationType.CHAPTER_SUBMITTED,
        title: "New Chapter Submission",
        message: `Chapter "${chapter.title}" has been submitted by ${contributor?.name || 'Unknown'}.`,
        relatedEntityType: EntityType.CHAPTER,
        relatedEntityId: chapterId,
      });
      if (contributor) {
        await sendChapterSubmittedNotificationEmail(
          moderator.email,
          moderator.name,
          chapter.title,
          course.title,
          contributor.name,
          chapterId
        );
      }
    }),
  ]);

  return updatedChapter;
}

export async function submitLessonService(
  lessonId: string,
  userId: string
): Promise<Lessons> {
  const lesson = await prisma.lessons.findUnique({
    where: { id: lessonId },
    include: { chapter: { include: { module: { include: { expertise: { include: { skillCategory: { include: { course: true } } } } } } } } },
  });

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  if (lesson.status !== CourseStatus.DRAFT) {
    throw new AppError("Only lessons in DRAFT status can be submitted", 400);
  }

  if (lesson.createdBy !== userId) {
    throw new AppError("You can only submit your own lessons", 403);
  }

  const updatedLesson = await prisma.lessons.update({
    where: { id: lessonId },
    data: {
      status: CourseStatus.SUBMITTED,
      submittedAt: new Date(),
      submittedBy: userId,
    },
  });

  const contributor = await prisma.user.findUnique({
    where: { id: userId },
  });

  const chapter = lesson.chapter;
  const moderatorsAndAdmins = await prisma.user.findMany({
    where: {
      role: { in: ['MODERATOR', 'ADMIN'] },
      isActive: true,
    },
  });

  await Promise.all([
    createNotificationService({
      userId,
      type: NotificationType.LESSON_SUBMITTED,
      title: "Lesson Submitted",
      message: `Your lesson "${lesson.title}" has been submitted for review.`,
      relatedEntityType: EntityType.LESSON,
      relatedEntityId: lessonId,
    }),
    contributor ? sendLessonSubmittedEmail(
      contributor.email,
      contributor.name,
      lesson.title,
      chapter.title,
      lessonId
    ) : Promise.resolve(),
    ...moderatorsAndAdmins.map(async (moderator) => {
      await createNotificationService({
        userId: moderator.id,
        type: NotificationType.LESSON_SUBMITTED,
        title: "New Lesson Submission",
        message: `Lesson "${lesson.title}" has been submitted by ${contributor?.name || 'Unknown'}.`,
        relatedEntityType: EntityType.LESSON,
        relatedEntityId: lessonId,
      });
      if (contributor) {
        await sendLessonSubmittedNotificationEmail(
          moderator.email,
          moderator.name,
          lesson.title,
          chapter.title,
          contributor.name,
          lessonId
        );
      }
    }),
  ]);

  return updatedLesson;
}


export async function approveCourseService(
  courseId: string,
  userId: string
): Promise<Course> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (course.status !== CourseStatus.SUBMITTED) {
    throw new AppError("Only courses in SUBMITTED status can be approved", 400);
  }

  const updatedCourse = await prisma.course.update({
    where: { id: courseId },
    data: {
      status: CourseStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: userId,
    },
  });

  const moderator = await prisma.user.findUnique({
    where: { id: userId },
  });

  await logWorkflowEventService({
    entityType: EntityType.COURSE,
    entityId: courseId,
    statusFrom: CourseStatus.SUBMITTED,
    statusTo: CourseStatus.APPROVED,
    action: WorkflowAction.APPROVED,
    performedBy: userId,
    performedByName: moderator?.name || 'Unknown',
    metadata: {
      courseTitle: course.title,
    },
  });

  const contributor = course.createdBy ? await prisma.user.findUnique({
    where: { id: course.createdBy },
  }) : null;

  // Get admins for notification
  const admins = await prisma.user.findMany({
    where: {
      role: 'ADMIN',
      isActive: true,
    },
  });

  await Promise.all([
    // Notify contributor
    contributor ? createNotificationService({
      userId: contributor.id,
      type: NotificationType.COURSE_APPROVED,
      title: "Course Approved",
      message: `Your course "${course.title}" has been approved by ${moderator?.name || 'Moderator'}.`,
      relatedEntityType: EntityType.COURSE,
      relatedEntityId: courseId,
    }) : Promise.resolve(),
    // Send email to contributor
    contributor ? sendCourseApprovedEmail(
      contributor.email,
      contributor.name,
      course.title,
      courseId
    ) : Promise.resolve(),
    // Notify admins
    ...admins.map(admin =>
      createNotificationService({
        userId: admin.id,
        type: NotificationType.COURSE_APPROVED,
        title: "Course Approved",
        message: `Course "${course.title}" has been approved by ${moderator?.name || 'Moderator'}.`,
        relatedEntityType: EntityType.COURSE,
        relatedEntityId: courseId,
      })
    ),
  ]);

  return updatedCourse;
}

export async function approveChapterService(
  chapterId: string,
  userId: string
): Promise<Chapters> {
  const chapter = await prisma.chapters.findUnique({
    where: { id: chapterId },
    include: { module: { include: { expertise: { include: { skillCategory: { include: { course: true } } } } } } },
  });

  if (!chapter) {
    throw new AppError("Chapter not found", 404);
  }

  if (chapter.status !== CourseStatus.SUBMITTED) {
    throw new AppError("Only chapters in SUBMITTED status can be approved", 400);
  }

  const updatedChapter = await prisma.chapters.update({
    where: { id: chapterId },
    data: {
      status: CourseStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: userId,
    },
  });

  const moderator = await prisma.user.findUnique({
    where: { id: userId },
  });

  await logWorkflowEventService({
    entityType: EntityType.CHAPTER,
    entityId: chapterId,
    statusFrom: CourseStatus.SUBMITTED,
    statusTo: CourseStatus.APPROVED,
    action: WorkflowAction.APPROVED,
    performedBy: userId,
    performedByName: moderator?.name || 'Unknown',
    metadata: {
      chapterTitle: chapter.title,
    },
  });

  const contributor = chapter.createdBy ? await prisma.user.findUnique({
    where: { id: chapter.createdBy },
  }) : null;

  const course = chapter.module.expertise.skillCategory.course;

  if (contributor) {
    await Promise.all([
      createNotificationService({
        userId: contributor.id,
        type: NotificationType.CHAPTER_APPROVED,
        title: "Chapter Approved",
        message: `Your chapter "${chapter.title}" has been approved.`,
        relatedEntityType: EntityType.CHAPTER,
        relatedEntityId: chapterId,
      }),
      sendChapterApprovedEmail(
        contributor.email,
        contributor.name,
        chapter.title,
        course.title,
        chapterId
      ),
    ]);
  }

  return updatedChapter;
}

export async function approveLessonService(
  lessonId: string,
  userId: string
): Promise<Lessons> {
  const lesson = await prisma.lessons.findUnique({
    where: { id: lessonId },
    include: { chapter: true },
  });

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  if (lesson.status !== CourseStatus.SUBMITTED) {
    throw new AppError("Only lessons in SUBMITTED status can be approved", 400);
  }

  const updatedLesson = await prisma.lessons.update({
    where: { id: lessonId },
    data: {
      status: CourseStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: userId,
    },
  });

  const moderator = await prisma.user.findUnique({
    where: { id: userId },
  });

  await logWorkflowEventService({
    entityType: EntityType.LESSON,
    entityId: lessonId,
    statusFrom: CourseStatus.SUBMITTED,
    statusTo: CourseStatus.APPROVED,
    action: WorkflowAction.APPROVED,
    performedBy: userId,
    performedByName: moderator?.name || 'Unknown',
    metadata: {
      lessonTitle: lesson.title,
    },
  });

  const contributor = lesson.createdBy ? await prisma.user.findUnique({
    where: { id: lesson.createdBy },
  }) : null;

  if (contributor) {
    await Promise.all([
      createNotificationService({
        userId: contributor.id,
        type: NotificationType.LESSON_APPROVED,
        title: "Lesson Approved",
        message: `Your lesson "${lesson.title}" has been approved.`,
        relatedEntityType: EntityType.LESSON,
        relatedEntityId: lessonId,
      }),
      sendLessonApprovedEmail(
        contributor.email,
        contributor.name,
        lesson.title,
        lesson.chapter.title,
        lessonId
      ),
    ]);
  }

  return updatedLesson;
}

export async function rejectCourseService(
  courseId: string,
  userId: string,
  rejectionReason: string
): Promise<Course> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (course.status !== CourseStatus.SUBMITTED) {
    throw new AppError("Only courses in SUBMITTED status can be rejected", 400);
  }

  const updatedCourse = await prisma.course.update({
    where: { id: courseId },
    data: {
      status: CourseStatus.REJECTED,
      rejectedAt: new Date(),
      rejectedBy: userId,
      rejectionReason,
    },
  });

  const moderator = await prisma.user.findUnique({
    where: { id: userId },
  });

  await logWorkflowEventService({
    entityType: EntityType.COURSE,
    entityId: courseId,
    statusFrom: CourseStatus.SUBMITTED,
    statusTo: CourseStatus.REJECTED,
    action: WorkflowAction.REJECTED,
    performedBy: userId,
    performedByName: moderator?.name || 'Unknown',
    metadata: {
      courseTitle: course.title,
      rejectionReason,
    },
  });

  const contributor = course.createdBy ? await prisma.user.findUnique({
    where: { id: course.createdBy },
  }) : null;

  if (contributor) {
    await Promise.all([
      createNotificationService({
        userId: contributor.id,
        type: NotificationType.COURSE_REJECTED,
        title: "Course Rejected",
        message: `Your course "${course.title}" has been rejected. Reason: ${rejectionReason}`,
        relatedEntityType: EntityType.COURSE,
        relatedEntityId: courseId,
      }),
      sendCourseRejectedEmail(
        contributor.email,
        contributor.name,
        course.title,
        rejectionReason,
        courseId
      ),
    ]);
  }

  return updatedCourse;
}

export async function rejectChapterService(
  chapterId: string,
  userId: string,
  rejectionReason: string
): Promise<Chapters> {
  const chapter = await prisma.chapters.findUnique({
    where: { id: chapterId },
    include: { module: { include: { expertise: { include: { skillCategory: { include: { course: true } } } } } } },
  });

  if (!chapter) {
    throw new AppError("Chapter not found", 404);
  }

  if (chapter.status !== CourseStatus.SUBMITTED) {
    throw new AppError("Only chapters in SUBMITTED status can be rejected", 400);
  }

  const updatedChapter = await prisma.chapters.update({
    where: { id: chapterId },
    data: {
      status: CourseStatus.REJECTED,
      rejectedAt: new Date(),
      rejectedBy: userId,
      rejectionReason,
    },
  });

  const moderator = await prisma.user.findUnique({
    where: { id: userId },
  });

  await logWorkflowEventService({
    entityType: EntityType.CHAPTER,
    entityId: chapterId,
    statusFrom: CourseStatus.SUBMITTED,
    statusTo: CourseStatus.REJECTED,
    action: WorkflowAction.REJECTED,
    performedBy: userId,
    performedByName: moderator?.name || 'Unknown',
    metadata: {
      chapterTitle: chapter.title,
      rejectionReason,
    },
  });

  const contributor = chapter.createdBy ? await prisma.user.findUnique({
    where: { id: chapter.createdBy },
  }) : null;

  const course = chapter.module.expertise.skillCategory.course;

  if (contributor) {
    await Promise.all([
      createNotificationService({
        userId: contributor.id,
        type: NotificationType.CHAPTER_REJECTED,
        title: "Chapter Rejected",
        message: `Your chapter "${chapter.title}" has been rejected. Reason: ${rejectionReason}`,
        relatedEntityType: EntityType.CHAPTER,
        relatedEntityId: chapterId,
      }),
      sendChapterRejectedEmail(
        contributor.email,
        contributor.name,
        chapter.title,
        course.title,
        rejectionReason,
        chapterId
      ),
    ]);
  }

  return updatedChapter;
}

export async function rejectLessonService(
  lessonId: string,
  userId: string,
  rejectionReason: string
): Promise<Lessons> {
  const lesson = await prisma.lessons.findUnique({
    where: { id: lessonId },
    include: { chapter: true },
  });

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  if (lesson.status !== CourseStatus.SUBMITTED) {
    throw new AppError("Only lessons in SUBMITTED status can be rejected", 400);
  }

  const updatedLesson = await prisma.lessons.update({
    where: { id: lessonId },
    data: {
      status: CourseStatus.REJECTED,
      rejectedAt: new Date(),
      rejectedBy: userId,
      rejectionReason,
    },
  });

  const moderator = await prisma.user.findUnique({
    where: { id: userId },
  });

  await logWorkflowEventService({
    entityType: EntityType.LESSON,
    entityId: lessonId,
    statusFrom: CourseStatus.SUBMITTED,
    statusTo: CourseStatus.REJECTED,
    action: WorkflowAction.REJECTED,
    performedBy: userId,
    performedByName: moderator?.name || 'Unknown',
    metadata: {
      lessonTitle: lesson.title,
      rejectionReason,
    },
  });

  const contributor = lesson.createdBy ? await prisma.user.findUnique({
    where: { id: lesson.createdBy },
  }) : null;

  if (contributor) {
    await Promise.all([
      createNotificationService({
        userId: contributor.id,
        type: NotificationType.LESSON_REJECTED,
        title: "Lesson Rejected",
        message: `Your lesson "${lesson.title}" has been rejected. Reason: ${rejectionReason}`,
        relatedEntityType: EntityType.LESSON,
        relatedEntityId: lessonId,
      }),
      sendLessonRejectedEmail(
        contributor.email,
        contributor.name,
        lesson.title,
        lesson.chapter.title,
        rejectionReason,
        lessonId
      ),
    ]);
  }

  return updatedLesson;
}


export async function publishCourseService(
  courseId: string,
  userId: string,
  flags?: CourseFlag[]
): Promise<Course> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (course.status !== CourseStatus.APPROVED) {
    throw new AppError("Only courses in APPROVED status can be published", 400);
  }

  const updatedCourse = await prisma.course.update({
    where: { id: courseId },
    data: {
      status: CourseStatus.PUBLISHED,
      published: true,
      flags: flags || [],
    },
  });

  const contributor = course.createdBy ? await prisma.user.findUnique({
    where: { id: course.createdBy },
  }) : null;

  await logWorkflowEventService({
    entityType: EntityType.COURSE,
    entityId: courseId,
    statusFrom: CourseStatus.APPROVED,
    statusTo: CourseStatus.PUBLISHED,
    action: WorkflowAction.PUBLISHED,
    performedBy: userId,
    performedByName: contributor?.name || 'Unknown',
    metadata: {
      courseTitle: course.title,
      flags: flags || [],
    },
  });

  if (contributor) {
    await Promise.all([
      createNotificationService({
        userId: contributor.id,
        type: NotificationType.COURSE_PUBLISHED,
        title: "Course Published",
        message: `Your course "${course.title}" has been published and is now live!`,
        relatedEntityType: EntityType.COURSE,
        relatedEntityId: courseId,
      }),
      sendCoursePublishedEmail(
        contributor.email,
        contributor.name,
        course.title,
        courseId
      ),
    ]);
  }

  return updatedCourse;
}

export async function publishChapterService(
  chapterId: string,
  userId: string,
  flags?: CourseFlag[]
): Promise<Chapters> {
  const chapter = await prisma.chapters.findUnique({
    where: { id: chapterId },
  });

  if (!chapter) {
    throw new AppError("Chapter not found", 404);
  }

  if (chapter.status !== CourseStatus.APPROVED) {
    throw new AppError("Only chapters in APPROVED status can be published", 400);
  }

  const updatedChapter = await prisma.chapters.update({
    where: { id: chapterId },
    data: {
      status: CourseStatus.PUBLISHED,
      flags: flags || [],
    },
  });

  // Find the contributor (createdBy) for this chapter
  const contributor = chapter.createdBy ? await prisma.user.findUnique({
    where: { id: chapter.createdBy },
  }) : null;

  await logWorkflowEventService({
    entityType: EntityType.CHAPTER,
    entityId: chapterId,
    statusFrom: CourseStatus.APPROVED,
    statusTo: CourseStatus.PUBLISHED,
    action: WorkflowAction.PUBLISHED,
    performedBy: userId,
    performedByName: contributor?.name || 'Unknown',
    metadata: {
      chapterTitle: chapter.title,
      flags: flags || [],
    },
  });

  return updatedChapter;
}

export async function publishLessonService(
  lessonId: string,
  userId: string,
  flags?: CourseFlag[]
): Promise<Lessons> {
  const lesson = await prisma.lessons.findUnique({
    where: { id: lessonId },
  });

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  if (lesson.status !== CourseStatus.APPROVED) {
    throw new AppError("Only lessons in APPROVED status can be published", 400);
  }

  const updatedLesson = await prisma.lessons.update({
    where: { id: lessonId },
    data: {
      status: CourseStatus.PUBLISHED,
      flags: flags || [],
    },
  });

  // Find the contributor (createdBy) for this lesson
  const contributor = lesson.createdBy ? await prisma.user.findUnique({
    where: { id: lesson.createdBy },
  }) : null;

  await logWorkflowEventService({
    entityType: EntityType.LESSON,
    entityId: lessonId,
    statusFrom: CourseStatus.APPROVED,
    statusTo: CourseStatus.PUBLISHED,
    action: WorkflowAction.PUBLISHED,
    performedBy: userId,
    performedByName: contributor?.name || 'Unknown',
    metadata: {
      lessonTitle: lesson.title,
      flags: flags || [],
    },
  });

  return updatedLesson;
}

export async function getSubmissionsForReviewService(
  filters: {
    status?: CourseStatus;
    entityType?: EntityType;
    page?: number;
    limit?: number;
  }
) {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {
    status: filters.status || CourseStatus.SUBMITTED,
  };

  const results: any[] = [];
  let total = 0;

  if (!filters.entityType || filters.entityType === EntityType.COURSE) {
    const [courses, courseCount] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          subCategory: true,
        },
        orderBy: { submittedAt: 'desc' },
      }),
      prisma.course.count({ where }),
    ]);

    results.push(...courses.map(c => ({
      ...c,
      entityType: EntityType.COURSE,
    })));
    total += courseCount;
  }

  if (!filters.entityType || filters.entityType === EntityType.CHAPTER) {
    const [chapters, chapterCount] = await Promise.all([
      prisma.chapters.findMany({
        where,
        skip,
        take: limit,
        include: {
          module: {
            include: {
              expertise: {
                include: {
                  skillCategory: {
                    include: {
                      course: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      }),
      prisma.chapters.count({ where }),
    ]);

    results.push(...chapters.map(c => ({
      ...c,
      entityType: EntityType.CHAPTER,
    })));
    total += chapterCount;
  }

  if (!filters.entityType || filters.entityType === EntityType.LESSON) {
    const [lessons, lessonCount] = await Promise.all([
      prisma.lessons.findMany({
        where,
        skip,
        take: limit,
        include: {
          chapter: {
            include: {
              module: {
                include: {
                  expertise: {
                    include: {
                      skillCategory: {
                        include: {
                          course: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      }),
      prisma.lessons.count({ where }),
    ]);

    results.push(...lessons.map(l => ({
      ...l,
      entityType: EntityType.LESSON,
    })));
    total += lessonCount;
  }

  return {
    submissions: results,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateCourseFlagsService(
  courseId: string,
  flags: CourseFlag[]
): Promise<Course> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const updatedCourse = await prisma.course.update({
    where: { id: courseId },
    data: {
      flags: flags,
    },
  });

  return updatedCourse;
}

export async function updateChapterFlagsService(
  chapterId: string,
  flags: CourseFlag[]
): Promise<Chapters> {
  const chapter = await prisma.chapters.findUnique({
    where: { id: chapterId },
  });

  if (!chapter) {
    throw new AppError("Chapter not found", 404);
  }

  const updatedChapter = await prisma.chapters.update({
    where: { id: chapterId },
    data: {
      flags: flags,
    },
  });

  return updatedChapter;
}

export async function updateLessonFlagsService(
  lessonId: string,
  flags: CourseFlag[]
): Promise<Lessons> {
  const lesson = await prisma.lessons.findUnique({
    where: { id: lessonId },
  });

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  const updatedLesson = await prisma.lessons.update({
    where: { id: lessonId },
    data: {
      flags: flags,
    },
  });

  return updatedLesson;
}

// Add this new service function
export async function getContributorCoursesService(
  userId: string,
  filters?: {
    status?: CourseStatus;
    page?: number;
    limit?: number;
  }
): Promise<{
  courses: Course[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const skip = (page - 1) * limit;

  const where = {
    createdBy: userId,
    isActive: true,
    ...(filters?.status && { status: filters.status }),
  };

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        category: true,
        subCategory: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.course.count({ where }),
  ]);

  return {
    courses,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// Also add for chapters and lessons
export async function getContributorChaptersService(
  userId: string,
  filters?: {
    status?: CourseStatus;
    page?: number;
    limit?: number;
  }
): Promise<{
  chapters: Chapters[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const skip = (page - 1) * limit;

  const where = {
    createdBy: userId,
    isActive: true,
    ...(filters?.status && { status: filters.status }),
  };

  const [chapters, total] = await Promise.all([
    prisma.chapters.findMany({
      where,
      include: {
        module: {
          include: {
            expertise: {
              include: {
                skillCategory: {
                  include: {
                    course: true,
                  },
                },
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.chapters.count({ where }),
  ]);

  return {
    chapters,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getContributorLessonsService(
  userId: string,
  filters?: {
    status?: CourseStatus;
    page?: number;
    limit?: number;
  }
): Promise<{
  lessons: Lessons[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const skip = (page - 1) * limit;

  const where = {
    createdBy: userId,
    isActive: true,
    ...(filters?.status && { status: filters.status }),
  };

  const [lessons, total] = await Promise.all([
    prisma.lessons.findMany({
      where,
      include: {
        chapter: {
          include: {
            module: {
              include: {
                expertise: {
                  include: {
                    skillCategory: {
                      include: {
                        course: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        Video: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.lessons.count({ where }),
  ]);

  return {
    lessons,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getContributorCourseDetailsService(
  courseId: string,
  userId: string
): Promise<
  Course & {
    category: Category;
    subCategory: SubCategory;
    totalPrice: number;
    SkillCategory: (SkillCategory & {
      Expertise: (Expertise & {
        Module: (Module & {
          Chapters: (Chapters & {
            Lessons: (Lessons & {
              Video: Video[];
            })[];
          })[];
        })[];
      })[];
    })[];
  }
> {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
      // No published filter - contributors can see their own unpublished courses
    },
    include: {
      category: true,
      subCategory: true,
      SkillCategory: {
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
        include: {
          Expertise: {
            where: { isActive: true },
            orderBy: { createdAt: 'asc' },
            include: {
              Module: {
                where: { isActive: true },
                orderBy: { createdAt: 'asc' },
                include: {
                  Chapters: {
                    where: { isActive: true },
                    orderBy: { order: 'asc' },
                    include: {
                      Lessons: {
                        where: { isActive: true },
                        orderBy: { order: 'asc' },
                        include: {
                          Video: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  // Verify ownership - only the creator can view their course details
  if (course.createdBy !== userId) {
    throw new AppError("Unauthorized - you can only view your own courses", 403);
  }

  const totalPrice = await calculateCourseTotalPrice(courseId);

  return {
    ...course,
    totalPrice
  };
}

// Get comprehensive activity timeline for a course
export async function getCourseActivityTimelineService(
  courseId: string,
  userId: string
): Promise<any[]> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      SkillCategory: {
        include: {
          Expertise: {
            include: {
              Module: {
                include: {
                  Chapters: {
                    include: {
                      Lessons: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (course.createdBy !== userId) {
    throw new AppError("Unauthorized", 403);
  }

  const activities: any[] = [];

  // 1. Course created
  activities.push({
    id: `course-created-${course.id}`,
    action: "COURSE_CREATED",
    entityType: "COURSE",
    entityId: course.id,
    entityTitle: course.title,
    createdAt: course.createdAt,
    metadata: {
      title: course.title,
      description: course.description
    }
  });

  // 2. Skill Categories added
  course.SkillCategory.forEach(sc => {
    activities.push({
      id: `skill-category-${sc.id}`,
      action: "SKILL_CATEGORY_ADDED",
      entityType: "SKILL_CATEGORY",
      entityId: sc.id,
      entityTitle: sc.name,
      createdAt: sc.createdAt,
      metadata: {
        name: sc.name,
        courseName: course.title
      }
    });

    // 3. Expertise added
    sc.Expertise.forEach(exp => {
      activities.push({
        id: `expertise-${exp.id}`,
        action: "EXPERTISE_ADDED",
        entityType: "EXPERTISE",
        entityId: exp.id,
        entityTitle: exp.name,
        createdAt: exp.createdAt,
        metadata: {
          name: exp.name,
          skillCategoryName: sc.name
        }
      });

      // 4. Modules added
      exp.Module.forEach(mod => {
        activities.push({
          id: `module-${mod.id}`,
          action: "MODULE_ADDED",
          entityType: "MODULE",
          entityId: mod.id,
          entityTitle: mod.title,
          createdAt: mod.createdAt,
          metadata: {
            title: mod.title,
            expertiseName: exp.name
          }
        });

        // 5. Chapters added
        mod.Chapters.forEach(ch => {
          activities.push({
            id: `chapter-${ch.id}`,
            action: "CHAPTER_ADDED",
            entityType: "CHAPTER",
            entityId: ch.id,
            entityTitle: ch.title,
            createdAt: ch.createdAt,
            metadata: {
              title: ch.title,
              moduleName: mod.title
            }
          });

          // 6. Lessons added
          ch.Lessons.forEach(lesson => {
            activities.push({
              id: `lesson-${lesson.id}`,
              action: "LESSON_ADDED",
              entityType: "LESSON",
              entityId: lesson.id,
              entityTitle: lesson.title,
              createdAt: lesson.createdAt,
              metadata: {
                title: lesson.title,
                chapterName: ch.title
              }
            });
          });
        });
      });
    });
  });

  // 7. Add workflow events (submissions, approvals, rejections)
  const workflowEvents = await prisma.workflowHistory.findMany({
    where: {
      entityType: EntityType.COURSE,
      entityId: courseId
    },
    orderBy: { createdAt: 'asc' }
  });

  workflowEvents.forEach(event => {
    activities.push({
      id: event.id,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      entityTitle: course.title,
      statusFrom: event.statusFrom,
      statusTo: event.statusTo,
      performedBy: event.performedBy,
      performedByName: event.performedByName,
      createdAt: event.createdAt,
      metadata: event.metadata
    });
  });

  // Sort all activities by date
  activities.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return activities;
}

// Add this new service function after getSkillCategoriesByCourseIdService

export async function getAllSkillCategoriesPublicService(): Promise<(SkillCategory & {
  course: Course & { category: Category; subCategory: SubCategory };
  expertiseCount: number;
})[]> {
  const skillCategories = await prisma.skillCategory.findMany({
    where: {
      isActive: true,
      isPublished: true,
      course: {
        published: true,
        status: CourseStatus.PUBLISHED,
        isActive: true
      }
    },
    include: {
      course: {
        include: {
          category: true,
          subCategory: true,
        },
      },
      Expertise: {
        where: { isActive: true, isPublished: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Add expertise count for each skill category
  return skillCategories.map((sc) => ({
    ...sc,
    expertiseCount: sc.Expertise.length,
  }));
}

// Also add for Expertise, Modules, Chapters, and Lessons
export async function getAllExpertisePublicService(): Promise<(Expertise & {
  skillCategory: SkillCategory & { course: Course };
  moduleCount: number;
})[]> {
  const expertise = await prisma.expertise.findMany({
    where: {
      isActive: true,
      isPublished: true,
      skillCategory: {
        isPublished: true,
        isActive: true,
        course: {
          published: true,
          status: CourseStatus.PUBLISHED,
          isActive: true
        }
      }
    },
    include: {
      skillCategory: {
        include: {
          course: true,
        },
      },
      Module: {
        where: { isActive: true, isPublished: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return expertise.map((exp) => ({
    ...exp,
    moduleCount: exp.Module.length,
  }));
}

export async function getAllModulesPublicService(): Promise<(Module & {
  expertise: Expertise & { skillCategory: SkillCategory & { course: Course } };
  chapterCount: number;
})[]> {
  const modules = await prisma.module.findMany({
    where: {
      isActive: true,
      isPublished: true,
      expertise: {
        isPublished: true,
        isActive: true,
        skillCategory: {
          isPublished: true,
          isActive: true,
          course: {
            published: true,
            status: CourseStatus.PUBLISHED,
            isActive: true
          }
        }
      }
    },
    include: {
      expertise: {
        include: {
          skillCategory: {
            include: {
              course: true,
            },
          },
        },
      },
      Chapters: {
        where: { isActive: true, status: CourseStatus.PUBLISHED },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return modules.map((mod) => ({
    ...mod,
    chapterCount: mod.Chapters.length,
  }));
}

export async function getAllChaptersPublicService(): Promise<(Chapters & {
  module: Module & {
    expertise: Expertise & { skillCategory: SkillCategory & { course: Course } };
  };
  lessonCount: number;
})[]> {
  const chapters = await prisma.chapters.findMany({
    where: {
      isActive: true,
      status: CourseStatus.PUBLISHED,
      module: {
        isPublished: true,
        isActive: true,
        expertise: {
          isPublished: true,
          isActive: true,
          skillCategory: {
            isPublished: true,
            isActive: true,
            course: {
              published: true,
              status: CourseStatus.PUBLISHED,
              isActive: true
            }
          }
        }
      }
    },
    include: {
      module: {
        include: {
          expertise: {
            include: {
              skillCategory: {
                include: {
                  course: true,
                },
              },
            },
          },
        },
      },
      Lessons: {
        where: { isActive: true, status: CourseStatus.PUBLISHED },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return chapters.map((ch) => ({
    ...ch,
    lessonCount: ch.Lessons.length,
  }));
}

export async function getAllLessonsPublicService(): Promise<(Lessons & {
  chapter: Chapters & {
    module: Module & {
      expertise: Expertise & { skillCategory: SkillCategory & { course: Course } };
    };
  };
  video: Video[]; // <-- lowercase 'video'
})[]> {
  const lessons = await prisma.lessons.findMany({
    where: {
      isActive: true,
      status: CourseStatus.PUBLISHED,
      chapter: {
        status: CourseStatus.PUBLISHED,
        isActive: true,
        module: {
          isPublished: true,
          isActive: true,
          expertise: {
            isPublished: true,
            isActive: true,
            skillCategory: {
              isPublished: true,
              isActive: true,
              course: {
                published: true,
                status: CourseStatus.PUBLISHED,
                isActive: true
              }
            }
          }
        }
      }
    },
    include: {
      chapter: {
        include: {
          module: {
            include: {
              expertise: {
                include: {
                  skillCategory: {
                    include: {
                      course: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      Video: true, // Prisma relation is 'Video'
    },
    orderBy: { createdAt: "desc" },
  });

  // Map 'Video' to 'video' for each lesson
  return lessons.map(lesson => ({
    ...lesson,
    video: lesson.Video, // Add this line
    Video: undefined,    // Optionally remove the original property
  }));
}

// Get latest free lessons (from chapters with price = 0) for the homepage
export async function getFreeLessonsPublicService(): Promise<(Lessons & {
  chapter: Chapters & {
    module: Module & {
      expertise: Expertise & { skillCategory: SkillCategory & { course: Course } };
    };
  };
  video: Video[];
})[]> {
  const lessons = await prisma.lessons.findMany({
    where: {
      isActive: true,
      status: CourseStatus.PUBLISHED,
      chapter: {
        price: 0,  // Filter for free chapters only
        isActive: true,
        status: CourseStatus.PUBLISHED,
        module: {
          isPublished: true,
          isActive: true,
          expertise: {
            isPublished: true,
            isActive: true,
            skillCategory: {
              isPublished: true,
              isActive: true,
              course: {
                published: true,
                status: CourseStatus.PUBLISHED,
                isActive: true
              }
            }
          }
        }
      }
    },
    include: {
      chapter: {
        include: {
          module: {
            include: {
              expertise: {
                include: {
                  skillCategory: {
                    include: {
                      course: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      Video: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10,  // Limit to 10 latest free lessons
  });

  // Map 'Video' to 'video' for each lesson
  return lessons.map(lesson => ({
    ...lesson,
    video: lesson.Video,
    Video: undefined,
  }));
}

async function updateCourseFlagsBasedOnVideos(courseId: string): Promise<void> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      SkillCategory: {
        include: {
          Expertise: {
            include: {
              Module: {
                include: {
                  Chapters: {
                    include: {
                      Lessons: {
                        include: {
                          Video: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!course) return;

  // Check if any lesson has a video
  let hasVideo = false;
  course.SkillCategory.forEach(skillCategory => {
    skillCategory.Expertise.forEach(expertise => {
      expertise.Module.forEach(module => {
        module.Chapters.forEach(chapter => {
          chapter.Lessons.forEach(lesson => {
            if (lesson.Video && lesson.Video.length > 0) {
              hasVideo = true;
            }
          });
        });
      });
    });
  });

  // Get current flags
  const currentFlags = course.flags || [];

  // Remove COMING_SOON if it exists
  let flags = currentFlags.filter(flag => flag !== 'COMING_SOON');

  // Add COMING_SOON if no videos exist
  // if (!hasVideo && !flags.includes('COMING_SOON')) {
  //   flags.push('COMING_SOON');
  // }

  // Update course flags
  await prisma.course.update({
    where: { id: courseId },
    data: { flags }
  });
}

// Add this function to get full nested structure without requiring published
export async function getCourseFullStructureService(courseId: string): Promise<
  Course & {
    category: Category;
    subCategory: SubCategory;
    SkillCategory: (SkillCategory & {
      Expertise: (Expertise & {
        Module: (Module & {
          Chapters: (Chapters & {
            Lessons: (Lessons & {
              Video: Video[];
            })[];
          })[];
        })[];
      })[];
    })[];
  }
> {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId
    },
    include: {
      category: true,
      subCategory: true,
      SkillCategory: {
        include: {
          Expertise: {
            include: {
              Module: {
                include: {
                  Chapters: {
                    include: {
                      Lessons: {
                        include: {
                          Video: true
                        }
                      }
                    },
                    orderBy: { order: "asc" }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  return course;
}