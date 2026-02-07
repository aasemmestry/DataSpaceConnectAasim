import { PrismaClient } from '@prisma/client';
import { PasswordService } from './packages/api/src/services/PasswordService';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@datagreen.cloud';
  const password = 'Password123!';
  
  // Use your actual service to hash it
  const hashedPassword = await PasswordService.hash(password);

  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName: 'System Admin',
      companyName: 'DataSpace',
      role: 'ADMIN',
    },
  });

  console.log('\n-----------------------------------');
  console.log('✅ TEST ADMIN READY');
  console.log(`Email: ${user.email}`);
  console.log(`Password: ${password}`);
  console.log('-----------------------------------');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());