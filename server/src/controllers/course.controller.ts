import {
  createCourseService, createCategoryService, createSubCategoryService, getAllCategoriesService, getSubCategoriesByCategoryIdService, getAllSubCategoriesService, getAllCoursesService, updateCourseService, createBulkSkillCategoriesService, getSkillCategoriesByCourseIdService, createBulkExpertiseService, getExpertiseBySkillCategoryIdService, createBulkModulesService, getModulesByExpertiseIdService, createBulkChaptersService, getChaptersByModuleIdService, createBulkLessonsService, getLessonsByChapterIdService, getTopCoursesService, getCourseDetailsByCourseIdService, getLessonsByChapterIdWithAuthService, createUserLessonNotesService, getUserLessonNotesByLessonIdService, deleteCourseService,
  deleteCategoryService,
  deleteSubCategoryService,
  deleteSkillCategoryService,
  deleteExpertiseService,
  deleteModuleService,
  deleteChapterService,
  deleteLessonService,
  updateCategoryService,
  updateSubCategoryService,
  updateSkillCategoryService,
  updateExpertiseService,
  updateChapterService,
  updateLessonService,
  updateVideoService,
  getCategoryByIdService,
  getSubCategoryByIdService,
  getSkillCategoryByIdService,
  getExpertiseByIdService,
  getModuleByIdService,
  getChapterByIdService,
  getLessonByIdService,
  getFreeCoursesService,
  getTrialCoursesService,
  getPaidCoursesService,
  searchCoursesService,
  updateModuleService,
  reorderLessonService,
  reorderChapterService,
  submitCourseService,
  submitChapterService,
  submitLessonService,
  approveCourseService,
  approveChapterService,
  approveLessonService,
  rejectCourseService,
  rejectChapterService,
  rejectLessonService,
  publishCourseService,
  publishChapterService,
  publishLessonService,
  getSubmissionsForReviewService,
  updateCourseFlagsService,
  updateChapterFlagsService,
  updateLessonFlagsService,
  getContributorCoursesService,
  getContributorChaptersService,
  getContributorLessonsService,
  getCourseActivityTimelineService,
  getContributorCourseDetailsService,
  getAllLessonsPublicService,
  getAllChaptersPublicService,
  getAllModulesPublicService,
  getAllExpertisePublicService,
  getAllSkillCategoriesPublicService,
  reorderSkillCategoryService, // NEW
  reorderExpertiseService, // NEW
  reorderModuleService, // NEW
  getCourseFullStructureService,
  getFreeLessonsPublicService, // NEW - for free lessons on homepage
} from "@/services/course.service";
import { errorHandler } from "@/utils/error";
import { Request, Response } from "express";
import {
  CreateCourseRequest, CreateCategoryRequest, CreateSubCategoryRequest, UpdateCourseRequest, CreateBulkSkillCategoriesRequest, CreateBulkExpertiseRequest, CreateBulkModulesRequest, CreateBulkChaptersRequest, CreateBulkLessonsRequest, CreateUserLessonNotesRequest, UpdateCategoryRequest, UpdateSubCategoryRequest, UpdateSkillCategoryRequest, UpdateExpertiseRequest, UpdateChapterRequest, UpdateLessonRequest, UpdateModuleRequest, SubmitCourseRequest,
  ApproveCourseRequest,
  RejectCourseRequest,
  PublishCourseRequest,
  UpdateCourseFlagsRequest,
  GetCoursesByFlagQueryParams,
  GetSubmissionsQueryParams,
} from "@/types/zod";
import { CourseStatus } from "@prisma/client";

export async function createCategoryController(req: Request, res: Response): Promise<Response> {
  try {
    const { name, description } = CreateCategoryRequest.parse(req.body);
    const data = await createCategoryService(name, description);

    return res.status(200).json({
      success: true,
      message: "Category created successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in createCategoryController", res);
  }
}

export async function getAllCategoriesController(req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllCategoriesService();

    return res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in getAllCategoriesController", res);
  }
}

export async function getAllSubCategoriesController(req: Request, res: Response): Promise<Response> {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required"
      });
    }

    const data = await getSubCategoriesByCategoryIdService(categoryId);

    return res.status(200).json({
      success: true,
      message: "Sub-categories retrieved successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in getAllSubCategoriesController", res);
  }
}

export async function getAllSubCategoriesAllController(req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllSubCategoriesService();

    return res.status(200).json({
      success: true,
      message: "All sub-categories retrieved successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in getAllSubCategoriesAllController", res);
  }
}

export async function createSubCategoryController(req: Request, res: Response): Promise<Response> {
  try {
    const { name, description, categoryId } = CreateSubCategoryRequest.parse(req.body);
    const data = await createSubCategoryService(name, description, categoryId);

    return res.status(200).json({
      success: true,
      message: "Sub-category created successfully",
      data: data
    });
  } catch (error) {
    return errorHandler(error, "Error in createSubCategoryController", res);
  }
}

export async function createCourseController(req: Request, res: Response): Promise<Response> {
  try {
    const {
      title,
      description,
      categoryId,
      subCategoryId,
      tumbnailUrl,
      published,
    } = CreateCourseRequest.parse(req.body);

    const data = await createCourseService(
      title,
      description,
      categoryId,
      subCategoryId,
      tumbnailUrl ?? "",
      req.user?.id,
      published
    );

    return res.status(200).json({
      success: true,
      message: "Course created successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in createCourseController", res);
  }
}

export async function getCourseDetailsByCourseIdController(req: Request, res: Response): Promise<Response> {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
    }

    const data = await getCourseDetailsByCourseIdService(courseId);

    return res.status(200).json({
      success: true,
      message: "Course details retrieved successfully",
      data: data
    });
  } catch (error) {
    return errorHandler(error, "Error in getCourseDetailsByCourseIdController", res);
  }
}

export async function getCourseDetailsByCourseId(req: Request, res: Response): Promise<Response> {
  try {
    const { courseId } = req.params;
    const { id } = req.user

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
    }

    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const data = await getCourseDetailsByCourseIdService(courseId);

    return res.status(200).json({
      success: true,
      message: "Course details retrieved successfully",
      data: data
    });
  } catch (error) {
    return errorHandler(error, "Error in getCourseDetailsByCourseIdWithAuthController", res);
  }
}

export async function updateCourseController(req: Request, res: Response): Promise<Response> {
  try {
    const { courseId } = req.params;
    const validatedData = UpdateCourseRequest.parse(req.body);

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
    }

    const data = await updateCourseService(courseId, validatedData);

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in updateCourseController", res);
  }
}

export async function createBulkSkillCategoriesController(req: Request, res: Response): Promise<Response> {
  try {
    const { skillCategories } = CreateBulkSkillCategoriesRequest.parse(req.body);
    const data = await createBulkSkillCategoriesService(skillCategories, req.user?.id);

    return res.status(200).json({
      success: true,
      message: `${skillCategories.length} skill categories created successfully`,
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in createBulkSkillCategoriesController", res);
  }
}

export async function getSkillCategoriesByCourseIdController(req: Request, res: Response): Promise<Response> {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
    }

    const role = (req as any).userRole;
    const publishedOnly = role !== 'ADMIN' && role !== 'CONTRIBUTOR';
    const data = await getSkillCategoriesByCourseIdService(courseId, publishedOnly);

    return res.status(200).json({
      success: true,
      message: "Skill categories retrieved successfully",
      data: data
    });
  } catch (error) {
    return errorHandler(error, "Error in getSkillCategoriesByCourseIdController", res);
  }
}

export async function createBulkExpertiseController(req: Request, res: Response): Promise<Response> {
  try {
    const { expertise } = CreateBulkExpertiseRequest.parse(req.body);
    const data = await createBulkExpertiseService(expertise, req.user?.id);

    return res.status(200).json({
      success: true,
      message: `${expertise.length} expertise created successfully`,
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in createBulkExpertiseController", res);
  }
}

export async function getExpertiseBySkillCategoryIdController(req: Request, res: Response): Promise<Response> {
  try {
    const { skillCategoryId } = req.params;

    if (!skillCategoryId) {
      return res.status(400).json({
        success: false,
        message: "Skill Category ID is required"
      });
    }

    const role = (req as any).userRole;
    const publishedOnly = role !== 'ADMIN' && role !== 'CONTRIBUTOR';
    const data = await getExpertiseBySkillCategoryIdService(skillCategoryId, publishedOnly);

    return res.status(200).json({
      success: true,
      message: "Expertise retrieved successfully",
      data: data
    });
  } catch (error) {
    return errorHandler(error, "Error in getExpertiseBySkillCategoryIdController", res);
  }
}

export async function createBulkModulesController(req: Request, res: Response): Promise<Response> {
  try {
    const { modules } = CreateBulkModulesRequest.parse(req.body);
    const data = await createBulkModulesService(modules, req.user?.id);

    return res.status(200).json({
      success: true,
      message: `${modules.length} modules created successfully`,
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in createBulkModulesController", res);
  }
}

export async function getModulesByExpertiseIdController(req: Request, res: Response): Promise<Response> {
  try {
    const { expertiseId } = req.params;

    if (!expertiseId) {
      return res.status(400).json({
        success: false,
        message: "Expertise ID is required"
      });
    }

    const role = (req as any).userRole;
    const publishedOnly = role !== 'ADMIN' && role !== 'CONTRIBUTOR';
    const data = await getModulesByExpertiseIdService(expertiseId, publishedOnly);

    return res.status(200).json({
      success: true,
      message: "Modules retrieved successfully",
      data: data
    });
  } catch (error) {
    return errorHandler(error, "Error in getModulesByExpertiseIdController", res);
  }
}

export async function createBulkChaptersController(req: Request, res: Response): Promise<Response> {
  try {
    const { chapters } = CreateBulkChaptersRequest.parse(req.body);
    const data = await createBulkChaptersService(chapters, req.user?.id);

    return res.status(200).json({
      success: true,
      message: `${chapters.length} chapters created successfully`,
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in createBulkChaptersController", res);
  }
}

export async function getChaptersByModuleIdController(req: Request, res: Response): Promise<Response> {
  try {
    const { moduleId } = req.params;

    if (!moduleId) {
      return res.status(400).json({
        success: false,
        message: "Module ID is required"
      });
    }

    const role = (req as any).userRole;
    const publishedOnly = role !== 'ADMIN' && role !== 'CONTRIBUTOR';
    const data = await getChaptersByModuleIdService(moduleId, publishedOnly);

    return res.status(200).json({
      success: true,
      message: "Chapters retrieved successfully",
      data: data
    });
  } catch (error) {
    return errorHandler(error, "Error in getChaptersByModuleIdController", res);
  }
}

export async function createBulkLessonsController(req: Request, res: Response): Promise<Response> {
  try {
    const { lessons } = CreateBulkLessonsRequest.parse(req.body);
    const data = await createBulkLessonsService(lessons, req.user?.id);

    return res.status(200).json({
      success: true,
      message: `${lessons.length} lessons created successfully`,
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in createBulkLessonsController", res);
  }
}

export async function getLessonsByChapterIdController(req: Request, res: Response): Promise<Response> {
  try {
    const { chapterId } = req.params;

    if (!chapterId) {
      return res.status(400).json({
        success: false,
        message: "Chapter ID is required"
      });
    }

    const role = (req as any).userRole;
    const publishedOnly = role !== 'ADMIN' && role !== 'CONTRIBUTOR';
    const data = await getLessonsByChapterIdService(chapterId, publishedOnly);

    return res.status(200).json({
      success: true,
      message: "Lessons retrieved successfully",
      data: data
    });
  } catch (error) {
    return errorHandler(error, "Error in getLessonsByChapterIdController", res);
  }
}

export async function getTopCoursesController(req: Request, res: Response): Promise<Response> {
  try {
    const data = await getTopCoursesService();
    return res.status(200).json({
      success: true,
      message: "Top courses retrieved successfully",
      data: data
    });
  } catch (error) {
    return errorHandler(error, "Error in getTopCoursesController", res);
  }
}

export async function getLessonsbyChapterIdWithAuthController(req: Request, res: Response): Promise<Response> {
  try {
    const { chapterId } = req.params;
    const { id } = req.user

    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!chapterId) {
      return res.status(400).json({
        success: false,
        message: "Chapter ID is required"
      });
    }

    const data = await getLessonsByChapterIdWithAuthService(chapterId, id);

    return res.status(200).json({
      success: true,
      message: "Lessons retrieved successfully",
      data: data
    });
  } catch (error) {
    return errorHandler(error, "Error in getLessonsbyChapterIdWithAuthController", res);
  }
}

export async function createUserLessonNotesController(req: Request, res: Response): Promise<Response> {
  try {
    const { content, lessonId } = CreateUserLessonNotesRequest.parse(req.body);
    const { id } = req.user;

    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const data = await createUserLessonNotesService(content, lessonId, id);

    return res.status(201).json({
      success: true,
      message: "User lesson note created successfully",
      data: data
    });
  } catch (error) {
    return errorHandler(error, "Error in createUserLessonNotesController", res);
  }
}

export async function getUserLessonNotesByLessonIdController(req: Request, res: Response): Promise<Response> {
  try {
    const { lessonId } = req.params;
    const { id } = req.user;

    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: "Lesson ID is required"
      });
    }

    const data = await getUserLessonNotesByLessonIdService(lessonId, id);

    return res.status(200).json({
      success: true,
      message: "User lesson notes retrieved successfully",
      data: data
    });
  } catch (error) {
    return errorHandler(error, "Error in getUserLessonNotesByLessonIdController", res);
  }
}

export async function deleteCourseController(req: Request, res: Response): Promise<Response> {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
    }

    await deleteCourseService(courseId);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully"
    });
  } catch (err) {
    return errorHandler(err, "Error in deleteCourseController", res);
  }
}

export async function deleteCategoryController(req: Request, res: Response): Promise<Response> {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required"
      });
    }

    await deleteCategoryService(categoryId);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (err) {
    return errorHandler(err, "Error in deleteCategoryController", res);
  }
}

export async function deleteSubCategoryController(req: Request, res: Response): Promise<Response> {
  try {
    const { subCategoryId } = req.params;

    if (!subCategoryId) {
      return res.status(400).json({
        success: false,
        message: "Sub-category ID is required"
      });
    }

    await deleteSubCategoryService(subCategoryId);

    return res.status(200).json({
      success: true,
      message: "Sub-category deleted successfully"
    });
  } catch (err) {
    return errorHandler(err, "Error in deleteSubCategoryController", res);
  }
}

export async function deleteSkillCategoryController(req: Request, res: Response): Promise<Response> {
  try {
    const { skillCategoryId } = req.params;

    if (!skillCategoryId) {
      return res.status(400).json({
        success: false,
        message: "Skill Category ID is required"
      });
    }

    await deleteSkillCategoryService(skillCategoryId);

    return res.status(200).json({
      success: true,
      message: "Skill category deleted successfully"
    });
  } catch (err) {
    return errorHandler(err, "Error in deleteSkillCategoryController", res);
  }
}

export async function deleteExpertiseController(req: Request, res: Response): Promise<Response> {
  try {
    const { expertiseId } = req.params;

    if (!expertiseId) {
      return res.status(400).json({
        success: false,
        message: "Expertise ID is required"
      });
    }

    await deleteExpertiseService(expertiseId);

    return res.status(200).json({
      success: true,
      message: "Expertise deleted successfully"
    });
  } catch (err) {
    return errorHandler(err, "Error in deleteExpertiseController", res);
  }
}

export async function deleteModuleController(req: Request, res: Response): Promise<Response> {
  try {
    const { moduleId } = req.params;

    if (!moduleId) {
      return res.status(400).json({
        success: false,
        message: "Module ID is required"
      });
    }

    await deleteModuleService(moduleId);

    return res.status(200).json({
      success: true,
      message: "Module deleted successfully"
    });
  } catch (err) {
    return errorHandler(err, "Error in deleteModuleController", res);
  }
}

export async function deleteChapterController(req: Request, res: Response): Promise<Response> {
  try {
    const { chapterId } = req.params;

    if (!chapterId) {
      return res.status(400).json({
        success: false,
        message: "Chapter ID is required"
      });
    }

    await deleteChapterService(chapterId);

    return res.status(200).json({
      success: true,
      message: "Chapter deleted successfully"
    });
  } catch (err) {
    return errorHandler(err, "Error in deleteChapterController", res);
  }
}

export async function deleteLessonController(req: Request, res: Response): Promise<Response> {
  try {
    const { lessonId } = req.params;

    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: "Lesson ID is required"
      });
    }

    await deleteLessonService(lessonId);

    return res.status(200).json({
      success: true,
      message: "Lesson deleted successfully"
    });
  } catch (err) {
    return errorHandler(err, "Error in deleteLessonController", res);
  }
}

export async function updateCategoryController(req: Request, res: Response): Promise<Response> {
  try {
    const { categoryId } = req.params;
    const validatedData = UpdateCategoryRequest.parse(req.body);

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required"
      });
    }

    const data = await updateCategoryService(categoryId, validatedData);

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in updateCategoryController", res);
  }
}

export async function updateSubCategoryController(req: Request, res: Response): Promise<Response> {
  try {
    const { subCategoryId } = req.params;
    const validatedData = UpdateSubCategoryRequest.parse(req.body);

    if (!subCategoryId) {
      return res.status(400).json({
        success: false,
        message: "Sub-category ID is required"
      });
    }

    const data = await updateSubCategoryService(subCategoryId, validatedData);

    return res.status(200).json({
      success: true,
      message: "Sub-category updated successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in updateSubCategoryController", res);
  }
}

export async function updateSkillCategoryController(req: Request, res: Response): Promise<Response> {
  try {
    const { skillCategoryId } = req.params;
    const validatedData = UpdateSkillCategoryRequest.parse(req.body);

    if (!skillCategoryId) {
      return res.status(400).json({
        success: false,
        message: "Skill Category ID is required"
      });
    }

    const data = await updateSkillCategoryService(skillCategoryId, validatedData);

    return res.status(200).json({
      success: true,
      message: "Skill category updated successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in updateSkillCategoryController", res);
  }
}

export async function updateExpertiseController(req: Request, res: Response): Promise<Response> {
  try {
    const { expertiseId } = req.params;
    const validatedData = UpdateExpertiseRequest.parse(req.body);

    if (!expertiseId) {
      return res.status(400).json({
        success: false,
        message: "Expertise ID is required"
      });
    }

    const data = await updateExpertiseService(expertiseId, validatedData);

    return res.status(200).json({
      success: true,
      message: "Expertise updated successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in updateExpertiseController", res);
  }
}

export async function updateChapterController(req: Request, res: Response): Promise<Response> {
  try {
    const { chapterId } = req.params;
    const validatedData = UpdateChapterRequest.parse(req.body);

    if (!chapterId) {
      return res.status(400).json({
        success: false,
        message: "Chapter ID is required"
      });
    }

    const data = await updateChapterService(chapterId, validatedData);

    return res.status(200).json({
      success: true,
      message: "Chapter updated successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in updateChapterController", res);
  }
}

export async function updateLessonController(req: Request, res: Response): Promise<Response> {
  try {
    const { lessonId } = req.params;
    const validatedData = UpdateLessonRequest.parse(req.body);

    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: "Lesson ID is required"
      });
    }

    const data = await updateLessonService(lessonId, validatedData);

    return res.status(200).json({
      success: true,
      message: "Lesson updated successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in updateLessonController", res);
  }
}

// Get single item controllers for editing
export async function getCategoryByIdController(req: Request, res: Response): Promise<Response> {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required"
      });
    }

    const data = await getCategoryByIdService(categoryId);

    return res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in getCategoryByIdController", res);
  }
}

export async function getSubCategoryByIdController(req: Request, res: Response): Promise<Response> {
  try {
    const { subCategoryId } = req.params;

    if (!subCategoryId) {
      return res.status(400).json({
        success: false,
        message: "Sub-category ID is required"
      });
    }

    const data = await getSubCategoryByIdService(subCategoryId);

    return res.status(200).json({
      success: true,
      message: "Sub-category retrieved successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in getSubCategoryByIdController", res);
  }
}

export async function getSkillCategoryByIdController(req: Request, res: Response): Promise<Response> {
  try {
    const { skillCategoryId } = req.params;

    if (!skillCategoryId) {
      return res.status(400).json({
        success: false,
        message: "Skill Category ID is required"
      });
    }

    const data = await getSkillCategoryByIdService(skillCategoryId);

    return res.status(200).json({
      success: true,
      message: "Skill category retrieved successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in getSkillCategoryByIdController", res);
  }
}

export async function getExpertiseByIdController(req: Request, res: Response): Promise<Response> {
  try {
    const { expertiseId } = req.params;

    if (!expertiseId) {
      return res.status(400).json({
        success: false,
        message: "Expertise ID is required"
      });
    }

    const data = await getExpertiseByIdService(expertiseId);

    return res.status(200).json({
      success: true,
      message: "Expertise retrieved successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in getExpertiseByIdController", res);
  }
}

export async function getModuleByIdController(req: Request, res: Response): Promise<Response> {
  try {
    const { moduleId } = req.params;

    if (!moduleId) {
      return res.status(400).json({
        success: false,
        message: "Module ID is required"
      });
    }

    const data = await getModuleByIdService(moduleId);

    return res.status(200).json({
      success: true,
      message: "Module retrieved successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in getModuleByIdController", res);
  }
}

export async function getChapterByIdController(req: Request, res: Response): Promise<Response> {
  try {
    const { chapterId } = req.params;

    if (!chapterId) {
      return res.status(400).json({
        success: false,
        message: "Chapter ID is required"
      });
    }

    const data = await getChapterByIdService(chapterId);

    return res.status(200).json({
      success: true,
      message: "Chapter retrieved successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in getChapterByIdController", res);
  }
}

export async function getLessonByIdController(req: Request, res: Response): Promise<Response> {
  try {
    const { lessonId } = req.params;

    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: "Lesson ID is required"
      });
    }

    const data = await getLessonByIdService(lessonId);

    return res.status(200).json({
      success: true,
      message: "Lesson retrieved successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in getLessonByIdController", res);
  }
}

export async function getFreeCoursesController(req: Request, res: Response): Promise<Response> {
  try {
    const data = await getFreeCoursesService();
    return res.status(200).json({
      success: true,
      message: "Free courses retrieved successfully",
      data: data
    });
  } catch (error) {
    return errorHandler(error, "Error in getFreeCoursesController", res);
  }
}

export async function getTrialCoursesController(req: Request, res: Response): Promise<Response> {
  try {
    const data = await getTrialCoursesService();
    return res.status(200).json({
      success: true,
      message: "Trial courses retrieved successfully",
      data: data
    });
  } catch (error) {
    return errorHandler(error, "Error in getTrialCoursesController", res);
  }
}

export async function getPaidCoursesController(req: Request, res: Response): Promise<Response> {
  try {
    const data = await getPaidCoursesService();
    return res.status(200).json({
      success: true,
      message: "Paid courses retrieved successfully",
      data: data
    });
  } catch (error) {
    return errorHandler(error, "Error in getPaidCoursesController", res);
  }
}

export async function searchCoursesController(req: Request, res: Response): Promise<Response> {
  try {
    const { query, category, sortBy, page = 1, limit = 10 } = req.query;

    // Validate query parameter
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required and must be a non-empty string"
      });
    }

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 10));

    // Sanitize search query
    const sanitizedQuery = query.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "");

    if (sanitizedQuery.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query contains no valid characters"
      });
    }

    // Validate sortBy parameter
    const validSortOptions = ["relevance", "newest", "mostPopular"];
    const finalSortBy = (sortBy && validSortOptions.includes(sortBy as string))
      ? sortBy as string
      : "relevance";

    // Build filter object
    const filters: any = {
      searchTerm: sanitizedQuery,
      category: category && typeof category === "string" ? category.trim() : undefined,
      sortBy: finalSortBy
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

    const data = await searchCoursesService(filters, pageNum, limitNum);

    return res.status(200).json({
      success: true,
      message: `Found ${data.total} course(s) matching your search`,
      data: {
        courses: data.courses,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(data.total / limitNum),
          totalResults: data.total,
          resultsPerPage: limitNum
        }
      }
    });
  } catch (error) {
    return errorHandler(error, "Error in searchCoursesController", res);
  }
}

export async function updateModuleController(req: Request, res: Response): Promise<Response> {
  try {
    const { moduleId } = req.params;
    const validatedData = UpdateModuleRequest.parse(req.body);

    if (!moduleId) {
      return res.status(400).json({
        success: false,
        message: "Module ID is required"
      });
    }

    const data = await updateModuleService(moduleId, validatedData);

    return res.status(200).json({
      success: true,
      message: "Module updated successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in updateModuleController", res);
  }
}

export async function reorderChapterController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { chapterId } = req.params;
    const { direction } = req.body; // "up" or "down"

    if (!direction || !["up", "down"].includes(direction)) {
      res.status(400).json({
        success: false,
        message: "Invalid direction. Must be 'up' or 'down'",
      });
      return;
    }

    const chapter = await reorderChapterService(chapterId, direction);

    res.status(200).json({
      success: true,
      message: "Chapter reordered successfully",
      data: chapter,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to reorder chapter",
      logs: [],
    });
  }
}

export async function reorderLessonController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { lessonId } = req.params;
    const { direction } = req.body; // "up" or "down"

    if (!direction || !["up", "down"].includes(direction)) {
      res.status(400).json({
        success: false,
        message: "Invalid direction. Must be 'up' or 'down'",
      });
      return;
    }

    const lesson = await reorderLessonService(lessonId, direction);

    res.status(200).json({
      success: true,
      message: "Lesson reordered successfully",
      data: lesson,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to reorder lesson",
      logs: [],
    });
  }
}

export async function submitCourseController(req: Request, res: Response): Promise<Response> {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
    }

    const data = await submitCourseService(courseId, userId);

    return res.status(200).json({
      success: true,
      message: "Course submitted for review successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in submitCourseController", res);
  }
}

export async function submitChapterController(req: Request, res: Response): Promise<Response> {
  try {
    const { chapterId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!chapterId) {
      return res.status(400).json({
        success: false,
        message: "Chapter ID is required"
      });
    }

    const data = await submitChapterService(chapterId, userId);

    return res.status(200).json({
      success: true,
      message: "Chapter submitted for review successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in submitChapterController", res);
  }
}

export async function submitLessonController(req: Request, res: Response): Promise<Response> {
  try {
    const { lessonId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: "Lesson ID is required"
      });
    }

    const data = await submitLessonService(lessonId, userId);

    return res.status(200).json({
      success: true,
      message: "Lesson submitted for review successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in submitLessonController", res);
  }
}

export async function approveCourseController(req: Request, res: Response): Promise<Response> {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
    }

    const data = await approveCourseService(courseId, userId);

    return res.status(200).json({
      success: true,
      message: "Course approved successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in approveCourseController", res);
  }
}

export async function approveChapterController(req: Request, res: Response): Promise<Response> {
  try {
    const { chapterId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!chapterId) {
      return res.status(400).json({
        success: false,
        message: "Chapter ID is required"
      });
    }

    const data = await approveChapterService(chapterId, userId);

    return res.status(200).json({
      success: true,
      message: "Chapter approved successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in approveChapterController", res);
  }
}

export async function approveLessonController(req: Request, res: Response): Promise<Response> {
  try {
    const { lessonId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: "Lesson ID is required"
      });
    }

    const data = await approveLessonService(lessonId, userId);

    return res.status(200).json({
      success: true,
      message: "Lesson approved successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in approveLessonController", res);
  }
}

export async function rejectCourseController(req: Request, res: Response): Promise<Response> {
  try {
    const { courseId } = req.params;
    const { rejectionReason } = RejectCourseRequest.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
    }

    const data = await rejectCourseService(courseId, userId, rejectionReason);

    return res.status(200).json({
      success: true,
      message: "Course rejected successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in rejectCourseController", res);
  }
}

export async function rejectChapterController(req: Request, res: Response): Promise<Response> {
  try {
    const { chapterId } = req.params;
    const { rejectionReason } = RejectCourseRequest.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!chapterId) {
      return res.status(400).json({
        success: false,
        message: "Chapter ID is required"
      });
    }

    const data = await rejectChapterService(chapterId, userId, rejectionReason);

    return res.status(200).json({
      success: true,
      message: "Chapter rejected successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in rejectChapterController", res);
  }
}

export async function rejectLessonController(req: Request, res: Response): Promise<Response> {
  try {
    const { lessonId } = req.params;
    const { rejectionReason } = RejectCourseRequest.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: "Lesson ID is required"
      });
    }

    const data = await rejectLessonService(lessonId, userId, rejectionReason);

    return res.status(200).json({
      success: true,
      message: "Lesson rejected successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in rejectLessonController", res);
  }
}

export async function publishCourseController(req: Request, res: Response): Promise<Response> {
  try {
    const { courseId } = req.params;
    const validatedData = PublishCourseRequest.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
    }

    const data = await publishCourseService(courseId, userId, validatedData.flags);

    return res.status(200).json({
      success: true,
      message: "Course published successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in publishCourseController", res);
  }
}

export async function publishChapterController(req: Request, res: Response): Promise<Response> {
  try {
    const { chapterId } = req.params;
    const validatedData = PublishCourseRequest.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!chapterId) {
      return res.status(400).json({
        success: false,
        message: "Chapter ID is required"
      });
    }

    const data = await publishChapterService(chapterId, userId, validatedData.flags);

    return res.status(200).json({
      success: true,
      message: "Chapter published successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in publishChapterController", res);
  }
}

export async function publishLessonController(req: Request, res: Response): Promise<Response> {
  try {
    const { lessonId } = req.params;
    const validatedData = PublishCourseRequest.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: "Lesson ID is required"
      });
    }

    const data = await publishLessonService(lessonId, userId, validatedData.flags);

    return res.status(200).json({
      success: true,
      message: "Lesson published successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in publishLessonController", res);
  }
}

export async function getSubmissionsForReviewController(req: Request, res: Response): Promise<Response> {
  try {
    const queryParams = GetSubmissionsQueryParams.parse(req.query);

    const data = await getSubmissionsForReviewService({
      status: queryParams.status,
      entityType: queryParams.entityType,
      page: queryParams.page,
      limit: queryParams.limit,
    });

    return res.status(200).json({
      success: true,
      message: "Submissions retrieved successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in getSubmissionsForReviewController", res);
  }
}

export async function updateCourseFlagsController(req: Request, res: Response): Promise<Response> {
  try {
    const { courseId } = req.params;
    const validatedData = UpdateCourseFlagsRequest.parse(req.body);

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
    }

    const data = await updateCourseFlagsService(courseId, validatedData.flags);

    return res.status(200).json({
      success: true,
      message: "Course flags updated successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in updateCourseFlagsController", res);
  }
}

export async function updateChapterFlagsController(req: Request, res: Response): Promise<Response> {
  try {
    const { chapterId } = req.params;
    const validatedData = UpdateCourseFlagsRequest.parse(req.body);

    if (!chapterId) {
      return res.status(400).json({
        success: false,
        message: "Chapter ID is required"
      });
    }

    const data = await updateChapterFlagsService(chapterId, validatedData.flags);

    return res.status(200).json({
      success: true,
      message: "Chapter flags updated successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in updateChapterFlagsController", res);
  }
}

export async function updateLessonFlagsController(req: Request, res: Response): Promise<Response> {
  try {
    const { lessonId } = req.params;
    const validatedData = UpdateCourseFlagsRequest.parse(req.body);

    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: "Lesson ID is required"
      });
    }

    const data = await updateLessonFlagsService(lessonId, validatedData.flags);

    return res.status(200).json({
      success: true,
      message: "Lesson flags updated successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in updateLessonFlagsController", res);
  }
}

// Update getAllCoursesController to support flag filtering
export async function getAllCoursesController(req: Request, res: Response): Promise<Response> {
  try {
    const queryParams = GetCoursesByFlagQueryParams.parse(req.query);

    const role = (req as any).userRole;
    const publishedOnly = role !== 'ADMIN' && role !== 'CONTRIBUTOR';

    const data = await getAllCoursesService({
      flag: queryParams.flag,
      page: queryParams.page,
      limit: queryParams.limit,
      categoryId: queryParams.categoryId,
      subCategoryId: queryParams.subCategoryId,
      publishedOnly,
    });

    return res.status(200).json({
      success: true,
      message: "Courses retrieved successfully",
      data: data.courses,
      pagination: {
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
      }
    });
  } catch (err) {
    return errorHandler(err, "Error in getAllCoursesController", res);
  }
}

export async function getContributorCoursesController(req: Request, res: Response): Promise<Response> {
  try {
    const userId = req.user?.id;
    const { status, page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const data = await getContributorCoursesService(userId, {
      status: status as CourseStatus,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
    });

    return res.status(200).json({
      success: true,
      message: "Contributor courses retrieved successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in getContributorCoursesController", res);
  }
}

export async function getContributorChaptersController(req: Request, res: Response): Promise<Response> {
  try {
    const userId = req.user?.id;
    const { status, page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const data = await getContributorChaptersService(userId, {
      status: status as CourseStatus,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
    });

    return res.status(200).json({
      success: true,
      message: "Contributor chapters retrieved successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in getContributorChaptersController", res);
  }
}

export async function getContributorLessonsController(req: Request, res: Response): Promise<Response> {
  try {
    const userId = req.user?.id;
    const { status, page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const data = await getContributorLessonsService(userId, {
      status: status as CourseStatus,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
    });

    return res.status(200).json({
      success: true,
      message: "Contributor lessons retrieved successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in getContributorLessonsController", res);
  }
}

export async function getContributorCourseDetailsController(req: Request, res: Response): Promise<Response> {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
    }

    const data = await getContributorCourseDetailsService(courseId, userId);

    return res.status(200).json({
      success: true,
      message: "Course details retrieved successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in getContributorCourseDetailsController", res);
  }
}

export async function getCourseActivityTimelineController(req: Request, res: Response): Promise<Response> {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
    }

    const data = await getCourseActivityTimelineService(courseId, userId);

    return res.status(200).json({
      success: true,
      message: "Course activity timeline retrieved successfully",
      data: data
    });
  } catch (err) {
    return errorHandler(err, "Error in getCourseActivityTimelineController", res);
  }
}

export async function getAllSkillCategoriesPublicController(req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllSkillCategoriesPublicService();

    return res.status(200).json({
      success: true,
      message: "All skill categories retrieved successfully",
      data: data,
    });
  } catch (err) {
    return errorHandler(err, "Error in getAllSkillCategoriesPublicController", res);
  }
}

export async function getAllExpertisePublicController(req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllExpertisePublicService();

    return res.status(200).json({
      success: true,
      message: "All expertise retrieved successfully",
      data: data,
    });
  } catch (err) {
    return errorHandler(err, "Error in getAllExpertisePublicController", res);
  }
}

export async function getAllModulesPublicController(req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllModulesPublicService();

    return res.status(200).json({
      success: true,
      message: "All modules retrieved successfully",
      data: data,
    });
  } catch (err) {
    return errorHandler(err, "Error in getAllModulesPublicController", res);
  }
}

export async function getAllChaptersPublicController(req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllChaptersPublicService();

    return res.status(200).json({
      success: true,
      message: "All chapters retrieved successfully",
      data: data,
    });
  } catch (err) {
    return errorHandler(err, "Error in getAllChaptersPublicController", res);
  }
}

export async function getAllLessonsPublicController(req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllLessonsPublicService();

    return res.status(200).json({
      success: true,
      message: "All lessons retrieved successfully",
      data: data,
    });
  } catch (err) {
    return errorHandler(err, "Error in getAllLessonsPublicController", res);
  }
}

export async function getFreeLessonsPublicController(req: Request, res: Response): Promise<Response> {
  try {
    const data = await getFreeLessonsPublicService();

    return res.status(200).json({
      success: true,
      message: "Free lessons retrieved successfully",
      data: data,
    });
  } catch (err) {
    return errorHandler(err, "Error in getFreeLessonsPublicController", res);
  }
}

export async function getCourseFullStructureController(req: Request, res: Response): Promise<Response> {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required"
      });
    }

    const data = await getCourseFullStructureService(courseId);

    return res.status(200).json({
      success: true,
      message: "Course structure retrieved successfully",
      data: data
    });
  } catch (error) {
    return errorHandler(error, "Error in getCourseFullStructureController", res);
  }
}

export async function reorderSkillCategoryController(req: Request, res: Response): Promise<Response> {
  try {
    const { skillCategoryId } = req.params;
    const { direction } = req.body;

    if (!skillCategoryId) {
      return res.status(400).json({
        success: false,
        message: "Skill Category ID is required"
      });
    }

    if (!direction || (direction !== "up" && direction !== "down")) {
      return res.status(400).json({
        success: false,
        message: "Direction must be 'up' or 'down'"
      });
    }

    await reorderSkillCategoryService(skillCategoryId, direction);

    return res.status(200).json({
      success: true,
      message: "Skill category reordered successfully"
    });
  } catch (err) {
    return errorHandler(err, "Error in reorderSkillCategoryController", res);
  }
}

export async function reorderExpertiseController(req: Request, res: Response): Promise<Response> {
  try {
    const { expertiseId } = req.params;
    const { direction } = req.body;

    if (!expertiseId) {
      return res.status(400).json({
        success: false,
        message: "Expertise ID is required"
      });
    }

    if (!direction || (direction !== "up" && direction !== "down")) {
      return res.status(400).json({
        success: false,
        message: "Direction must be 'up' or 'down'"
      });
    }

    await reorderExpertiseService(expertiseId, direction);

    return res.status(200).json({
      success: true,
      message: "Expertise reordered successfully"
    });
  } catch (err) {
    return errorHandler(err, "Error in reorderExpertiseController", res);
  }
}

export async function reorderModuleController(req: Request, res: Response): Promise<Response> {
  try {
    const { moduleId } = req.params;
    const { direction } = req.body;

    if (!moduleId) {
      return res.status(400).json({
        success: false,
        message: "Module ID is required"
      });
    }

    if (!direction || (direction !== "up" && direction !== "down")) {
      return res.status(400).json({
        success: false,
        message: "Direction must be 'up' or 'down'"
      });
    }

    await reorderModuleService(moduleId, direction);

    return res.status(200).json({
      success: true,
      message: "Module reordered successfully"
    });
  } catch (err) {
    return errorHandler(err, "Error in reorderModuleController", res);
  }
}

// End of file