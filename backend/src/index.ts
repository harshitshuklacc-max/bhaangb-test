import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";
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
import { setSocketServer } from "./services/notify.js";
import { purgeExpiredArchives } from "./utils/softDelete.js";
import { INSTITUTE } from "./lib/constants.js";

const app = express();
const httpServer = createServer(app);
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

const io = new Server(httpServer, {
  cors: { origin: frontendUrl, credentials: true },
});
setSocketServer(io);

io.on("connection", (socket) => {
  const { role, userId } = socket.handshake.auth as {
    role?: string;
    userId?: string;
  };
  if (role && userId) {
    socket.join(`${role.toLowerCase()}:${userId}`);
  }
});

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

const port = Number(process.env.PORT ?? 4000);

httpServer.listen(port, () => {
  console.log(`Smart Step Academy API running on port ${port}`);
});

setInterval(
  () => {
    purgeExpiredArchives().catch(console.error);
  },
  24 * 60 * 60 * 1000
);
