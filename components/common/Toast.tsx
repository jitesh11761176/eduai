import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

interface ToastProps {
  message: string;
  onDismiss: () => void;
  cta?: { text: string; action: () => void };
  icon?: React.ReactNode;
}

const Toast: React.FC<ToastProps> = ({ message, onDismiss, cta, icon }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 10000); // Auto-dismiss after 10 seconds
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-white rounded-xl shadow-2xl border-2 border-primary-200 z-[100] animate-fade-in-up">
      <div className="flex items-start space-x-4">
        {icon && <div className="flex-shrink-0 mt-1">{icon}</div>}
        <div className="flex-1">
          <p className="font-semibold text-gray-800">AI Assistant</p>
          <p className="text-sm text-gray-600">{message}</p>
          {cta && (
            <Button size="sm" onClick={cta.action} className="mt-3">
              {cta.text}
            </Button>
          )}
        </div>
        <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600" aria-label="Dismiss notification">
          <X size={20} />
        </button>
      </div>
       <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Toast;
