import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Resetting Node Moderation Status...');

  // 1. Count existing nodes
  const total = await prisma.node.count();
  
  if (total === 0) {
    console.log("⚠️ No nodes found! Please run the 'seed_france.ts' script first.");
    return;
  }

  // 2. Update ALL nodes to 'PENDING'
  // This forces them to appear in the Admin Approval Queue
  const result = await prisma.node.updateMany({
    data: {
      verification_status: 'PENDING'
    }
  });

  console.log(`✅ Success! Moved ${result.count} nodes to the Approval Queue.`);
  console.log(`👉 Go to your Admin Dashboard now to review them.`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());