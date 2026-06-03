import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { notDeleted } from "../lib/prisma.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import type { AuthRequest } from "../middleware/auth.js";
import { authenticate } from "../middleware/auth.js";
import { logAudit } from "../services/audit.js";

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid credentials payload" });
    return;
  }

  const { username, password } = parsed.data;
  const admin = await prisma.admin.findFirst({
    where: { username, ...notDeleted },
  });
  if (admin && (await verifyPassword(password, admin.passwordHash))) {
    const payload = { sub: admin.id, role: "ADMIN" as const, username };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
      user: { id: admin.id, role: "ADMIN", username, name: admin.name },
      accessToken,
    });
    return;
  }

  const teacher = await prisma.teacher.findFirst({
    where: { username, ...notDeleted },
  });
  if (teacher && (await verifyPassword(password, teacher.passwordHash))) {
    const payload = { sub: teacher.id, role: "TEACHER" as const, username };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
      user: {
        id: teacher.id,
        role: "TEACHER",
        username,
        name: teacher.name,
      },
      accessToken,
    });
    return;
  }

  const student = await prisma.student.findFirst({
    where: { username, ...notDeleted },
  });
  if (student && (await verifyPassword(password, student.passwordHash))) {
    const payload = { sub: student.id, role: "STUDENT" as const, username };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
      user: {
        id: student.id,
        role: "STUDENT",
        username,
        name: student.studentName,
        classLevel: student.classLevel,
      },
      accessToken,
    });
    return;
  }

  res.status(401).json({ error: "Invalid username or password" });
});

router.post("/refresh", async (req, res) => {
  const token =
    (req.cookies?.refreshToken as string) || (req.body.refreshToken as string);
  if (!token) {
    res.status(401).json({ error: "Refresh token required" });
    return;
  }
  try {
    const payload = verifyRefreshToken(token);
    const accessToken = signAccessToken(payload);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60 * 1000,
    });
    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ success: true });
});

router.get("/me", authenticate, async (req: AuthRequest, res) => {
  const user = req.user!;
  if (user.role === "ADMIN") {
    const admin = await prisma.admin.findFirst({
      where: { id: user.sub, ...notDeleted },
    });
    if (!admin) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({
      id: admin.id,
      role: "ADMIN",
      username: admin.username,
      name: admin.name,
    });
    return;
  }
  if (user.role === "TEACHER") {
    const teacher = await prisma.teacher.findFirst({
      where: { id: user.sub, ...notDeleted },
    });
    if (!teacher) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({
      id: teacher.id,
      role: "TEACHER",
      username: teacher.username,
      name: teacher.name,
      subject: teacher.subject,
    });
    return;
  }
  const student = await prisma.student.findFirst({
    where: { id: user.sub, ...notDeleted },
  });
  if (!student) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({
    id: student.id,
    role: "STUDENT",
    username: student.username,
    name: student.studentName,
    classLevel: student.classLevel,
    photoUrl: student.photoUrl,
  });
});

router.post("/change-password", authenticate, async (req: AuthRequest, res) => {
  const schema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid payload" });
    return;
  }
  const { currentPassword, newPassword } = parsed.data;
  const user = req.user!;
  const hash = await hashPassword(newPassword);

  if (user.role === "ADMIN") {
    const admin = await prisma.admin.findUnique({ where: { id: user.sub } });
    if (!admin || !(await verifyPassword(currentPassword, admin.passwordHash))) {
      res.status(400).json({ error: "Current password incorrect" });
      return;
    }
    await prisma.admin.update({
      where: { id: user.sub },
      data: { passwordHash: hash },
    });
  } else if (user.role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({ where: { id: user.sub } });
    if (
      !teacher ||
      !(await verifyPassword(currentPassword, teacher.passwordHash))
    ) {
      res.status(400).json({ error: "Current password incorrect" });
      return;
    }
    await prisma.teacher.update({
      where: { id: user.sub },
      data: { passwordHash: hash },
    });
  } else {
    const student = await prisma.student.findUnique({ where: { id: user.sub } });
    if (
      !student ||
      !(await verifyPassword(currentPassword, student.passwordHash))
    ) {
      res.status(400).json({ error: "Current password incorrect" });
      return;
    }
    await prisma.student.update({
      where: { id: user.sub },
      data: { passwordHash: hash },
    });
  }
  res.json({ success: true });
});

export default router;
