import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; // Import bcrypt for hashing

const prisma = new PrismaClient();

async function main() {
  console.log('🇫🇷 Starting French Infrastructure Deployment...');

  // 1. Hash the password so the login system can read it
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 2. Create or Update the Provider Account
  // We use "upsert" to fix the password if the user already exists
  const provider = await prisma.user.upsert({
    where: { email: 'france.admin@dataspace.com' },
    update: {
      password: hashedPassword // <--- THIS FIXES YOUR LOGIN
    },
    create: {
      email: 'france.admin@dataspace.com',
      password: hashedPassword, // <--- SAVES HASHED PASSWORD
      fullName: 'Pierre Dubois',
      companyName: 'France Connect Infrastructure',
      role: 'OFFERER',
      country: 'France',
      phoneNumber: '+33 1 23 45 67 89',
      accountType: 'Enterprise',
      entityType: 'Corporation'
    },
  });

  console.log(`👤 Using Provider: ${provider.companyName} (${provider.id})`);

  // 3. Define the 5 Resources
  const nodes = [
    {
      name: "PARIS-CORE-ELLIPSE",
      zone: "Paris, Île-de-France",
      node_hash: "NODE-PAR-7742",
      latitude: 48.8566,
      longitude: 2.3522,
      capacity: 5000,
      rental_rate: 125.50,
      powerKW: 2500,
      surfaceArea: 1500,
      serverModel: "Dell PowerEdge R750xs - AI Cluster",
      constructionYear: 2024,
      networkOperator: "Orange Business",
      status: "Active",
      country: "France",
      townCity: "Paris",
      postcode: "75001",
      address: "12 Rue de la Data",
      coolingSystem: true,
      heatNetwork: true,
      electricityGenerator: true,
      uses: ["AI & Machine Learning", "High Performance Computing"],
      securityFeatures: ["Biometric Access", "24/7 On-site Security", "CCTV", "Mantrap"],
      image_url: "https://images.unsplash.com/photo-1558494949-efc535b5c4c1?q=80&w=1000&auto=format&fit=crop"
    },
    {
      name: "MARSEILLE-SUBSEA-GATEWAY",
      zone: "Marseille, PACA",
      node_hash: "NODE-MRS-9921",
      latitude: 43.2965,
      longitude: 5.3698,
      capacity: 8000,
      rental_rate: 95.00,
      powerKW: 4000,
      surfaceArea: 2200,
      serverModel: "HPE ProLiant DL380 Gen11",
      constructionYear: 2023,
      networkOperator: "Interxion",
      status: "Active",
      country: "France",
      townCity: "Marseille",
      postcode: "13002",
      address: "Port of Marseille, Dock 4",
      coolingSystem: true,
      heatNetwork: false,
      electricityGenerator: true,
      uses: ["Colocation", "Cloud Services", "Content Delivery"],
      securityFeatures: ["Perimeter Fencing", "CCTV", "Armed Guard"],
      image_url: "https://images.unsplash.com/photo-1563770095-39d468f9a51d?q=80&w=1000&auto=format&fit=crop"
    },
    {
      name: "LYON-BIO-RESEARCH-HUB",
      zone: "Lyon, Auvergne-Rhône-Alpes",
      node_hash: "NODE-LYO-3310",
      latitude: 45.7640,
      longitude: 4.8357,
      capacity: 2048,
      rental_rate: 65.75,
      powerKW: 800,
      surfaceArea: 600,
      serverModel: "Lenovo ThinkSystem SR650",
      constructionYear: 2021,
      networkOperator: "SFR Business",
      status: "Active",
      country: "France",
      townCity: "Lyon",
      postcode: "69003",
      address: "Part-Dieu Technology Park",
      coolingSystem: true,
      heatNetwork: true,
      electricityGenerator: false,
      uses: ["Big Data", "Scientific Research"],
      securityFeatures: ["Card Access", "CCTV"],
      image_url: "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?q=80&w=1000&auto=format&fit=crop"
    },
    {
      name: "TOULOUSE-AEROSPACE-DATA",
      zone: "Toulouse, Occitanie",
      node_hash: "NODE-TLS-8812",
      latitude: 43.6047,
      longitude: 1.4442,
      capacity: 3500,
      rental_rate: 78.20,
      powerKW: 1200,
      surfaceArea: 950,
      serverModel: "Cisco UCS C240 M6",
      constructionYear: 2025,
      networkOperator: "Airbus Defence Net",
      status: "Active",
      country: "France",
      townCity: "Toulouse",
      postcode: "31000",
      address: "Aerospace Valley Blvd",
      coolingSystem: true,
      heatNetwork: false,
      electricityGenerator: true,
      uses: ["High Performance Computing", "Simulation"],
      securityFeatures: ["Biometric Access", "ISO 27001 Certified"],
      image_url: "https://images.unsplash.com/photo-1544197150-b99a580bb7f8?q=80&w=1000&auto=format&fit=crop"
    },
    {
      name: "BORDEAUX-GREEN-VAULT",
      zone: "Bordeaux, Nouvelle-Aquitaine",
      node_hash: "NODE-BOD-1102",
      latitude: 44.8378,
      longitude: -0.5792,
      capacity: 1024,
      rental_rate: 45.00,
      powerKW: 300,
      surfaceArea: 400,
      serverModel: "Dell PowerEdge R650",
      constructionYear: 2022,
      networkOperator: "Bouygues Telecom",
      status: "Active",
      country: "France",
      townCity: "Bordeaux",
      postcode: "33000",
      address: "Eco-Quartier Ginko",
      coolingSystem: false, // Passive cooling
      heatNetwork: true, // Exports heat to local homes
      electricityGenerator: true,
      uses: ["Web Hosting", "Green Cloud"],
      securityFeatures: ["CCTV", "Remote Monitoring"],
      image_url: "https://images.unsplash.com/photo-1551703599-6b3e8379aa8c?q=80&w=1000&auto=format&fit=crop"
    }
  ];

  // 4. Loop and Create
  for (const node of nodes) {
    const exists = await prisma.node.findUnique({
      where: { node_hash: node.node_hash }
    });

    if (!exists) {
      await prisma.node.create({
        data: {
          ...node,
          owner_id: provider.id,
          utilization: "0%"
        }
      });
      console.log(`✅ Created: ${node.name}`);
    } else {
      console.log(`⚠️ Skipped (Exists): ${node.name}`);
    }
  }

  console.log('🎉 France Population Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });