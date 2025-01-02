import React from 'react';

interface SafeAreaProps {
  children: React.ReactNode;
  top?: boolean;
  bottom?: boolean;
}

export const SafeArea: React.FC<SafeAreaProps> = ({
  children,
  top = true,
  bottom = true,
}) => {
  return (
    <div
      className={`
        ${top ? 'pt-safe' : ''}
        ${bottom ? 'pb-safe' : ''}
      `}
    >
      {children}
    </div>
  );
};
