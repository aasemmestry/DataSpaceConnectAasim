import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function fixOwnership() {
  try {
    // 1. Find the specific Offerer account
    // Matches the role defined in your schema.prisma
    const offerer = await p.user.findFirst({ 
      where: { role: 'OFFERER' } 
    });
    
    if (!offerer) {
      console.log('Error: No Offerer account found in database.');
      process.exit(1);
    }

    console.log('Linking nodes to owner: ' + offerer.email);

    // 2. Update all nodes to be owned by this specific User UUID
    // This ensures they appear in your 'Operational Overview'
    const result = await p.node.updateMany({
      data: { ownerId: offerer.id }
    });

    console.log('Success: ' + result.count + ' nodes are now under your management.');
  } catch (error) {
    console.error('Operation failed:', error);
  } finally {
    await p.$disconnect();
    process.exit(0);
  }
}

fixOwnership();