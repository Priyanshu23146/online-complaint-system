import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User as UserIcon } from "lucide-react";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to create account.");
      }

      navigate("/login", {
        state: { message: "Account created successfully. Please log in." },
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Create an Account
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            Join the community to raise and upvote issues
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="pl-10 w-full rounded-lg border border-slate-300 py-2.5 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="John Doe"
              />
            </div>
          </div>

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
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="pl-10 w-full rounded-lg border border-slate-300 py-2.5 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
                className="pl-10 w-full rounded-lg border border-slate-300 py-2.5 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 transition"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
