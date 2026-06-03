import { Router } from "express";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { prisma } from "../lib/prisma.js";
import { notDeleted } from "../lib/prisma.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.get(
  "/students",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    const format = (req.query.format as string) || "json";
    const students = await prisma.student.findMany({
      where: notDeleted,
      orderBy: { studentName: "asc" },
    });

    if (format === "json") {
      res.json({ students });
      return;
    }

    if (format === "excel") {
      const wb = new ExcelJS.Workbook();
      const sheet = wb.addWorksheet("Students");
      sheet.columns = [
        { header: "Name", key: "studentName", width: 25 },
        { header: "Class", key: "classLevel", width: 15 },
        { header: "Mobile", key: "mobile", width: 15 },
        { header: "Username", key: "username", width: 20 },
      ];
      students.forEach((s) => sheet.addRow(s));
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", "attachment; filename=students.xlsx");
      await wb.xlsx.write(res);
      return;
    }

    if (format === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=students.pdf");
      const doc = new PDFDocument();
      doc.pipe(res);
      doc.fontSize(18).text("Smart Step Academy – Student Report");
      doc.moveDown();
      students.forEach((s) => {
        doc.fontSize(10).text(`${s.studentName} | Class ${s.classLevel} | ${s.mobile}`);
      });
      doc.end();
      return;
    }

    res.status(400).json({ error: "Unsupported format" });
  }
);

router.get(
  "/attendance",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    const format = (req.query.format as string) || "json";
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = Number(req.query.month) || new Date().getMonth() + 1;
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0);

    const records = await prisma.attendance.findMany({
      where: { date: { gte: from, lte: to }, deletedAt: null },
      include: {
        student: { select: { studentName: true, classLevel: true } },
        teacher: { select: { name: true } },
      },
    });

    if (format === "excel") {
      const wb = new ExcelJS.Workbook();
      const sheet = wb.addWorksheet("Attendance");
      sheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Status", key: "status", width: 12 },
        { header: "Student", key: "student", width: 25 },
        { header: "Teacher", key: "teacher", width: 25 },
      ];
      records.forEach((r) =>
        sheet.addRow({
          date: r.date.toISOString().slice(0, 10),
          status: r.status,
          student: r.student?.studentName ?? "",
          teacher: r.teacher?.name ?? "",
        })
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", "attachment; filename=attendance.xlsx");
      await wb.xlsx.write(res);
      return;
    }

    res.json({ records });
  }
);

export default router;
