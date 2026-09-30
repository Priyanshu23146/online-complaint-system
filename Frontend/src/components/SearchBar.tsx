import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

/**
 * SearchBar Component
 *
 * Features:
 * - Text input for searching
 * - Debounced search (300ms delay to avoid too many API calls)
 * - Clear button
 * - Placeholder hint
 *
 * Props:
 *   value: string - Current search value
 *   onChange: (value: string) => void - Called with debounced value
 *   placeholder: string - Input placeholder text
 *   isLoading: boolean - Shows loading state
 *
 * Example usage:
 * const [search, setSearch] = useState('');
 * <SearchBar
 *   value={search}
 *   onChange={setSearch}
 *   placeholder="Search complaints by title or description..."
 * />
 */
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search complaints...",
  isLoading = false,
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  /**
   * Debouncing Logic:
   *
   * Without debouncing:
   *   User types "database"
   *   Each keystroke triggers API call
   *   API calls: "d", "da", "dat", "data", "datab", ...
   *   Result: 8 unnecessary API calls!
   *
   * With debouncing:
   *   User types "database"
   *   Waits 300ms after last keystroke
   *   Then triggers ONE API call
   *   Result: Only 1 API call! 🚀
   */
  useEffect(() => {
    if (inputValue === value) return;

    // Set up timer
    const timer = setTimeout(() => {
      onChange(inputValue);
    }, 300); // 300ms delay

    // Cleanup: if user types again before timer fires, cancel previous timer
    return () => clearTimeout(timer);
  }, [inputValue, onChange, value]);

  // Update local input immediately for responsive UI
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Clear search
  const handleClear = () => {
    setInputValue("");
    onChange("");
  };

  return (
    <div className="relative">
      <div className="relative flex items-center">
        {/* Search Icon */}
        <Search className="absolute left-3 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />

        {/* Input Field */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
        />

        {/* Clear Button (visible when input has text) */}
        {inputValue && !isLoading && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
            aria-label="Clear search"
            title="Clear search"
          >
            <X className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </button>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute right-3">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Hint Text */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1">
        Searches in title and description
      </p>
    </div>
  );
}

/**
 * USAGE IN PARENT COMPONENT:
 *
 * const [search, setSearch] = useState('');
 * const [isLoading, setIsLoading] = useState(false);
 *
 * const handleSearch = async (searchTerm: string) => {
 *   setIsLoading(true);
 *   try {
 *     const response = await API.get(`/complaints?search=${searchTerm}`);
 *     setComplaints(response.data.complaints);
 *   } finally {
 *     setIsLoading(false);
 *   }
 * };
 *
 * <SearchBar
 *   value={search}
 *   onChange={handleSearch}
 *   isLoading={isLoading}
 * />
 *
 * WHY THIS COMPONENT?
 *
 * ✅ Debouncing prevents API call spam
 * ✅ Clear button improves UX
 * ✅ Loading state shows feedback
 * ✅ Accessible (labels, hints)
 * ✅ Dark mode support
 * ✅ Mobile responsive
 */
