# Anandibi — E-Commerce Backend

A Turborepo monorepo with a **NestJS** API, **Prisma** ORM (PostgreSQL), JWT authentication, and role-based access control.

## Project Structure

```
├── apps/
│   └── api/            # NestJS REST API
├── packages/
│   ├── config/         # Shared ESLint & TypeScript configs
│   └── db/             # Prisma schema & client
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
git clone <repo-url> && cd anandibi
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

### 5. Run the API

```bash
npm run dev
```

The API will be available at **http://localhost:3000**.

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

**Query parameters** for `GET /products`:

| Param        | Type   | Description                |
|--------------|--------|----------------------------|
| `search`     | string | Search name & description  |
| `categoryId` | string | Filter by category         |
| `minPrice`   | number | Minimum price              |
| `maxPrice`   | number | Maximum price              |
| `page`       | number | Page number (default: 1)   |
| `limit`      | number | Items per page (default: 10)|

### Categories

| Method | Endpoint           | Auth  | Description       |
|--------|--------------------|-------|-------------------|
| GET    | `/categories`      | Public| List categories   |
| GET    | `/categories/:id`  | Public| Get category      |
| POST   | `/categories`      | Admin | Create category   |
| PUT    | `/categories/:id`  | Admin | Update category   |
| DELETE | `/categories/:id`  | Admin | Delete category   |

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: NestJS
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: Passport + JWT + bcrypt
- **Monorepo**: Turborepo with npm workspaces
