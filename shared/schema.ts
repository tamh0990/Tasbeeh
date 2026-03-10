import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const adhkar = pgTable("adhkar", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  isCustom: boolean("is_custom").default(false).notNull(),
  historicalCount: integer("historical_count").default(0).notNull(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  dhikrId: integer("dhikr_id").notNull(),
  count: integer("count").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertAdhkarSchema = createInsertSchema(adhkar).omit({ id: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, timestamp: true });

export type Dhikr = typeof adhkar.$inferSelect;
export type InsertDhikr = z.infer<typeof insertAdhkarSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type UpdateDhikrRequest = Partial<InsertDhikr>;