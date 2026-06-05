import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const MODELS = {
  TEXT: "gemini-flash-latest",
  IMAGE: "gemini-2.5-flash-image"
};
