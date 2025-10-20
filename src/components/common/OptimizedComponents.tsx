/**
 * Optimized Components
 * 
 * @description Collection of optimized React components using React.memo and performance best practices
 * @version 1.0.0
 * @author SAR Development Team
 */

import React from 'react';

/**
 * Optimized Button Component
 * 
 * @description Button component with React.memo optimization
 * @param props - Button props
 * @returns Optimized button component
 */
export const OptimizedButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = React.memo(({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary', 
  size = 'md',
  className = '' 
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}, (prevProps, nextProps) => {
  return prevProps.children === nextProps.children &&
         prevProps.onClick === nextProps.onClick &&
         prevProps.disabled === nextProps.disabled &&
         prevProps.variant === nextProps.variant &&
         prevProps.size === nextProps.size &&
         prevProps.className === nextProps.className;
});

/**
 * Optimized Input Component
 * 
 * @description Input component with React.memo optimization
 * @param props - Input props
 * @returns Optimized input component
 */
export const OptimizedInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
}> = React.memo(({ 
  value, 
  onChange, 
  placeholder = '', 
  type = 'text', 
  disabled = false, 
  required = false,
  className = '',
  id
}) => {
  const baseClasses = 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';
  const classes = `${baseClasses} ${disabledClasses} ${className}`;
  
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      className={classes}
    />
  );
}, (prevProps, nextProps) => {
  return prevProps.value === nextProps.value &&
         prevProps.onChange === nextProps.onChange &&
         prevProps.placeholder === nextProps.placeholder &&
         prevProps.type === nextProps.type &&
         prevProps.disabled === nextProps.disabled &&
         prevProps.required === nextProps.required &&
         prevProps.className === nextProps.className &&
         prevProps.id === nextProps.id;
});

/**
 * Optimized Card Component
 * 
 * @description Card component with React.memo optimization
 * @param props - Card props
 * @returns Optimized card component
 */
export const OptimizedCard: React.FC<{
  children: React.ReactNode;
  title?: string;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}> = React.memo(({ 
  children, 
  title, 
  className = '', 
  headerClassName = '',
  bodyClassName = ''
}) => {
  const cardClasses = `bg-white rounded-lg shadow-sm border border-gray-200 ${className}`;
  const headerClasses = `px-6 py-4 border-b border-gray-200 ${headerClassName}`;
  const bodyClasses = `p-6 ${bodyClassName}`;
  
  return (
    <div className={cardClasses}>
      {title && (
        <div className={headerClasses}>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className={bodyClasses}>
        {children}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.children === nextProps.children &&
         prevProps.title === nextProps.title &&
         prevProps.className === nextProps.className &&
         prevProps.headerClassName === nextProps.headerClassName &&
         prevProps.bodyClassName === nextProps.bodyClassName;
});

/**
 * Optimized Loading Spinner Component
 * 
 * @description Loading spinner component with React.memo optimization
 * @param props - Loading spinner props
 * @returns Optimized loading spinner component
 */
export const OptimizedLoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'gray' | 'white';
  className?: string;
}> = React.memo(({ 
  size = 'md', 
  color = 'blue', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  const colorClasses = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    white: 'text-white'
  };
  
  const classes = `animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`;
  
  return (
    <svg className={classes} fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}, (prevProps, nextProps) => {
  return prevProps.size === nextProps.size &&
         prevProps.color === nextProps.color &&
         prevProps.className === nextProps.className;
});

/**
 * Optimized Modal Component
 * 
 * @description Modal component with React.memo optimization
 * @param props - Modal props
 * @returns Optimized modal component
 */
export const OptimizedModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = React.memo(({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  className = ''
}) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };
  
  const modalClasses = `bg-white rounded-lg shadow-xl ${sizeClasses[size]} ${className}`;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full">
          <div className={modalClasses}>
            {title && (
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              </div>
            )}
            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.isOpen === nextProps.isOpen &&
         prevProps.onClose === nextProps.onClose &&
         prevProps.title === nextProps.title &&
         prevProps.children === nextProps.children &&
         prevProps.size === nextProps.size &&
         prevProps.className === nextProps.className;
});

/**
 * Optimized Table Component
 * 
 * @description Table component with React.memo optimization
 * @param props - Table props
 * @returns Optimized table component
 */
export const OptimizedTable: React.FC<{
  headers: string[];
  data: any[][];
  className?: string;
  headerClassName?: string;
  rowClassName?: string;
  cellClassName?: string;
}> = React.memo(({ 
  headers, 
  data, 
  className = '',
  headerClassName = '',
  rowClassName = '',
  cellClassName = ''
}) => {
  const tableClasses = `min-w-full divide-y divide-gray-200 ${className}`;
  const headerClasses = `bg-gray-50 ${headerClassName}`;
  const rowClasses = `hover:bg-gray-50 ${rowClassName}`;
  const cellClasses = `px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${cellClassName}`;
  
  return (
    <div className="overflow-x-auto">
      <table className={tableClasses}>
        <thead className={headerClasses}>
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowClasses}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className={cellClasses}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.headers) === JSON.stringify(nextProps.headers) &&
         JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data) &&
         prevProps.className === nextProps.className &&
         prevProps.headerClassName === nextProps.headerClassName &&
         prevProps.rowClassName === nextProps.rowClassName &&
         prevProps.cellClassName === nextProps.cellClassName;
});

export default {
  OptimizedButton,
  OptimizedInput,
  OptimizedCard,
  OptimizedLoadingSpinner,
  OptimizedModal,
  OptimizedTable
};
