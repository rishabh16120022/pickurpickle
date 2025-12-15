import { GoogleGenerativeAI } from "@google/genai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getGeminiReply(message) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(message);
  return result.response.text();
}
