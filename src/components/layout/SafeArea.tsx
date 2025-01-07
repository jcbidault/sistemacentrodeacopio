import React from 'react';

interface SafeAreaProps {
  children: React.ReactNode;
  top?: boolean;
  bottom?: boolean;
}

export const SafeArea: React.FC<SafeAreaProps> = ({
  children,
  top = false,
  bottom = false,
}) => {
  return (
    <div
      className={`
        ${top ? 'pt-safe' : ''}
        ${bottom ? 'pb-safe' : ''}
        min-h-screen
        flex
        flex-col
      `}
    >
      {children}
    </div>
  );
};
