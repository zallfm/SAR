import React, { useEffect } from 'react';

interface InfoModalProps {
  onClose: () => void;
  title: string;
  message: string;
}

const InfoModal: React.FC<InfoModalProps> = ({ onClose, title, message }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose} aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        </div>
        <div className="p-6">
          <p className="text-base text-gray-700">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;