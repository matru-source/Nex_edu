/*
  Warnings:

  - Added the required column `chapterId` to the `Purchase` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Purchase" DROP CONSTRAINT "Purchase_courseId_fkey";

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "chapterId" TEXT NOT NULL,
ALTER COLUMN "courseId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "UserLessonNotes" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "UserLessonNotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonQuestion" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionReply" (
    "id" TEXT NOT NULL,
    "reply" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "parentId" TEXT,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionReply_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLessonNotes" ADD CONSTRAINT "UserLessonNotes_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLessonNotes" ADD CONSTRAINT "UserLessonNotes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonQuestion" ADD CONSTRAINT "LessonQuestion_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonQuestion" ADD CONSTRAINT "LessonQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionReply" ADD CONSTRAINT "QuestionReply_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "QuestionReply"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionReply" ADD CONSTRAINT "QuestionReply_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "LessonQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionReply" ADD CONSTRAINT "QuestionReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
