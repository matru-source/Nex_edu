import { z } from "zod";

// Create admin reply request
export const CreateAdminReplyRequest = z.object({
    questionId: z.string().min(1, "Question ID is required"),
    reply: z.string().min(1, "Reply is required"),
    parentId: z.string().optional(),
});
export type CreateAdminReplyRequestParams = z.infer<typeof CreateAdminReplyRequest>;

// Block user request - can block for lesson or course
export const BlockUserRequest = z.object({
    userId: z.string().min(1, "User ID is required"),
    lessonId: z.string().optional(),
    courseId: z.string().optional(),
    reason: z.string().optional(),
}).refine(
    (data) => data.lessonId || data.courseId,
    {
        message: "Either lessonId or courseId must be provided",
        path: ["lessonId", "courseId"],
    }
).refine(
    (data) => !(data.lessonId && data.courseId),
    {
        message: "Cannot block for both lesson and course at the same time",
        path: ["lessonId", "courseId"],
    }
);
export type BlockUserRequestParams = z.infer<typeof BlockUserRequest>;

// Check user blocked request
export const CheckUserBlockedRequest = z.object({
    userId: z.string().min(1, "User ID is required"),
    lessonId: z.string().min(1, "Lesson ID is required"),
});
export type CheckUserBlockedRequestParams = z.infer<typeof CheckUserBlockedRequest>;
