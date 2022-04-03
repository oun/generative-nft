import { PrismaClient } from "@prisma/client";

declare global {
  interface Window {
    ethereum: any;
  }

  var prisma: PrismaClient;
}

export {};
