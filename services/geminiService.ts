import { GoogleGenAI, Content } from "@google/genai";

// Initialize the Google GenAI client
// The API key is obtained exclusively from process.env.API_KEY as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getRecipeSuggestion = async (pickleName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `I have a jar of "${pickleName}". Suggest 3 creative or traditional Indian meal combinations (breakfast, lunch, or dinner) that pair perfectly with this specific pickle. Keep it appetizing and concise. Format as a simple list.`,
      config: {
        systemInstruction: "You are an expert Indian Chef. You love traditional flavors.",
      },
    });

    return response.text || "Could not generate recipe at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, our AI Chef is currently on a break! Please try again later.";
  }
};

// Helper to interact with PickleBot
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

        // Transform history for Gemini Chat
        const chatHistory: Content[] = history
            .filter(msg => msg.role !== 'system') // System message is handled via config
            .map(msg => ({
                role: msg.role === 'model' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            }));

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: chatHistory,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        const response = await chat.sendMessage({ message: newMessage });
        return response.text || "I didn't catch that. Could you repeat?";

    } catch (error) {
        console.error("Gemini Chat Error:", error);
        return "I'm having trouble connecting to the server right now.";
    }
};