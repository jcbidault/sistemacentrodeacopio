import React from 'react';
import { theme } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  onClick,
}) => {
  const baseStyles = 'rounded-lg transition-all duration-200';
  
  const variants = {
    default: 'bg-white shadow-sm hover:shadow-md',
    elevated: 'bg-white shadow-md hover:shadow-lg',
    outlined: 'border border-gray-200 hover:border-gray-300 bg-white',
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className} ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
