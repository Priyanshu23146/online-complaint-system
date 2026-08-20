import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ThumbsUp, LogOut, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

// Dummy data for initial UI testing
const initialComplaints = [
  {
    id: 1,
    title: "Wi-Fi completely down in Library",
    status: "Pending",
    upvotes: 120,
  },
  {
    id: 2,
    title: "Water cooler not working in CS Block",
    status: "Resolved",
    upvotes: 85,
  },
  {
    id: 3,
    title: "Provide more vegetarian options in Canteen",
    status: "Pending",
    upvotes: 210,
  },
  {
    id: 4,
    title: "Lab computers lacking proper software",
    status: "Pending",
    upvotes: 150,
  },
];

const Dashboard: React.FC = () => {
  const [complaints, setComplaints] = useState(initialComplaints);

  // Mock function to test upvote UI interaction
  const handleUpvote = (id: number) => {
    setComplaints(
      complaints.map((c) =>
        c.id === id ? { ...c, upvotes: c.upvotes + 1 } : c,
      ),
    );
  };

  // Sort complaints for the graph (Top 3 trending)
  const chartData = [...complaints]
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, 3)
    .map((c) => ({ name: `ID: ${c.id}`, votes: c.upvotes, title: c.title }));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
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
        {/* Left Column: Complaints List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">
              Recent Complaints
            </h2>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium">
              + New Complaint
            </button>
          </div>

          <div className="space-y-4">
            {complaints.map((complaint) => (
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

                {/* The Upvote Button */}
                <button
                  onClick={() => handleUpvote(complaint.id)}
                  className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 transition group"
                >
                  <ThumbsUp className="h-5 w-5 group-hover:-translate-y-1 transition-transform" />
                  <span className="font-bold mt-1">{complaint.upvotes}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Trending Graph */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            🔥 Trending Issues
          </h2>
          <div className="h-64 w-full">
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
          </div>
          <p className="text-xs text-slate-500 mt-4 text-center">
            Graph updates dynamically based on user votes.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
