import React from "react";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  departments: any[];
  selectedDept: string;
  setSelectedDept: (val: string) => void;
  newTitle: string;
  setNewTitle: (val: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const RaiseComplaintModal: React.FC<Props> = ({
  isOpen,
  onClose,
  departments,
  selectedDept,
  setSelectedDept,
  newTitle,
  setNewTitle,
  isSubmitting,
  onSubmit,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-slate-900">
            Raise a Complaint
          </h3>
          <button onClick={onClose}>
            <X className="h-6 w-6 text-slate-400" />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Select Department
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              required
            >
              <option value="" disabled>
                Select a department
              </option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Issue Description
            </label>
            <textarea
              required
              rows={3}
              className="w-full rounded-lg border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
          >
            {isSubmitting ? "Submitting..." : "Submit Issue"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default RaiseComplaintModal;
