import React, { useState } from "react";
import { ShieldAlert, Copy, CheckCircle } from "lucide-react";
import API from "../api";

const SuperAdmin: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    email: string;
    pass: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedCredentials(null);

    try {
      const { data } = await API.post("/auth/onboard-client", {
        name,
        email,
        role: "DEPT_ADMIN", // Ya SUPER_ADMIN jo aap dena chahein
      });

      if (data.success) {
        setGeneratedCredentials({
          email: data.adminEmail,
          pass: data.tempPassword,
        });
        setName("");
        setEmail("");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create admin");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedCredentials) {
      navigator.clipboard.writeText(
        `Email: ${generatedCredentials.email}\nPassword: ${generatedCredentials.pass}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-700">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
          <ShieldAlert className="h-8 w-8 text-red-500" />
          <h2 className="text-2xl font-bold text-white">
            Super Admin{" "}
            <span className="text-slate-400 font-normal">| Onboarding</span>
          </h2>
        </div>

        {generatedCredentials ? (
          <div className="bg-emerald-900/30 border border-emerald-500/50 p-6 rounded-xl mb-6">
            <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" /> Client Generated Successfully!
            </h3>
            <p className="text-slate-300 text-sm mb-4">
              Share these credentials securely. The user will be forced to
              change this password on first login.
            </p>

            <div className="bg-slate-950 p-4 rounded-lg font-mono text-sm text-slate-300 relative group">
              <div>
                Email:{" "}
                <span className="text-white">{generatedCredentials.email}</span>
              </div>
              <div className="mt-2">
                Pass:{" "}
                <span className="text-amber-400">
                  {generatedCredentials.pass}
                </span>
              </div>

              <button
                onClick={copyToClipboard}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
              >
                {copied ? (
                  <span className="text-xs text-emerald-400">Copied!</span>
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>

            <button
              onClick={() => setGeneratedCredentials(null)}
              className="mt-4 w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Create Another Client
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Admin Full Name
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-indigo-500 outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Principal HBTU"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Official Email
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-indigo-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@college.edu"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition shadow-lg shadow-red-900/50"
            >
              {loading ? "Generating System..." : "Generate Client Credentials"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SuperAdmin;
