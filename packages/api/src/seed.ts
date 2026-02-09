import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Data Population ---');

  // 1. Update existing nodes that might have missing fields
  const existingNodes = await prisma.node.findMany();
  console.log(`Updating ${existingNodes.length} existing nodes...`);

  for (const node of existingNodes) {
    await prisma.node.update({
      where: { id: node.id },
      data: {
        serverModel: node.serverModel || 'HPE ProLiant DL380 Gen10',
        powerKW: node.powerKW || 45.5,
        surfaceArea: node.surfaceArea || 120,
        constructionYear: node.constructionYear || 2021,
        networkOperator: node.networkOperator || 'BT Global',
        country: node.country || 'United Kingdom',
        postcode: node.postcode || 'E1 6AN',
        townCity: node.townCity || 'London',
        address: node.address || '80-100 Commercial St',
        coolingSystem: true,
        heatNetwork: false,
        electricityGenerator: true,
        uses: node.uses.length > 0 ? node.uses : ['Cloud Services', 'Colocation', 'AI & Machine Learning'],
        securityFeatures: node.securityFeatures.length > 0 ? node.securityFeatures : ['Firewall', 'IDS', 'CCTV', 'Biometric Access']
      }
    });
  }

  // 2. Add 20 more servers
  console.log('Adding 20 more servers...');
  
  // Get an existing user to own these nodes (preferably an Offerer)
  let offerer = await prisma.user.findFirst({ where: { role: 'OFFERER' } });
  
  if (!offerer) {
    console.log('No offerer found, using first available user.');
    offerer = await prisma.user.findFirst();
  }

  if (!offerer) {
    console.error('No users found in database. Please register a user first.');
    return;
  }

  const zones = ['London', 'Mumbai', 'New York', 'Frankfurt', 'Singapore', 'Amsterdam', 'Surat', 'Tokyo', 'Paris', 'Sydney'];
  const models = ['HPE DL380 Gen10', 'Dell R740', 'Lenovo SR650', 'Cisco UCS C220', 'HPE DL360 Gen10'];
  const tiers = ['General Purpose', 'Compute Optimized', 'High Memory'];
  const osList = ['Ubuntu 22.04 LTS', 'Debian 12', 'CentOS Stream 9', 'Windows Server 2022'];

  for (let i = 0; i < 20; i++) {
    const zone = zones[Math.floor(Math.random() * zones.length)];
    const model = models[Math.floor(Math.random() * models.length)];
    
    // Random coordinates around the zone (rough simulation)
    const latBase = zone === 'Mumbai' ? 19.076 : zone === 'London' ? 51.507 : 40.712;
    const lngBase = zone === 'Mumbai' ? 72.877 : zone === 'London' ? -0.127 : -74.006;

    await prisma.node.create({
      data: {
        node_hash: 'NODE-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        name: `${zone} Edge-${i + 1}`,
        zone: zone,
        latitude: latBase + (Math.random() - 0.5) * 2,
        longitude: lngBase + (Math.random() - 0.5) * 2,
        capacity: Math.floor(Math.random() * 5000) + 500,
        utilization: Math.floor(Math.random() * 80) + '%',
        status: 'Active',
        tier: tiers[Math.floor(Math.random() * tiers.length)],
        os: osList[Math.floor(Math.random() * osList.length)],
        bandwidth: (Math.floor(Math.random() * 10) + 1) + ' Gbps',
        rental_rate: parseFloat((Math.random() * 10 + 1).toFixed(2)),
        serverModel: model,
        powerKW: parseFloat((Math.random() * 100 + 10).toFixed(1)),
        surfaceArea: parseFloat((Math.random() * 500 + 50).toFixed(1)),
        constructionYear: 2018 + Math.floor(Math.random() * 6),
        networkOperator: 'Tier 1 Carrier',
        country: 'Global',
        postcode: 'DATA-' + i,
        townCity: zone,
        address: `${Math.floor(Math.random() * 500)} Server Rd`,
        coolingSystem: Math.random() > 0.2,
        heatNetwork: Math.random() > 0.8,
        electricityGenerator: Math.random() > 0.3,
        uses: ['Cloud Services', 'Colocation'],
        securityFeatures: ['Firewall', 'IDS', 'CCTV'],
        owner_id: offerer.id
      }
    });
  }

  console.log('--- Population Complete ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
