import React from "react";
import { X, Globe, CheckCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clientOrgName: string;
  setClientOrgName: (val: string) => void;
  clientAdminName: string;
  setClientAdminName: (val: string) => void;
  clientAdminEmail: string;
  setClientAdminEmail: (val: string) => void;
  isOnboardingClient: boolean;
  clientGeneratedCreds: { email: string; pass: string } | null;
  onSubmit: (e: React.FormEvent) => void;
}

const OnboardClientModal: React.FC<Props> = ({
  isOpen,
  onClose,
  clientOrgName,
  setClientOrgName,
  clientAdminName,
  setClientAdminName,
  clientAdminEmail,
  setClientAdminEmail,
  isOnboardingClient,
  clientGeneratedCreds,
  onSubmit,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex justify-between items-center mb-5 border-b pb-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Globe className="h-6 w-6 text-indigo-600" /> Onboard Client
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        {clientGeneratedCreds ? (
          <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-xl text-center">
            <h4 className="text-indigo-700 font-bold mb-2 flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5" /> Organization Created!
            </h4>
            <div className="bg-slate-900 p-4 rounded-lg font-mono text-sm text-slate-300 text-left mt-4">
              <div>
                Email:{" "}
                <span className="text-white">{clientGeneratedCreds.email}</span>
              </div>
              <div className="mt-2">
                Pass:{" "}
                <span className="text-indigo-400 font-bold">
                  {clientGeneratedCreds.pass}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="mt-5 w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Organization Name
              </label>
              <input
                type="text"
                required
                value={clientOrgName}
                onChange={(e) => setClientOrgName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Admin Name
              </label>
              <input
                type="text"
                required
                value={clientAdminName}
                onChange={(e) => setClientAdminName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={clientAdminEmail}
                onChange={(e) => setClientAdminEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isOnboardingClient}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition shadow-md"
            >
              {isOnboardingClient ? "Provisioning..." : "Create Client Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
export default OnboardClientModal;
