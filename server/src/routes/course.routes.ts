import {
    createCourseController, createCategoryController, createSubCategoryController, getAllCategoriesController, getAllSubCategoriesController, getAllSubCategoriesAllController, getAllCoursesController, updateCourseController, createBulkSkillCategoriesController, getSkillCategoriesByCourseIdController, createBulkExpertiseController, getExpertiseBySkillCategoryIdController, createBulkModulesController, getModulesByExpertiseIdController, createBulkChaptersController, getChaptersByModuleIdController, createBulkLessonsController, getLessonsByChapterIdController, getTopCoursesController, getCourseDetailsByCourseId, getLessonsbyChapterIdWithAuthController, createUserLessonNotesController, getUserLessonNotesByLessonIdController, updateCategoryController, updateSubCategoryController, updateSkillCategoryController, updateExpertiseController, updateChapterController, updateLessonController, deleteCourseController, deleteCategoryController, deleteSubCategoryController, deleteSkillCategoryController, deleteExpertiseController, deleteModuleController, deleteChapterController, deleteLessonController, getCategoryByIdController, getSubCategoryByIdController, getSkillCategoryByIdController, getExpertiseByIdController, getModuleByIdController, getChapterByIdController, getLessonByIdController, getPaidCoursesController, getTrialCoursesController, getFreeCoursesController, searchCoursesController, getCourseDetailsByCourseIdController, updateModuleController, reorderChapterController, reorderLessonController, submitCourseController, reorderSkillCategoryController, reorderExpertiseController, reorderModuleController,
    submitChapterController,
    submitLessonController,
    approveCourseController,
    approveChapterController,
    approveLessonController,
    rejectCourseController,
    rejectChapterController,
    rejectLessonController,
    publishCourseController,
    publishChapterController,
    publishLessonController,
    getSubmissionsForReviewController, updateCourseFlagsController,
    updateChapterFlagsController,
    updateLessonFlagsController,
    getContributorCoursesController,
    getContributorChaptersController,
    getContributorLessonsController,
    getCourseActivityTimelineController,
    getContributorCourseDetailsController,
    getAllSkillCategoriesPublicController,
    getAllExpertisePublicController,
    getAllModulesPublicController,
    getAllChaptersPublicController,
    getAllLessonsPublicController,
    getFreeLessonsPublicController,
    getCourseFullStructureController,
} from "@/controllers/course.controller";
import { verifyUser, optionalAuth } from "@/middlewares/auth.middleware";
import validateInput from "@/middlewares/inputValidation.middleware";
import {
    RejectCourseRequest, UpdateCourseFlagsRequest,
    PublishCourseRequest, CreateCourseRequest, CreateCategoryRequest, CreateSubCategoryRequest, UpdateCourseRequest, CreateBulkSkillCategoriesRequest, CreateBulkExpertiseRequest, CreateBulkModulesRequest, CreateBulkChaptersRequest, CreateBulkLessonsRequest, CreateUserLessonNotesRequest, UpdateCategoryRequest, UpdateSubCategoryRequest, UpdateSkillCategoryRequest, UpdateExpertiseRequest, UpdateChapterRequest, UpdateLessonRequest, UpdateModuleRequest, ReorderLessonRequest, ReorderChapterRequest
} from "@/types/zod";
import { Router } from "express";

const router = Router();

// Category routes
router.post("/create/category", verifyUser('ADMIN'), validateInput(CreateCategoryRequest), createCategoryController);
router.get("/categories", getAllCategoriesController);

// Sub-category routes
router.post("/create/subcategory", verifyUser('ADMIN'), validateInput(CreateSubCategoryRequest), createSubCategoryController);
router.get("/subcategories/:categoryId", getAllSubCategoriesController);
router.get("/subcategories-all", getAllSubCategoriesAllController);

// Course routes - Allow CONTRIBUTOR to create and update
router.post("/create/course", verifyUser('ADMIN', 'CONTRIBUTOR'), validateInput(CreateCourseRequest), createCourseController);
router.get("/courses", optionalAuth, getAllCoursesController);
router.put("/course/:courseId", verifyUser('ADMIN', 'CONTRIBUTOR'), validateInput(UpdateCourseRequest), updateCourseController);
router.get("/top-courses", getTopCoursesController);
router.get("/public/course/:courseId", getCourseDetailsByCourseIdController);
router.get("/course/:courseId", verifyUser('STUDENT', 'CONTRIBUTOR'), getCourseDetailsByCourseId);
router.get("/courses/free", getFreeCoursesController);
router.get("/courses/trial", getTrialCoursesController);
router.get("/courses/paid", getPaidCoursesController);

router.get("/search", searchCoursesController);


// Skill Category routes - Allow CONTRIBUTOR
router.post("/create/skillcategories/bulk", verifyUser('ADMIN', 'CONTRIBUTOR'), validateInput(CreateBulkSkillCategoriesRequest), createBulkSkillCategoriesController);
router.get("/skillcategories/:courseId", optionalAuth, getSkillCategoriesByCourseIdController);

// Expertise routes - Allow CONTRIBUTOR
router.post("/create/expertise/bulk", verifyUser('ADMIN', 'CONTRIBUTOR'), validateInput(CreateBulkExpertiseRequest), createBulkExpertiseController);
router.get("/expertise/:skillCategoryId", optionalAuth, getExpertiseBySkillCategoryIdController);

// Module routes - Allow CONTRIBUTOR
router.post("/create/modules/bulk", verifyUser('ADMIN', 'CONTRIBUTOR'), validateInput(CreateBulkModulesRequest), createBulkModulesController);
router.get("/modules/:expertiseId", optionalAuth, getModulesByExpertiseIdController);

// Chapter routes - Allow CONTRIBUTOR
router.post("/create/chapters/bulk", verifyUser('ADMIN', 'CONTRIBUTOR'), validateInput(CreateBulkChaptersRequest), createBulkChaptersController);
router.get("/chapters/:moduleId", optionalAuth, getChaptersByModuleIdController);

// Lesson routes - Allow CONTRIBUTOR
router.post("/create/lessons/bulk", verifyUser('ADMIN', 'CONTRIBUTOR'), validateInput(CreateBulkLessonsRequest), createBulkLessonsController);
router.get("/lessons/:chapterId", optionalAuth, getLessonsByChapterIdController);
router.get("/auth/lessons/:chapterId", verifyUser('STUDENT'), getLessonsbyChapterIdWithAuthController);

// User Lesson Notes routes
router.post("/notes", verifyUser('STUDENT'), validateInput(CreateUserLessonNotesRequest), createUserLessonNotesController);
router.get("/notes/:lessonId", verifyUser('STUDENT'), getUserLessonNotesByLessonIdController);

// Update routes - Allow CONTRIBUTOR to update their own content
router.put("/category/:categoryId", verifyUser('ADMIN'), validateInput(UpdateCategoryRequest), updateCategoryController);
router.put("/subcategory/:subCategoryId", verifyUser('ADMIN'), validateInput(UpdateSubCategoryRequest), updateSubCategoryController);
router.put("/skillcategory/:skillCategoryId", verifyUser('ADMIN', 'CONTRIBUTOR'), validateInput(UpdateSkillCategoryRequest), updateSkillCategoryController);
router.put("/expertise/:expertiseId", verifyUser('ADMIN', 'CONTRIBUTOR'), validateInput(UpdateExpertiseRequest), updateExpertiseController);
router.put("/chapter/:chapterId", verifyUser('ADMIN', 'CONTRIBUTOR'), validateInput(UpdateChapterRequest), updateChapterController);
router.put("/lesson/:lessonId", verifyUser('ADMIN', 'CONTRIBUTOR'), validateInput(UpdateLessonRequest), updateLessonController);
router.put("/module/:moduleId", verifyUser('ADMIN', 'CONTRIBUTOR'), validateInput(UpdateModuleRequest), updateModuleController);

// Delete routes
router.delete("/course/:courseId", verifyUser('ADMIN'), deleteCourseController);
router.delete("/category/:categoryId", verifyUser('ADMIN'), deleteCategoryController);
router.delete("/subcategory/:subCategoryId", verifyUser('ADMIN'), deleteSubCategoryController);
router.delete("/skillcategory/:skillCategoryId", verifyUser('ADMIN'), deleteSkillCategoryController);
router.delete("/expertise/:expertiseId", verifyUser('ADMIN'), deleteExpertiseController);
router.delete("/module/:moduleId", verifyUser('ADMIN'), deleteModuleController);
router.delete("/chapter/:chapterId", verifyUser('ADMIN'), deleteChapterController);
router.delete("/lesson/:lessonId", verifyUser('ADMIN'), deleteLessonController);

// Get single item routes for editing - Allow CONTRIBUTOR to view for editing
router.get("/category/:categoryId", verifyUser('ADMIN'), getCategoryByIdController);
router.get("/subcategory/:subCategoryId", verifyUser('ADMIN'), getSubCategoryByIdController);
router.get("/skillcategory/:skillCategoryId", verifyUser('ADMIN', 'CONTRIBUTOR'), getSkillCategoryByIdController);
router.get("/expertise/:expertiseId", verifyUser('ADMIN', 'CONTRIBUTOR'), getExpertiseByIdController);
router.get("/module/:moduleId", verifyUser('ADMIN', 'CONTRIBUTOR'), getModuleByIdController);
router.get("/chapter/:chapterId", verifyUser('ADMIN', 'CONTRIBUTOR'), getChapterByIdController);
router.get("/lesson/:lessonId", verifyUser('ADMIN', 'CONTRIBUTOR'), getLessonByIdController);

router.get("/public/categories", getAllCategoriesController);
router.get("/public/subcategories/:categoryId", getAllSubCategoriesController);
router.get("/public/skillcategories/:courseId", optionalAuth, getSkillCategoriesByCourseIdController);
router.get("/public/expertise/:skillCategoryId", optionalAuth, getExpertiseBySkillCategoryIdController);
router.get("/public/modules/:expertiseId", optionalAuth, getModulesByExpertiseIdController);
router.get("/public/chapters/:moduleId", optionalAuth, getChaptersByModuleIdController);
router.get("/public/lessons/:chapterId", optionalAuth, getLessonsByChapterIdController);

// Reorder routes - Allow CONTRIBUTOR
router.put("/skillcategory/:skillCategoryId/reorder", verifyUser('ADMIN', 'CONTRIBUTOR'), validateInput(ReorderLessonRequest), reorderSkillCategoryController); // Reusing ReorderLessonRequest for direction validation
router.put("/expertise/:expertiseId/reorder", verifyUser('ADMIN', 'CONTRIBUTOR'), validateInput(ReorderLessonRequest), reorderExpertiseController);
router.put("/module/:moduleId/reorder", verifyUser('ADMIN', 'CONTRIBUTOR'), validateInput(ReorderLessonRequest), reorderModuleController);
router.put("/chapter/:chapterId/reorder", verifyUser('ADMIN', 'CONTRIBUTOR'), validateInput(ReorderChapterRequest), reorderChapterController);
router.put("/lesson/:lessonId/reorder", verifyUser('ADMIN', 'CONTRIBUTOR'), validateInput(ReorderLessonRequest), reorderLessonController);

// Submit for review (CONTRIBUTOR)
router.post("/course/:courseId/submit", verifyUser('CONTRIBUTOR'), submitCourseController);
router.post("/chapter/:chapterId/submit", verifyUser('CONTRIBUTOR'), submitChapterController);
router.post("/lesson/:lessonId/submit", verifyUser('CONTRIBUTOR'), submitLessonController);

// Approve (MODERATOR)
router.post("/course/:courseId/approve", verifyUser('MODERATOR'), approveCourseController);
router.post("/chapter/:chapterId/approve", verifyUser('MODERATOR'), approveChapterController);
router.post("/lesson/:lessonId/approve", verifyUser('MODERATOR'), approveLessonController);

// Reject (MODERATOR)
router.post("/course/:courseId/reject", verifyUser('MODERATOR'), validateInput(RejectCourseRequest), rejectCourseController);
router.post("/chapter/:chapterId/reject", verifyUser('MODERATOR'), validateInput(RejectCourseRequest), rejectChapterController);
router.post("/lesson/:lessonId/reject", verifyUser('MODERATOR'), validateInput(RejectCourseRequest), rejectLessonController);

// Publish (ADMIN)
router.post("/course/:courseId/publish", verifyUser('ADMIN'), validateInput(PublishCourseRequest), publishCourseController);
router.post("/chapter/:chapterId/publish", verifyUser('ADMIN'), validateInput(PublishCourseRequest), publishChapterController);
router.post("/lesson/:lessonId/publish", verifyUser('ADMIN'), validateInput(PublishCourseRequest), publishLessonController);

// Get submissions for review (MODERATOR/ADMIN)
router.get("/admin/submissions", verifyUser('MODERATOR'), getSubmissionsForReviewController);

router.put("/course/:courseId/flags", verifyUser('ADMIN'), validateInput(UpdateCourseFlagsRequest), updateCourseFlagsController);
router.put("/chapter/:chapterId/flags", verifyUser('ADMIN'), validateInput(UpdateCourseFlagsRequest), updateChapterFlagsController);
router.put("/lesson/:lessonId/flags", verifyUser('ADMIN'), validateInput(UpdateCourseFlagsRequest), updateLessonFlagsController);

router.get("/contributor/courses", verifyUser('CONTRIBUTOR', 'ADMIN'), getContributorCoursesController);
router.get("/contributor/chapters", verifyUser('CONTRIBUTOR', 'ADMIN'), getContributorChaptersController);
router.get("/contributor/lessons", verifyUser('CONTRIBUTOR', 'ADMIN'), getContributorLessonsController);

router.get(
    "/contributor/course/:courseId",
    verifyUser('CONTRIBUTOR'),
    getContributorCourseDetailsController
);

router.get(
    "/contributor/course/:courseId/timeline",
    verifyUser('CONTRIBUTOR'),
    getCourseActivityTimelineController
);

// Add these new routes after the existing public routes

router.get("/public/skillcategories-all", getAllSkillCategoriesPublicController);
router.get("/public/expertise-all", getAllExpertisePublicController);
router.get("/public/modules-all", getAllModulesPublicController);
router.get("/public/chapters-all", getAllChaptersPublicController);
router.get("/public/lessons-all", getAllLessonsPublicController);
router.get("/public/free-lessons", getFreeLessonsPublicController);

router.get("/course/:courseId/full-structure", verifyUser('ADMIN', 'CONTRIBUTOR'), getCourseFullStructureController);

export default router