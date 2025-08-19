import React, { useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { BookOpen, Users, BarChart2, Home, CheckSquare, FilePlus, Calendar, MessageCircle, BarChartHorizontal, UserCog, Briefcase, ClipboardEdit } from 'lucide-react';
import { View } from '../../types';

type NavigateFunction = (view: View, context?: any) => void;

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

interface SidebarProps {
  currentView: View;
  navigate: NavigateFunction;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, navigate, isOpen, setIsOpen }) => {
  const { user } = useContext(AuthContext);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close sidebar on click outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      { id: 'dashboard', icon: <Home size={20} />, label: 'Dashboard', onClick: () => navigate('dashboard') },
    ];

    if (user?.role !== 'admin' && user?.role !== 'principal') {
        baseItems.push({ id: 'calendar', icon: <Calendar size={20} />, label: 'Calendar', onClick: () => navigate('calendar') });
    }

    switch (user?.role) {
      case 'admin':
        return [
          ...baseItems,
          { id: 'manageUsers', icon: <Users size={20} />, label: 'Manage Users', onClick: () => navigate('manageUsers') },
          { id: 'analytics', icon: <BarChart2 size={20} />, label: 'Analytics' },
        ];
      case 'principal':
         return [
          ...baseItems,
          { id: 'analytics', icon: <BarChart2 size={20} />, label: 'School Analytics', onClick: () => navigate('dashboard') }, // Principal dashboard is analytics
        ];
      case 'teacher':
        return [
          ...baseItems,
          { id: 'createTest', icon: <FilePlus size={20} />, label: 'Create Test', onClick: () => navigate('createTest') },
          { id: 'lessonPlanner', icon: <ClipboardEdit size={20} />, label: 'Lesson Planner', onClick: () => navigate('lessonPlanner') },
          { id: 'teacherAnalytics', icon: <BarChartHorizontal size={20} />, label: 'Analytics', onClick: () => navigate('teacherAnalytics') },
          { id: 'teacherCommunity', icon: <MessageCircle size={20} />, label: 'Teacher Community', onClick: () => navigate('teacherCommunity') },
        ];
      case 'student':
        return [
          ...baseItems,
          { id: 'careerCenter', icon: <Briefcase size={20} />, label: 'Career Center', onClick: () => navigate('careerCenter') },
        ];
      default:
        return baseItems;
    }
  };

  const navItems = getNavItems();

  const isNavItemActive = (itemId: string) => {
    if (itemId === 'dashboard' && (currentView === 'dashboard' || currentView === 'courseDetail' || currentView === 'discussionThread' || currentView === 'parentDashboard' || currentView === 'projectWorkspace')) {
        return true;
    }
    return itemId === currentView;
  }

  const sidebarClasses = `
    w-64 bg-white/80 backdrop-blur-md text-gray-800 flex flex-col shadow-lg transition-transform duration-300 ease-in-out
    fixed inset-y-0 left-0 z-30 md:relative md:translate-x-0 border-r border-gray-200/60
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={() => setIsOpen(false)}></div>}

      <div ref={sidebarRef} className={sidebarClasses}>
        <div className="p-6 text-2xl font-bold text-primary-600 border-b">
          EduAI Platform
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              disabled={!item.onClick}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 text-left ${
                item.onClick ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              } ${
                isNavItemActive(item.id)
                  ? 'bg-primary-100 text-primary-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <p className="text-sm text-gray-500">© 2024 EduAI Inc.</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;