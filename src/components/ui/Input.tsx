import React from 'react';
import { theme } from '../../theme';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  startIcon,
  endIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseInputStyles = `
    w-full
    px-3
    py-2
    bg-white
    border
    rounded-md
    transition-all
    duration-200
    focus:outline-none
    focus:ring-2
    focus:ring-offset-0
    disabled:bg-gray-50
    disabled:text-gray-500
    disabled:cursor-not-allowed
  `;

  const inputStyles = error
    ? `${baseInputStyles} border-error-300 text-error-900 focus:border-error-500 focus:ring-error-200`
    : `${baseInputStyles} border-gray-300 focus:border-primary-500 focus:ring-primary-200`;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {startIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{startIcon}</span>
          </div>
        )}
        <input
          className={`
            ${inputStyles}
            ${startIcon ? 'pl-10' : ''}
            ${endIcon ? 'pr-10' : ''}
          `}
          disabled={disabled}
          {...props}
        />
        {endIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{endIcon}</span>
          </div>
        )}
      </div>
      {(error || helperText) && (
        <p
          className={`mt-1 text-sm ${
            error ? 'text-error-600' : 'text-gray-500'
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};
