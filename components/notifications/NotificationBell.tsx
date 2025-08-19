import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { Notification, View } from '../../types';

interface NotificationBellProps {
  notifications: Notification[];
  onMarkRead: (ids: string[]) => void;
  onNavigate: (view: View, context: any) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, onMarkRead, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const sortedNotifications = useMemo(() => 
    [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), 
  [notifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        onMarkRead(unreadIds);
    }
  };
  
  const handleNotificationClick = (notification: Notification) => {
    if (notification.link) {
        onNavigate(notification.link.view, notification.link.context);
    }
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleToggle} 
        className="relative p-2 text-gray-600 hover:text-primary-600 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border z-20 overflow-hidden">
          <div className="p-3 font-bold text-gray-800 border-b">Notifications</div>
          <div className="max-h-96 overflow-y-auto">
            {sortedNotifications.length > 0 ? (
              <ul>
                {sortedNotifications.map(notif => (
                  <li key={notif.id}>
                    <button
                      onClick={() => handleNotificationClick(notif)}
                      className={`w-full text-left px-4 py-3 transition-colors ${!notif.read ? 'bg-primary-50' : ''} ${notif.link ? 'hover:bg-gray-100' : 'cursor-default'}`}
                    >
                      <p className={`text-sm ${!notif.read ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-6 text-center text-gray-500">No new notifications.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
