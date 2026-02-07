import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function restoreData() {
  try {
    const aasim = await p.user.findUnique({ where: { email: 'aasim@datagreen.cloud' } });
    if (!aasim) {
      console.log('User aasim@datagreen.cloud not found in database.');
      process.exit(1);
    }

    // Clear existing nodes for this owner to avoid duplicates
    await p.node.deleteMany({ where: { ownerId: aasim.id } });

    await p.node.createMany({
      data: [
        { 
          name: 'Mumbai-Hub-01', 
          zone: 'Mumbai', 
          latitude: 19.0760, 
          longitude: 72.8777,
          capacity: 100, 
          utilization: '25%', 
          status: 'Active', // CHANGED FROM 'ONLINE' TO 'Active'
          ownerId: aasim.id,
          rental_rate: 1.5,
          node_hash: 'hash_mum_01',
          tier: 'Tier 3',
          os: 'Ubuntu 22.04'
        },
        { 
          name: 'Surat-Edge-01', 
          zone: 'Surat', 
          latitude: 21.1702,
          longitude: 72.8311,
          capacity: 50, 
          utilization: '10%', 
          status: 'Active', 
          ownerId: aasim.id,
          rental_rate: 1.2,
          node_hash: 'hash_sur_01',
          tier: 'Tier 2',
          os: 'Debian 11'
        },
        { 
          name: 'London-Global-01', 
          zone: 'London', 
          latitude: 51.5074,
          longitude: -0.1278,
          capacity: 200, 
          utilization: '45%', 
          status: 'Active', 
          ownerId: aasim.id,
          rental_rate: 2.5,
          node_hash: 'hash_lon_01',
          tier: 'Tier 4',
          os: 'RHEL 9'
        },
        { 
          name: 'NY-Global-02', 
          zone: 'New York', 
          latitude: 40.7128,
          longitude: -74.0060,
          capacity: 150, 
          utilization: '30%', 
          status: 'Active', 
          ownerId: aasim.id,
          rental_rate: 2.2,
          node_hash: 'hash_ny_01',
          tier: 'Tier 3',
          os: 'Ubuntu 20.04'
        },
        { 
          name: 'Tokyo-Global-03', 
          zone: 'Tokyo', 
          latitude: 35.6895,
          longitude: 139.6917,
          capacity: 80, 
          utilization: '15%', 
          status: 'Active', 
          ownerId: aasim.id,
          rental_rate: 2.8,
          node_hash: 'hash_tok_01',
          tier: 'Tier 3',
          os: 'CentOS Stream'
        }
      ]
    });

    console.log('✅ Nodes restored with status "Active". They should now show as Available in Seeker Map.');
  } catch (error) {
    console.error('Error restoring data:', error);
  } finally {
    await p.$disconnect();
    process.exit(0);
  }
}

restoreData();