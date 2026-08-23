import React, { useState, useEffect } from "react";
import { LogOut, CheckCircle, Clock, Trash2, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import API from "../api";

interface Complaint {
  id: number | string;
  title: string;
  status: string;
  upvotes: number;
}

const AdminDashboard: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Data Fetch Karna
  const fetchComplaints = async () => {
    try {
      const { data } = await API.get("/complaints");
      if (data && data.complaints) {
        setComplaints(
          data.complaints.map((c: any) => ({
            ...c,
            status: c.status || "Pending",
            upvotes: c.upvotes || 0,
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // 2. Status Update Karna (Resolve)
  const handleResolve = async (id: number | string) => {
    try {
      await API.put(`/complaints/${id}/status`, { status: "Resolved" });
      // UI Update karein
      setComplaints(
        complaints.map((c) => (c.id === id ? { ...c, status: "Resolved" } : c)),
      );
    } catch (error) {
      console.error("Resolve failed:", error);
      alert("Error resolving complaint. Check if you are an Admin.");
    }
  };

  // 3. Complaint Delete Karna
  const handleDelete = async (id: number | string) => {
    if (!window.confirm("Are you sure you want to delete this complaint?"))
      return;

    try {
      await API.delete(`/complaints/${id}`);
      // UI Update karein (List se hata dein)
      setComplaints(complaints.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Error deleting complaint. Check if you are an Admin.");
    }
  };

  // Complaints ko do hisson mein baantna
  const pendingComplaints = complaints.filter((c) => c.status !== "Resolved");
  const resolvedComplaints = complaints.filter((c) => c.status === "Resolved");

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-amber-500" /> Admin Control Panel
        </h1>
        <Link
          to="/"
          className="flex items-center gap-2 hover:text-slate-300 transition"
        >
          <LogOut className="h-5 w-5" /> Logout
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {/* PENDING SECTION */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="h-6 w-6 text-amber-500" /> Pending Complaints
          </h2>
          <div className="space-y-4">
            {loading ? (
              <p>Loading...</p>
            ) : pendingComplaints.length === 0 ? (
              <p className="text-slate-500">No pending complaints. Good job!</p>
            ) : (
              pendingComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {complaint.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Upvotes: {complaint.upvotes}
                    </p>
                  </div>
                  <button
                    onClick={() => handleResolve(complaint.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium text-sm"
                  >
                    Mark Resolved
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RESOLVED SECTION */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" /> Resolved History
          </h2>
          <div className="space-y-4">
            {loading ? (
              <p>Loading...</p>
            ) : resolvedComplaints.length === 0 ? (
              <p className="text-slate-500">No resolved complaints yet.</p>
            ) : (
              resolvedComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="bg-slate-100 p-5 rounded-xl border border-slate-200 flex justify-between items-center opacity-70 hover:opacity-100 transition"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-slate-700 line-through">
                      {complaint.title}
                    </h3>
                    <p className="text-sm text-green-600 font-medium mt-1">
                      Resolved
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(complaint.id)}
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
