import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { notDeleted } from "../lib/prisma.js";
import { authenticate, authorize, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get(
  "/admin",
  authenticate,
  authorize("ADMIN"),
  async (_req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalStudents, totalTeachers, attendanceToday, pendingLeaves] =
      await Promise.all([
        prisma.student.count({ where: notDeleted }),
        prisma.teacher.count({ where: notDeleted }),
        prisma.attendance.count({
          where: {
            date: { gte: today, lt: tomorrow },
            status: "PRESENT",
            deletedAt: null,
          },
        }),
        prisma.leaveRequest.count({
          where: { status: "PENDING", deletedAt: null },
        }),
      ]);

    res.json({
      totalStudents,
      totalTeachers,
      attendanceToday,
      pendingLeaveRequests: pendingLeaves,
    });
  }
);

router.get(
  "/teacher",
  authenticate,
  authorize("TEACHER"),
  async (req: AuthRequest, res) => {
    const teacherId = req.user!.sub;

    const [homeworkCount, attendanceSummary] = await Promise.all([
      prisma.homework.count({
        where: { teacherId, deletedAt: null },
      }),
      prisma.attendance.findMany({
        where: { teacherId, deletedAt: null },
        orderBy: { date: "desc" },
        take: 30,
      }),
    ]);

    const present = attendanceSummary.filter((a) => a.status === "PRESENT").length;
    const absent = attendanceSummary.filter((a) => a.status === "ABSENT").length;

    res.json({
      assignedHomework: homeworkCount,
      attendanceSummary: { present, absent, total: attendanceSummary.length },
    });
  }
);

router.get(
  "/student",
  authenticate,
  authorize("STUDENT"),
  async (req: AuthRequest, res) => {
    const studentId = req.user!.sub;
    const student = await prisma.student.findFirst({
      where: { id: studentId, ...notDeleted },
    });
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    const [attendanceCount, homeworkCount, noticesCount] = await Promise.all([
      prisma.attendance.count({
        where: { studentId, status: "PRESENT", deletedAt: null },
      }),
      prisma.homework.count({
        where: { classLevel: student.classLevel, deletedAt: null },
      }),
      prisma.notice.count({ where: { deletedAt: null } }),
    ]);

    res.json({
      attendancePresent: attendanceCount,
      homeworkCount,
      noticesCount,
      classLevel: student.classLevel,
    });
  }
);

export default router;
