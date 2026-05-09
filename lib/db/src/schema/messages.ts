import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id")
    .notNull()
    .references(() => usersTable.id),
  recipientId: integer("recipient_id")
    .notNull()
    .references(() => usersTable.id),
  ciphertextForRecipient: text("ciphertext_for_recipient").notNull(),
  ciphertextForSender: text("ciphertext_for_sender").notNull(),
  ivForRecipient: text("iv_for_recipient").notNull(),
  ivForSender: text("iv_for_sender").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messagesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messagesTable.$inferSelect;
