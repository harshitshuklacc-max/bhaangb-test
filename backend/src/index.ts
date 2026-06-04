import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { setSocketServer } from "./services/notify.js";
import { purgeExpiredArchives } from "./utils/softDelete.js";

const app = createApp();
const httpServer = createServer(app);
const frontendUrl =
  process.env.FRONTEND_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

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
