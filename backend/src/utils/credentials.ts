import { prisma } from "../lib/prisma.js";
import { generateSecurePassword } from "./password.js";

async function nextCounter(key: string, prefix: string): Promise<string> {
  const counter = await prisma.counter.upsert({
    where: { id: key },
    create: { id: key, value: 1001 },
    update: { value: { increment: 1 } },
  });
  return `${prefix}-${counter.value}`;
}

export async function generateStudentUsername(): Promise<string> {
  return nextCounter("student", "SSA-STU");
}

export async function generateTeacherUsername(): Promise<string> {
  return nextCounter("teacher", "SSA-TEA");
}

export function generateLoginPassword(): string {
  return generateSecurePassword(14);
}
