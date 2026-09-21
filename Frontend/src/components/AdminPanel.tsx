import React from "react";
import { ShieldCheck, PlusCircle, UserPlus, Trash2 } from "lucide-react";

interface Props {
  departments: any[];
  newDeptName: string;
  setNewDeptName: (val: string) => void;
  isCreatingDept: boolean;
  handleCreateDepartment: () => void;
  setAdminDeptId: (id: number) => void;
  setGeneratedCreds: (val: any) => void;
  setIsAssignAdminOpen: (val: boolean) => void;
  handleDeleteDepartment: (id: number) => void;
}

const AdminPanel: React.FC<Props> = ({
  departments,
  newDeptName,
  setNewDeptName,
  isCreatingDept,
  handleCreateDepartment,
  setAdminDeptId,
  setGeneratedCreds,
  setIsAssignAdminOpen,
  handleDeleteDepartment,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <ShieldCheck className="h-7 w-7 text-indigo-600" /> Admin Control Panel
      </h2>

      <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm dark:shadow-lg border border-slate-100 dark:border-neutral-800">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
          Create New Department
        </h3>
        <div className="flex gap-4">
          <input
            type="text"
            value={newDeptName}
            onChange={(e) => setNewDeptName(e.target.value)}
            placeholder="e.g. Mechanical Dept, IT Infrastructure"
            className="flex-1 rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 placeholder:text-slate-400 dark:placeholder:text-neutral-400 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            onClick={handleCreateDepartment}
            disabled={isCreatingDept || !newDeptName}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
          >
            <PlusCircle className="h-5 w-5" /> Add
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm dark:shadow-lg border border-slate-100 dark:border-neutral-800">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
          Active Departments
        </h3>
        {departments.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">
            No departments created yet.
          </p>
        ) : (
          <div className="space-y-3">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="flex items-center justify-between p-4 border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-800 rounded-lg"
              >
                <span className="font-semibold text-slate-700 dark:text-slate-100">
                  {dept.name}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAdminDeptId(dept.id);
                      setGeneratedCreds(null);
                      setIsAssignAdminOpen(true);
                    }}
                    className="text-sm flex items-center gap-1 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 px-3 py-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-300 transition font-medium"
                  >
                    <UserPlus className="h-4 w-4" /> Assign
                  </button>
                  <button
                    onClick={() => handleDeleteDepartment(dept.id)}
                    className="text-sm flex items-center gap-1 bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-300 transition font-medium shadow-sm"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
