
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { MessageCircle, X, Send, Bot, Sparkles } from 'lucide-react';
import { createSupportChat } from '../services/geminiService';
import { Chat, GenerateContentResponse } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
}

const SUGGESTIONS = [
  "Track my latest order",
  "I want to return an item",
  "How do I cancel my order?",
  "Change shipping address",
  "What pickles are spicy?"
];

const AIChat = () => {
  const { user, orders, products, config } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Namaste! I'm PickleBot. 🙏\nHow can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    if (isOpen && !chatSessionRef.current) {
        initializeChat();
    }
  }, [isOpen, user, orders, products]);

  const initializeChat = () => {
    const userOrders = user ? orders.filter(o => o.userId === user.id) : [];
    
    const contextData = `
      CURRENT USER:
      Name: ${user ? user.name : 'Guest'}
      Email: ${user ? user.email : 'Not Logged In'}
      ID: ${user ? user.id : 'N/A'}

      USER ORDERS (Most Recent First):
      ${JSON.stringify(userOrders.map(o => ({
        id: o.id,
        date: new Date(o.date).toLocaleDateString(),
        total: o.finalAmount,
        status: o.status,
        items: o.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
        tracking: o.awbCode || 'Pending'
      })), null, 2)}

      PRODUCT INVENTORY:
      ${JSON.stringify(products.map(p => ({
        name: p.name,
        price: p.price,
        inStock: p.inStock,
        category: p.category
      })), null, 2)}

      STORE CONFIG:
      Payment Methods: ${Object.keys(config.paymentMethods).filter(k => config.paymentMethods[k as keyof typeof config.paymentMethods]).join(', ')}
      Announcement: ${config.announcementText}
    `;

    chatSessionRef.current = createSupportChat(contextData);
  };

  const handleSend = async (textOverride?: string) => {
    const userMessage = textOverride || input;
    if (!userMessage.trim()) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      if (!chatSessionRef.current) initializeChat();
      
      const result: GenerateContentResponse = await chatSessionRef.current!.sendMessage({ message: userMessage });
      const responseText = result.text || "I'm having a bit of trouble connecting to the kitchen right now. Please try again.";
      
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[70] bg-primary text-white p-4 rounded-full shadow-2xl hover:bg-primary-dark transition-all duration-300 hover:scale-110 group border-4 border-white/20"
        >
          <MessageCircle size={28} />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[70] w-full max-w-[360px] h-[600px] bg-white rounded-2xl shadow-2xl border border-primary/20 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-primary p-4 flex justify-between items-center text-white shrink-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20 relative backdrop-blur-sm">
                <Bot size={24} className="text-accent" />
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-primary"></div>
              </div>
              <div>
                <h3 className="font-bold font-serif">PickleBot Support</h3>
                <p className="text-[10px] text-orange-100">Usually replies instantly</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-orange-100 hover:text-white transition p-2 hover:bg-white/10 rounded-full">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg scroll-smooth">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in slide-in-from-left-2">
                <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions & Input Area */}
          <div className="bg-white border-t border-gray-100 shrink-0 p-2">
             {messages.length < 5 && !isLoading && (
                <div className="px-2 pb-2 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-2">
                    {SUGGESTIONS.map((suggestion, i) => (
                        <button 
                            key={i}
                            onClick={() => handleSend(suggestion)}
                            className="inline-block px-3 py-1.5 bg-orange-50 hover:bg-orange-100 hover:text-primary border border-transparent rounded-full text-xs font-medium text-gray-600 transition duration-200"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
             )}

            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask about pickles..."
                    className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 min-w-0"
                />
                <button 
                    onClick={() => handleSend()} 
                    disabled={isLoading || !input.trim()}
                    className="p-2 bg-primary text-white rounded-full hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0"
                >
                    <Send size={16} />
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;
