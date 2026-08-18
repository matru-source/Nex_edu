/**
 * Script to fix video durations that were incorrectly stored
 * 
 * This script looks for videos with durations that are suspiciously high
 * (likely stored in minutes instead of seconds) and offers to fix them.
 * 
 * Usage:
 *   npx ts-node scripts/fix-video-durations.ts
 *   
 * Options:
 *   --dry-run    Only show what would be fixed, don't actually update
 *   --fix        Actually apply the fixes
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Videos with duration > 10 hours (36000 seconds) are likely incorrect
// A typical lesson video shouldn't be more than 2-3 hours max
const SUSPICIOUS_DURATION_THRESHOLD = 36000; // 10 hours in seconds

// async function main() {
//     const isDryRun = process.argv.includes("--dry-run");
//     const shouldFix = process.argv.includes("--fix");

//     if (!isDryRun && !shouldFix) {
//         console.log(`
// Video Duration Fix Script
// =========================
// This script finds videos with suspiciously long durations and can fix them.

// Usage:
//   npx ts-node scripts/fix-video-durations.ts --dry-run   # See what would be fixed
//   npx ts-node scripts/fix-video-durations.ts --fix       # Apply the fixes

// A video is considered "suspicious" if its duration is > 10 hours (${SUSPICIOUS_DURATION_THRESHOLD} seconds).
// This usually means the duration was stored in minutes instead of seconds.
// `);
//         process.exit(0);
//     }

//     console.log("Fetching videos with suspicious durations...\n");

//     // Find all videos with suspiciously long durations
//     const suspiciousVideos = await prisma.video.findMany({
//         where: {
//             duration: {
//                 gt: SUSPICIOUS_DURATION_THRESHOLD,
//             },
//         },
//         include: {
//             lesson: {
//                 include: {
//                     chapter: {
//                         include: {
//                             module: {
//                                 include: {
//                                     expertise: {
//                                         include: {
//                                             skillCategory: {
//                                                 include: {
//                                                     course: true,
//                                                 },
//                                             },
//                                         },
//                                     },
//                                 },
//                             },
//                         },
//                     },
//                 },
//             },
//         },
//     });

//     if (suspiciousVideos.length === 0) {
//         console.log("✅ No videos with suspicious durations found!");
//         console.log("All video durations appear to be correct (< 10 hours).");
//         process.exit(0);
//     }

//     console.log(`Found ${suspiciousVideos.length} video(s) with suspicious durations:\n`);

//     for (const video of suspiciousVideos) {
//         const currentDuration = video.duration;
//         const hours = Math.floor(currentDuration / 3600);
//         const minutes = Math.floor((currentDuration % 3600) / 60);
//         const seconds = currentDuration % 60;

//         // If the current value looks like minutes (e.g., 1360 which shows as 22h 40m),
//         // dividing by 60 would give us the correct seconds
//         const correctedDuration = Math.round(currentDuration / 60);
//         const correctedHours = Math.floor(correctedDuration / 3600);
//         const correctedMinutes = Math.floor((correctedDuration % 3600) / 60);
//         const correctedSeconds = correctedDuration % 60;

//         const courseName = video.lesson?.chapter?.module?.expertise?.skillCategory?.course?.title || "Unknown Course";
//         const lessonName = video.lesson?.title || "Unknown Lesson";

//         console.log(`Video ID: ${video.id}`);
//         console.log(`  Course: ${courseName}`);
//         console.log(`  Lesson: ${lessonName}`);
//         console.log(`  Current Duration: ${currentDuration} seconds (${hours}h ${minutes}m ${seconds}s)`);
//         console.log(`  Suggested Fix: ${correctedDuration} seconds (${correctedHours}h ${correctedMinutes}m ${correctedSeconds}s)`);
//         console.log();

//         if (shouldFix) {
//             await prisma.video.update({
//                 where: { id: video.id },
//                 data: { duration: correctedDuration },
//             });
//             console.log(`  ✅ Fixed! Duration updated to ${correctedDuration} seconds\n`);
//         }
//     }

//     if (isDryRun) {
//         console.log("=".repeat(60));
//         console.log("DRY RUN - No changes were made.");
//         console.log("Run with --fix flag to apply the changes.");
//     } else if (shouldFix) {
//         console.log("=".repeat(60));
//         console.log(`✅ Fixed ${suspiciousVideos.length} video(s)!`);
//     }
// }

// main()
//     .catch((e) => {
//         console.error("Error:", e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });
