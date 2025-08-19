import React, { useContext } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Chatbot from '../chatbot/Chatbot';
import { Notification, View, Course } from '../../types';
import { AuthContext } from '../../contexts/AuthContext';
import VoiceTutor from '../student/VoiceTutor';

interface LayoutProps {
  children: React.ReactNode;
  view: View;
  navigate: (view: View, context?: any) => void;
  notifications: Notification[];
  onMarkNotificationsRead: (ids: string[]) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  courseContext: Course | null;
}

const Layout: React.FC<LayoutProps> = ({ children, view, navigate, notifications, onMarkNotificationsRead, isSidebarOpen, setIsSidebarOpen, courseContext }) => {
  const { user } = useContext(AuthContext);
  
  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar 
        currentView={view} 
        navigate={navigate} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          notifications={notifications}
          onMarkNotificationsRead={onMarkNotificationsRead}
          navigate={navigate}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-4 md:p-8">
          {children}
        </main>
      </div>
      {user?.role === 'student' && <VoiceTutor />}
      <Chatbot course={courseContext} />
    </div>
  );
};

export default Layout;