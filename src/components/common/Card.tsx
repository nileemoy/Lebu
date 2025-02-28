import React from 'react';
import { CardProps } from '../../types';

const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  description,
  footer,
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
      {...props}
    >
      {(title || description) && (
        <div className="p-6 pb-3">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {description && <p className="text-gray-500 mt-1">{description}</p>}
        </div>
      )}
      
      <div className="p-6">
        {children}
      </div>
      
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;