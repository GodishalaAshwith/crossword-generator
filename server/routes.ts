import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { crosswordSchema } from "@shared/schema";
import { generateCrossword } from "../client/src/lib/crossword";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/crossword", async (req, res) => {
    try {
      const { wordList } = crosswordSchema.parse(req.body);
      const words = wordList
        .split(",")
        .map(word => word.trim())
        .filter(word => word.length >= 2);

      if (words.length < 2) {
        throw new Error("Please enter at least 2 words");
      }

      // Create words in storage
      const createdWords = await storage.createWords(words);

      // Generate crossword layout
      const { grid, wordPositions } = generateCrossword(words);

      // Update word positions
      const updatedWords = await Promise.all(
        createdWords.map(async (word, idx) => {
          const position = wordPositions[idx];
          return await storage.updateWordPosition(word.id, position);
        })
      );

      res.json({ words: updatedWords, grid });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}