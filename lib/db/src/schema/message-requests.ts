import { pgTable, serial, integer, text, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const messageRequestsTable = pgTable(
  "message_requests",
  {
    id: serial("id").primaryKey(),
    senderId: integer("sender_id")
      .notNull()
      .references(() => usersTable.id),
    recipientId: integer("recipient_id")
      .notNull()
      .references(() => usersTable.id),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("unique_request_pair").on(t.senderId, t.recipientId)],
);

export const insertMessageRequestSchema = createInsertSchema(messageRequestsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertMessageRequest = z.infer<typeof insertMessageRequestSchema>;
export type MessageRequest = typeof messageRequestsTable.$inferSelect;
