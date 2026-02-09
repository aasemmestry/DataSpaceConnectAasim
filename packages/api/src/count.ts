import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.node.count();
  console.log(`Node count: ${count}`);
}
main().finally(() => prisma.$disconnect());
