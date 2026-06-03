import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.post("/", async (req, res) => {
  const schema = z.object({
    studentName: z.string().min(1),
    parentName: z.string().min(1),
    mobile: z.string().min(10),
    email: z.string().email().optional().or(z.literal("")),
    classLevel: z.string().min(1),
    message: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const inquiry = await prisma.admissionInquiry.create({
    data: {
      ...parsed.data,
      email: parsed.data.email || null,
    },
  });
  res.status(201).json({ success: true, id: inquiry.id });
});

router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  async (_req, res) => {
    const items = await prisma.admissionInquiry.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
    res.json({ items });
  }
);

export default router;
