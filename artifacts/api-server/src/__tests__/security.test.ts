import { createServer, type Server as HttpServer } from "node:http";
import bcrypt from "bcryptjs";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { io as createSocketClient, type Socket } from "socket.io-client";

type Table = { name: string; [key: string]: unknown };
type User = {
  id: number;
  username: string;
  passwordHash: string;
  publicKeySpki: string;
  encryptedPrivateKey: string;
  salt: string;
  iv: string;
};

const state = vi.hoisted(() => ({
  loginUserId: 1,
  relationshipAccepted: true,
  duplicateMessageIds: new Set<string>(),
  insertedMessageIds: new Set<string>(),
}));

const users: User[] = [
  {
    id: 1,
    username: "alice",
    passwordHash: "",
    publicKeySpki: "A".repeat(88),
    encryptedPrivateKey: "B".repeat(32),
    salt: "C".repeat(32),
    iv: "D".repeat(16),
  },
  {
    id: 2,
    username: "bob",
    passwordHash: "",
    publicKeySpki: "E".repeat(88),
    encryptedPrivateKey: "F".repeat(32),
    salt: "G".repeat(32),
    iv: "H".repeat(16),
  },
];

const usersTable: Table = {
  name: "users",
  id: Symbol("users.id"),
  username: Symbol("users.username"),
  publicKeySpki: Symbol("users.publicKeySpki"),
};
const messageRequestsTable: Table = {
  name: "message_requests",
  id: Symbol("message_requests.id"),
  senderId: Symbol("message_requests.senderId"),
  recipientId: Symbol("message_requests.recipientId"),
  status: Symbol("message_requests.status"),
};
const messagesTable: Table = {
  name: "messages",
  id: Symbol("messages.id"),
  messageId: Symbol("messages.messageId"),
};

const acceptedRequest = {
  id: 42,
  senderId: 1,
  recipientId: 2,
  status: "accepted",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
};
const pendingRequest = {
  id: 43,
  senderId: 1,
  recipientId: 2,
  status: "pending",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
};

function selectedUser(selection: Record<string, unknown> | undefined): User[] {
  if (!selection) {
    return [users.find((user) => user.id === state.loginUserId)!];
  }

  if ("id" in selection && "username" in selection) {
    return users.filter((user) => user.id !== state.loginUserId);
  }

  if ("id" in selection) {
    return [users.find((user) => user.id !== state.loginUserId)!];
  }

  return [users.find((user) => user.id === state.loginUserId)!];
}

function rowsFor(
  table: Table | undefined,
  selection: Record<string, unknown> | undefined,
): unknown[] {
  if (table === usersTable) {
    return selectedUser(selection);
  }
  if (table === messageRequestsTable) {
    if (selection && "id" in selection) {
      return state.relationshipAccepted ? [acceptedRequest] : [];
    }
    return [pendingRequest];
  }
  return [];
}

function createQuery(selection: Record<string, unknown> | undefined) {
  let table: Table | undefined;
  const query: Record<string, any> = {
    from: (nextTable: Table) => {
      table = nextTable;
      return query;
    },
    where: () => query,
    orderBy: () => query,
    limit: async () => rowsFor(table, selection),
    then: (resolve: (value: unknown[]) => unknown, reject: (error: unknown) => unknown) =>
      Promise.resolve(rowsFor(table, selection)).then(resolve, reject),
  };
  return query;
}

const db = {
  select: vi.fn((selection?: Record<string, unknown>) => createQuery(selection)),
  insert: vi.fn((table: Table) => {
    let values: Record<string, any> = {};
    const query = {
      values: (nextValues: Record<string, any>) => {
        values = nextValues;
        return query;
      },
      returning: async () => {
        if (table === messagesTable) {
          if (state.duplicateMessageIds.has(values.messageId)) {
            const error = Object.assign(new Error("duplicate"), { code: "23505" });
            throw error;
          }
          state.duplicateMessageIds.add(values.messageId);
          state.insertedMessageIds.add(values.messageId);
          return [{
            id: state.insertedMessageIds.size,
            ...values,
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
          }];
        }
        return [{ ...pendingRequest, ...values }];
      },
    };
    return query;
  }),
};

vi.mock("@workspace/db", () => ({
  db,
  usersTable,
  messagesTable,
  messageRequestsTable,
}));

process.env.NODE_ENV = "production";
process.env.SESSION_SECRET = "test-session-secret-that-is-long-enough";
process.env.ALLOWED_ORIGIN = "https://cipherchat.example";

const { default: app, allowedOrigin, sessionMiddleware } = await import("../app");
const { setupSockets } = await import("../sockets/index");

let httpServer: HttpServer;
let ioServer: ReturnType<typeof setupSockets>;
let baseUrl = "";
let userOneCookie = "";
let userTwoCookie = "";

async function listen(server: HttpServer): Promise<number> {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server did not bind");
  return address.port;
}

async function apiRequest(
  path: string,
  options: RequestInit = {},
  cookie = "",
): Promise<{ status: number; body: unknown; headers: Headers }> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  if (cookie) headers.set("cookie", cookie);

  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  const text = await response.text();
  let body: unknown = undefined;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  return { status: response.status, body, headers: response.headers };
}

async function login(userId: number): Promise<string> {
  state.loginUserId = userId;
  const response = await apiRequest("/api/auth/login", {
    method: "POST",
    headers: { "x-forwarded-proto": "https" },
    body: JSON.stringify({ username: userId === 1 ? "alice" : "bob", password: "correct horse" }),
  });
  expect(response.status).toBe(200);
  const headersWithCookies = response.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const cookie = headersWithCookies.getSetCookie?.()[0] ?? response.headers.get("set-cookie");
  if (!cookie) throw new Error("Login did not set a session cookie");
  return cookie.split(";")[0];
}

function validMessage(messageId = "11111111-1111-4111-8111-111111111111") {
  return {
    recipientId: 2,
    ciphertextForRecipient: "AQ==",
    ciphertextForSender: "Ag==",
    ivForRecipient: "AAAAAAAAAAAAAAAA",
    ivForSender: "AAAAAAAAAAAAAAAA",
    messageId,
    clientSentAt: new Date().toISOString(),
  };
}

function connectAuthenticatedSocket(cookie: string): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const socket = createSocketClient(baseUrl, {
      path: "/api/socket.io",
      transports: ["polling"],
      extraHeaders: { Cookie: cookie },
      reconnection: false,
    });
    socket.once("connect", () => resolve(socket));
    socket.once("connect_error", reject);
  });
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

beforeAll(async () => {
  users[0].passwordHash = await bcrypt.hash("correct horse", 4);
  users[1].passwordHash = users[0].passwordHash;

  httpServer = createServer(app);
  ioServer = setupSockets(httpServer, sessionMiddleware, allowedOrigin);
  const port = await listen(httpServer);
  baseUrl = `http://127.0.0.1:${port}`;

  userOneCookie = await login(1);
  userTwoCookie = await login(2);
});

beforeEach(() => {
  state.relationshipAccepted = true;
  state.duplicateMessageIds.clear();
  state.insertedMessageIds.clear();
});

afterAll(async () => {
  await new Promise<void>((resolve) => ioServer.close(() => resolve()));
  if (!httpServer.listening) return;
  await new Promise<void>((resolve, reject) => {
    httpServer.close((error) => {
      if (error && (error as NodeJS.ErrnoException).code !== "ERR_SERVER_NOT_RUNNING") {
        reject(error);
        return;
      }
      resolve();
    });
  });
});

describe("HTTP authorization and CSRF boundaries", () => {
  it("rejects unauthenticated user-directory and public-key requests", async () => {
    const [directory, publicKey] = await Promise.all([
      apiRequest("/api/users"),
      apiRequest("/api/users/2/public-key"),
    ]);

    expect(directory.status).toBe(401);
    expect(publicKey.status).toBe(401);
  });

  it("rejects state-changing requests from a mismatched browser origin", async () => {
    const response = await apiRequest(
      "/api/message-requests",
      {
        method: "POST",
        headers: { origin: "https://attacker.example" },
        body: JSON.stringify({ recipientId: 2 }),
      },
      userOneCookie,
    );

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: "Cross-origin request rejected" });
  });
});

describe("encrypted message input and replay boundaries", () => {
  it("rejects invalid ciphertext, IV, and message IDs before persistence", async () => {
    const invalidCiphertext = await apiRequest(
      "/api/messages",
      { method: "POST", body: JSON.stringify({ ...validMessage(), ciphertextForRecipient: "not base64" }) },
      userOneCookie,
    );
    const invalidIv = await apiRequest(
      "/api/messages",
      { method: "POST", body: JSON.stringify({ ...validMessage(), ivForRecipient: "AQ==" }) },
      userOneCookie,
    );
    const invalidMessageId = await apiRequest(
      "/api/messages",
      { method: "POST", body: JSON.stringify({ ...validMessage(), messageId: "replayed-id" }) },
      userOneCookie,
    );

    expect(invalidCiphertext.status).toBe(400);
    expect(invalidIv.status).toBe(400);
    expect(invalidMessageId.status).toBe(400);
    expect(state.insertedMessageIds).toHaveLength(0);
  });

  it("rejects oversized message payloads", async () => {
    const oversized = await apiRequest(
      "/api/messages",
      {
        method: "POST",
        body: JSON.stringify({
          ...validMessage(),
          ciphertextForRecipient: "A".repeat(70_000),
        }),
      },
      userOneCookie,
    );

    expect(oversized.status).toBe(413);
  });

  it("handles duplicate message IDs as a safe conflict", async () => {
    const payload = validMessage("22222222-2222-4222-8222-222222222222");
    const first = await apiRequest(
      "/api/messages",
      { method: "POST", body: JSON.stringify(payload) },
      userOneCookie,
    );
    const replay = await apiRequest(
      "/api/messages",
      { method: "POST", body: JSON.stringify(payload) },
      userOneCookie,
    );

    expect(first.status).toBe(201);
    expect(replay.status).toBe(409);
    expect(replay.body).toEqual({ error: "Duplicate message ID — possible replay attack" });
  });

  it("rejects duplicate message requests", async () => {
    const response = await apiRequest(
      "/api/message-requests",
      { method: "POST", body: JSON.stringify({ recipientId: 2 }) },
      userOneCookie,
    );

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ error: "A request already exists between you and this user" });
  });
});

describe("Socket.IO typing authorization and rate limiting", () => {
  it("rejects unauthenticated socket connections", async () => {
    await expect(connectAuthenticatedSocket("")).rejects.toMatchObject({ message: "Unauthorized" });
  });

  it("relays typing only for accepted relationships", async () => {
    const sender = await connectAuthenticatedSocket(userOneCookie);
    const recipient = await connectAuthenticatedSocket(userTwoCookie);
    const received = new Promise<unknown>((resolve) => recipient.once("typing", resolve));

    sender.emit("typing", { toUserId: 2, isTyping: true });
    await expect(received).resolves.toEqual({ fromUserId: 1, isTyping: true });

    state.relationshipAccepted = false;
    let unauthorizedTyping = false;
    recipient.once("typing", () => {
      unauthorizedTyping = true;
    });
    sender.emit("typing", { toUserId: 2, isTyping: true });
    await wait(50);
    expect(unauthorizedTyping).toBe(false);

    sender.disconnect();
    recipient.disconnect();
  });

  it("limits typing events to 30 per second per socket", async () => {
    const sender = await connectAuthenticatedSocket(userOneCookie);
    const recipient = await connectAuthenticatedSocket(userTwoCookie);
    let received = 0;
    recipient.on("typing", () => {
      received += 1;
    });

    for (let index = 0; index < 35; index += 1) {
      sender.emit("typing", { toUserId: 2, isTyping: true });
    }
    await wait(100);

    expect(received).toBeLessThanOrEqual(30);
    sender.disconnect();
    recipient.disconnect();
  });
});