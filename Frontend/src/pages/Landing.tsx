import React from "react";
import { Link } from "react-router-dom";
import { Shield, Zap, BarChart3, ArrowRight } from "lucide-react";

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
        <div className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
          <Shield className="h-8 w-8" />
          OCMS
        </div>
        <div className="space-x-4">
          <Link
            to="/login"
            className="text-slate-600 hover:text-indigo-600 font-medium"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      <main className="flex flex-col items-center text-center px-4 pt-24 pb-16">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
          Resolve Issues{" "}
          <span className="text-indigo-600">Faster Together</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mb-10">
          A transparent and efficient online complaint management system. Raise
          issues, track progress, and upvote community complaints to get them
          resolved faster.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/login?role=user"
            className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg text-lg font-medium"
          >
            Login as User <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            to="/login?role=admin"
            className="flex items-center justify-center gap-2 px-8 py-3 bg-white text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition shadow-sm text-lg font-medium"
          >
            Login as Admin <Shield className="h-5 w-5" />
          </Link>
        </div>
      </main>

      <section className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-8">
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Fast Resolution
          </h3>
          <p className="text-slate-600">
            Direct pipeline to administrators ensures your grievances are heard
            and addressed quickly.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Community Upvotes
          </h3>
          <p className="text-slate-600">
            Upvote existing complaints to prioritize critical issues without
            creating duplicate tickets.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
            <Shield className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Secure &amp; Private
          </h3>
          <p className="text-slate-600">
            Your data is protected with industry-standard JWT authentication and
            strict validation.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
