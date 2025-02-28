import { pgTable, text, serial, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const words = pgTable("words", {
  id: serial("id").primaryKey(),
  word: text("word").notNull(),
  position: json("position").$type<{
    x: number;
    y: number;
    direction: "across" | "down";
    number: number;
  }>(),
});

export const insertWordSchema = createInsertSchema(words).pick({
  word: true,
}).extend({
  word: z.string().min(2).max(20),
});

export type InsertWord = z.infer<typeof insertWordSchema>;
export type Word = typeof words.$inferSelect;

export const crosswordSchema = z.object({
  wordList: z.string().min(1)
});

export type CrosswordInput = z.infer<typeof crosswordSchema>;