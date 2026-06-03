import { Router } from "express";
import { z } from "zod";
import PDFDocument from "pdfkit";
import { prisma } from "../lib/prisma.js";
import { notDeleted } from "../lib/prisma.js";
import { authenticate, authorize, type AuthRequest } from "../middleware/auth.js";
import { FeeType, PaymentMode } from "@prisma/client";

const router = Router();

router.get(
  "/structures",
  authenticate,
  authorize("ADMIN"),
  async (_req, res) => {
    const items = await prisma.feeStructure.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
    res.json({ items });
  }
);

router.post(
  "/structures",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    const schema = z.object({
      name: z.string(),
      feeType: z.nativeEnum(FeeType),
      amount: z.number().positive(),
      classLevel: z.string().optional(),
      description: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const structure = await prisma.feeStructure.create({
      data: {
        ...parsed.data,
        amount: parsed.data.amount,
      },
    });
    res.status(201).json(structure);
  }
);

router.post(
  "/assign",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    const schema = z.object({
      studentId: z.string(),
      feeStructureId: z.string(),
      dueDate: z.string(),
      amount: z.number().positive().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload" });
      return;
    }
    const structure = await prisma.feeStructure.findFirst({
      where: { id: parsed.data.feeStructureId, deletedAt: null },
    });
    if (!structure) {
      res.status(404).json({ error: "Fee structure not found" });
      return;
    }
    const assignment = await prisma.feeAssignment.create({
      data: {
        studentId: parsed.data.studentId,
        feeStructureId: parsed.data.feeStructureId,
        dueDate: new Date(parsed.data.dueDate),
        amount: parsed.data.amount ?? structure.amount,
      },
    });
    res.status(201).json(assignment);
  }
);

router.get("/student", authenticate, authorize("STUDENT"), async (req: AuthRequest, res) => {
  const studentId = req.user!.sub;
  const [assignments, payments] = await Promise.all([
    prisma.feeAssignment.findMany({
      where: { studentId, deletedAt: null },
      include: { feeStructure: true },
      orderBy: { dueDate: "asc" },
    }),
    prisma.feePayment.findMany({
      where: { studentId, deletedAt: null },
      orderBy: { paidAt: "desc" },
    }),
  ]);
  const pending = assignments.filter((a) => !a.isPaid);
  const dueAmount = pending.reduce((s, a) => s + Number(a.amount), 0);
  res.json({ assignments, payments, pending, dueAmount });
});

router.get(
  "/reports/due",
  authenticate,
  authorize("ADMIN"),
  async (_req, res) => {
    const pending = await prisma.feeAssignment.findMany({
      where: { isPaid: false, deletedAt: null },
      include: {
        student: { select: { studentName: true, classLevel: true, mobile: true } },
        feeStructure: true,
      },
    });
    res.json({ items: pending });
  }
);

router.post(
  "/pay",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    const schema = z.object({
      assignmentId: z.string(),
      amount: z.number().positive(),
      paymentMode: z.nativeEnum(PaymentMode),
      notes: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload" });
      return;
    }
    const assignment = await prisma.feeAssignment.findFirst({
      where: { id: parsed.data.assignmentId, deletedAt: null },
    });
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }
    const receiptNumber = `SSA-${Date.now()}`;
    const payment = await prisma.feePayment.create({
      data: {
        assignmentId: assignment.id,
        studentId: assignment.studentId,
        amount: parsed.data.amount,
        paymentMode: parsed.data.paymentMode,
        receiptNumber,
        notes: parsed.data.notes,
      },
    });
    await prisma.feeAssignment.update({
      where: { id: assignment.id },
      data: { isPaid: true },
    });
    res.status(201).json(payment);
  }
);

router.get(
  "/receipt/:paymentId",
  authenticate,
  async (req, res) => {
    const payment = await prisma.feePayment.findFirst({
      where: { id: req.params.paymentId, deletedAt: null },
      include: {
        student: true,
        assignment: { include: { feeStructure: true } },
      },
    });
    if (!payment) {
      res.status(404).json({ error: "Payment not found" });
      return;
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt-${payment.receiptNumber}.pdf`
    );

    const doc = new PDFDocument();
    doc.pipe(res);
    doc.fontSize(20).text("Smart Step Academy", { align: "center" });
    doc.fontSize(12).text("Fee Receipt", { align: "center" });
    doc.moveDown();
    doc.text(`Receipt No: ${payment.receiptNumber}`);
    doc.text(`Student: ${payment.student.studentName}`);
    doc.text(`Class: ${payment.student.classLevel}`);
    doc.text(`Amount: ₹${payment.amount}`);
    doc.text(`Mode: ${payment.paymentMode}`);
    doc.text(`Date: ${payment.paidAt.toLocaleString()}`);
    doc.end();
  }
);

export default router;
