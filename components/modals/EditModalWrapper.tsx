import React, { FC, MouseEvent, ReactNode } from "react";

interface ModalWrapperProps {
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  children: ReactNode;
}

const EditModalWrapper: FC<ModalWrapperProps> = ({ title, onClose, children, onConfirm }) => {
  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mx-4 sm:mx-0">
        {title && (
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{title}</h2>
        )}
        {children}
        <div className="flex gap-4 mt-4">
          <button
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-2 px-4 rounded-md hover:from-green-600 hover:to-green-800 transition ease-in-out duration-150"
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModalWrapper;
