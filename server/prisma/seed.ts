import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function createUsers() {
  const users: {
    email: string;
    role: UserRole;
  }[] = [
      { email: 'admin@admin.com', role: 'ADMIN' },
      { email: 'student@student.com', role: 'STUDENT' },
    ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        role: user.role, // Update role if user exists
      },
      create: {
        name: user.role === 'ADMIN' ? 'Admin User' : 'Student User',
        email: user.email,
        password: 'admin@admin',
        role: user.role,
      },
    });
  }
}

createUsers()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    console.log("Created Users");
    await prisma.$disconnect();
  });
