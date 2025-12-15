import { GoogleGenAI, Chat } from "@google/genai";

const getClient = () => {
  // The API key must be obtained exclusively from the environment variable process.env.API_KEY.
  const apiKey = process.env.API_KEY || ''; 
  
  if (!apiKey) {
    console.error("Gemini API Key is missing. Please set API_KEY in your environment.");
  }

  return new GoogleGenAI({ apiKey });
};

export const getRecipeSuggestion = async (pickleName: string): Promise<string> => {
  try {
    const ai = getClient();
    
    // Using flash model for speed on simple text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `I have a jar of "${pickleName}". Suggest 3 creative or traditional Indian meal combinations (breakfast, lunch, or dinner) that pair perfectly with this specific pickle. Keep it appetizing and concise. Format as a simple list.`,
      config: {
        systemInstruction: "You are an expert Indian Chef. You love traditional flavors.",
      }
    });

    return response.text || "Could not generate recipe at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, our AI Chef is currently on a break! Please try again later.";
  }
};

export const createSupportChat = (contextData: string): Chat => {
  const ai = getClient();
  
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are 'PickleBot', the friendly and helpful customer support AI for 'Pick Your Pickle'. 
      
      YOUR KNOWLEDGE BASE (CURRENT CONTEXT):
      ${contextData}

      GUIDELINES:
      1. You have full access to the User's Orders, Product List, and Store Policies provided in the context above.
      2. If a user asks about an order status, check the 'User Orders' section in the context and provide details (Status, Tracking ID, Items).
      3. If a user asks about products, recommend items from the 'Product Inventory'.
      4. If a user asks about payments, refer to the 'Store Config'.
      5. Keep responses concise, warm, and professional. Use Indian English nuances (like 'Namaste', 'No worries') occasionally.
      6. If the user is not logged in (User Name is Guest), politely ask them to login to track specific orders.
      7. Do not hallucinate order IDs. Only use the data provided.
      `,
    },
  });
};