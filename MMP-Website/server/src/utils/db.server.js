// Utility file to create a singleton instance of PrismaClient

import { PrismaClient } from "@prisma/client";

// Typescript way
// let db: PrismaClient;

// declare global {
//   var __db: PrismaClient | undefined;
// }

let db;

if (!global.__db) {
    global.__db = new PrismaClient();
}

db = global.__db;

export { db };
