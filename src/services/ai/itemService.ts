import { ai, MODELS } from "./config";

export async function generateItemDescription(name: string, category: string, subCategory?: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: MODELS.TEXT,
      contents: `Write a short, atmospheric, dark fantasy description (1-2 sentences) for a D&D item named "${name}". 
      Category: ${category}${subCategory ? `, Sub-category: ${subCategory}` : ""}.
      The tone should be serious, adult-themed, and cinematic, like Baldur's Gate 3 or classic D&D.`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Error generating item description:", error);
    return "";
  }
}
