# Portable E-Commerce Machine

A **white-label Turborepo monorepo** with a **NestJS** API, **Next.js** customer storefront, **Next.js** admin panel, **Prisma** ORM (PostgreSQL), JWT authentication, and role-based access control.

> **Tip:** Run `bash scripts/rebrand.sh` to personalize this project with your business name.

## Project Structure

```
├── apps/
│   ├── api/            # NestJS REST API (port 3000)
│   ├── web/            # Next.js customer storefront (port 3001)
│   └── admin/          # Next.js admin panel (port 3002)
├── packages/
│   ├── config/         # Shared ESLint & TypeScript configs
│   ├── db/             # Prisma schema & client
│   └── ui/             # Shared UI components (Button, Input, Card)
├── scripts/
│   └── rebrand.sh      # White-label rebranding script
├── docker-compose.yml  # PostgreSQL for local dev
└── turbo.json          # Turborepo pipeline
```

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **Docker** & **Docker Compose** (for the database)

## Getting Started

### 1. Clone & install

```bash
git clone <repo-url> && cd portable-ecom-machine
npm install
```

### 2. Start the database

```bash
docker compose up -d
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env if you changed the Postgres credentials
```

### 4. Generate Prisma client & apply migrations

```bash
cd packages/db
npx prisma generate
npx prisma migrate dev --name init
cd ../..
```

### 5. Run all apps in development

```bash
npm run dev
```

This starts all three apps via Turborepo:

| App   | URL                    | Description               |
|-------|------------------------|---------------------------|
| API   | http://localhost:3000   | NestJS backend            |
| Web   | http://localhost:3001   | Customer storefront       |
| Admin | http://localhost:3002   | Admin management panel    |

### 6. Build for production

```bash
npm run build
```

## API Endpoints

### Authentication

| Method | Endpoint         | Auth   | Description         |
|--------|------------------|--------|---------------------|
| POST   | `/auth/register` | Public | Register a new user |
| POST   | `/auth/login`    | Public | Login, get JWT      |
| GET    | `/auth/me`       | JWT    | Get current profile |

### Products

| Method | Endpoint         | Auth  | Description                      |
|--------|------------------|-------|----------------------------------|
| GET    | `/products`      | Public| List products (filter/paginate)  |
| GET    | `/products/:id`  | Public| Get single product               |
| POST   | `/products`      | Admin | Create product                   |
| PUT    | `/products/:id`  | Admin | Update product                   |
| DELETE | `/products/:id`  | Admin | Delete product                   |

### Categories

| Method | Endpoint           | Auth  | Description       |
|--------|--------------------|-------|-------------------|
| GET    | `/categories`      | Public| List categories   |
| GET    | `/categories/:id`  | Public| Get category      |
| POST   | `/categories`      | Admin | Create category   |
| PUT    | `/categories/:id`  | Admin | Update category   |
| DELETE | `/categories/:id`  | Admin | Delete category   |

### Orders (Admin Only)

| Method | Endpoint              | Auth  | Description           |
|--------|-----------------------|-------|-----------------------|
| GET    | `/orders`             | Admin | List all orders       |
| GET    | `/orders/:id`         | Admin | Get order details     |
| PUT    | `/orders/:id/status`  | Admin | Update order status   |
| GET    | `/orders/stats`       | Admin | Dashboard statistics  |

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Backend**: NestJS + Passport + JWT + bcrypt
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **ORM**: Prisma
- **Database**: PostgreSQL
- **UI Library**: Shadcn/UI-based shared components
- **Monorepo**: Turborepo with npm workspaces

## White-Label Rebranding

```bash
bash scripts/rebrand.sh
```

The script will prompt for your business name and tagline, then automatically update all branding references across the codebase.
