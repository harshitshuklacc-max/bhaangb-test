import { prisma } from "../lib/prisma.js";
import type { Server as SocketServer } from "socket.io";

let io: SocketServer | null = null;

export function setSocketServer(server: SocketServer): void {
  io = server;
}

export async function notifyStudentsInClass(
  classLevel: string,
  title: string,
  message: string
): Promise<void> {
  const students = await prisma.student.findMany({
    where: { classLevel, deletedAt: null },
    select: { id: true },
  });
  if (students.length === 0) return;

  await prisma.notification.createMany({
    data: students.map((s) => ({
      studentId: s.id,
      title,
      message,
    })),
  });

  for (const s of students) {
    io?.to(`student:${s.id}`).emit("notification", { title, message });
  }
}

export async function notifyTeacher(
  teacherId: string,
  title: string,
  message: string
): Promise<void> {
  await prisma.notification.create({
    data: { teacherId, title, message },
  });
  io?.to(`teacher:${teacherId}`).emit("notification", { title, message });
}

export async function notifyAllStudents(
  title: string,
  message: string
): Promise<void> {
  const students = await prisma.student.findMany({
    where: { deletedAt: null },
    select: { id: true },
  });
  if (students.length === 0) return;
  await prisma.notification.createMany({
    data: students.map((s) => ({ studentId: s.id, title, message })),
  });
  io?.emit("broadcast:students", { title, message });
}

export async function notifyAllTeachers(
  title: string,
  message: string
): Promise<void> {
  const teachers = await prisma.teacher.findMany({
    where: { deletedAt: null },
    select: { id: true },
  });
  if (teachers.length === 0) return;
  await prisma.notification.createMany({
    data: teachers.map((t) => ({ teacherId: t.id, title, message })),
  });
  io?.emit("broadcast:teachers", { title, message });
}
