import { X } from "lucide-react";

/**
 * * FilterPanel Component
 *
 * Features:
 * - Status filter (Pending, In-Progress, Resolved)
 * - Department filter (fetched from API)
 * - Date range filter (start and end date)
 * - Clear all filters button
 *
 * Props:
 *   filters: object - Current filter values
 *   onFilterChange: (name, value) => void - Called when filter changes
 *   onClearAll: () => void - Called when clear all is clicked
 *   departments: array - Available departments
 *   isLoading: boolean - Shows loading state
 */
interface FilterPanelProps {
  filters: {
    status: string;
    departmentId: string;
    startDate: string;
    endDate: string;
  };
  onFilterChange: (name: string, value: string) => void;
  onClearAll: () => void;
  departments: any[];
  isLoading?: boolean;
}

export default function FilterPanel({
  filters,
  onFilterChange,
  onClearAll,
  departments = [],
  isLoading = false,
}: FilterPanelProps) {
  const statusOptions = ["Pending", "In-Progress", "Resolved"];
  const hasActiveFilters =
    filters.status ||
    filters.departmentId ||
    filters.startDate ||
    filters.endDate;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm dark:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-50 flex items-center gap-2">
          🔽 Filters
          {hasActiveFilters && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1"
            title="Clear all filters"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* STATUS FILTER */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange("status", e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all disabled:opacity-50"
          >
            <option value="">All Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {filters.status && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Showing: {filters.status}
            </p>
          )}
        </div>

        {/* DEPARTMENT FILTER */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Department
          </label>
          <select
            value={filters.departmentId}
            onChange={(e) => onFilterChange("departmentId", e.target.value)}
            disabled={isLoading || departments.length === 0}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all disabled:opacity-50"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          {filters.departmentId && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Showing:{" "}
              {
                departments.find((d) => d.id === Number(filters.departmentId))
                  ?.name
              }
            </p>
          )}
        </div>

        {/* START DATE FILTER */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            From Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange("startDate", e.target.value)}
            disabled={isLoading}
            max={filters.endDate || undefined}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all disabled:opacity-50"
          />
          {filters.startDate && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              From: {new Date(filters.startDate).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* END DATE FILTER */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            To Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onFilterChange("endDate", e.target.value)}
            disabled={isLoading}
            min={filters.startDate || undefined}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all disabled:opacity-50"
          />
          {filters.endDate && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Until: {new Date(filters.endDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-300">
            <strong>Active Filters:</strong>{" "}
            {[
              filters.status && `Status: ${filters.status}`,
              filters.departmentId &&
                `Dept: ${
                  departments.find((d) => d.id === Number(filters.departmentId))
                    ?.name
                }`,
              filters.startDate &&
                `From: ${new Date(filters.startDate).toLocaleDateString()}`,
              filters.endDate &&
                `To: ${new Date(filters.endDate).toLocaleDateString()}`,
            ]
              .filter(Boolean)
              .join(" • ")}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * USAGE IN PARENT COMPONENT:
 *
 * const [filters, setFilters] = useState({
 *   status: '',
 *   departmentId: '',
 *   startDate: '',
 *   endDate: '',
 * });
 *
 * const handleFilterChange = (name: string, value: string) => {
 *   setFilters(prev => ({ ...prev, [name]: value }));
 *   // This will trigger useEffect in parent to fetch with new filters
 * };
 *
 * const handleClearAll = () => {
 *   setFilters({
 *     status: '',
 *     departmentId: '',
 *     startDate: '',
 *     endDate: '',
 *   });
 * };
 *
 * <FilterPanel
 *   filters={filters}
 *   onFilterChange={handleFilterChange}
 *   onClearAll={handleClearAll}
 *   departments={departments}
 * />
 *
 * WHY THIS COMPONENT?
 *
 * ✅ Multiple filter types in one place
 * ✅ Date validation (end date can't be before start date)
 * ✅ Clear button for quick reset
 * ✅ Active filters summary
 * ✅ Disabled state during loading
 * ✅ Dark mode support
 * ✅ Responsive grid layout
 */
