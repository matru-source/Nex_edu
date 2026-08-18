import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting quiz data fix...");

    // 1. Update all quizzes with maxAttempts < 3 to have maxAttempts = 3
    const quizUpdateResult = await prisma.quiz.updateMany({
        where: {
            maxAttempts: { lt: 3 },
        },
        data: {
            maxAttempts: 3,
        },
    });
    console.log(`Updated ${quizUpdateResult.count} quizzes to have maxAttempts = 3`);

    // 2. Get all IN_PROGRESS attempts and mark them as ABANDONED
    const inProgressAttempts = await prisma.quizAttempt.findMany({
        where: {
            status: "IN_PROGRESS",
        },
        include: {
            quiz: {
                include: {
                    questions: true,
                },
            },
        },
    });

    console.log(`Found ${inProgressAttempts.length} IN_PROGRESS attempts to mark as ABANDONED`);

    for (const attempt of inProgressAttempts) {
        const totalPoints = attempt.quiz.questions.reduce((sum, q) => sum + q.points, 0);
        await prisma.quizAttempt.update({
            where: { id: attempt.id },
            data: {
                status: "ABANDONED",
                completedAt: new Date(),
                score: 0,
                totalPoints: totalPoints,
                percentage: 0,
            },
        });
        console.log(`Marked attempt ${attempt.id} as ABANDONED`);
    }

    console.log("Quiz data fix completed!");
}

// main()
//     .catch((e) => {
//         console.error("Error:", e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });
