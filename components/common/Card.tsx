import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const interactiveClasses = onClick ? 'hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1 cursor-pointer' : '';

  return (
    <div 
      className={`bg-white/60 backdrop-blur-lg rounded-xl shadow-lg shadow-primary-500/5 overflow-hidden transition-all duration-300 border border-white/30 ${interactiveClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;