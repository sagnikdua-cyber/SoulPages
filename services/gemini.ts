import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export const geminiService = {
  async analyzeDiaryEntry(text: string) {
    if (!API_KEY) throw new Error("Gemini API Key missing");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Analyze this diary entry and return a JSON object with: 
    "mood" (one of: happy, sad, neutral, anxious, excited, tired, angry), 
    "summary" (max 20 words), 
    "emotionalScore" (0-100).
    Entry: "${text}"`;
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const jsonStr = response.text().replace(/```json|```/g, "").trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Gemini analysis failed:", error);
      return { mood: "neutral", summary: "Reflective entry.", emotionalScore: 50 };
    }
  },

  async generateGoalPlan(goal: string) {
    if (!API_KEY) throw new Error("Gemini API Key missing");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Create a 5-step action plan and a motivation message for this goal: "${goal}". 
    Return as Markdown format.`;
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      return "Unable to generate plan. You've got this!";
    }
  },

  async getMistakeAdvice(mistake: string, lesson: string) {
    if (!API_KEY) throw new Error("Gemini API Key missing");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `I made this mistake: "${mistake}". I learned this lesson: "${lesson}". 
    Provide one paragraph of reflective, supportive advice.`;
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      return "Mistakes are our greatest teachers. Keep growing.";
    }
  },

  async askLifeCoach(query: string, context?: string) {
    if (!API_KEY) throw new Error("Gemini API Key missing");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Context (previous habits/moods): ${context || "New user"}. 
    User Question: "${query}". 
    Respond as a compassionate AI Life Coach.`;
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      return "I'm here for you. What else is on your mind?";
    }
  }
};
