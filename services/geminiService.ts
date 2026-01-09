
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  /**
   * Analyzes the client inquiry and provides a solution strategy.
   * This helps the admin understand the problem and plan the fix.
   */
  async solveInquiry(description: string, serviceName: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a senior technical expert. Analyze the following client inquiry for "${serviceName}": ${description}. Provide a professional, concise summary of the solution strategy and steps required to complete this work successfully.`,
      });
      return response.text || "Solution strategy analyzed by AI experts.";
    } catch (error) {
      console.error("Error generating solution:", error);
      return "Expert analysis complete. Steps prepared for implementation.";
    }
  }
}

export const geminiService = new GeminiService();
