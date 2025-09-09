/*
  This file creates a Prisma Client and attaches it to the global object
  so that only one instance of the client is created in your application.
  This helps resolve issues with hot reloading that can occur when using
  Prisma ORM with Next.js in development mode.

  https://www.prisma.io/docs/guides/nextjs
*/

import { PrismaClient } from "../app/generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = global as unknown as {
    prisma: PrismaClient
}

const prisma = globalForPrisma.prisma || new PrismaClient().$extends(withAccelerate());

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;