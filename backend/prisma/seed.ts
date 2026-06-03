import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME ?? "smartstep05618";
  const password = process.env.ADMIN_PASSWORD ?? "Smartedhub123";

  const existing = await prisma.admin.findUnique({ where: { username } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.admin.create({
      data: {
        username,
        passwordHash,
        name: "Smart Step Administrator",
        email: "admin@smartstepacademy.in",
      },
    });
    console.log(`Admin created: ${username}`);
  } else {
    console.log(`Admin already exists: ${username}`);
  }

  await prisma.counter.upsert({
    where: { id: "student" },
    create: { id: "student", value: 1000 },
    update: {},
  });
  await prisma.counter.upsert({
    where: { id: "teacher" },
    create: { id: "teacher", value: 1000 },
    update: {},
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
