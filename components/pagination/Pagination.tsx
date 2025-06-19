// components/pagination/Pagination.tsx
"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const minPage = Math.max(1, currentPage - 2);
    const maxPage = Math.min(totalPages, currentPage + 2);

    if (minPage > 1) pages.push(1, "...");

    for (let i = minPage; i <= maxPage; i++) pages.push(i);

    if (maxPage < totalPages) pages.push("...", totalPages);

    return pages;
  };

  return (
    <div className="flex items-center gap-2 justify-center py-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2 py-1 rounded hover:bg-gray-100 disabled:text-gray-400"
      >
        &lt;
      </button>
      {getPages().map((page, idx) =>
        page === "..." ? (
          <span key={idx} className="px-2 text-gray-500">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(Number(page))}
            className={`px-3 py-1 rounded ${currentPage === page ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}
            disabled={currentPage === page}
          >
            {page}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2 py-1 rounded hover:bg-gray-100 disabled:text-gray-400"
      >
        &gt;
      </button>
    </div>
  );
}
