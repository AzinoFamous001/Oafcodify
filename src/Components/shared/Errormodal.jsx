import React from "react";
import { FaExclamationCircle } from "react-icons/fa";
import Button from "../../Shared/Buttons";

const ErrorModal = ({ isOpen, onClose, message, title = "Error!" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center border border-red-50">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <FaExclamationCircle size={48} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>
        <Button
          onClick={onClose}
          variant="primary"
          className="w-full py-4 text-lg font-bold shadow-lg shadow-blue-200"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default ErrorModal;
