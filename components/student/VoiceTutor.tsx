import React, { useState, useEffect, useRef } from 'react';
import { Mic, Bot } from 'lucide-react';
import { getChatbotResponseStream } from '../../services/geminiService';
import { ChatMessage } from '../../types';

const VoiceTutor: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            const recognition = recognitionRef.current;
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onerror = (event: any) => console.error('Speech recognition error:', event.error);
            
            recognition.onresult = (event: any) => {
                const currentTranscript = Array.from(event.results)
                    .map((result: any) => result[0])
                    .map((result: any) => result.transcript)
                    .join('');
                setTranscript(currentTranscript);

                if (event.results[0].isFinal) {
                    handleSend(currentTranscript);
                }
            };
        }
    }, []);

    const handleListen = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setTranscript('');
            recognitionRef.current?.start();
        }
    };

    const handleSend = async (message: string) => {
        if (!message.trim() || isLoading) return;
        const userMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: message };
        setMessages(prev => [...prev, userMessage]);
        setTranscript('');
        setIsLoading(true);

        const botMessageId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: botMessageId, sender: 'bot', text: '' }]);

        try {
            const history: { role: 'user' | 'model'; parts: { text: string }[] }[] = messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));
            const stream = await getChatbotResponseStream(history, message, "You are a friendly and encouraging AI tutor. Explain concepts clearly and simply.");
            
            let botResponse = '';
            for await (const chunk of stream) {
                botResponse += chunk.text;
                setMessages(prev => prev.map(msg => msg.id === botMessageId ? { ...msg, text: botResponse } : msg));
            }
        } catch (error) {
            console.error(error);
             setMessages(prev => prev.map(msg => msg.id === botMessageId ? { ...msg, text: 'Sorry, I had trouble responding.' } : msg));
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <>
        <div className="fixed bottom-8 left-8 z-40">
            <button
            onClick={() => setIsOpen(true)}
            className="bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
                <Mic size={28} />
            </button>
        </div>
        {isOpen && (
             <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
                <div className="bg-white rounded-2xl w-full max-w-lg h-[36rem] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="p-4 border-b">
                        <h3 className="font-bold text-lg text-center">AI Voice Tutor</h3>
                    </div>
                     <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
                         <div className="flex items-center gap-2">
                             <div className="p-2 bg-purple-100 rounded-full"><Bot size={20} className="text-purple-600"/></div>
                             <div className="bg-gray-200 p-3 rounded-xl text-sm">
                                Hello! Ask me any question about your studies.
                             </div>
                         </div>
                        {messages.map(msg => (
                           <div key={msg.id} className={`flex items-center gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                {msg.sender === 'bot' && <div className="p-2 bg-purple-100 rounded-full"><Bot size={20} className="text-purple-600"/></div>}
                                <div className={`p-3 rounded-xl text-sm ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                                    {msg.text}
                                </div>
                           </div>
                        ))}
                    </div>
                    <div className="p-4 border-t text-center space-y-3">
                        <p className="text-gray-600 h-6">{isListening ? (transcript || "Listening...") : "Click the mic to speak"}</p>
                         <button onClick={handleListen} disabled={!recognitionRef.current || isLoading} className={`mx-auto w-20 h-20 rounded-full text-white flex items-center justify-center transition ${isListening ? 'bg-red-500 animate-pulse' : 'bg-purple-600 hover:bg-purple-700'} disabled:bg-gray-400`}>
                            <Mic size={40}/>
                        </button>
                    </div>
                </div>
             </div>
        )}
        </>
    );
};

export default VoiceTutor;