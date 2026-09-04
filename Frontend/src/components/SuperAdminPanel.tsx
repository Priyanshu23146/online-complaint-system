import React from "react";
import { Globe, PlusCircle, Building2, CreditCard } from "lucide-react";

interface Props {
  clients: any[];
  setIsOnboardClientOpen: (val: boolean) => void;
  setClientGeneratedCreds: (val: any) => void;
}

const SuperAdminPanel: React.FC<Props> = ({
  clients,
  setIsOnboardClientOpen,
  setClientGeneratedCreds,
}) => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Globe className="h-7 w-7 text-indigo-600" /> B2B Client Management
        </h2>
        <button
          onClick={() => {
            setIsOnboardClientOpen(true);
            setClientGeneratedCreds(null);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium flex items-center gap-2"
        >
          <PlusCircle className="h-5 w-5" /> Onboard New Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.length === 0 ? (
          <p className="text-slate-500 col-span-3">No clients onboarded yet.</p>
        ) : (
          clients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition"
            >
              <div className="bg-slate-900 p-4 flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-indigo-400" />{" "}
                  {client.name}
                </h3>
                <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-1 rounded font-semibold border border-indigo-500/30">
                  Active
                </span>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Organization Admin
                  </p>
                  {client.users.length > 0 ? (
                    <p className="text-sm font-medium text-slate-700">
                      {client.users[0].name} <br />
                      <span className="text-slate-500 font-normal">
                        {client.users[0].email}
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-amber-600 font-medium italic">
                      No Admin Assigned
                    </p>
                  )}
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <CreditCard className="h-4 w-4 text-indigo-500" />
                    Plan: {client.subscriptions?.[0]?.plan || "FREE"}
                  </div>
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition">
                    Upgrade
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SuperAdminPanel;
