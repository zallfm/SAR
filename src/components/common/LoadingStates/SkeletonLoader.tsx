import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'chart' | 'table' | 'text';
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = 'card', className = '' }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        );

      case 'chart':
        return (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
            <div className="p-6 border-b border-gray-100">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="flex space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
            <div className="p-6 border-b border-gray-100">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex space-x-4">
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-200 rounded animate-pulse h-32"></div>
        );
    }
  };

  return (
    <div className={className}>
      {renderSkeleton()}
    </div>
  );
};

export default SkeletonLoader;
