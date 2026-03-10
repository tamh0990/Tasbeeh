import { db } from "./db";
import {
  adhkar,
  sessions,
  type InsertDhikr,
  type Dhikr,
  type InsertSession,
  type Session,
  type UpdateDhikrRequest
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getAdhkar(): Promise<Dhikr[]>;
  getDhikr(id: number): Promise<Dhikr | undefined>;
  createDhikr(dhikr: InsertDhikr): Promise<Dhikr>;
  updateDhikr(id: number, updates: UpdateDhikrRequest): Promise<Dhikr | undefined>;
  deleteDhikr(id: number): Promise<void>;
  
  getSessions(): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
}

export class DatabaseStorage implements IStorage {
  async getAdhkar(): Promise<Dhikr[]> {
    return await db.select().from(adhkar);
  }

  async getDhikr(id: number): Promise<Dhikr | undefined> {
    const [dhikr] = await db.select().from(adhkar).where(eq(adhkar.id, id));
    return dhikr;
  }

  async createDhikr(dhikr: InsertDhikr): Promise<Dhikr> {
    const [newDhikr] = await db.insert(adhkar).values(dhikr).returning();
    return newDhikr;
  }

  async updateDhikr(id: number, updates: UpdateDhikrRequest): Promise<Dhikr | undefined> {
    const [updated] = await db.update(adhkar).set(updates).where(eq(adhkar.id, id)).returning();
    return updated;
  }

  async deleteDhikr(id: number): Promise<void> {
    await db.delete(adhkar).where(eq(adhkar.id, id));
  }

  async getSessions(): Promise<Session[]> {
    return await db.select().from(sessions).orderBy(desc(sessions.timestamp));
  }

  async createSession(session: InsertSession): Promise<Session> {
    const [newSession] = await db.insert(sessions).values(session).returning();
    return newSession;
  }
}

export const storage = new DatabaseStorage();