/**
 * audit-logger.ts
 *
 * Security-focused audit log.
 *
 * CRITICAL INVARIANT: This file must NEVER log:
 *   - Plaintext messages
 *   - Passwords (plain or hashed)
 *   - Private keys or decrypted data
 *   - Full session tokens
 *   - Personal message content
 *
 * Only metadata is recorded: who, what event, when, from where.
 */

import { logger } from "./logger";

export type AuditEvent =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "REGISTER_SUCCESS"
  | "REGISTER_FAILED_DUPLICATE"
  | "LOGOUT"
  | "RATE_LIMIT_HIT"
  | "MESSAGE_SEND_BLOCKED_NO_REQUEST"
  | "MESSAGE_REPLAY_REJECTED"
  | "MESSAGE_SEND_SUCCESS"
  | "MSG_REQUEST_SENT"
  | "MSG_REQUEST_ACCEPTED"
  | "MSG_REQUEST_REJECTED"
  | "SUSPICIOUS_PAYLOAD"
  | "SESSION_INVALID";

interface AuditPayload {
  event: AuditEvent;
  userId?: number;
  targetUserId?: number;
  ip?: string;
  /** Free-form non-sensitive context — NEVER put message content here */
  detail?: string;
}

/**
 * Emit a structured security audit log line.
 * All logs go through pino so they can be shipped to a SIEM.
 */
export function audit(payload: AuditPayload): void {
  logger.info({ audit: true, ...payload }, `[AUDIT] ${payload.event}`);
}
