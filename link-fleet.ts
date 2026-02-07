import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function linkFleet() {
  try {
    // 1. Resolve the seeker user
    const seeker = await p.user.findUnique({ where: { email: 'ndplseo@gmail.com' } });
    // 2. Resolve the Mumbai node
    const node = await p.node.findFirst({ where: { zone: 'Mumbai' } });

    if (!seeker || !node) {
      console.log('CRITICAL: User or Node missing. Ensure ndplseo@gmail.com exists.');
      process.exit(1);
    }

    // 3. Clear existing active contracts using snake_case names from your schema
    await p.contract.deleteMany({
      where: { 
        node_id: node.id, 
        status: 'ACTIVE' 
      }
    });

    // 4. Create the link using your schema's exact field names
    await p.contract.create({
      data: {
        node_id: node.id,
        user_id: seeker.id,
        status: 'ACTIVE',
        start_date: new Date(Date.now() - 86400000) // 24 hours ago for billing demo
      }
    });

    // 5. Update node status to Leased
    await p.node.update({
      where: { id: node.id },
      data: { status: 'Leased' }
    });

    console.log('Success: Mumbai node successfully linked to your fleet account.');
  } catch (error) {
    console.error('Link failed:', error);
  } finally {
    await p.$disconnect();
    process.exit(0);
  }
}

linkFleet();