import { CaretDoubleLeft, CaretDoubleRight, CaretLeft, CaretRight } from '@phosphor-icons/react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const canPrevious = currentPage > 0;
  const canNext = currentPage < totalPages - 1;

  return (
    <div className="flex items-center justify-between gap-4 text-sm text-gray-600 p-4">
      {onPageSizeChange && (
        <div className="flex items-center gap-1">
          <span className="mr-1">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="text-xs py-1 pl-2 pr-6 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            {[10, 20, 30, 40, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-1">
        <span>
          {currentPage * pageSize + 1}-
          {Math.min((currentPage + 1) * pageSize, totalItems)} of {totalItems}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(0)}
          disabled={!canPrevious}
          className="p-1.5 rounded-md disabled:opacity-30 hover:bg-secondary-light transition-colors"
          aria-label="First page"
        >
          <CaretDoubleLeft size={20} className="h-4 w-4" />
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canPrevious}
          className="p-1.5 rounded-md disabled:opacity-30 hover:bg-secondary-light transition-colors"
          aria-label="Previous page"
        >
          <CaretLeft size={20} className="h-4 w-4" />
        </button>

        <div className="px-2 py-1 text-xs bg-primary text-white rounded-md">
          {currentPage + 1}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canNext}
          className="p-1.5 rounded-md disabled:opacity-30 hover:bg-secondary-light transition-colors"
          aria-label="Next page"
        >
          <CaretRight size={20} className="h-4 w-4" />
        </button>

        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={!canNext}
          className="p-1.5 rounded-md disabled:opacity-30 hover:bg-secondary-light transition-colors"
          aria-label="Last page"
        >
          <CaretDoubleRight size={20} className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}