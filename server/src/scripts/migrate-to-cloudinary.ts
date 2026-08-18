import { PrismaClient } from '@prisma/client';
import { uploadToCloudinary } from '../utils/cloudinary/cloudinary';

const prisma = new PrismaClient();

function isCloudinaryUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
}

async function migrateUrl(
  url: string | null | undefined,
  folder: string,
  resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto'
): Promise<string | null> {
  if (!url || isCloudinaryUrl(url)) return null;

  console.log(`  [MIGRATING] -> ${url}`);
  try {
    const result = await uploadToCloudinary(url, { folder, resourceType });
    console.log(`  [SUCCESS]   -> ${result.secure_url}`);
    return result.secure_url;
  } catch (error: any) {
    console.error(`  [FAILED]    -> ${url} : ${error.message}`);
    return null;
  }
}

export async function runMigration() {
  console.log('=============================================');
  console.log('  STARTING ASSET MIGRATION TO CLOUDINARY     ');
  console.log('=============================================\n');

  try {
    // 1. Users Profile Photos
    console.log('Checking Users profile photos...');
    const users = await prisma.user.findMany({
      where: { profilePhoto: { not: null } },
    });
    for (const u of users) {
      if (u.profilePhoto && !isCloudinaryUrl(u.profilePhoto)) {
        const newUrl = await migrateUrl(u.profilePhoto, 'erp-bugs/profiles', 'image');
        if (newUrl) {
          await prisma.user.update({ where: { id: u.id }, data: { profilePhoto: newUrl } });
        }
      }
    }

    // 2. Categories
    console.log('\nChecking Categories thumbnails...');
    const categories = await prisma.category.findMany({
      where: { tumbnailUrl: { not: null } },
    });
    for (const item of categories) {
      if (item.tumbnailUrl && !isCloudinaryUrl(item.tumbnailUrl)) {
        const newUrl = await migrateUrl(item.tumbnailUrl, 'erp-bugs/categories', 'image');
        if (newUrl) {
          await prisma.category.update({ where: { id: item.id }, data: { tumbnailUrl: newUrl } });
        }
      }
    }

    // 3. SubCategories
    console.log('\nChecking SubCategories thumbnails...');
    const subCategories = await prisma.subCategory.findMany({
      where: { tumbnailUrl: { not: null } },
    });
    for (const item of subCategories) {
      if (item.tumbnailUrl && !isCloudinaryUrl(item.tumbnailUrl)) {
        const newUrl = await migrateUrl(item.tumbnailUrl, 'erp-bugs/subcategories', 'image');
        if (newUrl) {
          await prisma.subCategory.update({ where: { id: item.id }, data: { tumbnailUrl: newUrl } });
        }
      }
    }

    // 4. Courses
    console.log('\nChecking Courses thumbnails...');
    const courses = await prisma.course.findMany({
      where: { tumbnailUrl: { not: null } },
    });
    for (const item of courses) {
      if (item.tumbnailUrl && !isCloudinaryUrl(item.tumbnailUrl)) {
        const newUrl = await migrateUrl(item.tumbnailUrl, 'erp-bugs/courses', 'image');
        if (newUrl) {
          await prisma.course.update({ where: { id: item.id }, data: { tumbnailUrl: newUrl } });
        }
      }
    }

    // 5. SkillCategories
    console.log('\nChecking SkillCategories thumbnails...');
    const skillCategories = await prisma.skillCategory.findMany({
      where: { tumbnailUrl: { not: null } },
    });
    for (const item of skillCategories) {
      if (item.tumbnailUrl && !isCloudinaryUrl(item.tumbnailUrl)) {
        const newUrl = await migrateUrl(item.tumbnailUrl, 'erp-bugs/skillcategories', 'image');
        if (newUrl) {
          await prisma.skillCategory.update({ where: { id: item.id }, data: { tumbnailUrl: newUrl } });
        }
      }
    }

    // 6. Expertise
    console.log('\nChecking Expertise thumbnails...');
    const expertise = await prisma.expertise.findMany({
      where: { tumbnailUrl: { not: null } },
    });
    for (const item of expertise) {
      if (item.tumbnailUrl && !isCloudinaryUrl(item.tumbnailUrl)) {
        const newUrl = await migrateUrl(item.tumbnailUrl, 'erp-bugs/expertise', 'image');
        if (newUrl) {
          await prisma.expertise.update({ where: { id: item.id }, data: { tumbnailUrl: newUrl } });
        }
      }
    }

    // 7. Modules
    console.log('\nChecking Modules thumbnails...');
    const modules = await prisma.module.findMany({
      where: { tumbnailUrl: { not: null } },
    });
    for (const item of modules) {
      if (item.tumbnailUrl && !isCloudinaryUrl(item.tumbnailUrl)) {
        const newUrl = await migrateUrl(item.tumbnailUrl, 'erp-bugs/modules', 'image');
        if (newUrl) {
          await prisma.module.update({ where: { id: item.id }, data: { tumbnailUrl: newUrl } });
        }
      }
    }

    // 8. Chapters
    console.log('\nChecking Chapters thumbnails...');
    const chapters = await prisma.chapters.findMany({
      where: { tumbnailUrl: { not: null } },
    });
    for (const item of chapters) {
      if (item.tumbnailUrl && !isCloudinaryUrl(item.tumbnailUrl)) {
        const newUrl = await migrateUrl(item.tumbnailUrl, 'erp-bugs/chapters', 'image');
        if (newUrl) {
          await prisma.chapters.update({ where: { id: item.id }, data: { tumbnailUrl: newUrl } });
        }
      }
    }

    // 9. Lessons
    console.log('\nChecking Lessons thumbnails...');
    const lessons = await prisma.lessons.findMany({
      where: { tumbnailUrl: { not: null } },
    });
    for (const item of lessons) {
      if (item.tumbnailUrl && !isCloudinaryUrl(item.tumbnailUrl)) {
        const newUrl = await migrateUrl(item.tumbnailUrl, 'erp-bugs/lessons', 'image');
        if (newUrl) {
          await prisma.lessons.update({ where: { id: item.id }, data: { tumbnailUrl: newUrl } });
        }
      }
    }

    // 10. Videos
    console.log('\nChecking Lesson Videos...');
    const videos = await prisma.video.findMany();
    for (const item of videos) {
      if (item.url && !isCloudinaryUrl(item.url)) {
        const newUrl = await migrateUrl(item.url, 'erp-bugs/videos', 'video');
        if (newUrl) {
          await prisma.video.update({ where: { id: item.id }, data: { url: newUrl } });
        }
      }
    }

    // 11. Materials
    console.log('\nChecking Course Materials / PDFs...');
    const materials = await prisma.material.findMany({
      where: { fileUrl: { not: null } },
    });
    for (const item of materials) {
      if (item.fileUrl && !isCloudinaryUrl(item.fileUrl)) {
        const newUrl = await migrateUrl(item.fileUrl, 'erp-bugs/materials', 'auto');
        if (newUrl) {
          await prisma.material.update({ where: { id: item.id }, data: { fileUrl: newUrl } });
        }
      }
    }

    // 12. Banners
    console.log('\nChecking Banners...');
    const banners = await prisma.banner.findMany();
    for (const item of banners) {
      if (item.imageUrl && !isCloudinaryUrl(item.imageUrl)) {
        const newUrl = await migrateUrl(item.imageUrl, 'erp-bugs/banners', 'image');
        if (newUrl) {
          await prisma.banner.update({ where: { id: item.id }, data: { imageUrl: newUrl } });
        }
      }
    }

    // 13. Client Logos
    console.log('\nChecking Client Logos...');
    const logos = await prisma.clientLogo.findMany();
    for (const item of logos) {
      if (item.imageUrl && !isCloudinaryUrl(item.imageUrl)) {
        const newUrl = await migrateUrl(item.imageUrl, 'erp-bugs/logos', 'image');
        if (newUrl) {
          await prisma.clientLogo.update({ where: { id: item.id }, data: { imageUrl: newUrl } });
        }
      }
    }

    console.log('\n=============================================');
    console.log('  MIGRATION FINISHED SUCCESSFULLY!           ');
    console.log('=============================================');
  } catch (err: any) {
    console.error('Migration error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  runMigration();
}
