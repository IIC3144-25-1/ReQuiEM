import React, { FC } from "react";
import { ChevronLeftCircleIcon, ChevronRightCircleIcon } from "lucide-react";

interface SelectPaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

const SelectPagination: FC<SelectPaginationProps> = ({
  currentPage,
  totalPages,
  setCurrentPage,
}) => {
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-full flex items-center px-3 border border-gray-300 dark:border-gray-600">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="p-2 text-gray-700 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white transition disabled:opacity-50"
        >
          <ChevronLeftCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <div className="flex items-center mx-2 sm:mx-4">
          <div className="mr-2">
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="font-medium bg-transparent dark:bg-gray-800 border border-gray-400 dark:border-gray-500 rounded px-1 py-1 text-xs sm:text-sm outline-none text-gray-900 dark:text-gray-200"
            >
              {Array.from({ length: totalPages }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          <div className="whitespace-nowrap font-medium text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            de {totalPages}
          </div>
        </div>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="p-2 text-gray-700 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white transition disabled:opacity-50"
        >
          <ChevronRightCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>
    </div>
  );
};

export default SelectPagination;
