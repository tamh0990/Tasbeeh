import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

async function seedDatabase() {
  try {
    const existingAdhkar = await storage.getAdhkar();
    if (existingAdhkar.length === 0) {
      const defaultAdhkar = [
        "سبحان الله",
        "الحمد لله",
        "الله أكبر",
        "لا إله إلا الله",
        "سبحان الله وبحمده",
        "سبحان الله العظيم"
      ];
      for (const text of defaultAdhkar) {
        await storage.createDhikr({ text, isCustom: false, historicalCount: 0 });
      }
      console.log("Database seeded with default adhkar.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed DB on startup
  seedDatabase();

  app.get(api.adhkar.list.path, async (_req, res) => {
    const adhkarList = await storage.getAdhkar();
    res.json(adhkarList);
  });

  app.post(api.adhkar.create.path, async (req, res) => {
    try {
      const input = api.adhkar.create.input.parse(req.body);
      const newDhikr = await storage.createDhikr(input);
      res.status(201).json(newDhikr);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
        return;
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.adhkar.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.adhkar.update.input.parse(req.body);
      const updated = await storage.updateDhikr(id, input);
      if (!updated) {
        res.status(404).json({ message: "Dhikr not found" });
        return;
      }
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
        return;
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.adhkar.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteDhikr(id);
    res.status(204).send();
  });

  app.get(api.sessions.list.path, async (_req, res) => {
    const sessionsList = await storage.getSessions();
    res.json(sessionsList);
  });

  app.post(api.sessions.create.path, async (req, res) => {
    try {
      const input = api.sessions.create.input.parse(req.body);
      const newSession = await storage.createSession(input);
      res.status(201).json(newSession);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
        return;
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}