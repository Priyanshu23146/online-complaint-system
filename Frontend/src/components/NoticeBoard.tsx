import React, { useEffect, useState } from "react";
import {
  Megaphone,
  Lock,
  Users,
  Building2,
  ShieldCheck,
  X,
} from "lucide-react";
import API from "../api";

interface Notice {
  id: number;
  title: string;
  content: string;
  visibility: string;
  createdAt: string;
  createdBy: {
    id: number;
    name: string;
    role: string;
  };
  department: {
    name: string;
  } | null;
}

const VISIBILITY_META: Record<
  string,
  { label: string; icon: React.ReactNode; cls: string; description: string }
> = {
  ORG_PUBLIC: {
    label: "Everyone",
    icon: <Building2 className="h-3 w-3" />,
    cls: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    description: "Visible to all organization members",
  },
  DEPT_PUBLIC: {
    label: "Department",
    icon: <Users className="h-3 w-3" />,
    cls: "bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
    description: "Visible to department members",
  },
  STAFF_ONLY: {
    label: "Staff only",
    icon: <ShieldCheck className="h-3 w-3" />,
    cls: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    description: "Visible to staff and admins only",
  },
  DEPT_ADMIN_ONLY: {
    label: "Admins only",
    icon: <Lock className="h-3 w-3" />,
    cls: "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
    description: "Confidential - Department admins only",
  },
};

const NoticeBoard: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const { data } = await API.get("/notices");
        setNotices(data.notices || []);
        setError("");
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load notices");
        setNotices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-slate-500 dark:text-slate-400 text-sm">
          Loading notices...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Megaphone className="h-6 w-6 text-indigo-600" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Notice Board
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
            <X className="h-4 w-4" />
            {error}
          </p>
        </div>
      )}

      {notices.length === 0 && !error && (
        <div className="bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-8 text-center">
          <Megaphone className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">
            No notices for you right now.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {notices.map((n) => {
          const meta =
            VISIBILITY_META[n.visibility] || VISIBILITY_META.ORG_PUBLIC!;

          return (
            <div
              key={n.id}
              className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm dark:shadow-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-semibold text-slate-900 dark:text-slate-50 flex-1">
                  {n.title}
                </h3>
                <span
                  className={`shrink-0 inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${meta.cls}`}
                  title={meta.description}
                >
                  {meta.icon} {meta.label}
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap mb-3">
                {n.content}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-neutral-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {n.createdBy.name}
                  </span>
                  <span className="mx-1">·</span>
                  <span className="lowercase bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                    {n.createdBy.role}
                  </span>
                  {n.department && (
                    <>
                      <span className="mx-1">·</span>
                      <span>{n.department.name}</span>
                    </>
                  )}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(n.createdAt).toLocaleDateString("en-IN", {
                    year: "2-digit",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NoticeBoard;
