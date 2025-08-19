import React, { useState, useRef, useEffect } from 'react';
import { User, Student, ChatMessage } from '../../../types';
import Card from '../../common/Card';
import Button from '../../common/Button';
import { Video, Send, Tv, MessageCircle, Edit2, Users, Trash2 } from 'lucide-react';
import Whiteboard from './Whiteboard';

interface CourseLiveClassTabProps {
  user: User;
  allStudents: Student[];
}

const CourseLiveClassTab: React.FC<CourseLiveClassTabProps> = ({ user, allStudents }) => {
  const isTeacher = user.role === 'teacher';
  const [isLive, setIsLive] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');

  const enrolledStudents = allStudents.filter(s => s.courses.some(c => c.courseId === 'c1'));

  const handleSendMessage = () => {
    if (input.trim()) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: user.id,
          senderName: user.name,
          senderAvatar: user.avatarUrl,
          text: input,
          timestamp: new Date()
        }
      ]);
      setInput('');
    }
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold text-gray-700">Live Classroom</h3>
        {isTeacher && (
             <Button onClick={() => setIsLive(!isLive)} variant={isLive ? 'danger' : 'primary'}>
                {isLive ? 'End Class' : 'Start Class'}
             </Button>
        )}
      </div>
      
      <Card className="p-0 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Main Content: Video/Whiteboard */}
          <div className="lg:col-span-2 bg-gray-900 flex flex-col items-center justify-center aspect-video relative">
            {!isLive ? (
              <div className="text-center text-white p-8">
                <Tv size={64} className="mx-auto opacity-50" />
                <p className="mt-4 font-semibold text-lg">Live Class is Offline</p>
                <p className="text-sm text-gray-400">
                  {isTeacher ? 'Click "Start Class" to begin the session.' : 'Please wait for the teacher to start the class.'}
                </p>
              </div>
            ) : (
               <>
                <div className="w-full h-full bg-black flex items-center justify-center">
                    <p className="text-white font-bold text-2xl">[ Teacher Video Feed ]</p>
                </div>
                <div className="absolute bottom-2 left-2 flex space-x-2 p-2 bg-black/50 rounded-lg">
                    {enrolledStudents.slice(0, 4).map(s => (
                        <img key={s.id} src={s.avatarUrl} title={s.name} className="w-16 h-16 rounded-md border-2 border-transparent hover:border-primary-500" />
                    ))}
                    {enrolledStudents.length > 4 && 
                        <div className="w-16 h-16 rounded-md bg-gray-700 flex items-center justify-center text-white font-bold">+{enrolledStudents.length - 4}</div>
                    }
                </div>
               </>
            )}
          </div>

          {/* Side Panel: Chat/Whiteboard */}
          <div className="lg:col-span-1 flex flex-col bg-white border-t lg:border-t-0 lg:border-l h-[32rem] lg:h-auto">
            <div className="flex border-b">
                <button onClick={() => setActiveTab('chat')} className={`flex-1 p-3 font-semibold flex items-center justify-center gap-2 ${activeTab === 'chat' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                    <MessageCircle size={18}/> Chat
                </button>
                <button onClick={() => setActiveTab('whiteboard')} className={`flex-1 p-3 font-semibold flex items-center justify-center gap-2 ${activeTab === 'whiteboard' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                    <Edit2 size={18}/> Whiteboard
                </button>
            </div>
            
            {activeTab === 'chat' ? (
                <>
                <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
                    {messages.map(msg => (
                        <div key={msg.id} className="flex items-start space-x-2 group">
                            <img src={msg.senderAvatar} className="w-8 h-8 rounded-full" />
                            <div className="flex-1">
                                <p className="text-sm">
                                    <span className="font-bold text-gray-800">{msg.senderName}</span>
                                    <span className="text-xs text-gray-400 ml-2">{msg.timestamp?.toLocaleTimeString()}</span>
                                </p>
                                <p className="text-gray-700">{msg.text}</p>
                            </div>
                            {isTeacher && msg.sender !== user.id && (
                                <button onClick={() => deleteMessage(msg.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500">
                                    <Trash2 size={14}/>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <div className="p-3 border-t bg-white">
                <div className="relative">
                    <input
                    type="text"
                    placeholder={isLive ? "Type a message..." : "Chat is disabled"}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="w-full pl-4 pr-10 py-2 border rounded-full"
                    disabled={!isLive}
                    />
                    <button onClick={handleSendMessage} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-primary-600 disabled:text-gray-300" disabled={!isLive}>
                    <Send size={20} />
                    </button>
                </div>
                </div>
                </>
            ) : (
                <Whiteboard isTeacher={isTeacher} isLive={isLive} />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CourseLiveClassTab;