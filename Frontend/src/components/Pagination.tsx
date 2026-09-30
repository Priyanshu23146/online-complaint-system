import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Pagination Component
 *
 * Features:
 * - Previous/Next buttons
 * - Current page display
 * - Total pages info
 * - Quick jump to page input
 * - Disabled state during loading
 *
 * Props:
 *   currentPage: number - Current page (1-indexed)
 *   totalPages: number - Total number of pages
 *   totalItems: number - Total number of items
 *   itemsPerPage: number - Items per page
 *   onPageChange: (page: number) => void - Called when page changes
 *   isLoading: boolean - Shows loading state
 */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  // Calculate which items are shown on current page
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Handle page changes
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleGoToPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pageNum = parseInt(e.target.value);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
    }
  };

  // Don't show if only 1 page
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Left: Info */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p>
          Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of{" "}
          <strong>{totalItems}</strong> complaints
        </p>
      </div>

      {/* Center: Page Navigation */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1 || isLoading}
          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          title="Previous page"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>

        {/* Page Numbers (Simple Version) */}
        <div className="flex items-center gap-1">
          {/* First page */}
          {currentPage > 2 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                disabled={isLoading}
                className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium transition-all"
              >
                1
              </button>
              {currentPage > 3 && (
                <span className="text-gray-500 dark:text-gray-400">...</span>
              )}
            </>
          )}

          {/* Previous page (if exists) */}
          {currentPage > 1 && (
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={isLoading}
              className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium transition-all"
            >
              {currentPage - 1}
            </button>
          )}

          {/* Current page (highlighted) */}
          <div className="px-3 py-1 rounded-lg bg-blue-600 dark:bg-blue-700 text-white text-sm font-bold">
            {currentPage}
          </div>

          {/* Next page (if exists) */}
          {currentPage < totalPages && (
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={isLoading}
              className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium transition-all"
            >
              {currentPage + 1}
            </button>
          )}

          {/* Last page */}
          {currentPage < totalPages - 1 && (
            <>
              {currentPage < totalPages - 2 && (
                <span className="text-gray-500 dark:text-gray-400">...</span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                disabled={isLoading}
                className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium transition-all"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages || isLoading}
          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          title="Next page"
          aria-label="Next page"
        >
          <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Right: Quick Jump */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="page-jump"
          className="text-sm text-gray-600 dark:text-gray-400"
        >
          Go to:
        </label>
        <input
          id="page-jump"
          type="number"
          min="1"
          max={totalPages}
          defaultValue={currentPage}
          onChange={handleGoToPage}
          disabled={isLoading}
          className="w-12 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          title="Jump to page"
        />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          / {totalPages}
        </span>
      </div>
    </div>
  );
}

/**
 * USAGE IN PARENT COMPONENT:
 *
 * const [currentPage, setCurrentPage] = useState(1);
 * const [pagination, setPagination] = useState({
 *   totalComplaints: 0,
 *   totalPages: 0,
 * });
 *
 * const handlePageChange = (page: number) => {
 *   setCurrentPage(page);
 *   // This will trigger useEffect in parent to fetch new page
 * };
 *
 * <Pagination
 *   currentPage={currentPage}
 *   totalPages={pagination.totalPages}
 *   totalItems={pagination.totalComplaints}
 *   itemsPerPage={20}
 *   onPageChange={handlePageChange}
 *   isLoading={loading}
 * />
 *
 * WHY THIS COMPONENT?
 *
 * ✅ Smart page button display (doesn't show all 100 pages)
 * ✅ Disabled state prevents clicking while loading
 * ✅ Shows which item range is displayed
 * ✅ Quick jump input for power users
 * ✅ Smooth scroll to top on page change
 * ✅ Dark mode support
 * ✅ Mobile responsive
 */
