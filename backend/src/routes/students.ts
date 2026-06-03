import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import { prisma } from "../lib/prisma.js";
import { notDeleted } from "../lib/prisma.js";
import { authenticate, authorize, type AuthRequest } from "../middleware/auth.js";
import { hashPassword } from "../utils/password.js";
import {
  generateStudentUsername,
  generateLoginPassword,
} from "../utils/credentials.js";
import { softDelete } from "../utils/softDelete.js";
import { logAudit } from "../services/audit.js";
import { uploadImage } from "../services/cloudinary.js";
import { sendCredentialsEmail } from "../services/email.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

const studentSchema = z.object({
  studentName: z.string().min(1),
  fatherName: z.string().min(1),
  motherName: z.string().min(1),
  mobile: z.string().min(10),
  alternateMobile: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  classLevel: z.string().min(1),
  schoolName: z.string().min(1),
  address: z.string().min(1),
  admissionDate: z.string(),
});

router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const search = (req.query.search as string) || "";
    const classLevel = req.query.classLevel as string | undefined;

    const where = {
      ...notDeleted,
      ...(classLevel ? { classLevel } : {}),
      ...(search
        ? {
            OR: [
              { studentName: { contains: search, mode: "insensitive" as const } },
              { mobile: { contains: search } },
              { username: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          username: true,
          studentName: true,
          classLevel: true,
          mobile: true,
          email: true,
          admissionDate: true,
          photoUrl: true,
        },
      }),
      prisma.student.count({ where }),
    ]);

    res.json({ items, total, page, limit });
  }
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    const student = await prisma.student.findFirst({
      where: { id: req.params.id, ...notDeleted },
    });
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }
    const { passwordHash: _, ...rest } = student;
    res.json(rest);
  }
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  upload.single("photo"),
  async (req: AuthRequest, res) => {
    const parsed = studentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const data = parsed.data;
    const plainPassword = generateLoginPassword();
    const username = await generateStudentUsername();
    const passwordHash = await hashPassword(plainPassword);

    let photoUrl: string | null = null;
    if (req.file) {
      photoUrl = await uploadImage(req.file, "students");
    }

    const student = await prisma.student.create({
      data: {
        username,
        passwordHash,
        studentName: data.studentName,
        fatherName: data.fatherName,
        motherName: data.motherName,
        mobile: data.mobile,
        alternateMobile: data.alternateMobile || null,
        email: data.email || null,
        classLevel: data.classLevel,
        schoolName: data.schoolName,
        address: data.address,
        admissionDate: new Date(data.admissionDate),
        photoUrl,
      },
    });

    await logAudit({
      adminId: req.user!.sub,
      action: "CREATE",
      entity: "Student",
      entityId: student.id,
      ipAddress: req.ip,
    });

    res.status(201).json({
      student: {
        id: student.id,
        username,
        studentName: student.studentName,
        classLevel: student.classLevel,
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
    const parsed = studentSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const existing = await prisma.student.findFirst({
      where: { id: req.params.id, ...notDeleted },
    });
    if (!existing) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    let photoUrl = existing.photoUrl;
    if (req.file) {
      const uploaded = await uploadImage(req.file, "students");
      if (uploaded) photoUrl = uploaded;
    }

    const data = parsed.data;
    const student = await prisma.student.update({
      where: { id: req.params.id },
      data: {
        ...data,
        email: data.email === "" ? null : data.email,
        admissionDate: data.admissionDate
          ? new Date(data.admissionDate)
          : undefined,
        photoUrl,
      },
    });

    await logAudit({
      adminId: req.user!.sub,
      action: "UPDATE",
      entity: "Student",
      entityId: student.id,
    });

    const { passwordHash: _, ...rest } = student;
    res.json(rest);
  }
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  async (req: AuthRequest, res) => {
    const student = await prisma.student.findFirst({
      where: { id: req.params.id, ...notDeleted },
    });
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }
    await prisma.student.update({
      where: { id: student.id },
      data: { deletedAt: new Date() },
    });
    await softDelete("Student", student.id, student as unknown as Record<string, unknown>);
    await logAudit({
      adminId: req.user!.sub,
      action: "ARCHIVE",
      entity: "Student",
      entityId: student.id,
    });
    res.json({ success: true });
  }
);

router.post(
  "/:id/send-credentials",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    const { password, email } = req.body as { password: string; email?: string };
    const student = await prisma.student.findFirst({
      where: { id: req.params.id, ...notDeleted },
    });
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }
    const to = email || student.email;
    if (!to) {
      res.status(400).json({ error: "Email required" });
      return;
    }
    const sent = await sendCredentialsEmail({
      to,
      name: student.studentName,
      username: student.username,
      password,
      role: "Student",
    });
    res.json({ sent });
  }
);

router.post(
  "/:id/reset-password",
  authenticate,
  authorize("ADMIN"),
  async (req: AuthRequest, res) => {
    const student = await prisma.student.findFirst({
      where: { id: req.params.id, ...notDeleted },
    });
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }
    const plainPassword = generateLoginPassword();
    await prisma.student.update({
      where: { id: student.id },
      data: { passwordHash: await hashPassword(plainPassword) },
    });
    res.json({ username: student.username, password: plainPassword });
  }
);

export default router;
