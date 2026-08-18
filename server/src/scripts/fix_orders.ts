import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting order normalization...");

    // 1. Fix Skill Categories
    console.log("Fixing Skill Categories...");
    const courses = await prisma.course.findMany({ select: { id: true } });
    for (const course of courses) {
        const skillCategories = await prisma.skillCategory.findMany({
            where: { courseId: course.id },
            orderBy: { createdAt: "asc" },
        });

        for (let i = 0; i < skillCategories.length; i++) {
            await prisma.skillCategory.update({
                where: { id: skillCategories[i].id },
                data: { order: i },
            });
        }
    }
    console.log(`Fixed Skill Categories for ${courses.length} courses.`);

    // 2. Fix Expertise
    console.log("Fixing Expertise...");
    const skillCategories = await prisma.skillCategory.findMany({ select: { id: true } });
    for (const sc of skillCategories) {
        const expertise = await prisma.expertise.findMany({
            where: { skillCategoryId: sc.id },
            orderBy: { createdAt: "asc" },
        });

        for (let i = 0; i < expertise.length; i++) {
            await prisma.expertise.update({
                where: { id: expertise[i].id },
                data: { order: i },
            });
        }
    }
    console.log(`Fixed Expertise for ${skillCategories.length} skill categories.`);

    // 3. Fix Modules
    console.log("Fixing Modules...");
    const expertiseList = await prisma.expertise.findMany({ select: { id: true } });
    for (const exp of expertiseList) {
        const modules = await prisma.module.findMany({
            where: { expertiseId: exp.id },
            orderBy: { createdAt: "asc" },
        });

        for (let i = 0; i < modules.length; i++) {
            await prisma.module.update({
                where: { id: modules[i].id },
                data: { order: i },
            });
        }
    }
    console.log(`Fixed Modules for ${expertiseList.length} expertise items.`);

    // 4. Fix Chapters
    console.log("Fixing Chapters...");
    const modules = await prisma.module.findMany({ select: { id: true } });
    for (const mod of modules) {
        const chapters = await prisma.chapters.findMany({
            where: { moduleId: mod.id },
            orderBy: { createdAt: "asc" },
        });

        for (let i = 0; i < chapters.length; i++) {
            await prisma.chapters.update({
                where: { id: chapters[i].id },
                data: { order: i },
            });
        }
    }
    console.log(`Fixed Chapters for ${modules.length} modules.`);

    // 5. Fix Lessons
    console.log("Fixing Lessons...");
    const chapters = await prisma.chapters.findMany({ select: { id: true } });
    for (const chap of chapters) {
        const lessons = await prisma.lessons.findMany({
            where: { chapterId: chap.id },
            orderBy: { createdAt: "asc" },
        });

        for (let i = 0; i < lessons.length; i++) {
            await prisma.lessons.update({
                where: { id: lessons[i].id },
                data: { order: i },
            });
        }
    }
    console.log(`Fixed Lessons for ${chapters.length} chapters.`);

    console.log("Order normalization complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
