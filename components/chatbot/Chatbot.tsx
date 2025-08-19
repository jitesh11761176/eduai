import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User as UserIcon, CornerDownLeft } from 'lucide-react';
import { getChatbotResponseStream } from '../../services/geminiService';
import { ChatMessage, Course } from '../../types';

interface ChatbotProps {
    course: Course | null;
}

const Chatbot: React.FC<ChatbotProps> = ({ course }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialMessage = course 
    ? `Hello! I'm your assistant for "${course.title}". How can I help you with the course materials?`
    : 'Hello! I am the EduAI assistant. How can I help you today?';
  
  useEffect(() => {
    setMessages([{ id: '1', sender: 'bot', text: initialMessage }]);
  }, [initialMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const botMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMessageId, sender: 'bot', text: '' }]);

    try {
        const history: { role: 'user' | 'model'; parts: { text: string }[] }[] = messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        let systemInstruction: string | undefined = undefined;
        if (course) {
            const materialContext = course.chapters
                .flatMap(ch => ch.materials)
                .map(m => {
                    if (m.type === 'text' && m.content) {
                        return `Type: Text Note\nTitle: ${m.title}\nContent: ${m.content.substring(0, 500)}...`;
                    }
                    return `Type: ${m.type}\nTitle: ${m.title}`;
                })
                .join('\n\n---\n\n');
            
            systemInstruction = `You are a helpful and friendly teaching assistant for the course "${course.title}". Your primary goal is to answer the user's questions based ONLY on the provided course materials. Be concise and clear. If the question cannot be answered from the materials, politely state that you can only provide information found within the course content. Do not use outside knowledge.

### COURSE MATERIALS ###
${materialContext}
########################`;
        }

        const stream = await getChatbotResponseStream(history, input, systemInstruction);
        let botResponse = '';

        for await (const chunk of stream) {
            botResponse += chunk.text;
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === botMessageId ? { ...msg, text: botResponse } : msg
                )
            );
        }
    } catch (error) {
        console.error(error);
        setMessages(prev =>
            prev.map(msg =>
                msg.id === botMessageId ? { ...msg, text: 'Sorry, I encountered an error. Please try again.' } : msg
            )
        );
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-primary-600 text-white rounded-full p-4 shadow-lg hover:bg-primary-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-8 w-96 h-[32rem] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border-2 border-primary-200">
          <div className="bg-primary-600 text-white p-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot size={24}/>
              <h3 className="font-bold text-lg">EduAI Assistant</h3>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                   {msg.sender === 'bot' && <div className="bg-primary-500 text-white rounded-full p-2"><Bot size={16}/></div>}
                  <div className={`max-w-xs px-4 py-2 rounded-xl ${msg.sender === 'user' ? 'bg-primary-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                    <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                  </div>
                  {msg.sender === 'user' && <div className="bg-gray-300 text-gray-700 rounded-full p-2"><UserIcon size={16}/></div>}
                </div>
              ))}
              {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="bg-primary-500 text-white rounded-full p-2 animate-pulse"><Bot size={16}/></div>
                    <div className="max-w-xs px-4 py-2 rounded-xl bg-gray-200 text-gray-800 rounded-bl-none">
                       <div className="flex items-center space-x-1">
                          <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                       </div>
                    </div>
                  </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="p-4 border-t bg-white rounded-b-xl">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="w-full pl-4 pr-12 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isLoading}
              />
              <button onClick={handleSend} className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-500 text-white p-2 rounded-full hover:bg-primary-600 disabled:bg-gray-300">
                {isLoading ? <CornerDownLeft size={20} className="animate-ping"/> : <Send size={20} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;