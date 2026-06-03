import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { notDeleted } from "../lib/prisma.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, authorize("ADMIN"), async (req, res) => {
  const q = ((req.query.q as string) || "").trim();
  if (q.length < 2) {
    res.json({ students: [], teachers: [], homework: [], notices: [] });
    return;
  }

  const [students, teachers, homework, notices] = await Promise.all([
    prisma.student.findMany({
      where: {
        ...notDeleted,
        OR: [
          { studentName: { contains: q, mode: "insensitive" } },
          { username: { contains: q, mode: "insensitive" } },
          { mobile: { contains: q } },
        ],
      },
      take: 10,
      select: { id: true, studentName: true, classLevel: true, username: true },
    }),
    prisma.teacher.findMany({
      where: {
        ...notDeleted,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { subject: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
      select: { id: true, name: true, subject: true },
    }),
    prisma.homework.findMany({
      where: {
        deletedAt: null,
        title: { contains: q, mode: "insensitive" },
      },
      take: 10,
      select: { id: true, title: true, classLevel: true },
    }),
    prisma.notice.findMany({
      where: {
        deletedAt: null,
        title: { contains: q, mode: "insensitive" },
      },
      take: 10,
      select: { id: true, title: true },
    }),
  ]);

  res.json({ students, teachers, homework, notices });
});

export default router;
