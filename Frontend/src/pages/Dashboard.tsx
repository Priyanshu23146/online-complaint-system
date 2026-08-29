import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ThumbsUp,
  LogOut,
  CheckCircle,
  Clock,
  X,
  LayoutDashboard,
  Bell,
  BookOpen,
  CalendarCheck,
  Check,
  ShieldCheck,
  PlusCircle,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [activeTab, setActiveTab] = useState(
    currentUser.role !== "STUDENT" ? "admin" : "dashboard",
  );
  const [complaints, setComplaints] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newDeptName, setNewDeptName] = useState("");
  const [isCreatingDept, setIsCreatingDept] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const compRes = await API.get("/complaints");
        if (compRes.data && compRes.data.complaints) {
          setComplaints(compRes.data.complaints);
        }
        const deptRes = await API.get("/departments");
        if (deptRes.data && deptRes.data.departments) {
          setDepartments(deptRes.data.departments);
          if (deptRes.data.departments.length > 0) {
            setSelectedDept(deptRes.data.departments[0].id.toString());
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !selectedDept) return;
    setIsSubmitting(true);
    try {
      const { data } = await API.post("/complaints", {
        title: newTitle,
        description: newTitle,
        departmentId: parseInt(selectedDept),
      });
      if (data && data.complaint) {
        setComplaints([
          { ...data.complaint, status: "Pending", upvotes: 0 },
          ...complaints,
        ]);
      }
      setNewTitle("");
      setIsModalOpen(false);
    } catch (error) {
      alert("Error creating complaint!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (id: number | string) => {
    setComplaints(
      complaints.map((c) =>
        c.id === id ? { ...c, upvotes: c.upvotes + 1 } : c,
      ),
    );
    try {
      await API.post(`/complaints/${id}/upvote`);
    } catch (error) {
      console.error("Upvote failed");
    }
  };

  const handleCreateDepartment = async () => {
    if (!newDeptName.trim()) return;
    setIsCreatingDept(true);
    try {
      const { data } = await API.post("/departments", { name: newDeptName });
      if (data.success) {
        setDepartments([...departments, data.department]);
        setNewDeptName("");
      }
    } catch (error) {
      alert("Failed to create department");
    } finally {
      setIsCreatingDept(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const chartData = [...complaints]
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, 3)
    .map((c) => ({ name: `ID: ${c.id}`, votes: c.upvotes, title: c.title }));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* 📌 SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full shadow-2xl z-10">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="bg-indigo-600 p-2 rounded-lg">🎓</span> AITD Portal
          </h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
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
            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              New
            </span>
          </button>

          <button
            onClick={() => setActiveTab("vault")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "vault" ? "bg-indigo-600 text-white" : "hover:bg-slate-800 hover:text-white"}`}
          >
            <BookOpen className="h-5 w-5" /> Academic Vault
          </button>

          {currentUser.role !== "STUDENT" && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mt-4 border border-indigo-500/30 ${activeTab === "admin" ? "bg-indigo-700 text-white" : "text-indigo-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <ShieldCheck className="h-5 w-5" /> Admin Controls
            </button>
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

      {/* 📌 MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* ---------------- SECTION 1: COMPLAINTS ---------------- */}
        {activeTab === "dashboard" && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">
                  Campus Issues
                </h2>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium"
                >
                  + Raise Issue
                </button>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <p className="animate-pulse">Loading...</p>
                ) : complaints.length === 0 ? (
                  <p>No complaints found.</p>
                ) : (
                  complaints.map((complaint) => (
                    <div
                      key={complaint.id}
                      className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {complaint.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2 text-sm">
                          <span
                            className={`flex items-center gap-1 ${complaint.status === "Resolved" ? "text-green-600" : "text-amber-500"}`}
                          >
                            {complaint.status === "Resolved" ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Clock className="h-4 w-4" />
                            )}
                            {complaint.status || "Pending"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUpvote(complaint.id)}
                        className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 transition group"
                      >
                        <ThumbsUp className="h-5 w-5 group-hover:-translate-y-1 transition-transform" />
                        <span className="font-bold mt-1">
                          {complaint.upvotes || 0}
                        </span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                🔥 Trending
              </h2>
              <div className="h-64 w-full">
                {chartData.length > 0 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                      />
                      <Tooltip
                        cursor={{ fill: "#f1f5f9" }}
                        contentStyle={{ borderRadius: "8px", border: "none" }}
                      />
                      <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, index) => (
                          <Cell
                            key={index}
                            fill={index === 0 ? "#4f46e5" : "#818cf8"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ---------------- SECTION 2,3,4: MOCKUPS ---------------- */}
        {activeTab === "attendance" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <CalendarCheck className="h-7 w-7 text-indigo-600" /> Attendance
              Overview
            </h2>
            <div className="bg-indigo-600 text-white p-6 rounded-xl shadow-sm w-max">
              <p className="text-indigo-100 text-sm font-medium">
                Overall Attendance
              </p>
              <h3 className="text-4xl font-bold mt-2">82%</h3>
              <p className="text-sm mt-2 flex items-center gap-1 opacity-90">
                <Check className="h-4 w-4" /> Above 75% Criteria
              </p>
            </div>
          </div>
        )}

        {activeTab === "notices" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Bell className="h-7 w-7 text-indigo-600" /> Notice Board
            </h2>
          </div>
        )}

        {activeTab === "vault" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="h-7 w-7 text-indigo-600" /> Academic Vault
            </h2>
          </div>
        )}

        {/* ---------------- SECTION 5: ADMIN CONTROLS ---------------- */}
        {activeTab === "admin" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="h-7 w-7 text-indigo-600" /> Admin Control
              Panel
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
                      <button className="text-sm flex items-center gap-1 bg-white border border-slate-300 px-3 py-1.5 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition font-medium">
                        <UserPlus className="h-4 w-4" /> Assign Admin
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 🚀 COMPLAINT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-slate-900">
                Raise a Complaint
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="h-6 w-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateComplaint}>
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
      )}
    </div>
  );
};

export default Dashboard;
