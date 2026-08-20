import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Shield } from "lucide-react";

const Login: React.FC = () => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  // Auto-switch based on URL query params from the Landing page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("role") === "admin") {
      setIsAdmin(true);
    }
  }, [location]);
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header Toggle */}
        <div className="flex w-full bg-slate-100 p-1">
          <button
            onClick={() => setIsAdmin(false)}
            className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all ${!isAdmin ? "bg-white shadow-sm text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}
          >
            <User className="h-4 w-4" /> User
          </button>
          <button
            onClick={() => setIsAdmin(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all ${isAdmin ? "bg-slate-800 shadow-sm text-white" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Shield className="h-4 w-4" /> Admin
          </button>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              {isAdmin ? "Admin Portal" : "Welcome Back"}
            </h2>
            <p className="text-slate-500 mt-2 text-sm">
              Please enter your details to sign in
            </p>
          </div>

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/dashboard");
            }}
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  className="pl-10 w-full rounded-lg border border-slate-300 py-2.5 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  className="pl-10 w-full rounded-lg border border-slate-300 py-2.5 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${isAdmin ? "bg-slate-800 hover:bg-slate-900 focus:ring-slate-900" : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"}`}
            >
              Sign In
            </button>
          </form>

          {!isAdmin && (
            <p className="mt-6 text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-indigo-600 hover:text-indigo-500 transition"
              >
                Sign up
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
