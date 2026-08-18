-- AlterTable: Add isPublished to SkillCategory (default true)
ALTER TABLE "SkillCategory" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable: Add isPublished to Expertise (default true)
ALTER TABLE "Expertise" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable: Add isPublished to Module (default true)
ALTER TABLE "Module" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable: Change Course.published default to true
ALTER TABLE "Course" ALTER COLUMN "published" SET DEFAULT true;
