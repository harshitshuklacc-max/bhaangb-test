import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import { prisma } from "../lib/prisma.js";
import { notDeleted } from "../lib/prisma.js";
import { authenticate, authorize, type AuthRequest } from "../middleware/auth.js";
import { hashPassword } from "../utils/password.js";
import {
  generateTeacherUsername,
  generateLoginPassword,
} from "../utils/credentials.js";
import { softDelete } from "../utils/softDelete.js";
import { logAudit } from "../services/audit.js";
import { uploadImage } from "../services/cloudinary.js";
import { sendCredentialsEmail } from "../services/email.js";
import { paramId } from "../utils/params.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

const teacherSchema = z.object({
  name: z.string().min(1),
  mobile: z.string().min(10),
  email: z.string().email(),
  qualification: z.string().min(1),
  subject: z.string().min(1),
  address: z.string().min(1),
  joiningDate: z.string(),
});

router.get("/", authenticate, authorize("ADMIN"), async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const search = (req.query.search as string) || "";

  const where = {
    ...notDeleted,
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { subject: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.teacher.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        name: true,
        subject: true,
        mobile: true,
        email: true,
        joiningDate: true,
        photoUrl: true,
      },
    }),
    prisma.teacher.count({ where }),
  ]);

  res.json({ items, total, page, limit });
});

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  upload.single("photo"),
  async (req: AuthRequest, res) => {
    const parsed = teacherSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const data = parsed.data;
    const plainPassword = generateLoginPassword();
    const username = await generateTeacherUsername();
    const passwordHash = await hashPassword(plainPassword);

    let photoUrl: string | null = null;
    if (req.file) {
      photoUrl = await uploadImage(req.file, "teachers");
    }

    const teacher = await prisma.teacher.create({
      data: {
        username,
        passwordHash,
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        qualification: data.qualification,
        subject: data.subject,
        address: data.address,
        joiningDate: new Date(data.joiningDate),
        photoUrl,
      },
    });

    await logAudit({
      adminId: req.user!.sub,
      action: "CREATE",
      entity: "Teacher",
      entityId: teacher.id,
    });

    res.status(201).json({
      teacher: {
        id: teacher.id,
        username,
        name: teacher.name,
        subject: teacher.subject,
      },
      credentials: { username, password: plainPassword },
    });
  }
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  upload.single("photo"),
  async (req: AuthRequest, res) => {
    const parsed = teacherSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const existing = await prisma.teacher.findFirst({
      where: { id: paramId(req), ...notDeleted },
    });
    if (!existing) {
      res.status(404).json({ error: "Teacher not found" });
      return;
    }

    let photoUrl = existing.photoUrl;
    if (req.file) {
      const uploaded = await uploadImage(req.file, "teachers");
      if (uploaded) photoUrl = uploaded;
    }

    const data = parsed.data;
    const teacher = await prisma.teacher.update({
      where: { id: paramId(req) },
      data: {
        ...data,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
        photoUrl,
      },
    });

    const { passwordHash: _, ...rest } = teacher;
    res.json(rest);
  }
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  async (req: AuthRequest, res) => {
    const teacher = await prisma.teacher.findFirst({
      where: { id: paramId(req), ...notDeleted },
    });
    if (!teacher) {
      res.status(404).json({ error: "Teacher not found" });
      return;
    }
    await prisma.teacher.update({
      where: { id: teacher.id },
      data: { deletedAt: new Date() },
    });
    await softDelete("Teacher", teacher.id, teacher as unknown as Record<string, unknown>);
    res.json({ success: true });
  }
);

router.post(
  "/:id/send-credentials",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    const { password } = req.body as { password: string };
    const teacher = await prisma.teacher.findFirst({
      where: { id: paramId(req), ...notDeleted },
    });
    if (!teacher) {
      res.status(404).json({ error: "Teacher not found" });
      return;
    }
    const sent = await sendCredentialsEmail({
      to: teacher.email,
      name: teacher.name,
      username: teacher.username,
      password,
      role: "Teacher",
    });
    res.json({ sent });
  }
);

export default router;
