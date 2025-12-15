import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getRecipeSuggestion = async (pickleName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `I have a jar of "${pickleName}". Suggest 3 creative or traditional Indian meal combinations (breakfast, lunch, or dinner) that pair perfectly with this specific pickle. Keep it appetizing and concise. Format as a simple list.`,
      config: {
        systemInstruction: "You are an expert Indian Chef. You love traditional flavors.",
        temperature: 0.7,
      },
    });

    return response.text || "Could not generate recipe at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, our AI Chef is currently on a break! Please try again later.";
  }
};

// Helper to interact with PickleBot (Stateless for Gemini)
export const sendPickleBotMessage = async (history: { role: 'user' | 'model' | 'system', text: string }[], newMessage: string, contextData: string) => {
    try {
        const systemInstruction = `You are 'PickleBot', the friendly and helpful customer support AI for 'Pick Your Pickle'. 
      
            YOUR KNOWLEDGE BASE (CURRENT CONTEXT):
            ${contextData}

            GUIDELINES:
            1. You have full access to the User's Orders, Product List, and Store Policies provided in the context above.
            2. If a user asks about an order status, check the 'User Orders' section in the context and provide details (Status, Tracking ID, Items).
            3. If a user asks about products, recommend items from the 'Product Inventory'.
            4. If a user asks about payments, refer to the 'Store Config'.
            5. Keep responses concise, warm, and professional. Use Indian English nuances (like 'Namaste', 'No worries') occasionally.
            6. If the user is not logged in (User Name is Guest), politely ask them to login to track specific orders.
            7. Do not hallucinate order IDs. Only use the data provided.`;

        // Convert internal message format to Gemini format
        const contents = history
            .filter(msg => msg.role !== 'system')
            .map(msg => ({
                role: msg.role === 'model' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            }));
            
        // Add the new message
        contents.push({
            role: 'user',
            parts: [{ text: newMessage }]
        });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
            }
        });

        return response.text || "I didn't catch that. Could you repeat?";

    } catch (error) {
        console.error("Gemini Chat Error:", error);
        throw error;
    }
};