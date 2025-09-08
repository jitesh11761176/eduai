import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Menu } from 'lucide-react';
import { Notification, View } from '../../types';
import NotificationBell from '../notifications/NotificationBell';
import Avatar from '../common/Avatar';

interface HeaderProps {
    toggleSidebar: () => void;
    notifications: Notification[];
    onMarkNotificationsRead: (ids: string[]) => void;
    navigate: (view: View, context?: any) => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, notifications, onMarkNotificationsRead, navigate }) => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  return (
    <header className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm z-10">
      <button onClick={toggleSidebar} className="md:hidden p-2 text-gray-600 hover:text-primary-600" aria-label="Open sidebar">
        <Menu size={24} />
      </button>
      
      <div className="flex-1"></div>

      <div className="flex items-center space-x-4">
        <NotificationBell 
            notifications={notifications}
            onMarkRead={onMarkNotificationsRead}
            onNavigate={navigate}
        />
        <div className="hidden sm:block text-right">
          <p className="font-semibold text-gray-800">{user.name}</p>
          <p className="text-sm text-gray-500 capitalize">{user.role}</p>
        </div>
  <Avatar name={user.name} src={user.avatarUrl} size={40} />
        <button 
          onClick={logout} 
          className="ml-2 px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;