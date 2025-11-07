import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function ensureSeed() {
  const adminEmail = 'fquejq@miumg.edu.gt';
  const adminPassword = 'fr3dy';
  const adminName = 'fredyquej';

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: passwordHash,
        role: 'admin',
      }
    });

    console.log(`✅ Default admin created: ${adminEmail}`);
  } else {
    console.log(`ℹ️ Admin already exists: ${adminEmail}`);
  }
}
