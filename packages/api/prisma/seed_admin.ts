import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🛡️  Creating Super Admin...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@dataspace.com' },
    update: {},
    create: {
      email: 'admin@dataspace.com',
      password: hashedPassword,
      fullName: 'System Administrator',
      companyName: 'DataSpace HQ',
      role: 'ADMIN', // Critical
      country: 'Global',
      accountType: 'Internal',
      entityType: 'Government'
    },
  });

  console.log(`✅ Admin Created: ${admin.email} / admin123`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });