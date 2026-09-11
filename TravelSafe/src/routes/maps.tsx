import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Mic, Utensils, Hospital, Fuel, Hotel, Landmark,
  Layers, Navigation2, Home, Map as MapIcon, Bell, Settings as SettingsIcon,
  Sparkles, X, AlertOctagon, ShieldCheck
} from "lucide-react";
import LeafletMap from "../components/map/LeafletMap";
import SafetyScoreCard from "../components/safety/SafetyScoreCard";
import SosModal from "../components/safety/SosModal";
import AiRiskModal from "../components/safety/AiRiskModal";
import SettingsModal from "../components/safety/SettingsModal";
import TopBar from "../components/TopBar";
import SideDrawer from "../components/SideDrawer";
import { useSafety } from "../context/SafetyContext";
import { useAuth } from "../context/AuthContext";

export const Route = createFileRoute("/maps")({
  component: MapsPage,
  head: () => ({
    meta: [
      { title: "Live Safety Map — TravelSafe" },
      { name: "description", content: "Explore live Leaflet map, geofences, hospital/police layers and AI safety scores." },
    ],
  }),
});

function Chip({ icon, label, active = false, onClick }: { icon: any; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`press shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border transition ${
        active
          ? "bg-[#2563EB] text-white border-[#2563EB] shadow-soft"
          : "glass text-slate-700 border-white/80 hover:bg-white/80"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function MapsPage() {
  const navigate = useNavigate();
  const { isSosActive, refreshLocation } = useSafety();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [showHospitals, setShowHospitals] = useState(true);
  const [showPolice, setShowPolice] = useState(true);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[var(--surface)] flex justify-center">
      {/* Outer Layout Container matching index.tsx 100% */}
      <div className="w-full max-w-[440px] md:max-w-4xl min-h-screen bg-[var(--surface)] pb-32 relative overflow-hidden shadow-2xl md:border-x border-slate-200">
        
        {/* Shared TopBar Header */}
        <TopBar onMenu={() => setDrawerOpen(true)} />

        {/* Main Content Area */}
        <main className="px-5 space-y-4 pt-3 relative">
          
          {/* Top Search Input & Category Chips */}
          <div className="space-y-2.5">
            <div className="glass rounded-2xl shadow-soft p-2 px-3 flex items-center gap-2 border border-white/80">
              <input
                placeholder="Search safe places, hospitals, police..."
                className="flex-1 bg-transparent border-none outline-none text-[13px] text-slate-800 placeholder:text-slate-500 min-w-0"
              />
              <button className="press h-8 w-8 grid place-items-center rounded-full hover:bg-slate-100">
                <Mic className="h-4 w-4 text-slate-600" />
              </button>
              <button
                onClick={() => setSosModalOpen(true)}
                className={`press px-3 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-soft ${
                  isSosActive ? "animate-bounce" : ""
                }`}
              >
                <AlertOctagon className="h-3.5 w-3.5" /> SOS
              </button>
            </div>

            {/* Filter Category Chips */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 py-0.5">
              <Chip active icon={<Sparkles className="h-3.5 w-3.5 text-white" />} label="Ask AI Risk" onClick={() => setAiModalOpen(true)} />
              <Chip icon={<Hospital className="h-3.5 w-3.5 text-red-500" />} label="Hospitals" onClick={() => setShowHospitals((v) => !v)} />
              <Chip icon={<ShieldCheck className="h-3.5 w-3.5 text-blue-500" />} label="Police" onClick={() => setShowPolice((v) => !v)} />
              <Chip icon={<Utensils className="h-3.5 w-3.5 text-amber-500" />} label="Restaurants" />
              <Chip icon={<Fuel className="h-3.5 w-3.5 text-emerald-500" />} label="Fuel" />
              <Chip icon={<Hotel className="h-3.5 w-3.5 text-purple-500" />} label="Hotels" />
              <Chip icon={<Landmark className="h-3.5 w-3.5 text-slate-600" />} label="ATMs" />
            </div>

            {/* AI Floating Safety Score Card Overlay */}
            <SafetyScoreCard onOpenAiModal={() => setAiModalOpen(true)} />
          </div>

          {/* Interactive Leaflet Map Card */}
          <div className="rounded-[28px] overflow-hidden shadow-float border border-slate-200 relative h-[480px] md:h-[600px] w-full bg-slate-100">
            <LeafletMap showHospitals={showHospitals} showPolice={showPolice} />

            {/* Floating Action Buttons */}
            <div className="absolute right-4 bottom-6 z-20 flex flex-col gap-2">
              <button
                onClick={() => setLayersOpen(!layersOpen)}
                className="press h-11 w-11 rounded-2xl bg-white border border-slate-100 text-slate-700 grid place-items-center shadow-float hover:bg-slate-50"
                title="Toggle Map Layers"
              >
                <Layers className="h-5 w-5 text-[#2563EB]" />
              </button>
              <button
                onClick={refreshLocation}
                className="press h-11 w-11 rounded-2xl bg-white border border-slate-100 text-slate-700 grid place-items-center shadow-float hover:bg-slate-50"
                title="Recenter Map"
              >
                <Navigation2 className="h-5 w-5 text-emerald-600" />
              </button>
            </div>

            {/* Layer Control Panel */}
            {layersOpen && (
              <div className="absolute right-4 bottom-20 z-30 w-56 bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-float space-y-3 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-100 pb-2">
                  <span>Map Infrastructure</span>
                  <button onClick={() => setLayersOpen(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <label className="flex items-center justify-between text-slate-700 cursor-pointer">
                  <span>🏥 Emergency Hospitals</span>
                  <input
                    type="checkbox"
                    checked={showHospitals}
                    onChange={(e) => setShowHospitals(e.target.checked)}
                    className="accent-blue-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between text-slate-700 cursor-pointer">
                  <span>👮 Police Stations</span>
                  <input
                    type="checkbox"
                    checked={showPolice}
                    onChange={(e) => setShowPolice(e.target.checked)}
                    className="accent-blue-600 rounded"
                  />
                </label>
              </div>
            )}
          </div>
        </main>

        {/* Standardized Bottom Navigation Bar */}
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[408px] z-40">
          <div className="glass rounded-[28px] shadow-float px-3 py-2.5 grid grid-cols-4 gap-1 border border-white/60">
            <Link
              to="/"
              className="press flex flex-col items-center gap-0.5 py-1.5 rounded-2xl text-slate-500 hover:text-slate-900"
            >
              <div className="h-10 w-10 grid place-items-center rounded-2xl text-slate-500">
                <Home className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-semibold">Home</span>
            </Link>

            <div className="flex flex-col items-center gap-0.5 py-1.5 rounded-2xl">
              <div className="h-10 w-10 grid place-items-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] text-white shadow-float">
                <MapIcon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold text-[#2563EB]">Maps</span>
            </div>

            <Link
              to="/alerts"
              className="press flex flex-col items-center gap-0.5 py-1.5 rounded-2xl text-slate-500 hover:text-slate-900 relative"
            >
              <div className="h-10 w-10 grid place-items-center rounded-2xl text-slate-500">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-3.5 h-2 w-2 rounded-full bg-[#EF4444] ring-2 ring-white" />
              </div>
              <span className="text-[10px] font-semibold">Alerts</span>
            </Link>

            <button
              onClick={() => setSettingsModalOpen(true)}
              className="press flex flex-col items-center gap-0.5 py-1.5 rounded-2xl text-slate-500 hover:text-slate-900"
            >
              <div className="h-10 w-10 grid place-items-center rounded-2xl text-slate-500">
                <SettingsIcon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-semibold">Settings</span>
            </button>
          </div>
        </nav>

        {/* Modals & Drawers */}
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
