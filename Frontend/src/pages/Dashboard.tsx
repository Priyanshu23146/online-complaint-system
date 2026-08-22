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
import { ThumbsUp, LogOut, CheckCircle, Clock, X } from "lucide-react";
import { Link } from "react-router-dom";
import API from "../api";

interface Complaint {
  id: number | string;
  title: string;
  status: string;
  upvotes: number;
}

const Dashboard: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal ke states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const { data } = await API.get("/complaints");

        // 🚨 FIX YAHAN HAI: data.complaints use karna hai, kyunki backend wahan data bhej raha hai
        if (data && data.complaints) {
          setComplaints(data.complaints);
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

  // Nayi Complaint create karne ka function
  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      // 🚨 UPDATED CODE: Ab title, description, aur category teeno bhej rahe hain
      const { data } = await API.post("/complaints", {
        title: newTitle,
        description: newTitle, // Validation pass karne ke liye dummy
        category: "General", // Validation pass karne ke liye dummy
      });

      // Nayi complaint ko existing list mein sabse upar add kar do (UI update)
      setComplaints([data, ...complaints]);

      // Modal band kardo aur input clear kardo
      setNewTitle("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create complaint:", error);
      alert("Error creating complaint! Check backend console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const chartData = [...complaints]
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, 3)
    .map((c) => ({ name: `ID: ${c.id}`, votes: c.upvotes, title: c.title }));

  return (
    <div className="min-h-screen bg-slate-50 relative">
      <nav className="bg-indigo-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">OCMS Dashboard</h1>
        <Link
          to="/"
          className="flex items-center gap-2 hover:text-indigo-200 transition"
        >
          <LogOut className="h-5 w-5" /> Logout
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">
              Recent Complaints
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium"
            >
              + New Complaint
            </button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <p className="text-slate-500 animate-pulse">
                Loading complaints from database...
              </p>
            ) : complaints.length === 0 ? (
              <p className="text-slate-500">
                No complaints found. Be the first to raise an issue!
              </p>
            ) : (
              complaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between"
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
                    <span className="font-bold mt-1">{complaint.upvotes}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            🔥 Trending Issues
          </h2>
          <div className="h-64 w-full">
            {chartData.length > 0 ? (
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
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                    {chartData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "#4f46e5" : "#818cf8"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                Not enough data for graph
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-4 text-center">
            Graph updates dynamically based on live database votes.
          </p>
        </div>
      </main>

      {/* NEW COMPLAINT MODAL */}
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
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Issue Description
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g., Library Wi-Fi is not working since morning..."
                  className="w-full rounded-lg border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition"
              >
                {isSubmitting ? "Submitting..." : "Submit Complaint"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
