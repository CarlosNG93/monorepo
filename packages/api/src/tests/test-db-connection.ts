import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log("Conexión a la base de datos exitosa!");

    const users = await prisma.user.findMany();
    console.log("Usuarios en la base de datos:", users);
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
