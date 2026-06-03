import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { notDeleted } from "../lib/prisma.js";
import { authenticate, authorize, type AuthRequest } from "../middleware/auth.js";
import { notifyStudentsInClass } from "../services/notify.js";

const router = Router();

const testSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  classLevel: z.string().min(1),
  testDate: z.string(),
  testTime: z.string(),
  totalMarks: z.number().int().positive(),
});

router.get("/", authenticate, async (req: AuthRequest, res) => {
  const user = req.user!;

  if (user.role === "STUDENT") {
    const student = await prisma.student.findFirst({
      where: { id: user.sub, ...notDeleted },
    });
    if (!student) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const items = await prisma.test.findMany({
      where: { classLevel: student.classLevel, deletedAt: null },
      orderBy: { testDate: "asc" },
    });
    res.json({ items });
    return;
  }

  if (user.role === "TEACHER") {
    const items = await prisma.test.findMany({
      where: { teacherId: user.sub, deletedAt: null },
      orderBy: { testDate: "asc" },
    });
    res.json({ items });
    return;
  }

  const items = await prisma.test.findMany({
    where: { deletedAt: null },
    orderBy: { testDate: "asc" },
    include: { teacher: { select: { name: true } } },
  });
  res.json({ items });
});

router.post(
  "/",
  authenticate,
  authorize("TEACHER", "ADMIN"),
  async (req: AuthRequest, res) => {
    const parsed = testSchema.safeParse({
      ...req.body,
      totalMarks: Number(req.body.totalMarks),
    });
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const data = parsed.data;
    const teacherId =
      req.user!.role === "TEACHER" ? req.user!.sub : (req.body.teacherId as string);

    const test = await prisma.test.create({
      data: {
        name: data.name,
        subject: data.subject,
        classLevel: data.classLevel,
        testDate: new Date(data.testDate),
        testTime: data.testTime,
        totalMarks: data.totalMarks,
        teacherId: teacherId || null,
      },
    });

    await notifyStudentsInClass(
      data.classLevel,
      "Test Scheduled",
      `${data.name} on ${new Date(data.testDate).toLocaleDateString()} at ${data.testTime}`
    );

    res.status(201).json(test);
  }
);

router.post(
  "/:id/results",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  async (req, res) => {
    const schema = z.object({
      results: z.array(
        z.object({
          studentId: z.string(),
          marks: z.number().int().optional(),
          remarks: z.string().optional(),
        })
      ),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload" });
      return;
    }
    const testId = req.params.id;
    for (const r of parsed.data.results) {
      await prisma.testResult.upsert({
        where: {
          testId_studentId: { testId, studentId: r.studentId },
        },
        create: {
          testId,
          studentId: r.studentId,
          marks: r.marks,
          remarks: r.remarks,
        },
        update: { marks: r.marks, remarks: r.remarks },
      });
    }
    res.json({ success: true });
  }
);

router.get(
  "/:id/results",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  async (req, res) => {
    const results = await prisma.testResult.findMany({
      where: { testId: req.params.id, deletedAt: null },
      include: {
        student: { select: { studentName: true, classLevel: true } },
      },
    });
    res.json({ results });
  }
);

export default router;
