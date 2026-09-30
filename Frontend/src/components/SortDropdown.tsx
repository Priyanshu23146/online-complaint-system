import { ArrowUpDown } from "lucide-react";

/**
 * SortDropdown Component
 *
 * Features:
 * - Sort by newest/oldest
 * - Sort by most/least upvotes
 * - Shows current sort option
 *
 * Props:
 *   value: string - Current sort option
 *   onChange: (value: string) => void - Called when sort changes
 */
interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const sortOptions = [
    {
      value: "newest",
      label: "🕐 Newest First",
      description: "Recently added",
    },
    { value: "oldest", label: "📅 Oldest First", description: "Oldest first" },
    {
      value: "most-upvotes",
      label: "👍 Most Upvotes",
      description: "Most voted",
    },
    {
      value: "least-upvotes",
      label: "👎 Least Upvotes",
      description: "Least voted",
    },
  ];

  const currentSort =
    sortOptions.find((opt) => opt.value === value) || sortOptions[0];

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all cursor-pointer"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Show current sort with description */}
      <div className="hidden sm:block ml-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {currentSort.description}
        </p>
      </div>
    </div>
  );
}

/**
 * USAGE IN PARENT COMPONENT:
 *
 * const [sortBy, setSortBy] = useState('newest');
 *
 * const handleSort = (newSort: string) => {
 *   setSortBy(newSort);
 *   // This will trigger useEffect in parent to fetch with new sort
 * };
 *
 * <SortDropdown value={sortBy} onChange={handleSort} />
 *
 * SORT OPTIONS EXPLAINED:
 *
 * newest:
 *   Query: orderBy: { createdAt: 'desc' }
 *   Result: Most recent complaints first
 *   Use case: See latest complaints
 *
 * oldest:
 *   Query: orderBy: { createdAt: 'asc' }
 *   Result: Oldest complaints first
 *   Use case: Review old unresolved issues
 *
 * most-upvotes:
 *   Query: orderBy: { upvotes: 'desc' }
 *   Result: Most voted complaints first
 *   Use case: Address trending issues
 *
 * least-upvotes:
 *   Query: orderBy: { upvotes: 'asc' }
 *   Result: Least voted complaints first
 *   Use case: Find overlooked issues
 */
