import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  // Create Offerer User
  const offerer = await prisma.user.upsert({
    where: { email: 'offerer@dataspace.com' },
    update: {},
    create: {
      email: 'offerer@dataspace.com',
      password,
      fullName: 'John Offerer',
      companyName: 'DataSpace Infrastructure Ltd',
      role: UserRole.OFFERER,
    },
  });

  console.log('Created Offerer:', offerer.email);

  // Create Nodes with Geolocation
  const nodes = [
    {
      node_hash: 'node_alpha_123',
      name: 'North Hub Alpha',
      zone: 'London, UK',
      latitude: 51.5074,
      longitude: -0.1278,
      capacity: 2500,
      utilization: '15%',
      status: 'Active',
      rental_rate: 15.50,
      tier: 'Tier 3',
      os: 'Ubuntu 22.04',
      bandwidth: '10 Gbps',
    },
    {
      node_hash: 'node_beta_456',
      name: 'East Edge Beta',
      zone: 'Berlin, DE',
      latitude: 52.5200,
      longitude: 13.4050,
      capacity: 1200,
      utilization: '45%',
      status: 'Active',
      rental_rate: 12.00,
      tier: 'Tier 2',
      os: 'CentOS 9',
      bandwidth: '5 Gbps',
    },
    {
      node_hash: 'node_gamma_789',
      name: 'South Storage Gamma',
      zone: 'Madrid, ES',
      latitude: 40.4168,
      longitude: -3.7038,
      capacity: 500,
      utilization: '80%',
      status: 'Stopped',
      rental_rate: 8.50,
      tier: 'Tier 1',
      os: 'Debian 12',
      bandwidth: '1 Gbps',
    },
    {
      node_hash: 'node_delta_101',
      name: 'Paris Prime',
      zone: 'Paris, FR',
      latitude: 48.8566,
      longitude: 2.3522,
      capacity: 3000,
      utilization: '10%',
      status: 'Active',
      rental_rate: 18.00,
      tier: 'Tier 4',
      os: 'RHEL 9',
      bandwidth: '20 Gbps',
    },
    {
      node_hash: 'node_epsilon_202',
      name: 'Amsterdam Core',
      zone: 'Amsterdam, NL',
      latitude: 52.3676,
      longitude: 4.9041,
      capacity: 1800,
      utilization: '30%',
      status: 'Active',
      rental_rate: 14.25,
      tier: 'Tier 3',
      os: 'Ubuntu 24.04',
      bandwidth: '10 Gbps',
    },
  ];

  // Clear existing nodes to avoid duplicates during re-seed
  await prisma.node.deleteMany({ where: { owner_id: offerer.id } });

  for (const nodeData of nodes) {
    await prisma.node.create({
      data: {
        ...nodeData,
        owner_id: offerer.id,
      },
    });
  }

  console.log(`Seed completed: 1 Offerer and ${nodes.length} Nodes created.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
