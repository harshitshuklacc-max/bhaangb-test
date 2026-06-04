import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import { prisma } from "../lib/prisma.js";
import { authenticate, authorize, type AuthRequest } from "../middleware/auth.js";
import { uploadImage } from "../services/cloudinary.js";
import { paramId } from "../utils/params.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    const status = req.query.status as string | undefined;
    const items = await prisma.leaveRequest.findMany({
      where: {
        deletedAt: null,
        ...(status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : {}),
      },
      include: { teacher: { select: { name: true, subject: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ items });
  }
);

router.get(
  "/my",
  authenticate,
  authorize("TEACHER"),
  async (req: AuthRequest, res) => {
    const items = await prisma.leaveRequest.findMany({
      where: { teacherId: req.user!.sub, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
    res.json({ items });
  }
);

router.post(
  "/",
  authenticate,
  authorize("TEACHER"),
  upload.single("attachment"),
  async (req: AuthRequest, res) => {
    const schema = z.object({
      startDate: z.string(),
      endDate: z.string(),
      reason: z.string().min(1),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    let attachmentUrl: string | null = null;
    if (req.file) {
      attachmentUrl = await uploadImage(req.file, "leave");
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        teacherId: req.user!.sub,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        reason: parsed.data.reason,
        attachmentUrl,
      },
    });
    res.status(201).json(leave);
  }
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    const schema = z.object({
      status: z.enum(["APPROVED", "REJECTED"]),
      adminNotes: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload" });
      return;
    }
    const leave = await prisma.leaveRequest.update({
      where: { id: paramId(req) },
      data: {
        status: parsed.data.status,
        adminNotes: parsed.data.adminNotes,
      },
    });
    res.json(leave);
  }
);

export default router;
