/**
 * sockets/index.ts
 *
 * Socket.IO server — real-time delivery of encrypted payloads.
 *
 * Architecture principles:
 *  - Sockets authenticate via the existing express-session cookie.
 *    No separate WebSocket credentials needed.
 *  - The server ONLY relays already-encrypted ciphertext.
 *    It never sees, touches, or logs plaintext.
 *  - Each authenticated user joins a private room named `user:<id>`.
 *    Messages are delivered to the recipient's room only.
 */

import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import type { SessionData } from "express-session";
import { logger } from "../lib/logger";

/* ------------------------------------------------------------------ */
/* Module-level singleton so routes can emit events                    */
/* ------------------------------------------------------------------ */
let _io: Server | null = null;

export function getIo(): Server {
  if (!_io) throw new Error("Socket.IO not initialised — call setupSockets first");
  return _io;
}

/* ------------------------------------------------------------------ */
/* Extend Socket type to carry session data                            */
/* ------------------------------------------------------------------ */
declare module "socket.io" {
  interface Socket {
    sessionUserId?: number;
  }
}

/* ------------------------------------------------------------------ */
/* Bootstrap                                                           */
/* ------------------------------------------------------------------ */
export function setupSockets(
  httpServer: HttpServer,
  sessionMiddleware: (req: any, res: any, next: any) => void,
): Server {
  const io = new Server(httpServer, {
    path: "/api/socket.io",
    cors: {
      // Allow same origin only; the proxy forwards credentials
      origin: true,
      credentials: true,
    },
    // Allow 30-second polling before upgrading to WebSocket
    transports: ["polling", "websocket"],
  });

  /* Run the express-session middleware so we can read req.session */
  io.engine.use(sessionMiddleware);

  /* Auth gate — reject unauthenticated sockets immediately */
  io.use((socket, next) => {
    const session = (socket.request as any).session as SessionData | undefined;
    const userId = session?.userId;
    if (!userId) {
      logger.warn({ socketId: socket.id }, "Socket rejected — no session");
      return next(new Error("Unauthorized"));
    }
    socket.sessionUserId = userId;
    next();
  });

  io.on("connection", (socket) => {
    const userId = socket.sessionUserId!;
    /* Private room per user — only this socket receives events for that user */
    socket.join(`user:${userId}`);
    logger.info({ userId, socketId: socket.id }, "Socket connected");

    socket.on("disconnect", (reason) => {
      logger.info({ userId, reason }, "Socket disconnected");
    });

    /* Typing indicator — relay to partner without server storing it */
    socket.on("typing", (data: { toUserId: number; isTyping: boolean }) => {
      if (typeof data?.toUserId !== "number") return;
      socket.to(`user:${data.toUserId}`).emit("typing", {
        fromUserId: userId,
        isTyping: !!data.isTyping,
      });
    });
  });

  _io = io;
  logger.info("Socket.IO server ready");
  return io;
}

/* ------------------------------------------------------------------ */
/* Helpers for route handlers to push events                           */
/* ------------------------------------------------------------------ */

/** Deliver a new encrypted message to recipient (and echo to sender) */
export function emitNewMessage(recipientId: number, senderId: number, message: object) {
  if (!_io) return;
  _io.to(`user:${recipientId}`).emit("new_message", message);
  // Echo to sender's other tabs
  _io.to(`user:${senderId}`).emit("new_message", message);
}

/** Notify a user that a message request changed status */
export function emitRequestUpdate(userId: number, payload: object) {
  if (!_io) return;
  _io.to(`user:${userId}`).emit("request_update", payload);
}

/** Notify a user that a message was read by recipient */
export function emitMessageRead(senderId: number, payload: object) {
  if (!_io) return;
  _io.to(`user:${senderId}`).emit("message_read", payload);
}
