import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function exportAllData() {
  console.log("Connecting to database and reading all tables in read-only mode...");

  const data: Record<string, any[]> = {};
  const counts: Record<string, number> = {};

  // Read tables in order
  const models = [
    { name: "User", fn: () => prisma.user.findMany() },
    { name: "BillingInfo", fn: () => prisma.billingInfo.findMany() },
    { name: "Category", fn: () => prisma.category.findMany() },
    { name: "SubCategory", fn: () => prisma.subCategory.findMany() },
    { name: "Course", fn: () => prisma.course.findMany() },
    { name: "SkillCategory", fn: () => prisma.skillCategory.findMany() },
    { name: "Expertise", fn: () => prisma.expertise.findMany() },
    { name: "Module", fn: () => prisma.module.findMany() },
    { name: "Chapters", fn: () => prisma.chapters.findMany() },
    { name: "Lessons", fn: () => prisma.lessons.findMany() },
    { name: "Video", fn: () => prisma.video.findMany() },
    { name: "Material", fn: () => prisma.material.findMany() },
    { name: "ViewingHistory", fn: () => prisma.viewingHistory.findMany() },
    { name: "Quiz", fn: () => prisma.quiz.findMany() },
    { name: "QuizQuestion", fn: () => prisma.quizQuestion.findMany() },
    { name: "QuizOption", fn: () => prisma.quizOption.findMany() },
    { name: "QuizAttempt", fn: () => prisma.quizAttempt.findMany() },
    { name: "QuizAnswer", fn: () => prisma.quizAnswer.findMany() },
    { name: "Purchase", fn: () => prisma.purchase.findMany() },
    { name: "UserLessonNotes", fn: () => prisma.userLessonNotes.findMany() },
    { name: "LessonQuestion", fn: () => prisma.lessonQuestion.findMany() },
    { name: "QuestionReply", fn: () => prisma.questionReply.findMany() },
    { name: "Notification", fn: () => prisma.notification.findMany() },
    { name: "WorkflowHistory", fn: () => prisma.workflowHistory.findMany() },
    { name: "ContactSubmission", fn: () => prisma.contactSubmission.findMany() },
    { name: "CartItem", fn: () => prisma.cartItem.findMany() },
    { name: "FaqBlock", fn: () => prisma.faqBlock.findMany() },
    { name: "Banner", fn: () => prisma.banner.findMany() },
    { name: "ClientLogo", fn: () => prisma.clientLogo.findMany() },
  ];

  let totalRecords = 0;

  for (const model of models) {
    try {
      const records = await model.fn();
      data[model.name] = records;
      counts[model.name] = records.length;
      totalRecords += records.length;
      console.log(`✓ Read ${model.name}: ${records.length} records`);
    } catch (err: any) {
      console.error(`✗ Error reading ${model.name}:`, err.message);
      data[model.name] = [];
      counts[model.name] = 0;
    }
  }

  // Build the Markdown Content
  let md = `# Production Database Full Export & Data Backup\n\n`;
  md += `**Export Date**: ${new Date().toISOString()}\n`;
  md += `**Total Tables Audited**: ${models.length}\n`;
  md += `**Total Records Exported**: ${totalRecords}\n\n`;
  md += `---\n\n`;

  md += `## 📊 Table Summary & Record Counts\n\n`;
  md += `| Table / Model | Record Count | Description / Notes |\n`;
  md += `| :--- | :---: | :--- |\n`;

  for (const model of models) {
    md += `| **${model.name}** | ${counts[model.name]} | ${counts[model.name] > 0 ? "Contains active data" : "Empty table"} |\n`;
  }

  md += `\n---\n\n`;
  md += `## 📂 Complete Table Data\n\n`;

  for (const model of models) {
    const records = data[model.name];
    md += `### 🏷️ Table: \`${model.name}\` (${records.length} records)\n\n`;

    if (records.length === 0) {
      md += `*No records in this table.*\n\n`;
    } else {
      md += `\`\`\`json\n`;
      md += JSON.stringify(records, null, 2);
      md += `\n\`\`\`\n\n`;
    }
    md += `---\n\n`;
  }

  // Output paths
  const outputPath = path.resolve(__dirname, "../../production_database_export.md");
  fs.writeFileSync(outputPath, md, "utf-8");

  console.log(`\n========================================`);
  console.log(`Data export complete!`);
  console.log(`Saved markdown file to: ${outputPath}`);
  console.log(`Total records: ${totalRecords}`);
  console.log(`========================================\n`);

  await prisma.$disconnect();
}

exportAllData().catch(async (e) => {
  console.error("Fatal export error:", e);
  await prisma.$disconnect();
  process.exit(1);
});
