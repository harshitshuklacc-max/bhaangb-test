import { Router } from "express";
import { z } from "zod";
import { NoticeAudience } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { authenticate, authorize, type AuthRequest } from "../middleware/auth.js";
import {
  notifyAllStudents,
  notifyAllTeachers,
  notifyStudentsInClass,
} from "../services/notify.js";

const router = Router();

router.get("/", authenticate, async (req: AuthRequest, res) => {
  const user = req.user!;

  if (user.role === "TEACHER") {
    const items = await prisma.notice.findMany({
      where: {
        deletedAt: null,
        audience: "TEACHERS",
      },
      orderBy: { publishedAt: "desc" },
    });
    res.json({ items });
    return;
  }

  if (user.role === "STUDENT") {
    const student = await prisma.student.findFirst({
      where: { id: user.sub, deletedAt: null },
    });
    if (!student) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const items = await prisma.notice.findMany({
      where: {
        deletedAt: null,
        OR: [
          { audience: "ALL_STUDENTS" },
          { audience: "CLASS_WISE", classLevel: student.classLevel },
        ],
      },
      orderBy: { publishedAt: "desc" },
    });
    res.json({ items });
    return;
  }

  const items = await prisma.notice.findMany({
    where: { deletedAt: null },
    orderBy: { publishedAt: "desc" },
  });
  res.json({ items });
});

router.post("/", authenticate, authorize("ADMIN"), async (req, res) => {
  const schema = z.object({
    title: z.string(),
    content: z.string(),
    audience: z.nativeEnum(NoticeAudience),
    classLevel: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const data = parsed.data;
  if (data.audience === "CLASS_WISE" && !data.classLevel) {
    res.status(400).json({ error: "classLevel required" });
    return;
  }

  const notice = await prisma.notice.create({ data });

  if (data.audience === "ALL_STUDENTS") {
    await notifyAllStudents(data.title, data.content);
  } else if (data.audience === "CLASS_WISE" && data.classLevel) {
    await notifyStudentsInClass(data.classLevel, data.title, data.content);
  } else if (data.audience === "TEACHERS") {
    await notifyAllTeachers(data.title, data.content);
  }

  res.status(201).json(notice);
});

export default router;
