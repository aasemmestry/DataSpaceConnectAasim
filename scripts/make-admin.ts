import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAdmin(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });
    console.log(`Successfully updated ${email} to ADMIN role.`);
    console.log(user);
  } catch (error) {
    console.error(`Error updating user ${email}:`, error);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address: npm run make-admin <email>');
  process.exit(1);
}

makeAdmin(email);
