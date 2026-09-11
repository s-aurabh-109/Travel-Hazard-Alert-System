import { useState } from "react";
import {
  X, ChevronDown, User, KeyRound, LogOut, UserPlus, Moon, Settings as SettingsIcon, ShieldCheck
} from "lucide-react";

export default function SideDrawer({
  dark,
  onToggleDark,
  onClose,
  onOpenSettings,
}: {
  dark: boolean;
  onToggleDark: () => void;
  onClose: () => void;
  onOpenSettings?: () => void;
}) {
  const [profileOpen, setProfileOpen] = useState(true);

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: "fade-swap .4s ease" }}
      />

      {/* Drawer */}
      <aside
        className="absolute left-0 top-0 h-full w-[86%] max-w-[340px] bg-white shadow-float flex flex-col z-50"
        style={{ animation: "drawer-in .28s cubic-bezier(.22,.9,.3,1.1)" }}
      >
        <div className="p-5 pt-6">
          <div className="flex items-start justify-between">
            <button className="press h-16 w-16 rounded-full overflow-hidden ring-2 ring-white shadow-float">
              <img src="https://i.pravatar.cc/120?img=15" alt="You" className="h-full w-full object-cover" />
            </button>
            <button onClick={onClose} className="press h-9 w-9 grid place-items-center rounded-full bg-slate-100">
              <X className="h-4 w-4 text-slate-600" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="font-display font-extrabold text-[17px] text-slate-900">Saurabh Kumar</div>
              <button className="text-[12.5px] text-[#2563EB] font-semibold">Set Emoji Status</button>
            </div>
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="press h-9 w-9 grid place-items-center rounded-full hover:bg-slate-100"
            >
              <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          {profileOpen && (
            <div className="mt-3 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden" style={{ animation: "fade-swap .3s ease" }}>
              <div className="flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-slate-700 hover:bg-slate-100/80 cursor-pointer border-b border-slate-100">
                <User className="h-4.5 w-4.5 text-[#2563EB]" />
                <span>My Profile</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-slate-700 hover:bg-slate-100/80 cursor-pointer border-b border-slate-100">
                <KeyRound className="h-4.5 w-4.5 text-slate-500" />
                <span>Reset Password</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-[#EF4444] hover:bg-red-50 cursor-pointer">
                <LogOut className="h-4.5 w-4.5 text-[#EF4444]" />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-slate-100" />

        <div className="p-2 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-[13.5px] font-semibold text-slate-800 hover:bg-slate-50 rounded-2xl">
            <UserPlus className="h-5 w-5 text-[#2563EB]" />
            <span>Create Group</span>
          </button>

          <div className="w-full flex items-center justify-between px-4 py-3 text-[13.5px] font-semibold text-slate-800 hover:bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-slate-600" />
              <span>Dark Mode</span>
            </div>
            <span
              onClick={onToggleDark}
              className={`inline-flex h-6 w-11 items-center rounded-full px-0.5 cursor-pointer transition-colors ${dark ? "bg-[#2563EB]" : "bg-slate-300"}`}
            >
              <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${dark ? "translate-x-5" : ""}`} />
            </span>
          </div>

          <button
            onClick={() => {
              onClose();
              if (onOpenSettings) onOpenSettings();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-[13.5px] font-semibold text-slate-800 hover:bg-slate-50 rounded-2xl"
          >
            <SettingsIcon className="h-5 w-5 text-slate-600" />
            <span>Settings</span>
          </button>
        </div>

        <div className="mt-auto p-5 text-[11px] text-slate-400">
          TravelSafe · v1.0.0
        </div>
      </aside>
    </div>
  );
}
