/**
 * index.ts — server entry point
 *
 * Creates an HTTP server (required for Socket.IO) and attaches
 * both Express and Socket.IO to it.
 */

import { createServer } from "node:http";
import app, { allowedOrigin, sessionMiddleware } from "./app";
import { setupSockets } from "./sockets/index";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

/* Wrap Express in an HTTP server so Socket.IO can attach to it */
const httpServer = createServer(app);

/* Initialise Socket.IO — passes session middleware so sockets can
   read req.session and authenticate against the same session store */
setupSockets(httpServer, sessionMiddleware, allowedOrigin);

// Bound slow-client and idle-connection resource usage.
httpServer.requestTimeout = 15_000;
httpServer.headersTimeout = 10_000;
httpServer.keepAliveTimeout = 5_000;

httpServer.listen(port, (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
});
