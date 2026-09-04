import React, { useState, useEffect } from "react";
import { CalendarCheck, Bell, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Sidebar from "../components/Sidebar";
import SuperAdminPanel from "../components/SuperAdminPanel";
import AdminPanel from "../components/AdminPanel";
import ComplaintsList from "../components/ComplaintsList";
import RaiseComplaintModal from "../components/RaiseComplaintModal";
import AssignAdminModal from "../components/AssignAdminModal";
import OnboardClientModal from "../components/OnboardClientModal";

const Dashboard: React.FC = () => {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const getDefaultTab = () => {
    switch (currentUser.role) {
      case "SUPER_ADMIN":
        return "superadmin";
      case "ORG_ADMIN":
        return "admin";
      default:
        return "dashboard";
    }
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab());
  const [complaints, setComplaints] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);

  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newDeptName, setNewDeptName] = useState("");
  const [isCreatingDept, setIsCreatingDept] = useState(false);

  const [isAssignAdminOpen, setIsAssignAdminOpen] = useState(false);
  const [adminDeptId, setAdminDeptId] = useState<number | null>(null);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [generatedCreds, setGeneratedCreds] = useState<{
    email: string;
    pass: string;
  } | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

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
        if (compRes.data && compRes.data.complaints)
          setComplaints(compRes.data.complaints);

        const deptRes = await API.get("/departments");
        if (deptRes.data && deptRes.data.departments) {
          setDepartments(deptRes.data.departments);
          if (deptRes.data.departments.length > 0)
            setSelectedDept(deptRes.data.departments[0].id.toString());
        }

        if (currentUser.role === "SUPER_ADMIN") {
          const clientRes = await API.get("/superadmin/clients");
          if (clientRes.data && clientRes.data.organizations)
            setClients(clientRes.data.organizations);
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
      if (data && data.complaint)
        setComplaints([
          { ...data.complaint, status: "Pending", upvotes: 0 },
          ...complaints,
        ]);
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
        { name: adminName, email: adminEmail },
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
        if (clientRes.data && clientRes.data.organizations)
          setClients(clientRes.data.organizations);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to onboard client");
    } finally {
      setIsOnboardingClient(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
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
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto p-8">
        {activeTab === "dashboard" && (
          <ComplaintsList
            currentUser={currentUser}
            complaints={complaints}
            loading={loading}
            chartData={chartData}
            setIsModalOpen={setIsModalOpen}
            handleStatusChange={handleStatusChange}
            handleUpvote={handleUpvote}
            toggleChat={toggleChat}
            activeChatId={activeChatId}
            comments={comments}
            newComment={newComment}
            setNewComment={setNewComment}
            handleSendComment={handleSendComment}
          />
        )}

        {activeTab === "attendance" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <CalendarCheck className="h-7 w-7 text-indigo-600" /> Attendance
              Overview
            </h2>
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

        {activeTab === "admin" && (
          <AdminPanel
            departments={departments}
            newDeptName={newDeptName}
            setNewDeptName={setNewDeptName}
            isCreatingDept={isCreatingDept}
            handleCreateDepartment={handleCreateDepartment}
            setAdminDeptId={setAdminDeptId}
            setGeneratedCreds={setGeneratedCreds}
            setIsAssignAdminOpen={setIsAssignAdminOpen}
            handleDeleteDepartment={handleDeleteDepartment}
          />
        )}

        {activeTab === "superadmin" && (
          <SuperAdminPanel
            clients={clients}
            setIsOnboardClientOpen={setIsOnboardClientOpen}
            setClientGeneratedCreds={setClientGeneratedCreds}
          />
        )}
      </main>

      <RaiseComplaintModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        departments={departments}
        selectedDept={selectedDept}
        setSelectedDept={setSelectedDept}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        isSubmitting={isSubmitting}
        onSubmit={handleCreateComplaint}
      />

      <AssignAdminModal
        isOpen={isAssignAdminOpen}
        onClose={() => setIsAssignAdminOpen(false)}
        adminName={adminName}
        setAdminName={setAdminName}
        adminEmail={adminEmail}
        setAdminEmail={setAdminEmail}
        isAssigning={isAssigning}
        generatedCreds={generatedCreds}
        onSubmit={handleAssignAdmin}
      />

      <OnboardClientModal
        isOpen={isOnboardClientOpen}
        onClose={() => setIsOnboardClientOpen(false)}
        clientOrgName={clientOrgName}
        setClientOrgName={setClientOrgName}
        clientAdminName={clientAdminName}
        setClientAdminName={setClientAdminName}
        clientAdminEmail={clientAdminEmail}
        setClientAdminEmail={setClientAdminEmail}
        isOnboardingClient={isOnboardingClient}
        clientGeneratedCreds={clientGeneratedCreds}
        onSubmit={handleOnboardClient}
      />
    </div>
  );
};

export default Dashboard;
