import React, { useEffect } from 'react';

interface SuccessModalProps {
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose} aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Information</h2>
        </div>
        <div className="p-6">
          <p className="text-base text-gray-700">Save Successfully</p>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
