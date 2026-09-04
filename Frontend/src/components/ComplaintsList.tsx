import React from "react";
import { ThumbsUp, CheckCircle, Clock, MessageSquare } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Props {
  currentUser: any;
  complaints: any[];
  loading: boolean;
  chartData: any[];
  setIsModalOpen: (val: boolean) => void;
  handleStatusChange: (id: number, status: string) => void;
  handleUpvote: (id: number) => void;
  toggleChat: (id: number) => void;
  activeChatId: number | null;
  comments: any[];
  newComment: string;
  setNewComment: (val: string) => void;
  handleSendComment: (id: number) => void;
}

const ComplaintsList: React.FC<Props> = ({
  currentUser,
  complaints,
  loading,
  chartData,
  setIsModalOpen,
  handleStatusChange,
  handleUpvote,
  toggleChat,
  activeChatId,
  comments,
  newComment,
  setNewComment,
  handleSendComment,
}) => {
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Campus Issues</h2>
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
                            handleStatusChange(complaint.id, e.target.value)
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
  );
};

export default ComplaintsList;
