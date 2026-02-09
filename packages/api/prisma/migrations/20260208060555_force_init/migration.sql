-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OFFERER', 'SEEKER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phoneNumber" TEXT,
    "country" TEXT,
    "accountType" TEXT DEFAULT 'seeker',
    "entityType" TEXT,
    "companyName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'SEEKER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Node" (
    "id" SERIAL NOT NULL,
    "node_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "capacity" INTEGER NOT NULL,
    "utilization" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "tier" TEXT,
    "os" TEXT,
    "bandwidth" TEXT,
    "rental_rate" DOUBLE PRECISION NOT NULL,
    "serverModel" TEXT,
    "powerKW" DOUBLE PRECISION,
    "surfaceArea" DOUBLE PRECISION,
    "constructionYear" INTEGER,
    "networkOperator" TEXT,
    "image_url" TEXT DEFAULT 'https://images.unsplash.com/photo-1558494949-efc535b5c4c1?q=80&w=1000&auto=format&fit=crop',
    "country" TEXT,
    "postcode" TEXT,
    "townCity" TEXT,
    "address" TEXT,
    "additionalAddress" TEXT,
    "coolingSystem" BOOLEAN NOT NULL DEFAULT false,
    "heatNetwork" BOOLEAN NOT NULL DEFAULT false,
    "electricityGenerator" BOOLEAN NOT NULL DEFAULT false,
    "uses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "securityFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "node_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Node_node_hash_key" ON "Node"("node_hash");

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_node_id_fkey" FOREIGN KEY ("node_id") REFERENCES "Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
