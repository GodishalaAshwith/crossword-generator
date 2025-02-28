import { words, type Word, type InsertWord } from "@shared/schema";

export interface IStorage {
  getWords(): Promise<Word[]>;
  createWords(words: string[]): Promise<Word[]>;
  updateWordPosition(
    id: number,
    position: { x: number; y: number; direction: "across" | "down"; number: number }
  ): Promise<Word>;
}

export class MemStorage implements IStorage {
  private words: Map<number, Word>;
  private currentId: number;

  constructor() {
    this.words = new Map();
    this.currentId = 1;
  }

  async getWords(): Promise<Word[]> {
    return Array.from(this.words.values());
  }

  async createWords(wordList: string[]): Promise<Word[]> {
    const words: Word[] = [];
    for (const word of wordList) {
      const id = this.currentId++;
      const newWord: Word = { id, word, position: null };
      this.words.set(id, newWord);
      words.push(newWord);
    }
    return words;
  }

  async updateWordPosition(
    id: number,
    position: { x: number; y: number; direction: "across" | "down"; number: number }
  ): Promise<Word> {
    const word = this.words.get(id);
    if (!word) throw new Error("Word not found");

    const updatedWord = { ...word, position };
    this.words.set(id, updatedWord);
    return updatedWord;
  }
}

export const storage = new MemStorage();