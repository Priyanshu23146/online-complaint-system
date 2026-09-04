import React from "react";
import {
  LayoutDashboard,
  CalendarCheck,
  Bell,
  BookOpen,
  ShieldCheck,
  Globe,
  LogOut,
  MonitorDot,
} from "lucide-react";

interface SidebarProps {
  currentUser: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  handleLogout,
}) => {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full shadow-2xl z-10">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 tracking-wide">
          <span className="bg-indigo-600 p-2 rounded-lg shadow-lg">
            <MonitorDot className="h-6 w-6 text-white" />
          </span>
          Apna Desk
        </h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {currentUser.role === "SUPER_ADMIN" ? (
          <button
            onClick={() => setActiveTab("superadmin")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "superadmin" ? "bg-indigo-600 text-white" : "hover:bg-slate-800 hover:text-white"}`}
          >
            <Globe className="h-5 w-5" /> Client Management
          </button>
        ) : (
          <>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "dashboard" ? "bg-indigo-600 text-white" : "hover:bg-slate-800 hover:text-white"}`}
            >
              <LayoutDashboard className="h-5 w-5" /> Complaints
            </button>
            <button
              onClick={() => setActiveTab("attendance")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "attendance" ? "bg-indigo-600 text-white" : "hover:bg-slate-800 hover:text-white"}`}
            >
              <CalendarCheck className="h-5 w-5" /> Attendance
            </button>
            <button
              onClick={() => setActiveTab("notices")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "notices" ? "bg-indigo-600 text-white" : "hover:bg-slate-800 hover:text-white"}`}
            >
              <Bell className="h-5 w-5" /> Notice Board
            </button>
            <button
              onClick={() => setActiveTab("vault")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "vault" ? "bg-indigo-600 text-white" : "hover:bg-slate-800 hover:text-white"}`}
            >
              <BookOpen className="h-5 w-5" /> Academic Vault
            </button>
            {currentUser.role === "ORG_ADMIN" && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mt-4 border border-indigo-500/30 ${activeTab === "admin" ? "bg-indigo-700 text-white" : "text-indigo-400 hover:bg-slate-800 hover:text-white"}`}
              >
                <ShieldCheck className="h-5 w-5" /> Admin Controls
              </button>
            )}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
