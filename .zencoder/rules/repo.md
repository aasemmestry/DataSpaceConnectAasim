---
description: Repository Information Overview
alwaysApply: true
---

# DataSpaceConnect Monorepo Information

## Summary
**DataSpaceConnect** is a B2B monorepo platform connecting Datacenter owners (**Offerers**) with resource seekers (**Seekers**). It uses an **Express/PostgreSQL** backend with **Prisma ORM** and a **React 19** frontend with **Capacitor** for iOS.

## Structure
The project uses **NPM Workspaces** with the following packages:
- **packages/api**: Node.js/Express backend with Prisma.
- **packages/web**: React 19 frontend with Vite, Tailwind CSS, and Leaflet.js.
- **packages/common**: Shared TypeScript types and Zod validation schemas.

## Projects

### Backend (@dataspace/api)
**Configuration File**: [./packages/api/package.json](./packages/api/package.json)

#### Language & Runtime
**Language**: TypeScript  
**Runtime**: Node.js  
**Framework**: Express.js  
**ORM**: Prisma  
**Database**: PostgreSQL

#### Key Features
- **Auth System**: Bcrypt hashing, JWT (HTTP-only cookies), Refresh Tokens.
- **Discovery API**: Geospatial search for datacenters.
- **Offerer Stats**: Analytics for datacenter capacity and status.
- **Datacenter Profile**: Detailed technical specifications and contact endpoints.

---

### Frontend (@dataspace/web)
**Configuration File**: [./packages/web/package.json](./packages/web/package.json)

#### Language & Runtime
**Language**: TypeScript (React 19)  
**Build Tool**: Vite  
**State Management**: Redux Toolkit  
**Form Handling**: React Hook Form + Zod

#### Key Features
- **Discovery Map**: Leaflet.js integration with real-time filtering for power and hardware.
- **Offerer Dashboard**: Analytics overview and site management.
- **Datacenter Detail View**: Comprehensive technical profile with contact request functionality.
- **B2B Auth**: Multi-role registration with company identification.

#### Capacitor & iOS Configuration
**App ID**: `com.dev.dataspaceconnect`
**iOS Path**: [./packages/web/ios/](./packages/web/ios/)

---

### Common (@dataspace/common)
**Configuration File**: [./packages/common/package.json](./packages/common/package.json)
Contains shared Zod schemas (e.g., `registerSchema`) and TypeScript interfaces used across both API and Web packages.

## Build & Installation
```bash
# Install all dependencies
npm install

# Run backend
cd packages/api && npm run dev

# Run frontend
cd packages/web && npm run dev
```
