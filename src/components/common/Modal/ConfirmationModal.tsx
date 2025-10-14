import React from 'react';

interface ConfirmationModalProps {
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ onClose, onConfirm, title, message }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        </div>
        <div className="p-6">
          <p className="text-base text-gray-700">{message}</p>
        </div>
        <div className="flex justify-end items-center p-4 bg-gray-50 border-t gap-3 rounded-b-lg">
          <button 
            onClick={onClose} 
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            No
          </button>
          <button 
            onClick={onConfirm}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;