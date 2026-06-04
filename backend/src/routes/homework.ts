import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { notDeleted } from "../lib/prisma.js";
import { authenticate, authorize, type AuthRequest } from "../middleware/auth.js";
import { notifyStudentsInClass } from "../services/notify.js";
import { paramId } from "../utils/params.js";

const router = Router();

const homeworkSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  subject: z.string().min(1),
  classLevel: z.string().min(1),
  dueDate: z.string(),
});

router.get("/", authenticate, async (req: AuthRequest, res) => {
  const user = req.user!;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 20);

  if (user.role === "STUDENT") {
    const student = await prisma.student.findFirst({
      where: { id: user.sub, ...notDeleted },
    });
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }
    const where = { classLevel: student.classLevel, deletedAt: null };
    const [items, total] = await Promise.all([
      prisma.homework.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { dueDate: "asc" },
        include: { teacher: { select: { name: true } } },
      }),
      prisma.homework.count({ where }),
    ]);
    res.json({ items, total, page, limit });
    return;
  }

  if (user.role === "TEACHER") {
    const where = { teacherId: user.sub, deletedAt: null };
    const [items, total] = await Promise.all([
      prisma.homework.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.homework.count({ where }),
    ]);
    res.json({ items, total, page, limit });
    return;
  }

  const classLevel = req.query.classLevel as string | undefined;
  const where = {
    deletedAt: null,
    ...(classLevel ? { classLevel } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.homework.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { teacher: { select: { name: true } } },
    }),
    prisma.homework.count({ where }),
  ]);
  res.json({ items, total, page, limit });
});

router.post(
  "/",
  authenticate,
  authorize("TEACHER", "ADMIN"),
  async (req: AuthRequest, res) => {
    const parsed = homeworkSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const data = parsed.data;
    const teacherId =
      req.user!.role === "TEACHER"
        ? req.user!.sub
        : (req.body.teacherId as string);
    if (!teacherId) {
      res.status(400).json({ error: "teacherId required for admin" });
      return;
    }

    const homework = await prisma.homework.create({
      data: {
        title: data.title,
        description: data.description,
        subject: data.subject,
        classLevel: data.classLevel,
        dueDate: new Date(data.dueDate),
        teacherId,
      },
    });

    await notifyStudentsInClass(
      data.classLevel,
      "New Homework",
      `${data.title} – due ${new Date(data.dueDate).toLocaleDateString()}`
    );

    res.status(201).json(homework);
  }
);

router.put(
  "/:id",
  authenticate,
  authorize("TEACHER", "ADMIN"),
  async (req: AuthRequest, res) => {
    const parsed = homeworkSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const existing = await prisma.homework.findFirst({
      where: { id: paramId(req), deletedAt: null },
    });
    if (!existing) {
      res.status(404).json({ error: "Homework not found" });
      return;
    }
    if (
      req.user!.role === "TEACHER" &&
      existing.teacherId !== req.user!.sub
    ) {
      res.status(403).json({ error: "Not your homework" });
      return;
    }
    const data = parsed.data;
    const homework = await prisma.homework.update({
      where: { id: paramId(req) },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
    });
    res.json(homework);
  }
);

router.delete(
  "/:id",
  authenticate,
  authorize("TEACHER", "ADMIN"),
  async (req: AuthRequest, res) => {
    const existing = await prisma.homework.findFirst({
      where: { id: paramId(req), deletedAt: null },
    });
    if (!existing) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if (
      req.user!.role === "TEACHER" &&
      existing.teacherId !== req.user!.sub
    ) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    await prisma.homework.update({
      where: { id: paramId(req) },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true });
  }
);

export default router;
