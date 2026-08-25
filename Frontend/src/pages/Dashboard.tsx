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
} from "lucide-react";
import { useNavigate } from "react-router-dom"; // Link hata diya error fix karne ke liye
import API from "../api";

interface Complaint {
  id: number | string;
  title: string;
  status: string;
  upvotes: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  // 🚀 NAYA: Department select karne ke liye state
  const [selectedDept, setSelectedDept] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const { data } = await API.get("/complaints");
        if (data && data.complaints) {
          const formattedComplaints = data.complaints.map((c: any) => ({
            ...c,
            status: c.status || "Pending",
            upvotes: c.upvotes || 0,
          }));
          setComplaints(formattedComplaints);
        } else {
          setComplaints([]);
        }
      } catch (error) {
        console.error("Error fetching complaints:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const handleUpvote = async (id: number | string) => {
    setComplaints(
      complaints.map((c) =>
        c.id === id ? { ...c, upvotes: c.upvotes + 1 } : c,
      ),
    );
    try {
      await API.post(`/complaints/${id}/upvote`);
    } catch (error) {
      console.error("Upvote failed:", error);
    }
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsSubmitting(true);
    try {
      // 🚀 NAYA: Ab hardcode '1' ki jagah student ka selected department jayega
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
      setSelectedDept("1"); // Form reset
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create complaint:", error);
      alert("Error creating complaint!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const chartData = [...complaints]
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, 3)
    .map((c) => ({ name: `ID: ${c.id}`, votes: c.upvotes, title: c.title }));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* 📌 SIDEBAR NAVIGATION */}
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

      {/* 📌 MAIN CONTENT AREA */}
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
                            {complaint.status}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUpvote(complaint.id)}
                        className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 transition group"
                      >
                        <ThumbsUp className="h-5 w-5 group-hover:-translate-y-1 transition-transform" />
                        <span className="font-bold mt-1">
                          {complaint.upvotes}
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

        {/* ---------------- SECTION 2: ATTENDANCE (MOCKUP) ---------------- */}
        {activeTab === "attendance" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <CalendarCheck className="h-7 w-7 text-indigo-600" /> Attendance
              Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-indigo-600 text-white p-6 rounded-xl shadow-sm">
                <p className="text-indigo-100 text-sm font-medium">
                  Overall Attendance
                </p>
                <h3 className="text-4xl font-bold mt-2">82%</h3>
                <p className="text-sm mt-2 flex items-center gap-1 opacity-90">
                  <Check className="h-4 w-4" /> Above 75% Criteria
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <p className="text-slate-500 text-sm font-medium">
                  Total Classes Held
                </p>
                <h3 className="text-3xl font-bold text-slate-800 mt-2">124</h3>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <p className="text-slate-500 text-sm font-medium">
                  Classes Attended
                </p>
                <h3 className="text-3xl font-bold text-slate-800 mt-2">102</h3>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- SECTION 3: NOTICE BOARD (MOCKUP) ---------------- */}
        {activeTab === "notices" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Bell className="h-7 w-7 text-indigo-600" /> Digital Notice Board
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 hover:bg-slate-50 transition">
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                  Urgent
                </span>
                <h3 className="text-xl font-semibold text-slate-900 mt-2">
                  Hack AITD 2026 Finale Guidelines
                </h3>
                <p className="text-slate-600 mt-2 text-sm">
                  All selected participants must report to the New Seminar Hall
                  by 9:00 AM on Feb 23, 2026.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- SECTION 4: ACADEMIC VAULT (MOCKUP) ---------------- */}
        {activeTab === "vault" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="h-7 w-7 text-indigo-600" /> Academic Vault
            </h2>
            <p className="text-slate-500">
              Access notes, PYQs, and assignments specific to your branch and
              year.
            </p>
          </div>
        )}
      </main>

      {/* 🚀 UPDATED COMPLAINT MODAL (DEPARTMENT DROPDOWN ADDED) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-slate-900">
                Raise a Complaint
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateComplaint}>
              {/* NAYA: Department Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Select Department
                </label>
                <select
                  className="w-full rounded-lg border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                >
                  <option value="1">IT Department</option>
                  <option value="2">Hostel / Campus Management</option>
                  <option value="3">Library / Academics</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Issue Description
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g., Lab 2 Wi-Fi is down..."
                  className="w-full rounded-lg border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition shadow-md"
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
