import { prisma } from "../utils/prisma";
import { CourseStatus } from "@prisma/client";

async function main() {
    console.log("Starting status migration...");

    // Update Chapters
    try {
        const chapters = await prisma.chapters.updateMany({
            where: {
                status: CourseStatus.DRAFT
            },
            data: {
                status: CourseStatus.PUBLISHED
            }
        });
        console.log(`Updated ${chapters.count} chapters to PUBLISHED.`);
    } catch (error) {
        console.error("Error updating chapters:", error);
    }

    // Update Lessons
    try {
        const lessons = await prisma.lessons.updateMany({
            where: {
                status: CourseStatus.DRAFT
            },
            data: {
                status: CourseStatus.PUBLISHED
            }
        });
        console.log(`Updated ${lessons.count} lessons to PUBLISHED.`);
    } catch (error) {
        console.error("Error updating lessons:", error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
