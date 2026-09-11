import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSafety } from "../context/SafetyContext";
import SosModal from "../components/safety/SosModal";
import AiRiskModal from "../components/safety/AiRiskModal";
import SettingsModal from "../components/safety/SettingsModal";
import TopBar from "../components/TopBar";
import SideDrawer from "../components/SideDrawer";
import {
  Bell, MapPin, ShieldCheck, Activity, Compass, Users,
  AlertTriangle, Hospital, Home, Map, Settings as SettingsIcon,
  Sparkles, Battery, Thermometer, Wind, Gauge, Route as RouteIcon,
  ShieldAlert, CloudSun, Navigation, ChevronDown, User, KeyRound,
  LogOut, UserPlus, Moon, X, Asterisk, AudioLines, BookOpen,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: TravelSafeApp,
  head: () => ({
    meta: [
      { title: "TravelSafe — Smart Tourist Safety" },
      { name: "description", content: "Live hazard alerts, geo-fencing, group travel and AI-powered safety insights for travellers." },
    ],
  }),
});

function TravelSafeApp() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const { isSosActive, safetyScore } = useSafety();
  const { user } = useAuth();

  return (
    <div className="min-h-screen w-full bg-[var(--surface)] flex justify-center">
      <div className="w-full max-w-[440px] md:max-w-4xl min-h-screen bg-[var(--surface)] pb-32 relative overflow-hidden shadow-2xl md:border-x border-slate-200">
        <TopBar onMenu={() => setDrawerOpen(true)} />
        <main className="px-5 space-y-6 pt-2">
          <HeroCard onStartTrip={() => setAiModalOpen(true)} />
          <QuickActions onOpenSos={() => setSosModalOpen(true)} onOpenAi={() => setAiModalOpen(true)} />
          <FeaturesStory />
          <TravelStats />
          <SafetyBanner onOpenSos={() => setSosModalOpen(true)} />
          <Footer />
        </main>
        <BottomNav onOpenSettings={() => setSettingsModalOpen(true)} />
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

/* ---------------- Hero ---------------- */
function HeroCard({ onStartTrip }: { onStartTrip?: () => void }) {
  return (
    <section className="relative overflow-hidden rounded-[28px] p-5 text-white shadow-float animate-bg-shift"
      style={{ backgroundImage: "linear-gradient(135deg, #1D4ED8 0%, #2563EB 45%, #0EA5E9 100%)" }}
    >
      {[...Array(8)].map((_, i) => (
        <span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-white/80 animate-twinkle"
          style={{ top: `${10 + (i * 9) % 70}%`, left: `${5 + (i * 13) % 90}%`, animationDelay: `${i * 0.3}s` }}
        />
      ))}
      <span className="absolute top-6 right-6 h-4 w-10 rounded-full bg-white/40 blur-[2px] animate-float-slow" />
      <span className="absolute top-16 right-24 h-3 w-8 rounded-full bg-white/30 blur-[2px] animate-drift" />

      <div className="relative grid grid-cols-[minmax(0,1fr)_120px] gap-3 items-center">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium rounded-full bg-white/15 backdrop-blur px-2.5 py-1 mb-3">
            <Sparkles className="h-3 w-3" /> AI Safety Active
          </div>
          <h1 className="font-display text-[22px] leading-tight font-extrabold">Hello, Saurabh 👋</h1>
          <p className="text-white/90 text-[13px] mt-1">Welcome to TravelSafe</p>
          <p className="text-white/70 text-[12px] mt-0.5">Your safety, our priority.</p>

          <button onClick={onStartTrip} className="press mt-4 inline-flex items-center gap-1.5 bg-white text-[#2563EB] text-[12px] font-semibold rounded-full px-3.5 py-2 shadow-soft">
            <Navigation className="h-3.5 w-3.5" /> Start Trip
          </button>
        </div>
        <HeroIllustration />
      </div>
    </section>
  );
}

function HeroIllustration() {
  return (
    <div className="relative h-28 w-28 mx-auto">
      <div className="absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/20" />
      <div className="absolute inset-2 flex flex-col items-center justify-center text-center">
        <MapPin className="h-8 w-8 text-white animate-bounce" />
        <span className="text-[10px] font-bold text-white mt-1">Live GPS</span>
      </div>
    </div>
  );
}

/* ---------------- Quick Actions ---------------- */
function QuickActions({ onOpenSos, onOpenAi }: { onOpenSos: () => void; onOpenAi: () => void }) {
  const navigate = useNavigate();
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-slate-900 text-[16px]">Quick Actions</h2>
        <span className="text-[11px] text-slate-400 font-medium">Swipe →</span>
      </div>
      <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
        <ActionCard icon={MapPin} label="Famous Places" sub="Nearby spots" onClick={() => navigate({ to: "/maps" })} />
        <ActionCard icon={Compass} label="Live Location" sub="Your GPS" onClick={() => navigate({ to: "/maps" })} />
        <ActionCard icon={CloudSun} label="Live Weather" sub="Right now" onClick={onOpenAi} />
        <ActionCard icon={ShieldCheck} label="Safety Tip" sub="Daily advice" onClick={onOpenAi} />
        <ActionCard icon={Activity} label="Monitoring" sub="Live center" onClick={onOpenAi} />
      </div>
    </section>
  );
}

function ActionCard({ icon: Icon, label, sub, onClick }: { icon: any; label: string; sub: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="press shrink-0 w-[104px] rounded-3xl bg-white p-3 shadow-soft border border-slate-100 text-left">
      <div className="h-9 w-9 rounded-2xl bg-blue-50 text-[#2563EB] grid place-items-center mb-2">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="font-display font-bold text-[12px] text-slate-900 leading-tight">{label}</div>
      <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>
    </button>
  );
}

function FeaturesStory() {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4.5 w-4.5 text-[#2563EB]" />
        <h2 className="font-display font-bold text-slate-900 text-[16px]">Explore Features</h2>
      </div>
      <div className="rounded-[24px] bg-white p-4 shadow-soft border border-slate-100 space-y-2">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <Asterisk className="h-4 w-4 text-[#2563EB]" /> See the alert, not just the noise.
        </div>
        <p className="text-[12px] text-slate-600 leading-relaxed">
          Get clear, cited hazard signals with the exact source — weather bureaus, traffic feeds, and local reports — so you always know why we alerted you.
        </p>
      </div>
      <div className="rounded-[24px] bg-white p-4 shadow-soft border border-slate-100 space-y-2">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <AudioLines className="h-4 w-4 text-[#0EA5E9]" /> Listen to your route, on the go.
        </div>
        <p className="text-[12px] text-slate-600 leading-relaxed">
          Turn your itinerary into a calm, spoken safety brief. Traffic, weather and geo-fence warnings become a hands-free companion for the road.
        </p>
      </div>
    </section>
  );
}

function TravelStats() {
  const stats = [
    { icon: Thermometer, label: "Temperature", value: "28°C", tint: "text-[#F59E0B]", bg: "bg-orange-50" },
    { icon: Wind, label: "AQI", value: "62 Good", tint: "text-[#10B981]", bg: "bg-emerald-50" },
    { icon: ShieldAlert, label: "Hazards", value: "0 nearby", tint: "text-[#EF4444]", bg: "bg-red-50" },
    { icon: Gauge, label: "Safe Zone", value: "94 / 100", tint: "text-[#2563EB]", bg: "bg-blue-50" },
    { icon: RouteIcon, label: "Travelled", value: "12.4 km", tint: "text-[#0EA5E9]", bg: "bg-sky-50" },
    { icon: Battery, label: "Battery", value: "78%", tint: "text-[#10B981]", bg: "bg-emerald-50" },
  ];
  return (
    <section>
      <h2 className="font-display font-bold text-slate-900 text-[16px] mb-3">Travel Statistics</h2>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl bg-white shadow-soft p-3.5 border border-slate-100">
            <div className={`h-9 w-9 rounded-2xl ${s.bg} grid place-items-center ${s.tint}`}>
              <s.icon className="h-4.5 w-4.5" />
            </div>
            <div className="mt-2.5 text-[11px] text-slate-500">{s.label}</div>
            <div className="font-display font-bold text-[15px] text-slate-900">{s.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SafetyBanner({ onOpenSos }: { onOpenSos?: () => void }) {
  return (
    <section className="relative overflow-hidden rounded-[24px] p-5 text-white shadow-float"
      style={{ backgroundImage: "linear-gradient(135deg,#059669 0%,#10B981 60%,#34D399 100%)" }}>
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-2xl bg-white/20 grid place-items-center backdrop-blur">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-white/80">Protected by</div>
          <div className="font-display font-extrabold text-[16px]">TravelSafe AI Monitoring</div>
          <ul className="mt-2 space-y-1 text-[12px] text-white/95">
            <li className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-white animate-twinkle" /> Live Hazard Detection</li>
            <li className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-white animate-twinkle" /> Geo-Fencing Enabled</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="text-center pt-2 pb-4">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-[#059669] px-2.5 py-1 text-[11px] font-semibold">
        <ShieldCheck className="h-3 w-3" /> Verified
      </div>
      <p className="mt-2 text-[12px] font-semibold text-slate-800">© 2026 TravelSafe</p>
      <p className="text-[11px] text-slate-500">Certified Smart Tourism Platform</p>
    </footer>
  );
}

/* ---------------- Bottom Nav ---------------- */
function BottomNav({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const navigate = useNavigate();
  const [active, setActive] = useState("home");
  const tabs = [
    { id: "home", icon: Home, label: "Home", to: "/" as const },
    { id: "maps", icon: Map, label: "Maps", to: "/maps" as const },
    { id: "alerts", icon: Bell, label: "Alerts", to: "/alerts" as const },
    { id: "settings", icon: SettingsIcon, label: "Settings", to: "/" as const },
  ];
  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[408px] z-40">
      <div className="glass rounded-[28px] shadow-float px-3 py-2.5 grid grid-cols-4 gap-1 border border-white/60">
        {tabs.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActive(t.id);
                if (t.id === "maps") navigate({ to: "/maps" });
                if (t.id === "alerts") navigate({ to: "/alerts" });
                if (t.id === "settings" && onOpenSettings) onOpenSettings();
              }}
              className="press flex flex-col items-center gap-0.5 py-1.5 rounded-2xl relative"
            >
              <div className={`h-10 w-10 grid place-items-center rounded-2xl transition-all ${
                isActive ? "bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] text-white shadow-float" : "text-slate-400"
              }`}>
                <t.icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 1.8} />
                {t.id === "alerts" && !isActive && (
                  <span className="absolute top-1 right-3 h-2 w-2 rounded-full bg-[#EF4444] ring-2 ring-white animate-twinkle" />
                )}
              </div>
              <span className={`text-[10px] font-semibold ${isActive ? "text-[#2563EB]" : "text-slate-500"}`}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
