"use strict";

const prismaClient = require("@prisma/client");
const { PrismaClient } = prismaClient;

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

module.exports = { ...prismaClient, prisma };
module.exports.default = prisma;
