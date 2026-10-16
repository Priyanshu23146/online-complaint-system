import { useEffect, useState } from "react";
import axios from "axios";

export default function MemberDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get("/api/complaints", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setComplaints(res.data.complaints);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="p-6 bg-linear-to-b from-slate-50 to-slate-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-slate-900">My Complaints</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600">Total</p>
          <p className="text-2xl font-bold">{complaints.length}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <p className="text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-blue-600">
            {complaints.filter((c: any) => c.status === "Pending").length}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <p className="text-gray-600">Resolved</p>
          <p className="text-2xl font-bold text-green-600">
            {complaints.filter((c: any) => c.status === "Resolved").length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c: any) => (
              <tr key={c.id} className="border-t hover:bg-slate-50">
                <td className="p-4">{c.title}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded text-sm ${
                      c.status === "Resolved"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="p-4 text-gray-600">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
