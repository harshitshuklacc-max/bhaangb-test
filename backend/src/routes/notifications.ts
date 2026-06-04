import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { paramId } from "../utils/params.js";

const router = Router();

router.get("/", authenticate, async (req: AuthRequest, res) => {
  const user = req.user!;
  const where =
    user.role === "STUDENT"
      ? { studentId: user.sub, deletedAt: null }
      : user.role === "TEACHER"
        ? { teacherId: user.sub, deletedAt: null }
        : { deletedAt: null };

  const items = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json({ items });
});

router.patch("/:id/read", authenticate, async (req, res) => {
  await prisma.notification.update({
    where: { id: paramId(req) },
    data: { read: true },
  });
  res.json({ success: true });
});

export default router;
