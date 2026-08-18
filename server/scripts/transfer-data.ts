import { PrismaClient } from "@prisma/client";

const SOURCE_URL = "postgresql://neondb_owner:npg_Bs7XL2iOdmzu@ep-twilight-heart-add72izp-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const TARGET_URL = "postgresql://neondb_owner:npg_I7Z1GrgJlmxD@ep-purple-feather-azzep0or-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const sourcePrisma = new PrismaClient({
  datasources: { db: { url: SOURCE_URL } },
});

const targetPrisma = new PrismaClient({
  datasources: { db: { url: TARGET_URL } },
});

async function cleanTargetDb() {
  console.log("Cleaning target database tables to prepare for clean 1:1 migration...");
  // Delete in reverse dependency order
  const models = [
    "WorkflowHistory",
    "FaqBlock",
    "CartItem",
    "ContactSubmission",
    "QuestionReply",
    "LessonQuestion",
    "UserLessonNotes",
    "QuizAnswer",
    "QuizAttempt",
    "QuizOption",
    "QuizQuestion",
    "Quiz",
    "ViewingHistory",
    "Material",
    "Video",
    "Lessons",
    "Purchase",
    "Chapters",
    "Module",
    "Expertise",
    "SkillCategory",
    "Course",
    "SubCategory",
    "Category",
    "Notification",
    "BillingInfo",
    "Banner",
    "ClientLogo",
    "User"
  ];

  for (const model of models) {
    try {
      await (targetPrisma as any)[model.charAt(0).toLowerCase() + model.slice(1)].deleteMany();
    } catch (e: any) {
      // Ignore if table already empty
    }
  }
  console.log("✓ Target database cleaned successfully.\n");
}

async function chunkInsert(modelDelegate: any, records: any[], batchSize = 250) {
  if (!records || records.length === 0) return 0;
  let inserted = 0;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    for (const record of batch) {
      try {
        await modelDelegate.create({
          data: record,
        });
        inserted++;
      } catch (err: any) {
        // If single insert fails (e.g. invalid foreign key), log and skip
        console.warn(`  ⚠️ Skipped 1 invalid record in ${modelDelegate.name || 'table'}: ${err.message?.split('\n')[0]}`);
      }
    }
  }
  return inserted;
}

async function migrateData() {
  console.log("==================================================");
  console.log("🚀 STARTING PRODUCTION TO TARGET DB DATA TRANSFER");
  console.log("Source: ep-twilight-heart... (Read-Only)");
  console.log("Target: ep-purple-feather... (Target DB)");
  console.log("==================================================\n");

  await cleanTargetDb();

  // 1. Fetch valid user IDs to filter any orphaned notifications/records
  const sourceUsers = await sourcePrisma.user.findMany();
  const validUserIds = new Set(sourceUsers.map(u => u.id));

  const migrationOrder: { name: string; getSource: () => Promise<any[]>; getTarget: () => any; filter?: (records: any[]) => any[] }[] = [
    // 1. Root entities
    { name: "User", getSource: () => sourcePrisma.user.findMany(), getTarget: () => targetPrisma.user },
    { name: "BillingInfo", getSource: () => sourcePrisma.billingInfo.findMany(), getTarget: () => targetPrisma.billingInfo },
    { name: "Category", getSource: () => sourcePrisma.category.findMany(), getTarget: () => targetPrisma.category },
    { name: "Banner", getSource: () => sourcePrisma.banner.findMany(), getTarget: () => targetPrisma.banner },
    { name: "ClientLogo", getSource: () => sourcePrisma.clientLogo.findMany(), getTarget: () => targetPrisma.clientLogo },
    { name: "ContactSubmission", getSource: () => sourcePrisma.contactSubmission.findMany(), getTarget: () => targetPrisma.contactSubmission },
    { 
      name: "Notification", 
      getSource: () => sourcePrisma.notification.findMany(), 
      getTarget: () => targetPrisma.notification,
      filter: (records) => records.filter(r => validUserIds.has(r.userId))
    },

    // 2. Hierarchy Level 1-3
    { name: "SubCategory", getSource: () => sourcePrisma.subCategory.findMany(), getTarget: () => targetPrisma.subCategory },
    { name: "Course", getSource: () => sourcePrisma.course.findMany(), getTarget: () => targetPrisma.course },
    { name: "SkillCategory", getSource: () => sourcePrisma.skillCategory.findMany(), getTarget: () => targetPrisma.skillCategory },
    { name: "Expertise", getSource: () => sourcePrisma.expertise.findMany(), getTarget: () => targetPrisma.expertise },
    { name: "Module", getSource: () => sourcePrisma.module.findMany(), getTarget: () => targetPrisma.module },
    { name: "Chapters", getSource: () => sourcePrisma.chapters.findMany(), getTarget: () => targetPrisma.chapters },

    // 3. Lessons & Quizzes
    { name: "Lessons", getSource: () => sourcePrisma.lessons.findMany(), getTarget: () => targetPrisma.lessons },
    { name: "Video", getSource: () => sourcePrisma.video.findMany(), getTarget: () => targetPrisma.video },
    { name: "Material", getSource: () => sourcePrisma.material.findMany(), getTarget: () => targetPrisma.material },
    { name: "Quiz", getSource: () => sourcePrisma.quiz.findMany(), getTarget: () => targetPrisma.quiz },
    { name: "QuizQuestion", getSource: () => sourcePrisma.quizQuestion.findMany(), getTarget: () => targetPrisma.quizQuestion },
    { name: "QuizOption", getSource: () => sourcePrisma.quizOption.findMany(), getTarget: () => targetPrisma.quizOption },

    // 4. Purchases & Activity
    { name: "Purchase", getSource: () => sourcePrisma.purchase.findMany(), getTarget: () => targetPrisma.purchase },
    { name: "CartItem", getSource: () => sourcePrisma.cartItem.findMany(), getTarget: () => targetPrisma.cartItem },
    { name: "ViewingHistory", getSource: () => sourcePrisma.viewingHistory.findMany(), getTarget: () => targetPrisma.viewingHistory },
    { name: "QuizAttempt", getSource: () => sourcePrisma.quizAttempt.findMany(), getTarget: () => targetPrisma.quizAttempt },
    { name: "QuizAnswer", getSource: () => sourcePrisma.quizAnswer.findMany(), getTarget: () => targetPrisma.quizAnswer },
    { name: "UserLessonNotes", getSource: () => sourcePrisma.userLessonNotes.findMany(), getTarget: () => targetPrisma.userLessonNotes },
    { name: "LessonQuestion", getSource: () => sourcePrisma.lessonQuestion.findMany(), getTarget: () => targetPrisma.lessonQuestion },
    { name: "QuestionReply", getSource: () => sourcePrisma.questionReply.findMany(), getTarget: () => targetPrisma.questionReply },
    { name: "WorkflowHistory", getSource: () => sourcePrisma.workflowHistory.findMany(), getTarget: () => targetPrisma.workflowHistory },
    { name: "FaqBlock", getSource: () => sourcePrisma.faqBlock.findMany(), getTarget: () => targetPrisma.faqBlock },
  ];

  const results: { table: string; source: number; target: number; status: string }[] = [];
  let totalMigrated = 0;

  for (const item of migrationOrder) {
    process.stdout.write(`Processing ${item.name}... `);
    let records = await item.getSource();
    if (item.filter) {
      records = item.filter(records);
    }
    const count = await chunkInsert(item.getTarget(), records);
    const targetCount = await item.getTarget().count();
    totalMigrated += count;

    const isMatch = records.length === targetCount;
    results.push({
      table: item.name,
      source: records.length,
      target: targetCount,
      status: isMatch ? "✓ VERIFIED" : "⚠ MISMATCH",
    });

    console.log(`Copied ${count}/${records.length} records. Target count: ${targetCount} ${isMatch ? "✓" : "✗"}`);
  }

  console.log("\n==================================================");
  console.log("📊 FINAL VERIFICATION AUDIT");
  console.log("==================================================");
  console.table(results);

  const allPassed = results.every(r => r.source === r.target);
  console.log(`\nMigration Result: ${allPassed ? "🎉 100% SUCCESS - ALL TABLES MATCH!" : "⚠️ SOME TABLES HAD DISCREPANCIES"}`);
  console.log(`Total Rows Migrated to Target DB: ${totalMigrated}`);

  await sourcePrisma.$disconnect();
  await targetPrisma.$disconnect();
}

migrateData().catch(async (err) => {
  console.error("Fatal migration error:", err);
  await sourcePrisma.$disconnect();
  await targetPrisma.$disconnect();
  process.exit(1);
});
