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
  Trash2,
  MessageSquare,
  Globe,
  Building2,
  CreditCard,
  MonitorDot,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const Dashboard: React.FC = () => {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  // 🚀 SMART ROUTING: Determine default tab based on role
  const getDefaultTab = () => {
    switch (currentUser.role) {
      case "SUPER_ADMIN":
        return "superadmin";
      case "ORG_ADMIN":
        return "admin";
      default:
        return "dashboard"; // For STUDENT and DEPT_ADMIN
    }
  };
  const [activeTab, setActiveTab] = useState(getDefaultTab());

  const [complaints, setComplaints] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);

  // 💬 Comment System States
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  // 🚀 Complaint Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🚀 Admin Panel States
  const [newDeptName, setNewDeptName] = useState("");
  const [isCreatingDept, setIsCreatingDept] = useState(false);

  // 🚀 Assign Admin Modal States
  const [isAssignAdminOpen, setIsAssignAdminOpen] = useState(false);
  const [adminDeptId, setAdminDeptId] = useState<number | null>(null);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [generatedCreds, setGeneratedCreds] = useState<{
    email: string;
    pass: string;
  } | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  // 🚀 Super Admin Onboarding States
  const [isOnboardClientOpen, setIsOnboardClientOpen] = useState(false);
  const [clientOrgName, setClientOrgName] = useState("");
  const [clientAdminName, setClientAdminName] = useState("");
  const [clientAdminEmail, setClientAdminEmail] = useState("");
  const [isOnboardingClient, setIsOnboardingClient] = useState(false);
  const [clientGeneratedCreds, setClientGeneratedCreds] = useState<{
    email: string;
    pass: string;
  } | null>(null);

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

        // Fetch B2B Clients ONLY if user is SUPER_ADMIN
        if (currentUser.role === "SUPER_ADMIN") {
          const clientRes = await API.get("/superadmin/clients");
          if (clientRes.data && clientRes.data.organizations) {
            setClients(clientRes.data.organizations);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser.role]);

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

  const handleStatusChange = async (id: number | string, newStatus: string) => {
    try {
      await API.put(`/complaints/${id}/status`, { status: newStatus });
      setComplaints(
        complaints.map((c) => (c.id === id ? { ...c, status: newStatus } : c)),
      );
    } catch (error) {
      alert("Failed to update status!");
    }
  };

  const toggleChat = async (complaintId: number) => {
    if (activeChatId === complaintId) {
      setActiveChatId(null);
      return;
    }
    setActiveChatId(complaintId);
    try {
      const res = await API.get(`/comments/${complaintId}`);
      setComments(res.data.comments);
    } catch (error) {
      console.error("Failed to fetch comments", error);
    }
  };

  const handleSendComment = async (complaintId: number) => {
    if (!newComment.trim()) return;
    try {
      const res = await API.post("/comments", {
        text: newComment,
        complaintId,
      });
      setComments([...comments, res.data.comment]);
      setNewComment("");
    } catch (error) {
      alert("Failed to send message");
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

  const handleDeleteDepartment = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this department?",
    );
    if (!confirmDelete) return;

    try {
      await API.delete(`/departments/${id}`);
      setDepartments(departments.filter((dept) => dept.id !== id));
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete department.");
    }
  };

  const handleAssignAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminDeptId) return;

    setIsAssigning(true);
    try {
      const { data } = await API.post(
        `/departments/${adminDeptId}/assign-admin`,
        {
          name: adminName,
          email: adminEmail,
        },
      );

      if (data.success) {
        setGeneratedCreds({ email: data.adminEmail, pass: data.tempPassword });
        setAdminName("");
        setAdminEmail("");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to assign admin");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleOnboardClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOnboardingClient(true);
    try {
      const { data } = await API.post("/auth/onboard", {
        organizationName: clientOrgName,
        adminName: clientAdminName,
        adminEmail: clientAdminEmail,
      });

      if (data.success) {
        setClientGeneratedCreds({
          email: data.adminEmail,
          pass: data.tempPassword,
        });
        setClientOrgName("");
        setClientAdminName("");
        setClientAdminEmail("");

        const clientRes = await API.get("/superadmin/clients");
        if (clientRes.data && clientRes.data.organizations) {
          setClients(clientRes.data.organizations);
        }
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to onboard client");
    } finally {
      setIsOnboardingClient(false);
    }
  };

  // 🚀 FIXED: Hard reload to clear all states properly
  const handleLogout = () => {
    // 1. Memory clear karein
    localStorage.clear();

    // 2. React Router se smoothly Landing Page par bhejein
    navigate("/");

    // 3. 100 milliseconds baad page refresh karein taaki purani state cache se hat jaye
    setTimeout(() => {
      window.location.reload();
    }, 100);
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
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 tracking-wide">
            <span className="bg-indigo-600 p-2 rounded-lg shadow-lg">
              <MonitorDot className="h-6 w-6 text-white" />
            </span>
            Apna Desk
          </h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {/* 🚀 1. EXCLUSIVE SUPER ADMIN MENU */}
          {currentUser.role === "SUPER_ADMIN" ? (
            <button
              onClick={() => setActiveTab("superadmin")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "superadmin" ? "bg-indigo-600 text-white" : "hover:bg-slate-800 hover:text-white"}`}
            >
              <Globe className="h-5 w-5" /> Client Management
            </button>
          ) : (
            /* 🎓 2. STANDARD COLLEGE MENU */
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

              {/* 🛡️ ORG ADMIN EXCLUSIVE TAB */}
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
                      className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition"
                    >
                      {/* TOP SECTION: INFO & UPVOTES */}
                      <div className="flex items-start justify-between w-full">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {complaint.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-2 text-sm">
                            {currentUser.role === "DEPT_ADMIN" ? (
                              <select
                                value={complaint.status || "Pending"}
                                onChange={(e) =>
                                  handleStatusChange(
                                    complaint.id,
                                    e.target.value,
                                  )
                                }
                                className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                              >
                                <option value="Pending">Pending</option>
                                <option value="In-Progress">In-Progress</option>
                                <option value="Resolved">Resolved</option>
                              </select>
                            ) : (
                              <span
                                className={`flex items-center gap-1 font-medium ${complaint.status === "Resolved" ? "text-emerald-600" : complaint.status === "In-Progress" ? "text-blue-600" : "text-amber-500"}`}
                              >
                                {complaint.status === "Resolved" ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <Clock className="h-4 w-4" />
                                )}
                                {complaint.status || "Pending"}
                              </span>
                            )}
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

                      {/* 💬 CHAT UI TOGGLE BUTTON */}
                      <div className="mt-4 border-t border-slate-100 pt-3">
                        <button
                          onClick={() => toggleChat(complaint.id)}
                          className="text-sm font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition"
                        >
                          <MessageSquare className="h-4 w-4" />
                          {activeChatId === complaint.id
                            ? "Close Discussion"
                            : "Open Discussion"}
                        </button>
                      </div>

                      {/* 🟢 LIVE CHATBOX WINDOW */}
                      {activeChatId === complaint.id && (
                        <div className="mt-3 bg-slate-50 rounded-lg p-4 shadow-inner border border-slate-200">
                          <div className="max-h-40 overflow-y-auto space-y-2 mb-3 pr-2">
                            {comments.length === 0 ? (
                              <p className="text-xs text-slate-400 text-center italic">
                                No comments yet. Start the conversation!
                              </p>
                            ) : (
                              comments.map((msg, idx) => (
                                <div
                                  key={idx}
                                  className={`p-2 rounded-md text-sm w-fit max-w-[85%] ${msg.user.name === currentUser.name ? "bg-indigo-100 text-indigo-900 ml-auto" : "bg-white border text-slate-700"}`}
                                >
                                  <span className="block text-[10px] font-bold text-slate-500 mb-1">
                                    {msg.user.name} (
                                    {msg.user.role === "DEPT_ADMIN"
                                      ? "HOD"
                                      : "Student"}
                                    )
                                  </span>
                                  {msg.text}
                                </div>
                              ))
                            )}
                          </div>

                          <div className="flex gap-2 mt-2">
                            <input
                              type="text"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Type an update or question..."
                              className="flex-1 text-sm border border-slate-300 rounded-md px-3 py-1.5 focus:outline-none focus:border-indigo-500 bg-white"
                            />
                            <button
                              onClick={() => handleSendComment(complaint.id)}
                              className="bg-indigo-600 text-white px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-indigo-700 transition"
                            >
                              Send
                            </button>
                          </div>
                        </div>
                      )}
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

            {/* CREATE DEPT */}
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

            {/* LIST DEPTS */}
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
        )}

        {/* ---------------- SECTION 6: SUPER ADMIN MASTER DASHBOARD ---------------- */}
        {activeTab === "superadmin" && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Globe className="h-7 w-7 text-indigo-600" /> B2B Client
                Management
              </h2>
              <button
                onClick={() => {
                  setIsOnboardClientOpen(true);
                  setClientGeneratedCreds(null);
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium flex items-center gap-2"
              >
                <PlusCircle className="h-5 w-5" /> Onboard New Client
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.length === 0 ? (
                <p className="text-slate-500 col-span-3">
                  No clients onboarded yet.
                </p>
              ) : (
                clients.map((client) => (
                  <div
                    key={client.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition"
                  >
                    <div className="bg-slate-900 p-4 flex justify-between items-center">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-indigo-400" />{" "}
                        {client.name}
                      </h3>
                      <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-1 rounded font-semibold border border-indigo-500/30">
                        Active
                      </span>
                    </div>

                    <div className="p-5 space-y-4">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Organization Admin
                        </p>
                        {client.users.length > 0 ? (
                          <p className="text-sm font-medium text-slate-700">
                            {client.users[0].name} <br />{" "}
                            <span className="text-slate-500 font-normal">
                              {client.users[0].email}
                            </span>
                          </p>
                        ) : (
                          <p className="text-sm text-amber-600 font-medium italic">
                            No Admin Assigned
                          </p>
                        )}
                      </div>

                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <CreditCard className="h-4 w-4 text-indigo-500" />
                          Plan: {client.subscriptions?.[0]?.plan || "FREE"}
                        </div>
                        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition">
                          Upgrade
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* 🚀 MODAL 1: RAISE COMPLAINT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
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

      {/* 🚀 MODAL 2: ASSIGN ADMIN */}
      {isAssignAdminOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-5 border-b pb-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-indigo-600" /> Assign Dept
                Admin
              </h3>
              <button
                onClick={() => setIsAssignAdminOpen(false)}
                className="text-slate-400 hover:text-red-500 transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {generatedCreds ? (
              <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-xl text-center">
                <h4 className="text-indigo-700 font-bold mb-2 flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5" /> Admin Created!
                </h4>
                <p className="text-sm text-slate-600 mb-4">
                  Share these login credentials securely.
                </p>
                <div className="bg-slate-900 p-4 rounded-lg font-mono text-sm text-slate-300 text-left">
                  <div>
                    Email:{" "}
                    <span className="text-white">{generatedCreds.email}</span>
                  </div>
                  <div className="mt-2">
                    Pass:{" "}
                    <span className="text-amber-400 font-bold">
                      {generatedCreds.pass}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsAssignAdminOpen(false)}
                  className="mt-5 w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleAssignAdmin}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Admin Name
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="e.g. Dr. Ramesh"
                    className="w-full rounded-lg border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="ramesh@college.edu"
                    className="w-full rounded-lg border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition shadow-md"
                >
                  {isAssigning
                    ? "Generating System..."
                    : "Create Admin & Get Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 🚀 MODAL 3: SUPER ADMIN ONBOARD CLIENT */}
      {isOnboardClientOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-5 border-b pb-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Globe className="h-6 w-6 text-indigo-600" /> Onboard Client
              </h3>
              <button
                onClick={() => setIsOnboardClientOpen(false)}
                className="text-slate-400 hover:text-red-500 transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {clientGeneratedCreds ? (
              <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-xl text-center">
                <h4 className="text-indigo-700 font-bold mb-2 flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5" /> Organization Created!
                </h4>
                <p className="text-sm text-slate-600 mb-4">
                  Share these Master Admin credentials with the client.
                </p>
                <div className="bg-slate-900 p-4 rounded-lg font-mono text-sm text-slate-300 text-left">
                  <div>
                    Email:{" "}
                    <span className="text-white">
                      {clientGeneratedCreds.email}
                    </span>
                  </div>
                  <div className="mt-2">
                    Temp Pass:{" "}
                    <span className="text-indigo-400 font-bold">
                      {clientGeneratedCreds.pass}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsOnboardClientOpen(false)}
                  className="mt-5 w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleOnboardClient}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Organization (College/Company) Name
                  </label>
                  <input
                    type="text"
                    required
                    value={clientOrgName}
                    onChange={(e) => setClientOrgName(e.target.value)}
                    placeholder="e.g. XYZ College"
                    className="w-full rounded-lg border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Admin Name
                  </label>
                  <input
                    type="text"
                    required
                    value={clientAdminName}
                    onChange={(e) => setClientAdminName(e.target.value)}
                    placeholder="e.g. Principal Sharma"
                    className="w-full rounded-lg border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    value={clientAdminEmail}
                    onChange={(e) => setClientAdminEmail(e.target.value)}
                    placeholder="admin@college.edu"
                    className="w-full rounded-lg border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isOnboardingClient}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition shadow-md"
                >
                  {isOnboardingClient
                    ? "Provisioning Setup..."
                    : "Create Client Account"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
