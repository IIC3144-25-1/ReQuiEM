import { CirclePlusIcon } from 'lucide-react';
import React, { FC } from 'react';

interface AddButtonProps {
  textToShow: string;
  onClick: () => void;
}

const AddButton: FC<AddButtonProps> = ({ textToShow, onClick }) => {
  return (
    <button
      className="flex w-full items-center justify-center rounded-md p-2 mt-4 
                 bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-all 
                 dark:bg-slate-800 dark:hover:bg-blue-900"
      type="button"
      onClick={onClick}
    >
      <CirclePlusIcon className="w-6 h-6" />
      <span className="ml-2">{textToShow}</span>
    </button>
  );
};

export default AddButton;
