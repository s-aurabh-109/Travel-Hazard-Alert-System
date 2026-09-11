import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bell, ShieldAlert, Sparkles, ChevronRight, Home, Map as MapIcon, Settings as SettingsIcon
} from "lucide-react";
import { useSafety } from "../context/SafetyContext";
import SosModal from "../components/safety/SosModal";
import AiRiskModal from "../components/safety/AiRiskModal";
import SettingsModal from "../components/safety/SettingsModal";
import TopBar from "../components/TopBar";
import SideDrawer from "../components/SideDrawer";

export const Route = createFileRoute("/alerts")({
  component: AlertsPage,
  head: () => ({
    meta: [
      { title: "Live Hazard Alerts — TravelSafe" },
      { name: "description", content: "Real-time hazard alerts, NDMA advisories, weather, and AI risk signals for travellers." },
    ],
  }),
});

function AlertsPage() {
  const navigate = useNavigate();
  const { safetyScore } = useSafety();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const alerts = [
    {
      id: "a-1",
      title: "Kalpa Route · Safety Brief",
      summary: "Landslide-prone stretch near NH-05 (14:20 IST). Prefer daylight travel.",
      source: "NDMA Feed",
      type: "warn",
      time: "10m ago",
    },
    {
      id: "a-2",
      title: "High Crime Density Advisory",
      summary: "Increased night activity reported near Railway Station West Exit. Increased police patrols dispatched.",
      source: "Police Patrol Control",
      type: "danger",
      time: "25m ago",
    },
    {
      id: "a-3",
      title: "Weather Warning · Heavy Fog",
      summary: "Visibility reduced to under 50m on Expressway stretch. Drive below 40km/h.",
      source: "IMD Bureau",
      type: "info",
      time: "1h ago",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[var(--surface)] flex justify-center">
      <div className="w-full max-w-[440px] md:max-w-4xl min-h-screen bg-[var(--surface)] pb-32 relative overflow-hidden shadow-2xl md:border-x border-slate-200">
        
        {/* Shared TopBar Header */}
        <TopBar onMenu={() => setDrawerOpen(true)} />

        {/* Page Content */}
        <main className="px-5 space-y-4 pt-3">
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-extrabold text-[18px] text-slate-900">Live Hazard Signals</h1>
              <p className="text-[11px] text-slate-500">Real-time alerts from NDMA, IMD & AI Models</p>
            </div>
            <button
              onClick={() => setSosModalOpen(true)}
              className="press px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-soft"
            >
              <ShieldAlert className="h-3.5 w-3.5" /> SOS
            </button>
          </div>

          {/* AI Score Banner Button -> Triggers AI Threat Calculation Modal */}
          <div
            onClick={() => setAiModalOpen(true)}
            className="press rounded-[24px] p-4 text-white shadow-float cursor-pointer"
            style={{ backgroundImage: "linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #0EA5E9 100%)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-semibold bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur">
                <Sparkles className="h-3 w-3" /> Calculate AI Safety Score
              </div>
              <ChevronRight className="h-4 w-4 text-white/80" />
            </div>
            <h2 className="font-display font-extrabold text-[17px] mt-2">Area Threat Index: {safetyScore?.level} ({safetyScore?.score}/100)</h2>
            <p className="text-white/90 text-[12px] mt-0.5">"{safetyScore?.aiSummary}"</p>
          </div>

          {/* Active Hazard Feed List */}
          <section className="space-y-3">
            <h3 className="font-display font-bold text-slate-900 text-[15px]">Active Advisory Stream</h3>

            {alerts.map((item) => (
              <div key={item.id} className="rounded-[24px] bg-white p-4 shadow-soft border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                      item.type === "danger"
                        ? "bg-red-100 text-red-700"
                        : item.type === "warn"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {item.source}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{item.time}</span>
                </div>
                <h4 className="font-display font-bold text-[14px] text-slate-900">{item.title}</h4>
                <p className="text-[12px] text-slate-600 leading-relaxed">{item.summary}</p>
              </div>
            ))}
          </section>
        </main>

        {/* Standardized Bottom Navigation Bar */}
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[408px] z-40">
          <div className="glass rounded-[28px] shadow-float px-3 py-2.5 grid grid-cols-4 gap-1 border border-white/60">
            <button
              onClick={() => navigate({ to: "/" })}
              className="press flex flex-col items-center gap-0.5 py-1.5 rounded-2xl text-slate-500"
            >
              <div className="h-10 w-10 grid place-items-center rounded-2xl">
                <Home className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-semibold">Home</span>
            </button>

            <button
              onClick={() => navigate({ to: "/maps" })}
              className="press flex flex-col items-center gap-0.5 py-1.5 rounded-2xl text-slate-500"
            >
              <div className="h-10 w-10 grid place-items-center rounded-2xl">
                <MapIcon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-semibold">Maps</span>
            </button>

            <div className="flex flex-col items-center gap-0.5 py-1.5 rounded-2xl">
              <div className="h-10 w-10 grid place-items-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] text-white shadow-float">
                <Bell className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold text-[#2563EB]">Alerts</span>
            </div>

            <button
              onClick={() => setSettingsModalOpen(true)}
              className="press flex flex-col items-center gap-0.5 py-1.5 rounded-2xl text-slate-500"
            >
              <div className="h-10 w-10 grid place-items-center rounded-2xl">
                <SettingsIcon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-semibold">Settings</span>
            </button>
          </div>
        </nav>

        {drawerOpen && (
          <SideDrawer
            dark={dark}
            onToggleDark={() => setDark((v) => !v)}
            onClose={() => setDrawerOpen(false)}
            onOpenSettings={() => setSettingsModalOpen(true)}
          />
        )}
        {sosModalOpen && <SosModal onClose={() => setSosModalOpen(false)} />}
        {aiModalOpen && <AiRiskModal onClose={() => setAiModalOpen(false)} />}
        {settingsModalOpen && <SettingsModal onClose={() => setSettingsModalOpen(false)} />}
      </div>
    </div>
  );
}
