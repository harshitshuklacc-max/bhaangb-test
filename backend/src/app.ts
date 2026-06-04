import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import csurf from "csurf";

import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import studentRoutes from "./routes/students.js";
import teacherRoutes from "./routes/teachers.js";
import attendanceRoutes from "./routes/attendance.js";
import homeworkRoutes from "./routes/homework.js";
import noticeRoutes from "./routes/notices.js";
import leaveRoutes from "./routes/leave.js";
import inquiryRoutes from "./routes/inquiries.js";
import searchRoutes from "./routes/search.js";
import notificationRoutes from "./routes/notifications.js";
import reportRoutes from "./routes/reports.js";
import { INSTITUTE } from "./lib/constants.js";

function getFrontendUrl(): string {
  if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function createApp(): express.Application {
  const app = express();
  const frontendUrl = getFrontendUrl();

  app.use(helmet());
  app.use(
    cors({
      origin: frontendUrl,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/", limiter);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
  });
  app.use("/api/auth/login", authLimiter);

  const csrfProtection = csurf({
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    },
  });

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", institute: INSTITUTE.name });
  });

  app.get("/api/csrf-token", csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/students", studentRoutes);
  app.use("/api/teachers", teacherRoutes);
  app.use("/api/attendance", attendanceRoutes);
  app.use("/api/homework", homeworkRoutes);
  app.use("/api/notices", noticeRoutes);
  app.use("/api/leave", leaveRoutes);
  app.use("/api/inquiries", inquiryRoutes);
  app.use("/api/search", searchRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/reports", reportRoutes);

  app.use(
    (
      err: Error & { code?: string },
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      if (err.code === "EBADCSRFTOKEN") {
        res.status(403).json({ error: "Invalid CSRF token" });
        return;
      }
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  );

  return app;
}

/** Singleton for serverless */
let appInstance: express.Application | null = null;

export function getApp(): express.Application {
  if (!appInstance) {
    appInstance = createApp();
  }
  return appInstance;
}

export default getApp;
