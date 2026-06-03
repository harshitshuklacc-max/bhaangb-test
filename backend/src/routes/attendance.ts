import { Router } from "express";
import { z } from "zod";
import { AttendanceStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { notDeleted } from "../lib/prisma.js";
import { authenticate, authorize, type AuthRequest } from "../middleware/auth.js";

const router = Router();

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
}

router.get(
  "/calendar",
  authenticate,
  async (req: AuthRequest, res) => {
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = Number(req.query.month) || new Date().getMonth() + 1;
    const base = new Date(year, month - 1, 1);
    const from = startOfMonth(base);
    const to = endOfMonth(base);

    const user = req.user!;

    if (user.role === "STUDENT") {
      const records = await prisma.attendance.findMany({
        where: {
          studentId: user.sub,
          date: { gte: from, lte: to },
          deletedAt: null,
        },
      });
      res.json({ records });
      return;
    }

    if (user.role === "TEACHER") {
      const records = await prisma.attendance.findMany({
        where: {
          teacherId: user.sub,
          date: { gte: from, lte: to },
          deletedAt: null,
        },
      });
      res.json({ records });
      return;
    }

    const studentId = req.query.studentId as string | undefined;
    const teacherId = req.query.teacherId as string | undefined;
    const records = await prisma.attendance.findMany({
      where: {
        ...(studentId ? { studentId } : {}),
        ...(teacherId ? { teacherId } : {}),
        date: { gte: from, lte: to },
        deletedAt: null,
      },
      include: {
        student: { select: { studentName: true, classLevel: true } },
        teacher: { select: { name: true } },
      },
    });
    res.json({ records });
  }
);

router.post(
  "/teacher/self",
  authenticate,
  authorize("TEACHER"),
  async (req: AuthRequest, res) => {
    const schema = z.object({
      date: z.string(),
      status: z.enum(["PRESENT", "ABSENT"]),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload" });
      return;
    }
    const date = new Date(parsed.data.date);
    date.setHours(0, 0, 0, 0);
    const status =
      parsed.data.status === "PRESENT"
        ? AttendanceStatus.PRESENT
        : AttendanceStatus.ABSENT;

    const record = await prisma.attendance.upsert({
      where: {
        teacherId_date: { teacherId: req.user!.sub, date },
      },
      create: {
        teacherId: req.user!.sub,
        date,
        status,
        markedBy: "TEACHER",
      },
      update: { status },
    });
    res.json(record);
  }
);

router.post(
  "/student/self",
  authenticate,
  authorize("STUDENT"),
  async (req: AuthRequest, res) => {
    const schema = z.object({
      date: z.string(),
      status: z.enum(["PRESENT", "ABSENT"]),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload" });
      return;
    }
    const date = new Date(parsed.data.date);
    date.setHours(0, 0, 0, 0);
    const status =
      parsed.data.status === "PRESENT"
        ? AttendanceStatus.PRESENT
        : AttendanceStatus.ABSENT;

    const record = await prisma.attendance.upsert({
      where: {
        studentId_date: { studentId: req.user!.sub, date },
      },
      create: {
        studentId: req.user!.sub,
        date,
        status,
        markedBy: "STUDENT",
      },
      update: { status },
    });
    res.json(record);
  }
);

router.get(
  "/reports/daily",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    const dateStr = (req.query.date as string) || new Date().toISOString();
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const next = new Date(date);
    next.setDate(next.getDate() + 1);

    const records = await prisma.attendance.findMany({
      where: { date: { gte: date, lt: next }, deletedAt: null },
      include: {
        student: { select: { studentName: true, classLevel: true } },
        teacher: { select: { name: true } },
      },
    });
    res.json({ records });
  }
);

router.get(
  "/reports/monthly",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = Number(req.query.month) || new Date().getMonth() + 1;
    const from = new Date(year, month - 1, 1);
    const to = endOfMonth(from);

    const records = await prisma.attendance.findMany({
      where: { date: { gte: from, lte: to }, deletedAt: null },
      include: {
        student: { select: { studentName: true, classLevel: true } },
        teacher: { select: { name: true } },
      },
    });
    res.json({ records });
  }
);

export default router;
