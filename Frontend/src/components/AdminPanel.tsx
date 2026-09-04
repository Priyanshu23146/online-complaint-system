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
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <ShieldCheck className="h-7 w-7 text-indigo-600" /> Admin Control Panel
      </h2>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          Create New Department
        </h3>
        <div className="flex gap-4">
          <input
            type="text"
            value={newDeptName}
            onChange={(e) => setNewDeptName(e.target.value)}
            placeholder="e.g. Mechanical Dept, IT Infrastructure"
            className="flex-1 rounded-lg border border-slate-300 py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 outline-none"
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

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          Active Departments
        </h3>
        {departments.length === 0 ? (
          <p className="text-slate-500">No departments created yet.</p>
        ) : (
          <div className="space-y-3">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="flex items-center justify-between p-4 border border-slate-100 bg-slate-50 rounded-lg"
              >
                <span className="font-semibold text-slate-700">
                  {dept.name}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAdminDeptId(dept.id);
                      setGeneratedCreds(null);
                      setIsAssignAdminOpen(true);
                    }}
                    className="text-sm flex items-center gap-1 bg-white border border-slate-300 px-3 py-1.5 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition font-medium"
                  >
                    <UserPlus className="h-4 w-4" /> Assign
                  </button>
                  <button
                    onClick={() => handleDeleteDepartment(dept.id)}
                    className="text-sm flex items-center gap-1 bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-md hover:bg-red-50 hover:border-red-300 transition font-medium shadow-sm"
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
